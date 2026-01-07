import React from "react";
import { AlertTriangle, X } from "lucide-react";

const ConfirmDialog = ({ 
    isOpen, 
    onClose, 
    onConfirm, 
    onCancel,
    title = "Xác nhận", 
    message, 
    confirmText = "Xác nhận", 
    cancelText = "Hủy",
    type = "warning" // warning, danger, info
}) => {
    if (!isOpen) return null;

    const handleCancel = () => {
        if (onCancel) onCancel();
        onClose();
    };

    const handleConfirm = () => {
        onConfirm();
        onClose();
    };

    const getIcon = () => {
        switch (type) {
            case "danger":
                return <AlertTriangle className="w-8 h-8 text-red-500 mr-3" />;
            case "warning":
                return <AlertTriangle className="w-8 h-8 text-yellow-500 mr-3" />;
            case "info":
                return <AlertTriangle className="w-8 h-8 text-blue-500 mr-3" />;
            default:
                return <AlertTriangle className="w-8 h-8 text-yellow-500 mr-3" />;
        }
    };

    const getConfirmButtonStyle = () => {
        switch (type) {
            case "danger":
                return "bg-red-500 hover:bg-red-600";
            case "warning":
                return "bg-yellow-500 hover:bg-yellow-600";
            case "info":
                return "bg-blue-500 hover:bg-blue-600";
            default:
                return "bg-yellow-500 hover:bg-yellow-600";
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <div className="flex items-center mb-4">
                    {getIcon()}
                    <h2 className="text-xl font-bold flex-1">{title}</h2>
                    <button
                        onClick={handleCancel}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="text-gray-600 mb-6">
                    {typeof message === "string" ? (
                        <p>{message}</p>
                    ) : (
                        message
                    )}
                </div>

                <div className="flex justify-end space-x-3">
                    <button
                        onClick={handleCancel}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={handleConfirm}
                        className={`px-4 py-2 text-white rounded-lg transition-colors ${getConfirmButtonStyle()}`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmDialog;