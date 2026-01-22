import { useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import notificationService from "../services/notificationService";
import signalRService from "../services/signalRService";
import {
    setUnreadCount,
    incrementUnreadCount,
    resetUnreadCount,
    setLoading,
    setError,
    clearError,
} from "../store/notificationSlice";

export const useNotifications = () => {
    const dispatch = useDispatch();
    const { unreadCount, isLoading, error } = useSelector(
        (state) => state.notifications,
    );
    const { isAuthenticated } = useSelector((state) => state.user);

    // Fetch unread count
    const fetchUnreadCount = useCallback(async () => {
        if (!isAuthenticated) return;

        try {
            dispatch(setLoading(true));
            dispatch(clearError());
            const count = await notificationService.getUnreadCount();
            dispatch(setUnreadCount(count));
        } catch (error) {
            console.error("Error fetching unread count:", error);
            dispatch(setError(error.message));
        } finally {
            dispatch(setLoading(false));
        }
    }, [dispatch, isAuthenticated]);

    // Handle new notification received via SignalR
    const handleNotificationReceived = useCallback(
        () => {
            dispatch(incrementUnreadCount());
        },
        [dispatch],
    );

    // Handle marking all notifications as read
    const handleMarkAllAsRead = useCallback(() => {
        dispatch(resetUnreadCount());
    }, [dispatch]);

    // Initialize SignalR and fetch unread count when authenticated
    useEffect(() => {
        if (isAuthenticated) {
            // Fetch initial unread count
            fetchUnreadCount();

            // Start SignalR connection
            const startSignalR = async () => {
                try {
                    await signalRService.start();
                    signalRService.onReceiveNotification(
                        handleNotificationReceived,
                    );
                } catch (error) {
                    console.error("Failed to start SignalR:", error);
                }
            };

            startSignalR();

            // Cleanup function
            return () => {
                signalRService.offReceiveNotification(
                    handleNotificationReceived,
                );
            };
        } else {
            // Reset state when not authenticated
            dispatch(setUnreadCount(0));
            signalRService.stop();
        }
    }, [
        isAuthenticated,
        fetchUnreadCount,
        handleNotificationReceived,
        dispatch,
    ]);

    // Cleanup SignalR on component unmount
    useEffect(() => {
        return () => {
            signalRService.stop();
        };
    }, []);

    return {
        unreadCount,
        isLoading,
        error,
        fetchUnreadCount,
        handleMarkAllAsRead,
        signalRConnected: signalRService.isConnectionActive(),
    };
};
