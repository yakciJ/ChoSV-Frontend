import React, { useState, useEffect, useCallback } from "react";
import {
    Users,
    Package,
    MessageSquare,
    FileText,
    TrendingUp,
    TrendingDown,
    Activity,
    Calendar,
    Eye,
    CheckCircle,
    XCircle,
    Clock,
} from "lucide-react";
import { getAllUsers } from "../../services/userService";
import { getAllProductsAdmin } from "../../services/productService";
import { getAllCategories } from "../../services/categoryService";
import { getAllUserWallPosts } from "../../services/userWallPostService";

const flattenCategories = (categories) => {
    let result = [];
    categories.forEach((category) => {
        result.push(category);
        if (category.childs && category.childs.length > 0) {
            result = result.concat(flattenCategories(category.childs));
        }
    });
    return result;
};

const AdminDashboard = () => {
    const [loading, setLoading] = useState(true);
    const [dashboardData, setDashboardData] = useState({
        users: {
            total: 0,
            recent: [],
        },
        products: {
            total: 0,
            pending: 0,
            approved: 0,
            rejected: 0,
            recent: [],
        },
        categories: {
            total: 0,
            data: [],
        },
        reviews: {
            total: 0,
            recent: [],
        },
    });
    const [error, setError] = useState(null);

    const fetchDashboardData = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            // Fetch all data in parallel
            const [
                usersResponse,
                productsResponse,
                categoriesResponse,
                reviewsResponse,
            ] = await Promise.all([
                getAllUsers().catch(() => ({ items: [], totalCount: 0 })),
                getAllProductsAdmin().catch(() => ({
                    items: [],
                    totalCount: 0,
                })),
                getAllCategories().catch(() => []),
                getAllUserWallPosts(1, 5).catch(() => ({
                    items: [],
                    totalCount: 0,
                })),
            ]);

            // Process users data
            const users = usersResponse.items || [];
            const recentUsers = users.slice(0, 5);

            // Process products data
            const products = productsResponse.items || [];
            const productStats = products.reduce(
                (acc, product) => {
                    acc.total++;
                    switch (product.status?.toLowerCase()) {
                        case "pending":
                            acc.pending++;
                            break;
                        case "approved":
                            acc.approved++;
                            break;
                        case "rejected":
                            acc.rejected++;
                            break;
                        default:
                            break;
                    }
                    return acc;
                },
                { total: 0, pending: 0, approved: 0, rejected: 0 }
            );
            const recentProducts = products.slice(0, 5);

            // Process categories data
            const categories = categoriesResponse || [];
            const flatCategories = flattenCategories(categories);

            // Process reviews data
            const reviews = reviewsResponse.items || [];
            const recentReviews = reviews.slice(0, 5);

            setDashboardData({
                users: {
                    total: usersResponse.totalCount || users.length,
                    recent: recentUsers,
                },
                products: {
                    ...productStats,
                    total: productsResponse.totalCount || products.length,
                    recent: recentProducts,
                },
                categories: {
                    total: flatCategories.length,
                    data: flatCategories,
                },
                reviews: {
                    total: reviewsResponse.totalCount || reviews.length,
                    recent: recentReviews,
                },
            });
        } catch (error) {
            console.error("Error fetching dashboard data:", error);
            setError("Không thể tải dữ liệu dashboard. Vui lòng thử lại.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case "pending":
                return "text-yellow-600 bg-yellow-100";
            case "approved":
                return "text-green-600 bg-green-100";
            case "rejected":
                return "text-red-600 bg-red-100";
            case "sold":
                return "text-blue-600 bg-blue-100";
            default:
                return "text-gray-600 bg-gray-100";
        }
    };

    const getStatusIcon = (status) => {
        switch (status?.toLowerCase()) {
            case "pending":
                return <Clock className="w-4 h-4" />;
            case "approved":
                return <CheckCircle className="w-4 h-4" />;
            case "rejected":
                return <XCircle className="w-4 h-4" />;
            default:
                return <Activity className="w-4 h-4" />;
        }
    };

    const formatDate = (dateString) => {
        try {
            return new Date(dateString).toLocaleDateString("vi-VN", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            });
        } catch {
            return "N/A";
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">
                    Dashboard Quản Trị
                </h1>
                <p className="text-gray-600 mt-1">
                    Tổng quan về hệ thống Chợ Sinh Viên
                </p>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Users Stats */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">
                                Tổng người dùng
                            </p>
                            <p className="text-3xl font-bold text-blue-600">
                                {dashboardData.users.total.toLocaleString()}
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Users className="w-6 h-6 text-blue-600" />
                        </div>
                    </div>
                </div>

                {/* Products Stats */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">
                                Tổng sản phẩm
                            </p>
                            <p className="text-3xl font-bold text-green-600">
                                {dashboardData.products.total.toLocaleString()}
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                            <Package className="w-6 h-6 text-green-600" />
                        </div>
                    </div>
                </div>

                {/* Categories Stats */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">
                                Tổng danh mục
                            </p>
                            <p className="text-3xl font-bold text-purple-600">
                                {dashboardData.categories.total.toLocaleString()}
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                            <FileText className="w-6 h-6 text-purple-600" />
                        </div>
                    </div>
                </div>

                {/* Reviews Stats */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">
                                Tổng đánh giá
                            </p>
                            <p className="text-3xl font-bold text-orange-600">
                                {dashboardData.reviews.total.toLocaleString()}
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                            <MessageSquare className="w-6 h-6 text-orange-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Product Status Overview */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Trạng thái sản phẩm
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                        <div className="flex items-center gap-3">
                            <Clock className="w-5 h-5 text-yellow-600" />
                            <span className="font-medium text-yellow-700">
                                Chờ duyệt
                            </span>
                        </div>
                        <span className="text-2xl font-bold text-yellow-600">
                            {dashboardData.products.pending}
                        </span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex items-center gap-3">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                            <span className="font-medium text-green-700">
                                Đã duyệt
                            </span>
                        </div>
                        <span className="text-2xl font-bold text-green-600">
                            {dashboardData.products.approved}
                        </span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
                        <div className="flex items-center gap-3">
                            <XCircle className="w-5 h-5 text-red-600" />
                            <span className="font-medium text-red-700">
                                Bị từ chối
                            </span>
                        </div>
                        <span className="text-2xl font-bold text-red-600">
                            {dashboardData.products.rejected}
                        </span>
                    </div>
                </div>
            </div>

            {/* Recent Data Tables */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Users */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold text-gray-900">
                            Người dùng mới nhất
                        </h2>
                        <Users className="w-5 h-5 text-gray-400" />
                    </div>
                    <div className="space-y-3">
                        {dashboardData.users.recent.length > 0 ? (
                            dashboardData.users.recent.map((user, index) => (
                                <div
                                    key={index}
                                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                                            <span className="text-sm font-medium text-white">
                                                {user.userName?.[0]?.toUpperCase() ||
                                                    "U"}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">
                                                {user.userName || "N/A"}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                {user.email || "N/A"}
                                            </p>
                                        </div>
                                    </div>
                                    <span className="text-sm text-gray-500">
                                        {user.createdAt
                                            ? formatDate(user.createdAt)
                                            : "N/A"}
                                    </span>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-500 text-center py-4">
                                Không có dữ liệu
                            </p>
                        )}
                    </div>
                </div>

                {/* Recent Products */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold text-gray-900">
                            Sản phẩm mới nhất
                        </h2>
                        <Package className="w-5 h-5 text-gray-400" />
                    </div>
                    <div className="space-y-3">
                        {dashboardData.products.recent.length > 0 ? (
                            dashboardData.products.recent.map(
                                (product, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                    >
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-gray-900 truncate">
                                                {product.productName || "N/A"}
                                            </p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span
                                                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                                        product.status
                                                    )}`}
                                                >
                                                    {getStatusIcon(
                                                        product.status
                                                    )}
                                                    {product.status || "N/A"}
                                                </span>
                                            </div>
                                        </div>
                                        <span className="text-sm text-gray-500 ml-2">
                                            {product.createdAt
                                                ? formatDate(product.createdAt)
                                                : "N/A"}
                                        </span>
                                    </div>
                                )
                            )
                        ) : (
                            <p className="text-gray-500 text-center py-4">
                                Không có dữ liệu
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Recent Reviews */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-900">
                        Đánh giá mới nhất
                    </h2>
                    <MessageSquare className="w-5 h-5 text-gray-400" />
                </div>
                <div className="space-y-3">
                    {dashboardData.reviews.recent.length > 0 ? (
                        dashboardData.reviews.recent.map((review, index) => (
                            <div
                                key={index}
                                className="flex items-start justify-between p-4 bg-gray-50 rounded-lg"
                            >
                                <div className="flex items-start gap-3 flex-1 min-w-0">
                                    <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                                        <span className="text-sm font-medium text-white">
                                            {review.posterUserName?.[0]?.toUpperCase() ||
                                                "U"}
                                        </span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-gray-900">
                                            {review.posterUserName || "N/A"}
                                        </p>
                                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                            {review.commentContent || "N/A"}
                                        </p>
                                    </div>
                                </div>
                                <span className="text-sm text-gray-500 ml-3 flex-shrink-0">
                                    {review.createdAt
                                        ? formatDate(review.createdAt)
                                        : "N/A"}
                                </span>
                            </div>
                        ))
                    ) : (
                        <p className="text-gray-500 text-center py-4">
                            Không có dữ liệu
                        </p>
                    )}
                </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Hành động nhanh
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <a
                        href="/admin/users"
                        className="flex items-center gap-3 p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-200"
                    >
                        <Users className="w-6 h-6 text-blue-600" />
                        <span className="font-medium text-blue-700">
                            Quản lý người dùng
                        </span>
                    </a>
                    <a
                        href="/admin/products"
                        className="flex items-center gap-3 p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors border border-green-200"
                    >
                        <Package className="w-6 h-6 text-green-600" />
                        <span className="font-medium text-green-700">
                            Quản lý sản phẩm
                        </span>
                    </a>
                    <a
                        href="/admin/categories"
                        className="flex items-center gap-3 p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors border border-purple-200"
                    >
                        <FileText className="w-6 h-6 text-purple-600" />
                        <span className="font-medium text-purple-700">
                            Quản lý danh mục
                        </span>
                    </a>
                    <a
                        href="/admin/reviews"
                        className="flex items-center gap-3 p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors border border-orange-200"
                    >
                        <MessageSquare className="w-6 h-6 text-orange-600" />
                        <span className="font-medium text-orange-700">
                            Quản lý đánh giá
                        </span>
                    </a>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
