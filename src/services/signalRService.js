import { HubConnectionBuilder, LogLevel } from "@microsoft/signalr";

class SignalRService {
    constructor() {
        this.connection = null;
        this.isConnected = false;
    }

    async start() {
        try {
            const token = localStorage.getItem("access_token");
            if (!token) {
                console.log("No access token found, cannot connect to SignalR");
                return;
            }

            this.connection = new HubConnectionBuilder()
                .withUrl(
                    `${import.meta.env.VITE_BACKEND_URL}/notificationhub`,
                    {
                        accessTokenFactory: () => token,
                    },
                )
                .configureLogging(LogLevel.Information)
                .build();

            await this.connection.start();
            this.isConnected = true;
            console.log("SignalR Connected");

            // Handle connection closed
            this.connection.onclose(async () => {
                this.isConnected = false;
                console.log("SignalR Connection closed");
                // Try to reconnect after 5 seconds
                setTimeout(() => this.start(), 5000);
            });
        } catch (error) {
            this.isConnected = false;
            console.error("SignalR Connection Error:", error);
            // Try to reconnect after 5 seconds
            setTimeout(() => this.start(), 5000);
        }
    }

    async stop() {
        if (this.connection) {
            await this.connection.stop();
            this.isConnected = false;
            console.log("SignalR Connection stopped");
        }
    }

    onReceiveNotification(callback) {
        if (this.connection) {
            this.connection.on("ReceiveNotification", callback);
        }
    }

    offReceiveNotification(callback) {
        if (this.connection) {
            this.connection.off("ReceiveNotification", callback);
        }
    }

    getConnectionState() {
        return this.connection?.state || "Disconnected";
    }

    isConnectionActive() {
        return this.isConnected && this.connection?.state === "Connected";
    }
}

// Create a singleton instance
const signalRService = new SignalRService();

export default signalRService;
