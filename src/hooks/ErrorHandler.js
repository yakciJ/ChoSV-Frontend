import { useState } from "react";

export const useErrorHandler = () => {
    const [error, setError] = useState(null);

    const handleError = (err) => {
        const errorMessage = err.response?.data?.error?.toLowerCase() || "";
        const statusCode = err.response?.status;

        // Define error message patterns
        const notFoundPatterns = [
            "không tìm thấy",
            "not found",
            "không có",
            "không tồn tại",
        ];

        const forbiddenPatterns = [
            "không có quyền",
            "forbidden",
            "access denied",
        ];

        // Check if it's a not found error
        if (
            notFoundPatterns.some((pattern) =>
                errorMessage.includes(pattern)
            ) ||
            statusCode === 404
        ) {
            setError("not-found");
        }
        // Check if it's a forbidden error
        else if (
            forbiddenPatterns.some((pattern) =>
                errorMessage.includes(pattern)
            ) ||
            statusCode === 403
        ) {
            setError("forbidden");
        }
        // Check server errors
        else if (statusCode >= 500) {
            setError("server-error");
        }
        // Check network errors
        else if (!err.response) {
            setError("network-error");
        }
        // Default to server error
        else {
            setError("server-error");
        }
    };

    const clearError = () => setError(null);

    return { error, handleError, clearError };
};
