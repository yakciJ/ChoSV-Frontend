import React, { createContext, useState } from "react";
import ConfirmDialog from "../components/ConfirmDialog";
import Notification from "../components/Notification";

const DialogContext = createContext();

const DialogProvider = ({ children }) => {
    // Confirm Dialog State
    const [confirmDialog, setConfirmDialog] = useState({
        isOpen: false,
        title: "Xác nhận",
        message: "",
        confirmText: "Xác nhận",
        cancelText: "Hủy",
        type: "warning",
        onConfirm: () => {},
    });

    // Notification State
    const [notification, setNotification] = useState({
        isOpen: false,
        message: "",
        type: "info",
        autoClose: true,
        duration: 3000,
    });

    // Confirm Dialog Functions
    const showConfirm = ({
        title = "Xác nhận",
        message,
        confirmText = "Xác nhận",
        cancelText = "Hủy",
        type = "warning",
        onConfirm = () => {},
    }) => {
        return new Promise((resolve, reject) => {
            setConfirmDialog({
                isOpen: true,
                title,
                message,
                confirmText,
                cancelText,
                type,
                onConfirm: () => {
                    onConfirm();
                    resolve(true);
                },
                onCancel: () => {
                    reject(false);
                },
            });
        });
    };

    const hideConfirm = () => {
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
    };

    // Notification Functions
    const showNotification = ({
        message,
        type = "info",
        autoClose = true,
        duration = 3000,
    }) => {
        setNotification({
            isOpen: true,
            message,
            type,
            autoClose,
            duration,
        });
    };

    const hideNotification = () => {
        setNotification((prev) => ({ ...prev, isOpen: false }));
    };

    // Convenience methods
    const showSuccess = (message) =>
        showNotification({ message, type: "success" });
    const showError = (message) => showNotification({ message, type: "error" });
    const showWarning = (message) =>
        showNotification({ message, type: "warning" });
    const showInfo = (message) => showNotification({ message, type: "info" });

    const confirm = (message, options = {}) => {
        return showConfirm({
            message,
            type: "warning",
            ...options,
        });
    };

    const confirmDelete = (message, options = {}) => {
        return showConfirm({
            message,
            type: "danger",
            confirmText: "Xóa",
            ...options,
        });
    };

    const value = {
        // Confirm methods
        showConfirm,
        confirm,
        confirmDelete,

        // Notification methods
        showNotification,
        showSuccess,
        showError,
        showWarning,
        showInfo,
    };

    return (
        <DialogContext.Provider value={value}>
            {children}
            <ConfirmDialog
                isOpen={confirmDialog.isOpen}
                onClose={hideConfirm}
                onConfirm={confirmDialog.onConfirm}
                onCancel={confirmDialog.onCancel}
                title={confirmDialog.title}
                message={confirmDialog.message}
                confirmText={confirmDialog.confirmText}
                cancelText={confirmDialog.cancelText}
                type={confirmDialog.type}
            />
            <Notification
                isOpen={notification.isOpen}
                onClose={hideNotification}
                message={notification.message}
                type={notification.type}
                autoClose={notification.autoClose}
                duration={notification.duration}
            />
        </DialogContext.Provider>
    );
};

export { DialogProvider, DialogContext };
