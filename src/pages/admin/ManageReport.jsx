import React, { useState, useEffect, useCallback } from "react";
import {
    Search,
    Trash2,
    AlertTriangle,
    ChevronLeft,
    ChevronRight,
    FileText,
    User,
    Package,
    MessageSquare,
    Calendar,
    CheckCircle,
    XCircle,
    Clock,
    Eye,
} from "lucide-react";
import {
    getAllReports,
    updateReportStatus,
    deleteReport,
} from "../../services/reportService";
import { formatDateLocal } from "../../helpers/formatDate";
import { useDialog } from "../../hooks/useDialog";

const ManageReport = () => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [hasNext, setHasNext] = useState(false);
    const [hasPrevious, setHasPrevious] = useState(false);
    const [error, setError] = useState(null);
    const [selectedReport, setSelectedReport] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);

    const { confirm, confirmDelete, showSuccess, showError } = useDialog();

    const statusOptions = [
        { value: "", label: "Tất cả trạng thái" },
        { value: "Pending", label: "Chờ xử lý" },
        { value: "Approved", label: "Đã duyệt" },
        { value: "Rejected", label: "Đã từ chối" },
    ];

    const fetchReports = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await getAllReports(
                currentPage,
                pageSize,
                statusFilter,
            );

            setReports(response.items || []);
            setTotalCount(response.totalCount || 0);
            setTotalPages(response.totalPages || 1);
            setHasNext(response.hasNext || false);
            setHasPrevious(response.hasPrevious || false);
        } catch (error) {
            console.error("Error fetching reports:", error);
            setError("Không thể tải danh sách báo cáo. Vui lòng thử lại.");
        } finally {
            setLoading(false);
        }
    }, [currentPage, pageSize, statusFilter]);

    useEffect(() => {
        fetchReports();
    }, [fetchReports]);

    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => {
                setError(null);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [error]);

    const handleStatusChange = async (reportId, newStatus) => {
        try {
            const reportName = `Báo cáo #${reportId}`;
            const statusText = statusOptions.find(
                (opt) => opt.value === newStatus,
            )?.label;

            await confirm(
                `Bạn có chắc chắn muốn thay đổi trạng thái của ${reportName} thành "${statusText}"?`,
                {
                    title: "Xác nhận thay đổi trạng thái",
                    confirmText: "Xác nhận",
                },
            );

            setError(null);
            await updateReportStatus(reportId, newStatus);
            showSuccess("Cập nhật trạng thái báo cáo thành công!");
            await fetchReports();
        } catch (error) {
            if (error !== false) {
                console.error("Error updating report status:", error);
                const errorMessage =
                    error.response?.data?.message ||
                    "Không thể cập nhật trạng thái báo cáo. Vui lòng thử lại.";
                showError(errorMessage);
            }
        }
    };

    const handleDelete = async (reportId, reportReason) => {
        try {
            await confirmDelete(
                `Bạn có chắc chắn muốn xóa báo cáo "${reportReason}"?`,
                {
                    title: "Xóa báo cáo",
                    confirmText: "Xóa",
                },
            );

            setError(null);
            await deleteReport(reportId);
            showSuccess("Xóa báo cáo thành công!");
            await fetchReports();
        } catch (error) {
            if (error !== false) {
                console.error("Error deleting report:", error);
                const errorMessage =
                    error.response?.data?.message ||
                    "Không thể xóa báo cáo. Vui lòng thử lại.";
                showError(errorMessage);
            }
        }
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            Pending: {
                color: "bg-yellow-100 text-yellow-800",
                icon: <Clock className="w-3 h-3" />,
                text: "Chờ xử lý",
            },
            Approved: {
                color: "bg-green-100 text-green-800",
                icon: <CheckCircle className="w-3 h-3" />,
                text: "Đã duyệt",
            },
            Rejected: {
                color: "bg-red-100 text-red-800",
                icon: <XCircle className="w-3 h-3" />,
                text: "Đã từ chối",
            },
        };

        const config = statusConfig[status] || statusConfig.Pending;

        return (
            <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}
            >
                {config.icon}
                <span className="ml-1">{config.text}</span>
            </span>
        );
    };

    const getEntityIcon = (entityType) => {
        switch (entityType) {
            case "User":
                return <User className="w-4 h-4 text-blue-500" />;
            case "Product":
                return <Package className="w-4 h-4 text-green-500" />;
            case "Comment":
                return <MessageSquare className="w-4 h-4 text-purple-500" />;
            default:
                return <FileText className="w-4 h-4 text-gray-500" />;
        }
    };

    const getEntityTypeText = (entityType) => {
        switch (entityType) {
            case "User":
                return "Người dùng";
            case "Product":
                return "Sản phẩm";
            case "Comment":
                return "Bình luận";
            default:
                return entityType;
        }
    };

    const openDetailModal = (report) => {
        setSelectedReport(report);
        setShowDetailModal(true);
    };

    const closeDetailModal = () => {
        setSelectedReport(null);
        setShowDetailModal(false);
    };

    // Filter reports based on search query (client-side filtering)
    const filteredReports = reports.filter((report) => {
        const matchesSearch =
            report.reportReason
                .toLowerCase()
                .includes(searchQuery.toLowerCase()) ||
            report.reporterName
                .toLowerCase()
                .includes(searchQuery.toLowerCase()) ||
            report.reportId.toString().includes(searchQuery) ||
            getEntityTypeText(report.reportedEntityType)
                .toLowerCase()
                .includes(searchQuery.toLowerCase());

        return matchesSearch;
    });

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Quản lý báo cáo
                    </h1>
                    <p className="text-gray-600 mt-1">
                        Tổng cộng {totalCount} báo cáo
                    </p>
                </div>
            </div>

            {/* Alert Messages */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    {error}
                </div>
            )}

            {/* Search and Filters */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <div className="flex gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm theo ID, lý do, người báo cáo..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-white text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    <select
                        value={statusFilter}
                        onChange={(e) => {
                            setStatusFilter(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="px-3 py-2 border bg-white text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        {statusOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                    <select
                        value={pageSize}
                        onChange={(e) => {
                            setPageSize(Number(e.target.value));
                            setCurrentPage(1);
                        }}
                        className="px-3 py-2 border bg-white text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value={10}>10 / trang</option>
                        <option value={25}>25 / trang</option>
                        <option value={50}>50 / trang</option>
                    </select>
                </div>
            </div>

            {/* Reports Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    ID & Người báo cáo
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Loại & Đối tượng
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Lý do báo cáo
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Ngày báo cáo
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Trạng thái
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Thao tác
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredReports.length > 0 ? (
                                filteredReports.map((report) => (
                                    <tr
                                        key={report.reportId}
                                        className="hover:bg-gray-50"
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">
                                                    #{report.reportId}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {report.reporterName}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                {getEntityIcon(
                                                    report.reportedEntityType,
                                                )}
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {getEntityTypeText(
                                                            report.reportedEntityType,
                                                        )}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        ID:{" "}
                                                        {
                                                            report.reportedEntityId
                                                        }
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-900 max-w-xs truncate">
                                                {report.reportReason}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-4 h-4 text-gray-400" />
                                                <span className="text-sm text-gray-900">
                                                    {formatDateLocal(
                                                        report.reportedDate,
                                                    )}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {getStatusBadge(report.status)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() =>
                                                        openDetailModal(report)
                                                    }
                                                    className="inline-flex items-center px-3 py-1.5 rounded-md text-xs font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors"
                                                    title="Xem chi tiết"
                                                >
                                                    <Eye className="w-3 h-3 mr-1" />
                                                    Xem
                                                </button>

                                                {report.status ===
                                                    "Pending" && (
                                                    <>
                                                        <button
                                                            onClick={() =>
                                                                handleStatusChange(
                                                                    report.reportId,
                                                                    "Approved",
                                                                )
                                                            }
                                                            className="inline-flex items-center px-3 py-1.5 rounded-md text-xs font-medium bg-green-100 text-green-700 hover:bg-green-200 transition-colors"
                                                            title="Duyệt báo cáo"
                                                        >
                                                            <CheckCircle className="w-3 h-3 mr-1" />
                                                            Duyệt
                                                        </button>
                                                        <button
                                                            onClick={() =>
                                                                handleStatusChange(
                                                                    report.reportId,
                                                                    "Rejected",
                                                                )
                                                            }
                                                            className="inline-flex items-center px-3 py-1.5 rounded-md text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
                                                            title="Từ chối báo cáo"
                                                        >
                                                            <XCircle className="w-3 h-3 mr-1" />
                                                            Từ chối
                                                        </button>
                                                    </>
                                                )}

                                                <button
                                                    onClick={() =>
                                                        handleDelete(
                                                            report.reportId,
                                                            report.reportReason,
                                                        )
                                                    }
                                                    className="inline-flex items-center px-3 py-1.5 rounded-md text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
                                                    title="Xóa báo cáo"
                                                >
                                                    <Trash2 className="w-3 h-3 mr-1" />
                                                    Xóa
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan={6}
                                        className="px-6 py-12 text-center"
                                    >
                                        <div className="flex flex-col items-center gap-3">
                                            <FileText className="w-12 h-12 text-gray-400" />
                                            <p className="text-gray-500">
                                                {searchQuery || statusFilter
                                                    ? "Không tìm thấy báo cáo phù hợp"
                                                    : "Chưa có báo cáo nào"}
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination */}
            <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-700">
                        <span>
                            Hiển thị {(currentPage - 1) * pageSize + 1} đến{" "}
                            {Math.min(currentPage * pageSize, totalCount)} trong
                            tổng số {totalCount} kết quả
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={!hasPrevious}
                            className="relative inline-flex items-center px-3 py-2 rounded-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ChevronLeft className="w-4 h-4" />
                            Trước
                        </button>

                        <div className="flex gap-1">
                            {Array.from(
                                { length: totalPages },
                                (_, i) => i + 1,
                            ).map((page) => (
                                <button
                                    key={page}
                                    onClick={() => handlePageChange(page)}
                                    className={`relative inline-flex items-center px-3 py-2 rounded-md border text-sm font-medium ${
                                        page === currentPage
                                            ? "border-blue-500 bg-blue-50 text-blue-600"
                                            : "border-gray-300 bg-white text-gray-500 hover:bg-gray-50"
                                    }`}
                                >
                                    {page}
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={!hasNext}
                            className="relative inline-flex items-center px-3 py-2 rounded-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Sau
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Detail Modal */}
            {showDetailModal && selectedReport && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto">
                        <div className="flex justify-between items-start mb-6">
                            <h3 className="text-lg font-semibold text-gray-900">
                                Chi tiết báo cáo #{selectedReport.reportId}
                            </h3>
                            <button
                                onClick={closeDetailModal}
                                className="text-gray-400 hover:text-gray-600 text-xl font-bold"
                            >
                                ×
                            </button>
                        </div>

                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Người báo cáo
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <User className="w-4 h-4 text-gray-500" />
                                        <span className="text-gray-900">
                                            {selectedReport.reporterName}
                                        </span>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Trạng thái
                                    </label>
                                    {getStatusBadge(selectedReport.status)}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Loại đối tượng
                                    </label>
                                    <div className="flex items-center gap-2">
                                        {getEntityIcon(
                                            selectedReport.reportedEntityType,
                                        )}
                                        <span className="text-gray-900">
                                            {getEntityTypeText(
                                                selectedReport.reportedEntityType,
                                            )}
                                        </span>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        ID đối tượng
                                    </label>
                                    <span className="text-gray-900">
                                        {selectedReport.reportedEntityId}
                                    </span>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Lý do báo cáo
                                </label>
                                <div className="bg-gray-50 p-3 rounded-lg">
                                    <p className="text-gray-900">
                                        {selectedReport.reportReason}
                                    </p>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Ngày báo cáo
                                </label>
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-gray-500" />
                                    <span className="text-gray-900">
                                        {formatDateLocal(
                                            selectedReport.reportedDate,
                                        )}
                                    </span>
                                </div>
                            </div>

                            {selectedReport.status === "Pending" && (
                                <div className="flex gap-3 pt-4 border-t">
                                    <button
                                        onClick={() => {
                                            closeDetailModal();
                                            handleStatusChange(
                                                selectedReport.reportId,
                                                "Approved",
                                            );
                                        }}
                                        className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                                    >
                                        <CheckCircle className="w-4 h-4" />
                                        Duyệt báo cáo
                                    </button>
                                    <button
                                        onClick={() => {
                                            closeDetailModal();
                                            handleStatusChange(
                                                selectedReport.reportId,
                                                "Rejected",
                                            );
                                        }}
                                        className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                                    >
                                        <XCircle className="w-4 h-4" />
                                        Từ chối báo cáo
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageReport;
