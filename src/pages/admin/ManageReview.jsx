import React, { useState, useEffect, useCallback } from "react";
import {
    Search,
    Trash2,
    User,
    MessageSquare,
    Calendar,
    AlertTriangle,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import {
    getAllUserWallPosts,
    deleteUserWallPostAdmin,
} from "../../services/userWallPostService";
import { formatDateLocal } from "../../helpers/formatDate";
import { useDialog } from "../../hooks/useDialog";

const ManageReview = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [hasNext, setHasNext] = useState(false);
    const [hasPrevious, setHasPrevious] = useState(false);
    const [error, setError] = useState(null);

    const { confirmDelete, showSuccess, showError } = useDialog();

    const fetchReviews = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await getAllUserWallPosts(currentPage, pageSize);
            const data = response;

            setReviews(data.items || []);
            setTotalCount(data.totalCount || 0);
            setTotalPages(data.totalPages || 1);
            setHasNext(data.hasNext || false);
            setHasPrevious(data.hasPrevious || false);
        } catch (error) {
            console.error("Error fetching reviews:", error);
            setError("Không thể tải danh sách đánh giá. Vui lòng thử lại.");
        } finally {
            setLoading(false);
        }
    }, [currentPage, pageSize]);

    useEffect(() => {
        fetchReviews();
    }, [fetchReviews]);

    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => {
                setError(null);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [error]);

    const handleDeleteClick = async (review) => {
        try {
            await confirmDelete(
                `Bạn có chắc chắn muốn xóa đánh giá từ "${review.posterUserName}"?`,
                {
                    title: "Xóa đánh giá",
                    confirmText: "Xóa",
                }
            );

            setError(null);
            await deleteUserWallPostAdmin(review.userWallPostId);
            showSuccess("Xóa đánh giá thành công!");
            fetchReviews();
        } catch (error) {
            if (error !== false) {
                // false means user cancelled, don't show error
                console.error("Error deleting review:", error);
                showError("Không thể xóa đánh giá. Vui lòng thử lại.");
            }
        }
    };

    // Filter reviews based on search query
    const filteredReviews = reviews.filter(
        (review) =>
            review.commentContent
                .toLowerCase()
                .includes(searchQuery.toLowerCase()) ||
            review.posterUserName
                .toLowerCase()
                .includes(searchQuery.toLowerCase())
    );

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

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
                    <h1 className="text-3xl font-bold text-gray-900">
                        Quản lý đánh giá
                    </h1>
                    <p className="text-gray-600 mt-1">
                        Tổng cộng {totalCount} đánh giá từ người dùng
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
            <div className="flex gap-4 items-center">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Tìm kiếm theo nội dung hoặc tên người dùng..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <select
                    value={pageSize}
                    onChange={(e) => setPageSize(parseInt(e.target.value))}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                    <option value={10}>10 / trang</option>
                    <option value={25}>25 / trang</option>
                    <option value={50}>50 / trang</option>
                </select>
            </div>

            {/* Reviews Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Người viết
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Nội dung đánh giá
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Ngày tạo
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Thao tác
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredReviews.length > 0 ? (
                                filteredReviews.map((review) => (
                                    <tr
                                        key={review.userWallPostId}
                                        className="hover:bg-gray-50"
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                                                    <User className="w-6 h-6 text-white" />
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {review.posterUserName}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        ID: {review.posterId}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-start gap-2">
                                                <MessageSquare className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
                                                <div className="text-sm text-gray-900 max-w-md">
                                                    {review.commentContent}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-4 h-4 text-gray-400" />
                                                <span className="text-sm text-gray-900">
                                                    {formatDateLocal(
                                                        review.createdAt
                                                    )}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <button
                                                onClick={() =>
                                                    handleDeleteClick(review)
                                                }
                                                className="text-red-600 hover:text-red-900 transition-colors p-2 hover:bg-red-50 rounded"
                                                title="Xóa đánh giá"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan={4}
                                        className="px-6 py-12 text-center"
                                    >
                                        <div className="flex flex-col items-center gap-3">
                                            <MessageSquare className="w-12 h-12 text-gray-400" />
                                            <p className="text-gray-500">
                                                {searchQuery
                                                    ? "Không tìm thấy đánh giá phù hợp"
                                                    : "Chưa có đánh giá nào"}
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
            {totalPages > 1 && (
                <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-700">
                        Hiển thị{" "}
                        <span className="font-medium">
                            {(currentPage - 1) * pageSize + 1}
                        </span>{" "}
                        đến{" "}
                        <span className="font-medium">
                            {Math.min(currentPage * pageSize, totalCount)}
                        </span>{" "}
                        của <span className="font-medium">{totalCount}</span>{" "}
                        đánh giá
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={!hasPrevious}
                            className={`px-3 py-2 rounded-lg border flex items-center gap-2 ${
                                !hasPrevious
                                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                    : "bg-white text-gray-700 hover:bg-gray-50 border-gray-300"
                            }`}
                        >
                            <ChevronLeft className="w-4 h-4" />
                            Trước
                        </button>

                        <div className="flex gap-1">
                            {Array.from(
                                { length: Math.min(5, totalPages) },
                                (_, i) => {
                                    const pageNumber = Math.max(
                                        1,
                                        Math.min(
                                            currentPage - 2 + i,
                                            totalPages - 4 + i
                                        )
                                    );

                                    if (pageNumber > totalPages) return null;

                                    return (
                                        <button
                                            key={pageNumber}
                                            onClick={() =>
                                                handlePageChange(pageNumber)
                                            }
                                            className={`px-3 py-2 rounded-lg border ${
                                                pageNumber === currentPage
                                                    ? "bg-blue-500 text-white border-blue-500"
                                                    : "bg-white text-gray-700 hover:bg-gray-50 border-gray-300"
                                            }`}
                                        >
                                            {pageNumber}
                                        </button>
                                    );
                                }
                            )}
                        </div>

                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={!hasNext}
                            className={`px-3 py-2 rounded-lg border flex items-center gap-2 ${
                                !hasNext
                                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                    : "bg-white text-gray-700 hover:bg-gray-50 border-gray-300"
                            }`}
                        >
                            Sau
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageReview;
