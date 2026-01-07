import React, { useState, useEffect } from "react";
import {
    Search,
    Filter,
    UserCheck,
    UserX,
    Trash2,
    ChevronLeft,
    ChevronRight,
    Mail,
    Phone,
    MapPin,
    Calendar,
    AlertTriangle,
} from "lucide-react";
import { getAllUsers, banUser, deleteUser } from "../../services/userService";

const ManageUser = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [hasNext, setHasNext] = useState(false);
    const [hasPrevious, setHasPrevious] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchUsers();
    }, [currentPage, pageSize, searchQuery]);

    const fetchUsers = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await getAllUsers();
            const data = response;

            setUsers(data.items || []);
            setTotalCount(data.totalCount || 0);
            setTotalPages(data.totalPages || 1);
            setHasNext(data.hasNext || false);
            setHasPrevious(data.hasPrevious || false);
        } catch (error) {
            console.error("Error fetching users:", error);
            setError("Không thể tải danh sách người dùng. Vui lòng thử lại.");
        } finally {
            setLoading(false);
        }
    };

    const handleBanUser = async (userId, isBanned) => {
        const action = isBanned ? "bỏ cấm" : "cấm";
        const confirmMessage = isBanned
            ? "Bạn có chắc chắn muốn bỏ cấm người dùng này?"
            : "Bạn có chắc chắn muốn cấm người dùng này?";

        if (!window.confirm(confirmMessage)) {
            return;
        }

        try {
            const response = await banUser(userId);
            console.log("Ban user response:", response);

            if (response) {
                setUsers(
                    users.map((user) =>
                        user.userId === userId
                            ? { ...user, isBanned: !isBanned }
                            : user
                    )
                );

                const successMessage =
                    response.message || `Đã ${action} người dùng thành công!`;
                alert(successMessage);
            }
        } catch (error) {
            console.error("Error updating user ban status:", error);
            alert(`Không thể ${action} người dùng. Vui lòng thử lại.`);
        }
    };

    const handleDeleteUser = async (userId) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa người dùng này?")) {
            try {
                const response = await deleteUser(userId);

                if (response.status === 200) {
                    // Remove user from local state
                    setUsers(users.filter((user) => user.userId !== userId));
                    setTotalCount((prev) => prev - 1);
                    console.log("Đã xóa người dùng thành công");

                    // If current page becomes empty and it's not the first page, go to previous page
                    if (users.length === 1 && currentPage > 1) {
                        setCurrentPage(currentPage - 1);
                    }
                }
            } catch (error) {
                console.error("Error deleting user:", error);
                alert("Không thể xóa người dùng. Vui lòng thử lại.");
            }
        }
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("vi-VN");
    };

    // Filter users based on search query
    const filteredUsers = users.filter((user) => {
        const searchLower = searchQuery.toLowerCase();
        return (
            user.userName?.toLowerCase().includes(searchLower) ||
            user.userEmail?.toLowerCase().includes(searchLower) ||
            user.fullName?.toLowerCase().includes(searchLower)
        );
    });

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col justify-center items-center min-h-96">
                <div className="text-red-500 text-lg mb-4">{error}</div>
                <button
                    onClick={fetchUsers}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                    Thử lại
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Quản lý người dùng
                    </h1>
                    <p className="text-gray-600 mt-1">
                        Tổng cộng {totalCount} người dùng
                    </p>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <div className="flex gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm theo tên, email, username..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    <select
                        value={pageSize}
                        onChange={(e) => {
                            setPageSize(Number(e.target.value));
                            setCurrentPage(1); // Reset to first page when changing page size
                        }}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value={10}>10 / trang</option>
                        <option value={25}>25 / trang</option>
                        <option value={50}>50 / trang</option>
                    </select>
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Người dùng
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Thông tin liên hệ
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Trạng thái
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Ngày tham gia
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Thao tác
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredUsers.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan="5"
                                        className="px-6 py-12 text-center text-gray-500"
                                    >
                                        {searchQuery
                                            ? "Không tìm thấy người dùng nào"
                                            : "Chưa có người dùng nào"}
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((user) => (
                                    <tr
                                        key={user.userId}
                                        className="hover:bg-gray-50"
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-12 w-12">
                                                    {user.avatarImage ? (
                                                        <img
                                                            className="h-12 w-12 rounded-full object-cover"
                                                            src={
                                                                user.avatarImage
                                                            }
                                                            alt={
                                                                user.fullName ||
                                                                user.userName
                                                            }
                                                            onError={(e) => {
                                                                e.target.src =
                                                                    "https://via.placeholder.com/48/6B7280/FFFFFF?text=" +
                                                                    encodeURIComponent(
                                                                        (
                                                                            user.fullName ||
                                                                            user.userName
                                                                        )
                                                                            .charAt(
                                                                                0
                                                                            )
                                                                            .toUpperCase()
                                                                    );
                                                            }}
                                                        />
                                                    ) : (
                                                        <div className="h-12 w-12 rounded-full bg-gray-400 flex items-center justify-center text-white font-medium text-lg">
                                                            {(
                                                                user.fullName ||
                                                                user.userName
                                                            )
                                                                .charAt(0)
                                                                .toUpperCase()}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {user.fullName ||
                                                            user.userName}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        @{user.userName}
                                                    </div>
                                                    {user.bio && (
                                                        <div className="text-xs text-gray-400 mt-1 max-w-xs truncate">
                                                            {user.bio}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="space-y-1">
                                                <div className="flex items-center text-sm text-gray-600">
                                                    <Mail className="w-4 h-4 mr-2" />
                                                    {user.userEmail}
                                                </div>
                                                {user.phoneNumber && (
                                                    <div className="flex items-center text-sm text-gray-600">
                                                        <Phone className="w-4 h-4 mr-2" />
                                                        {user.phoneNumber}
                                                    </div>
                                                )}
                                                {user.address && (
                                                    <div className="flex items-center text-sm text-gray-600">
                                                        <MapPin className="w-4 h-4 mr-2" />
                                                        <span className="max-w-xs truncate">
                                                            {user.address}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="space-y-2">
                                                <div className="flex items-center">
                                                    {user.isBanned ? (
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                            <UserX className="w-3 h-3 mr-1" />
                                                            Bị cấm
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                            <UserCheck className="w-3 h-3 mr-1" />
                                                            Hoạt động
                                                        </span>
                                                    )}
                                                </div>
                                                {user.warningCount > 0 && (
                                                    <div className="flex items-center text-xs text-orange-600">
                                                        <AlertTriangle className="w-3 h-3 mr-1" />
                                                        {user.warningCount} cảnh
                                                        báo
                                                    </div>
                                                )}
                                                <div className="flex items-center text-xs text-gray-500">
                                                    {user.emailConfirmed ? (
                                                        <span className="text-green-600">
                                                            ✓ Email xác thực
                                                        </span>
                                                    ) : (
                                                        <span className="text-red-600">
                                                            ✗ Email chưa xác
                                                            thực
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center text-sm text-gray-600">
                                                <Calendar className="w-4 h-4 mr-2" />
                                                {formatDate(user.createdAt)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() =>
                                                        handleBanUser(
                                                            user.userId,
                                                            user.isBanned
                                                        )
                                                    }
                                                    className={`inline-flex items-center px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                                                        user.isBanned
                                                            ? "bg-green-100 text-green-700 hover:bg-green-200"
                                                            : "bg-orange-100 text-orange-700 hover:bg-orange-200"
                                                    }`}
                                                >
                                                    {user.isBanned ? (
                                                        <>
                                                            <UserCheck className="w-3 h-3 mr-1" />
                                                            Bỏ cấm
                                                        </>
                                                    ) : (
                                                        <>
                                                            <UserX className="w-3 h-3 mr-1" />
                                                            Cấm
                                                        </>
                                                    )}
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        handleDeleteUser(
                                                            user.userId
                                                        )
                                                    }
                                                    className="inline-flex items-center px-3 py-1.5 rounded-md text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
                                                >
                                                    <Trash2 className="w-3 h-3 mr-1" />
                                                    Xóa
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center text-sm text-gray-700">
                            <span>
                                Hiển thị {(currentPage - 1) * pageSize + 1} đến{" "}
                                {Math.min(currentPage * pageSize, totalCount)}{" "}
                                trong tổng số {totalCount} kết quả
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() =>
                                    handlePageChange(currentPage - 1)
                                }
                                disabled={!hasPrevious}
                                className="relative inline-flex items-center px-3 py-2 rounded-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ChevronLeft className="w-4 h-4" />
                                Trước
                            </button>

                            <div className="flex gap-1">
                                {Array.from(
                                    { length: totalPages },
                                    (_, i) => i + 1
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
                                onClick={() =>
                                    handlePageChange(currentPage + 1)
                                }
                                disabled={!hasNext}
                                className="relative inline-flex items-center px-3 py-2 rounded-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Sau
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManageUser;
