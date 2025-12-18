import axiosInstance from "./axiosInstance";
import * as signalR from "@microsoft/signalr";

const url = "/api/Chat/";

// ===============================
// REST API CALLS (AXIOS)
// ===============================

export const getChatHistory = async (otherUserId, page = 1, pageSize = 50) => {
    const response = await axiosInstance.get(`${url}history/${otherUserId}`, {
        params: {
            page,
            pageSize,
        },
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

    if (!token) {
        throw new Error("No access token available");
    }

    // Check if token is expired (you can decode JWT to check expiry)
    // For now, we'll make a lightweight API call to validate the token
    try {
        // Make a simple API call to validate token - this will trigger refresh if needed
        await axiosInstance.get("/api/User/me", {
            skipAuthRedirect: true, // Don't redirect on failure
        });

        // Return the token (which might have been refreshed by axios interceptor)
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
    }

    async connect() {
        if (this.connection && this.isConnected) {
            return;
        }

        this.connection = new signalR.HubConnectionBuilder()
            .withUrl(`${import.meta.env.VITE_BACKEND_URL}/chathub`, {
                accessTokenFactory: async () => {
                    try {
                        // Always get a fresh, valid token
                        return await getValidToken();
                    } catch (error) {
                        console.error(
                            "Failed to get valid token for SignalR:",
                            error
                        );
                        throw error;
                    }
                },
                transport:
                    signalR.HttpTransportType.WebSockets |
                    signalR.HttpTransportType.ServerSentEvents,
                skipNegotiation: false,
            })
            .withAutomaticReconnect({
                nextRetryDelayInMilliseconds: (retryContext) => {
                    // Custom retry logic
                    if (retryContext.previousRetryCount === 0) return 0;
                    if (retryContext.previousRetryCount === 1) return 2000;
                    if (retryContext.previousRetryCount === 2) return 10000;
                    if (retryContext.previousRetryCount === 3) return 30000;
                    return null; // Stop retrying after 4 attempts
                },
            })
            .configureLogging(signalR.LogLevel.Information)
            .build();

        try {
            await this.connection.start();
            this.isConnected = true;
            this.reconnectAttempts = 0;
            console.log("Chat SignalR Connected");
        } catch (error) {
            console.error("Chat SignalR Connection Error:", error);
            this.isConnected = false;

            // If connection failed due to auth, clear tokens and throw
            if (
                error.message?.includes("Unauthorized") ||
                error.statusCode === 401
            ) {
                localStorage.clear();
                throw new Error("Authentication failed");
            }
            throw error;
        }

        // Handle connection events
        this.connection.onreconnecting(() => {
            console.log("Chat SignalR Reconnecting...");
            this.isConnected = false;
        });

        this.connection.onreconnected(() => {
            console.log("Chat SignalR Reconnected");
            this.isConnected = true;
            this.reconnectAttempts = 0;
        });

        this.connection.onclose(async (error) => {
            console.log("Chat SignalR Disconnected", error);
            this.isConnected = false;

            // If disconnection was due to authentication, don't retry
            if (
                error &&
                (error.message?.includes("Unauthorized") ||
                    error.statusCode === 401)
            ) {
                console.log(
                    "SignalR disconnected due to authentication failure"
                );
                localStorage.clear();
                if (window.__store) {
                    window.__store.dispatch({ type: "RESET_STORE" });
                }
                return;
            }

            // Manual reconnect fallback with token refresh
            if (this.reconnectAttempts < this.maxReconnectAttempts) {
                setTimeout(async () => {
                    this.reconnectAttempts++;
                    try {
                        await this.connect(); // This will get a fresh token
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

            // If error is due to authentication, try to reconnect with fresh token
            if (
                error.message?.includes("Unauthorized") ||
                error.statusCode === 401
            ) {
                console.log(
                    "SendMessage failed due to auth, attempting reconnect..."
                );
                await this.disconnect();
                await this.connect();
                // Retry the message after reconnection
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

            // Handle auth errors similar to sendMessage
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

    // Event listeners (same as before)
    onReceiveMessage(callback) {
        if (this.connection) {
            this.connection.on("ReceiveMessage", callback);
        }
    }

    onMessageSent(callback) {
        if (this.connection) {
            this.connection.on("MessageSent", callback);
        }
    }

    onMessageMarkedAsRead(callback) {
        if (this.connection) {
            this.connection.on("MessageMarkedAsRead", callback);
        }
    }

    onUserOnline(callback) {
        if (this.connection) {
            this.connection.on("UserOnline", callback);
        }
    }

    onUserOffline(callback) {
        if (this.connection) {
            this.connection.on("UserOffline", callback);
        }
    }

    onOnlineUsers(callback) {
        if (this.connection) {
            this.connection.on("OnlineUsers", callback);
        }
    }

    onError(callback) {
        if (this.connection) {
            this.connection.on("Error", callback);
        }
    }

    // Remove specific event listener
    off(eventName, callback) {
        if (this.connection) {
            this.connection.off(eventName, callback);
        }
    }

    // Remove all listeners for an event
    offAll(eventName) {
        if (this.connection) {
            this.connection.off(eventName);
        }
    }
}

// Create singleton instance
export const chatSignalR = new ChatSignalRService();

// ===============================
// HYBRID METHODS (SIGNALR + FALLBACK)
// ===============================

export const sendMessage = async (receiverId, content) => {
    try {
        // Try SignalR first
        if (chatSignalR.isConnected) {
            await chatSignalR.sendMessage(receiverId, content);
        } else {
            // Fallback to REST API
            await sendMessageRest({ receiverId, content });
        }
    } catch (error) {
        // If SignalR fails, try REST API as fallback
        console.warn("SignalR send failed, trying REST API fallback:", error);
        await sendMessageRest({ receiverId, content });
    }
};

export const markAsRead = async (messageId) => {
    try {
        // Try SignalR first
        if (chatSignalR.isConnected) {
            await chatSignalR.markAsRead(messageId);
        } else {
            // Fallback to REST API
            await markAsReadRest(messageId);
        }
    } catch (error) {
        // If SignalR fails, try REST API as fallback
        console.warn(
            "SignalR markAsRead failed, trying REST API fallback:",
            error
        );
        await markAsReadRest(messageId);
    }
};
