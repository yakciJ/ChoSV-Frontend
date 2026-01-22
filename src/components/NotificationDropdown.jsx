import { useState, useEffect, useRef, useCallback } from "react";
import { X } from "lucide-react";
import notificationService from "../services/notificationService";
import { formatDate } from "../helpers/formatDate";

export default function NotificationDropdown({ isOpen, onClose }) {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef(null);

    const fetchNotifications = useCallback(async () => {
        setLoading(true);
        try {
            const response = await notificationService.getAllNotifications(50);
            setNotifications(response.items || []);

            // Mark all unread notifications as read
            const unreadNotifications =
                response.items?.filter((n) => !n.isRead) || [];
            if (unreadNotifications.length > 0) {
                const unreadIds = unreadNotifications.map(
                    (n) => n.notificationId,
                );
                await notificationService.markAllAsRead(unreadIds);

                // Update local state to reflect that notifications are now read
                setNotifications((prev) =>
                    prev.map((notification) => ({
                        ...notification,
                        isRead: true,
                    })),
                );
            }
        } catch (error) {
            console.error("Error fetching notifications:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (isOpen) {
            fetchNotifications();
        }
    }, [isOpen, fetchNotifications]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target)
            ) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen, onClose]);

    const handleDeleteNotification = async (notificationId) => {
        try {
            await notificationService.deleteNotification(notificationId);
            setNotifications((prev) =>
                prev.filter((n) => n.notificationId !== notificationId),
            );
        } catch (error) {
            console.error("Error deleting notification:", error);
        }
    };

    const formatNotificationTime = (createdAt) => {
        const date = new Date(createdAt);
        const now = new Date();
        const diffInMinutes = Math.floor((now - date) / (1000 * 60));

        if (diffInMinutes < 1) return "Vừa xong";
        if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;

        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `${diffInHours} giờ trước`;

        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays < 7) return `${diffInDays} ngày trước`;

        return formatDate(createdAt);
    };

    if (!isOpen) return null;

    return (
        <div
            ref={dropdownRef}
            className="absolute right-0 mt-2 w-96 bg-white border border-gray-200 rounded-lg shadow-lg z-50"
        >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800">
                    Thông báo
                </h3>
                <button
                    onClick={onClose}
                    className="p-1 hover:bg-gray-100 rounded-full"
                >
                    <X size={20} className="text-gray-600" />
                </button>
            </div>

            {/* Notifications List */}
            <div className="max-h-96 overflow-y-auto">
                {loading ? (
                    <div className="p-4 text-center">
                        <div className="text-gray-500">Đang tải...</div>
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="p-8 text-center">
                        <div className="text-gray-500">
                            Không có thông báo nào
                        </div>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-200">
                        {notifications.map((notification) => (
                            <div
                                key={notification.notificationId}
                                className={`p-4 hover:bg-gray-50 transition-colors ${
                                    !notification.isRead ? "bg-blue-50" : ""
                                }`}
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-gray-800 leading-relaxed">
                                            {notification.message ||
                                                "Thông báo không có nội dung"}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {formatNotificationTime(
                                                notification.createdAt,
                                            )}
                                        </p>
                                        {!notification.isRead && (
                                            <div className="flex items-center gap-1 mt-1">
                                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                                <span className="text-xs text-blue-600 font-medium">
                                                    Mới
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    <button
                                        onClick={() =>
                                            handleDeleteNotification(
                                                notification.notificationId,
                                            )
                                        }
                                        className="flex-shrink-0 p-1 hover:bg-gray-200 rounded-full transition-colors"
                                        title="Xóa thông báo"
                                    >
                                        <X
                                            size={16}
                                            className="text-gray-500"
                                        />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
                <div className="p-3 border-t border-gray-200 bg-gray-50">
                    <div className="text-center">
                        <span className="text-sm text-gray-600">
                            {notifications.length} thông báo
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}
