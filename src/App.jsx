import { RouterProvider } from "react-router-dom";
import { router } from "./routes/routes.jsx";
import "./App.css";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { chatSignalR } from "./services/chatService.js";

export default function App() {
    const { isAuthenticated } = useSelector((state) => state.user);

    useEffect(() => {
        if (isAuthenticated) {
            // Connect when user becomes authenticated
            chatSignalR
                .connect()
                .then(() => console.log("Chat connected successfully"))
                .catch((err) => console.error("Chat connection failed:", err));
        } else {
            // Disconnect when user logs out
            chatSignalR.disconnect();
        }

        return () => {
            chatSignalR.disconnect();
        };
    }, [isAuthenticated]);
    return <RouterProvider router={router} />;
}
