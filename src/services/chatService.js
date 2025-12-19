import axiosInstance from "./axiosInstance";
import * as signalR from "@microsoft/signalr";

const url = "/api/Chat/";

// ===============================
// REST API CALLS (AXIOS)
// ===============================

export const getChatHistory = async (otherUserId, page = 1, pageSize = 50) => {
    const response = await axiosInstance.get(`${url}history/${otherUserId}`, {
        params: { page, pageSize },
    });
    return response;
};

export const getRecentChats = async () => {
    const response = await axiosInstance.get(`${url}recent`);
    return response;
};

export const getNewestUnreadMessage = async () => {
    const response = await axiosInstance.get(`${url}unread`);
    return response;
};

export const getUnreadMessageCount = async () => {
    const response = await axiosInstance.get(`${url}unread/count`);
    return response;
};

// Fallback REST API methods (when SignalR is not available)
export const markAsReadRest = async (messageId) => {
    const response = await axiosInstance.post(`${url}mark-read/${messageId}`);
    return response;
};

export const sendMessageRest = async (messageData) => {
    const response = await axiosInstance.post(`${url}send`, messageData);
    return response;
};

// ===============================
// TOKEN REFRESH HELPER
// ===============================

const getValidToken = async () => {
    const token = localStorage.getItem("access_token");
    if (!token) throw new Error("No access token available");

    try {
        // This triggers refresh if your axios interceptor refreshes on 401
        await axiosInstance.get("/api/User/me", { skipAuthRedirect: true });
        return localStorage.getItem("access_token");
    } catch (error) {
        localStorage.clear();
        throw new Error("Authentication failed, " + error.message);
    }
};

// ===============================
// SIGNALR CONNECTION & METHODS
// ===============================

class ChatSignalRService {
    constructor() {
        this.connection = null;
        this.isConnected = false;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;

        // App-level subscribers (pages subscribe here; SignalR attaches once)
        this._subscribers = {
            ReceiveMessage: new Set(),
            MessageSent: new Set(),
            MessageMarkedAsRead: new Set(),
            OnlineUsers: new Set(),
            UserOnline: new Set(),
            UserOffline: new Set(),
            Error: new Set(),
            ConnectionState: new Set(),
        };

        // Track whether SignalR handlers are attached to the current connection instance
        this._signalRHandlersAttached = false;
    }

    // Pages call this to listen to chat events
    // returns an unsubscribe function
    subscribe(eventName, handler) {
        const bucket = this._subscribers[eventName];
        if (!bucket) throw new Error(`Unknown chat event: ${eventName}`);

        bucket.add(handler);
        return () => bucket.delete(handler);
    }

    _emit(eventName, payload) {
        const bucket = this._subscribers[eventName];
        if (!bucket) return;

        for (const fn of bucket) {
            try {
                fn(payload);
            } catch (e) {
                console.error(`Chat subscriber error in ${eventName}:`, e);
            }
        }
    }

    _attachSignalRHandlersOnce() {
        if (!this.connection || this._signalRHandlersAttached) return;

        // These are the ONLY SignalR .on registrations in the whole app:
        this.connection.on("ReceiveMessage", (message) =>
            this._emit("ReceiveMessage", message)
        );
        this.connection.on("MessageSent", (message) =>
            this._emit("MessageSent", message)
        );
        this.connection.on("MessageMarkedAsRead", (data) =>
            this._emit("MessageMarkedAsRead", data)
        );
        this.connection.on("OnlineUsers", (users) =>
            this._emit("OnlineUsers", users || [])
        );
        this.connection.on("UserOnline", (userId) =>
            this._emit("UserOnline", userId)
        );
        this.connection.on("UserOffline", (userId) =>
            this._emit("UserOffline", userId)
        );
        this.connection.on("Error", (err) => this._emit("Error", err));

        this._signalRHandlersAttached = true;
    }

