import React, { useState } from "react";
import { X, Flag } from "lucide-react";
import { sendReport } from "../services/reportService";
import { useErrorHandler } from "../hooks/ErrorHandler";
import Notification from "./Notification";

const ReportDialog = ({
    isOpen,
    onClose,
    entityId,
    entityType,
    onReportSuccess,
}) => {
    const [reportReason, setReportReason] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccessNotification, setShowSuccessNotification] =
        useState(false);
    const { error, handleError, clearError } = useErrorHandler();

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!reportReason.trim()) {
            handleError("Vui lòng nhập lý do báo cáo");
            return;
        }

        if (!entityId) {
            handleError("Lỗi: Không thể xác định đối tượng cần báo cáo");
            return;
        }

        setIsSubmitting(true);
        clearError();

        try {
            await sendReport({
                reportedEntityId: entityId.toString(),
                reportedEntityType: entityType,
                reportReason: reportReason.trim(),
            });

            setShowSuccessNotification(true);

            if (onReportSuccess) {
                onReportSuccess();
            }

            handleClose();
        } catch (err) {
            handleError(
                err.response?.data?.error ||
                    err.message ||
                    "Gửi báo cáo thất bại",
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        setReportReason("");
        clearError();
        onClose();
    };

    const getEntityTypeText = () => {
        switch (entityType) {
            case "User":
                return "người dùng";
            case "Product":
                return "sản phẩm";
            case "Comment":
                return "bình luận";
            default:
                return "nội dung";
        }
    };

    return (
        <>
            <Notification
                isOpen={showSuccessNotification}
                onClose={() => setShowSuccessNotification(false)}
                message="Báo cáo đã được gửi thành công!"
                type="success"
            />

            {isOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center">
                                <Flag className="w-5 h-5 text-red-500 mr-2" />
                                <h3 className="text-lg font-semibold">
                                    Báo cáo {getEntityTypeText()}
                                </h3>
                            </div>
                            <button
                                onClick={handleClose}
                                className="text-gray-400 hover:text-gray-600"
                                disabled={isSubmitting}
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label
                                    htmlFor="reportReason"
                                    className="block text-sm font-medium text-gray-700 mb-2"
                                >
                                    Lý do báo cáo *
                                </label>
                                <textarea
                                    id="reportReason"
                                    value={reportReason}
                                    onChange={(e) =>
                                        setReportReason(e.target.value)
                                    }
                                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    rows={4}
                                    placeholder="Vui lòng mô tả lý do báo cáo..."
                                    disabled={isSubmitting}
                                />
                            </div>

                            {error && (
                                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                                    {error}
                                </div>
                            )}

                            <div className="flex space-x-3">
                                <button
                                    type="button"
                                    onClick={handleClose}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                                    disabled={isSubmitting}
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:opacity-50 flex items-center justify-center"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                        <>
                                            <Flag className="w-4 h-4 mr-2" />
                                            Gửi báo cáo
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default ReportDialog;
