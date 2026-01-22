import axiosInstance from "./axiosInstance";

const notificationService = {
    // Get all notifications
    getAllNotifications: async (pageSize = 50) => {
        try {
            const response = await axiosInstance.get(
                `/api/Notification?pageSize=${pageSize}`,
            );
            return response;
        } catch (error) {
            console.error("Error fetching notifications:", error);
            throw error;
        }
    },

    // Get unread count
    getUnreadCount: async () => {
        try {
            const response = await axiosInstance.get(
                "/api/Notification/unreadCount",
            );
            return response;
        } catch (error) {
            console.error("Error fetching unread count:", error);
            throw error;
        }
    },

    // Mark notification as read
    markAsRead: async (notificationId) => {
        try {
            const response = await axiosInstance.put(
                `/api/Notification/${notificationId}/read`,
            );
            return response;
        } catch (error) {
            console.error("Error marking notification as read:", error);
            throw error;
        }
    },

    // Delete notification
    deleteNotification: async (notificationId) => {
        try {
            const response = await axiosInstance.delete(
                `/api/Notification/${notificationId}`,
            );
            return response;
        } catch (error) {
            console.error("Error deleting notification:", error);
            throw error;
        }
    },

    // Mark all notifications as read
    markAllAsRead: async (notificationIds) => {
        try {
            const promises = notificationIds.map((id) =>
                axiosInstance.put(`/api/Notification/${id}/read`),
            );
            const results = await Promise.all(promises);
            return results;
        } catch (error) {
            console.error("Error marking all notifications as read:", error);
            throw error;
        }
    },
};

export default notificationService;