    async connect() {
        // Already connected
        if (this.connection && this.isConnected) return;

        // Build connection if needed
        if (!this.connection) {
            this.connection = new signalR.HubConnectionBuilder()
                .withUrl(`${import.meta.env.VITE_BACKEND_URL}/chathub`, {
                    accessTokenFactory: async () => {
                        // Always get a fresh, valid token
                        return await getValidToken();
                    },
                    transport:
                        signalR.HttpTransportType.WebSockets |
                        signalR.HttpTransportType.ServerSentEvents,
                    skipNegotiation: false,
                })
                .withAutomaticReconnect({
                    nextRetryDelayInMilliseconds: (retryContext) => {
                        if (retryContext.previousRetryCount === 0) return 0;
                        if (retryContext.previousRetryCount === 1) return 2000;
                        if (retryContext.previousRetryCount === 2) return 10000;
                        if (retryContext.previousRetryCount === 3) return 30000;
                        return null;
                    },
                })
                .configureLogging(signalR.LogLevel.Information)
                .build();

            // Attach handlers immediately once the connection object exists
            this._signalRHandlersAttached = false;
            this._attachSignalRHandlersOnce();

            // Connection lifecycle events
            this.connection.onreconnecting(() => {
                this.isConnected = false;
                this._emit("ConnectionState", { state: "reconnecting" });
            });

            this.connection.onreconnected(() => {
                this.isConnected = true;
                this.reconnectAttempts = 0;
                this._emit("ConnectionState", { state: "reconnected" });
            });

            this.connection.onclose(async (error) => {
                this.isConnected = false;
                this._emit("ConnectionState", { state: "closed", error });

                if (
                    error &&
                    (error.message?.includes("Unauthorized") ||
                        error.statusCode === 401)
                ) {
                    localStorage.clear();
                    if (window.__store) {
                        window.__store.dispatch({ type: "RESET_STORE" });
                    }
                    return;
                }

                // Manual reconnect fallback
                if (this.reconnectAttempts < this.maxReconnectAttempts) {
                    setTimeout(async () => {
                        this.reconnectAttempts++;
                        try {
                            await this.connect();
                        } catch (reconnectError) {
                            console.error(
                                "Manual reconnect failed:",
                                reconnectError
                            );
                        }
                    }, 5000);
                }
            });
        }

        try {
            await this.connection.start();
            this.isConnected = true;
            this.reconnectAttempts = 0;
            this._emit("ConnectionState", { state: "connected" });
            console.log("Chat SignalR Connected");
        } catch (error) {
            console.error("Chat SignalR Connection Error:", error);
            this.isConnected = false;
            this._emit("ConnectionState", { state: "connect_failed", error });

            if (
                error.message?.includes("Unauthorized") ||
                error.statusCode === 401
            ) {
                localStorage.clear();
                throw new Error("Authentication failed");
            }
            throw error;
        }
    }

    async disconnect() {
        if (this.connection) {
            try {
                await this.connection.stop();
            } catch (error) {
                console.error("Error disconnecting from chat:", error);
            }
            this.connection = null;
            this.isConnected = false;
            this.reconnectAttempts = 0;
            this._signalRHandlersAttached = false;
            this._emit("ConnectionState", { state: "disconnected" });
        }
    }

    // Chat SignalR methods
    async sendMessage(receiverId, content) {
        if (!this.connection || !this.isConnected) {
            throw new Error("Chat connection is not established");
        }

        try {
            await this.connection.invoke("SendMessage", {
                receiverId,
                content,
            });
        } catch (error) {
            console.error("Error sending message via SignalR:", error);

            if (
                error.message?.includes("Unauthorized") ||
                error.statusCode === 401
            ) {
                await this.disconnect();
                await this.connect();
                await this.connection.invoke("SendMessage", {
                    receiverId,
                    content,
                });
                return;
            }
            throw error;
        }
    }

    async markAsRead(messageId) {
        if (!this.connection || !this.isConnected) {
            throw new Error("Chat connection is not established");
        }

        try {
            await this.connection.invoke("MarkAsRead", messageId);
        } catch (error) {
            console.error("Error marking message as read:", error);

            if (
                error.message?.includes("Unauthorized") ||
                error.statusCode === 401
            ) {
                await this.disconnect();
                await this.connect();
                await this.connection.invoke("MarkAsRead", messageId);
                return;
            }
            throw error;
        }
    }

    async getOnlineUsers() {
        if (!this.connection || !this.isConnected) {
            throw new Error("Chat connection is not established");
        }

        try {
            await this.connection.invoke("GetOnlineUsers");
        } catch (error) {
            console.error("Error getting online users:", error);
            throw error;
        }
    }

    // NOTE: Keep these for backward compatibility (optional),
    // but you should stop using them in Chat.jsx.
    onReceiveMessage(callback) {
        if (this.connection) this.connection.on("ReceiveMessage", callback);
    }
    onMessageSent(callback) {
        if (this.connection) this.connection.on("MessageSent", callback);
    }
    onMessageMarkedAsRead(callback) {
        if (this.connection)
            this.connection.on("MessageMarkedAsRead", callback);
    }
    onUserOnline(callback) {
        if (this.connection) this.connection.on("UserOnline", callback);
    }
    onUserOffline(callback) {
        if (this.connection) this.connection.on("UserOffline", callback);
    }
    onOnlineUsers(callback) {
        if (this.connection) this.connection.on("OnlineUsers", callback);
    }
    onError(callback) {
        if (this.connection) this.connection.on("Error", callback);
    }

    off(eventName, callback) {
        if (this.connection) this.connection.off(eventName, callback);
    }
    offAll(eventName) {
        if (this.connection) this.connection.off(eventName);
    }
}

// Create singleton instance
export const chatSignalR = new ChatSignalRService();

// ===============================
// HYBRID METHODS (SIGNALR + FALLBACK)
// ===============================

export const sendMessage = async (receiverId, content) => {
    try {
        if (chatSignalR.isConnected) {
            await chatSignalR.sendMessage(receiverId, content);
        } else {
            await sendMessageRest({ receiverId, content });
        }
    } catch (error) {
        console.warn("SignalR send failed, trying REST API fallback:", error);
        await sendMessageRest({ receiverId, content });
    }
};

export const markAsRead = async (messageId) => {
    try {
        if (chatSignalR.isConnected) {
            await chatSignalR.markAsRead(messageId);
        } else {
            await markAsReadRest(messageId);
        }
    } catch (error) {
        console.warn(
            "SignalR markAsRead failed, trying REST API fallback:",
            error
        );
        await markAsReadRest(messageId);
    }
};
