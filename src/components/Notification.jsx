import React from "react";
import { CheckCircle, AlertCircle, X, AlertTriangle, Info } from "lucide-react";

const Notification = ({ 
    isOpen, 
    onClose, 
    message, 
    type = "info", // success, error, warning, info
    autoClose = true,
    duration = 3000 
}) => {
    React.useEffect(() => {
        if (isOpen && autoClose) {
            const timer = setTimeout(() => {
                onClose();
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [isOpen, autoClose, duration, onClose]);

    if (!isOpen) return null;

    const getIcon = () => {
        switch (type) {
            case "success":
                return <CheckCircle className="w-6 h-6 text-green-500" />;
            case "error":
                return <AlertCircle className="w-6 h-6 text-red-500" />;
            case "warning":
                return <AlertTriangle className="w-6 h-6 text-yellow-500" />;
            case "info":
                return <Info className="w-6 h-6 text-blue-500" />;
            default:
                return <Info className="w-6 h-6 text-blue-500" />;
        }
    };

    const getBgColor = () => {
        switch (type) {
            case "success":
                return "bg-green-50 border-green-200";
            case "error":
                return "bg-red-50 border-red-200";
            case "warning":
                return "bg-yellow-50 border-yellow-200";
            case "info":
                return "bg-blue-50 border-blue-200";
            default:
                return "bg-blue-50 border-blue-200";
        }
    };

    const getTextColor = () => {
        switch (type) {
            case "success":
                return "text-green-800";
            case "error":
                return "text-red-800";
            case "warning":
                return "text-yellow-800";
            case "info":
                return "text-blue-800";
            default:
                return "text-blue-800";
        }
    };

    return (
        <div className="fixed top-4 right-4 z-50">
            <div className={`flex items-center p-4 rounded-lg border shadow-lg ${getBgColor()}`}>
                {getIcon()}
                <div className={`ml-3 text-sm font-medium ${getTextColor()}`}>
                    {message}
                </div>
                <button
                    onClick={onClose}
                    className={`ml-auto -mx-1.5 -my-1.5 rounded-lg p-1.5 hover:bg-gray-200 transition-colors ${getTextColor()}`}
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};

export default Notification;