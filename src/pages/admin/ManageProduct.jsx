import React, { useState, useEffect } from "react";
import {
    Search,
    Filter,
    Eye,
    CheckCircle,
    XCircle,
    ChevronLeft,
    ChevronRight,
    Package,
    User,
    Calendar,
    Tag,
    X,
    ImageIcon,
} from "lucide-react";
import {
    getAllProductsAdmin,
    changeProductStatus,
    deleteProductAdmin,
} from "../../services/productService";
import { formatVND } from "../../helpers/formatPrice";

const ManageProduct = () => {
    const [products, setProducts] = useState([]);
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
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);

    const statusOptions = [
        { value: "", label: "Tất cả trạng thái" },
        { value: "Pending", label: "Chờ duyệt" },
        { value: "Approved", label: "Đã duyệt" },
        { value: "Rejected", label: "Bị từ chối" },
        { value: "Sold", label: "Đã bán" },
    ];

    useEffect(() => {
        fetchProducts();
    }, [currentPage, pageSize, statusFilter]);

    const fetchProducts = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await getAllProductsAdmin(
                currentPage,
                pageSize,
                statusFilter || null
            );

            setProducts(response.items || []);
            setTotalCount(response.totalCount || 0);
            setTotalPages(response.totalPages || 1);
            setHasNext(response.hasNext || false);
            setHasPrevious(response.hasPrevious || false);
        } catch (error) {
            console.error("Error fetching products:", error);
            setError("Không thể tải danh sách sản phẩm. Vui lòng thử lại.");
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (productId, newStatus) => {
        try {
            await changeProductStatus(productId, newStatus);

            // Update local state
            setProducts(
                products.map((product) =>
                    product.productId === productId
                        ? { ...product, status: newStatus }
                        : product
                )
            );

            // Update selected product if it's the one being changed
            if (selectedProduct?.productId === productId) {
                setSelectedProduct({ ...selectedProduct, status: newStatus });
            }

            alert(
                `Đã ${
                    newStatus === "Approved" ? "duyệt" : "từ chối"
                } sản phẩm thành công!`
            );
            setShowDetailModal(false);
        } catch (error) {
            console.error("Error updating product status:", error);
            alert("Không thể cập nhật trạng thái sản phẩm. Vui lòng thử lại.");
        }
    };

    const handleDelete = async (productId, productName) => {
        if (
            window.confirm(
                `Bạn có chắc chắn muốn xóa sản phẩm "${productName}"?`
            )
        ) {
            try {
                await deleteProductAdmin(productId);

                // Remove product from local state
                setProducts(
                    products.filter(
                        (product) => product.productId !== productId
                    )
                );
                setTotalCount((prevCount) => prevCount - 1);

                alert("Đã xóa sản phẩm thành công!");

                // Close modal if the deleted product is currently being viewed
                if (selectedProduct?.productId === productId) {
                    setShowDetailModal(false);
                    setSelectedProduct(null);
                }
            } catch (error) {
                console.error("Error deleting product:", error);
                alert("Không thể xóa sản phẩm. Vui lòng thử lại.");
            }
        }
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("vi-VN", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            Pending: {
                bg: "bg-yellow-100",
                text: "text-yellow-800",
                label: "Chờ duyệt",
            },
            Approved: {
                bg: "bg-green-100",
                text: "text-green-800",
                label: "Đã duyệt",
            },
            Rejected: {
                bg: "bg-red-100",
                text: "text-red-800",
                label: "Bị từ chối",
            },
            Sold: { bg: "bg-blue-100", text: "text-blue-800", label: "Đã bán" },
        };

        const config = statusConfig[status] || {
            bg: "bg-gray-100",
            text: "text-gray-800",
            label: status,
        };

        return (
            <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}
            >
                {config.label}
            </span>
        );
    };

    const openDetailModal = (product) => {
        setSelectedProduct(product);
        setShowDetailModal(true);
    };

    const closeDetailModal = () => {
        setShowDetailModal(false);
        setSelectedProduct(null);
    };

    // Filter products based on search query (client-side filtering)
    const filteredProducts = products.filter((product) => {
        if (!searchQuery) return true;

        const searchLower = searchQuery.toLowerCase();
        return (
            product.productName?.toLowerCase().includes(searchLower) ||
            product.sellerName?.toLowerCase().includes(searchLower) ||
            product.productDescription?.toLowerCase().includes(searchLower)
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
                    onClick={fetchProducts}
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
                        Quản lý sản phẩm
                    </h1>
                    <p className="text-gray-600 mt-1">
                        Tổng cộng {totalCount} sản phẩm
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
                            placeholder="Tìm kiếm theo tên sản phẩm, người bán, mô tả..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    <select
                        value={statusFilter}
                        onChange={(e) => {
                            setStatusFilter(e.target.value);
                            setCurrentPage(1); // Reset to first page when filtering
                        }}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value={10}>10 / trang</option>
                        <option value={25}>25 / trang</option>
                        <option value={50}>50 / trang</option>
                    </select>
                </div>
            </div>

            {/* Products Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Sản phẩm
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Người bán
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Giá
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Trạng thái
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Ngày tạo
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Thao tác
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredProducts.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan="6"
                                        className="px-6 py-12 text-center text-gray-500"
                                    >
                                        {searchQuery || statusFilter
                                            ? "Không tìm thấy sản phẩm nào"
                                            : "Chưa có sản phẩm nào"}
                                    </td>
                                </tr>
                            ) : (
                                filteredProducts.map((product) => (
                                    <tr
                                        key={product.productId}
                                        className="hover:bg-gray-50"
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-16 w-16">
                                                    {product.firstImageUrl ? (
                                                        <img
                                                            className="h-16 w-16 rounded-lg object-cover"
                                                            src={
                                                                product.firstImageUrl
                                                            }
                                                            alt={
                                                                product.productName
                                                            }
                                                            onError={(e) => {
                                                                e.target.src =
                                                                    "https://via.placeholder.com/64/E5E7EB/9CA3AF?text=No+Image";
                                                            }}
                                                        />
                                                    ) : (
                                                        <div className="h-16 w-16 rounded-lg bg-gray-200 flex items-center justify-center">
                                                            <ImageIcon className="w-8 h-8 text-gray-400" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
                                                        {product.productName}
                                                    </div>
                                                    <div className="text-sm text-gray-500 max-w-xs truncate">
                                                        {product.categories
                                                            .map(
                                                                (cat) =>
                                                                    cat.categoryName
                                                            )
                                                            .join(" > ")}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center text-sm text-gray-600">
                                                <User className="w-4 h-4 mr-2" />
                                                {product.sellerName}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">
                                                {formatVND(
                                                    product.productPrice
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {getStatusBadge(product.status)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center text-sm text-gray-600">
                                                <Calendar className="w-4 h-4 mr-2" />
                                                {formatDate(
                                                    product.createdDate
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center gap-2 justify-end">
                                                <button
                                                    onClick={() =>
                                                        openDetailModal(product)
                                                    }
                                                    className="inline-flex items-center px-3 py-1.5 rounded-md text-xs font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors"
                                                >
                                                    <Eye className="w-3 h-3 mr-1" />
                                                    Chi tiết
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        handleDelete(
                                                            product.productId,
                                                            product.productName
                                                        )
                                                    }
                                                    className="inline-flex items-center px-3 py-1.5 rounded-md text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
                                                >
                                                    <X className="w-3 h-3 mr-1" />
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
                                    { length: Math.min(5, totalPages) },
                                    (_, i) => {
                                        let pageNum;
                                        if (totalPages <= 5) {
                                            pageNum = i + 1;
                                        } else if (currentPage <= 3) {
                                            pageNum = i + 1;
                                        } else if (
                                            currentPage >=
                                            totalPages - 2
                                        ) {
                                            pageNum = totalPages - 4 + i;
                                        } else {
                                            pageNum = currentPage - 2 + i;
                                        }
                                        return (
                                            <button
                                                key={pageNum}
                                                onClick={() =>
                                                    handlePageChange(pageNum)
                                                }
                                                className={`relative inline-flex items-center px-3 py-2 rounded-md border text-sm font-medium ${
                                                    pageNum === currentPage
                                                        ? "border-blue-500 bg-blue-50 text-blue-600"
                                                        : "border-gray-300 bg-white text-gray-500 hover:bg-gray-50"
                                                }`}
                                            >
                                                {pageNum}
                                            </button>
                                        );
                                    }
                                )}
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

            {/* Product Detail Modal */}
            {showDetailModal && selectedProduct && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            {/* Modal Header */}
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-gray-900">
                                    Chi tiết sản phẩm
                                </h2>
                                <button
                                    onClick={closeDetailModal}
                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="flex flex-col md:flex-row gap-8">
                                {/* Left side - Image */}
                                <div className="flex-[3] space-y-4">
                                    <h3 className="text-lg font-semibold text-gray-700">
                                        Hình ảnh sản phẩm
                                    </h3>
                                    <div className="border-2 border-gray-200 rounded-lg p-4">
                                        {selectedProduct.firstImageUrl ? (
                                            <img
                                                src={
                                                    selectedProduct.firstImageUrl
                                                }
                                                alt={
                                                    selectedProduct.productName
                                                }
                                                className="w-full h-64 object-cover rounded-lg"
                                                onError={(e) => {
                                                    e.target.src =
                                                        "https://via.placeholder.com/400/E5E7EB/9CA3AF?text=No+Image";
                                                }}
                                            />
                                        ) : (
                                            <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                                                <ImageIcon className="w-16 h-16 text-gray-400" />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Right side - Product Details */}
                                <div className="flex-[7] space-y-6">
                                    <h3 className="text-lg font-semibold text-gray-700">
                                        Thông tin sản phẩm
                                    </h3>

                                    {/* Product Name */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Tên sản phẩm
                                        </label>
                                        <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50">
                                            {selectedProduct.productName}
                                        </div>
                                    </div>

                                    {/* Price */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Giá
                                        </label>
                                        <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 font-semibold text-green-600">
                                            {formatVND(
                                                selectedProduct.productPrice
                                            )}
                                        </div>
                                    </div>

                                    {/* Categories */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Danh mục
                                        </label>
                                        <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50">
                                            {selectedProduct.categories
                                                .map((cat) => cat.categoryName)
                                                .join(" > ")}
                                        </div>
                                    </div>

                                    {/* Seller */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Người bán
                                        </label>
                                        <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50">
                                            {selectedProduct.sellerName}
                                        </div>
                                    </div>

                                    {/* Status */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Trạng thái hiện tại
                                        </label>
                                        <div className="w-full px-3 py-2">
                                            {getStatusBadge(
                                                selectedProduct.status
                                            )}
                                        </div>
                                    </div>

                                    {/* Description */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Mô tả sản phẩm
                                        </label>
                                        <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 min-h-[100px] whitespace-pre-wrap">
                                            {selectedProduct.productDescription ||
                                                "Không có mô tả"}
                                        </div>
                                    </div>

                                    {/* Created Date */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Ngày tạo
                                        </label>
                                        <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50">
                                            {formatDate(
                                                selectedProduct.createdDate
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Modal Footer - Action Buttons */}
                            <div className="flex justify-center gap-4 mt-8 pt-6 border-t border-gray-200">
                                <button
                                    onClick={() =>
                                        handleDelete(
                                            selectedProduct.productId,
                                            selectedProduct.productName
                                        )
                                    }
                                    className="flex items-center gap-2 px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
                                >
                                    <X className="w-4 h-4" />
                                    Xóa sản phẩm
                                </button>
                                <button
                                    onClick={() =>
                                        handleStatusChange(
                                            selectedProduct.productId,
                                            "Rejected"
                                        )
                                    }
                                    disabled={
                                        selectedProduct.status === "Rejected"
                                    }
                                    className="flex items-center gap-2 px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
                                >
                                    <XCircle className="w-4 h-4" />
                                    Từ chối
                                </button>
                                <button
                                    onClick={() =>
                                        handleStatusChange(
                                            selectedProduct.productId,
                                            "Approved"
                                        )
                                    }
                                    disabled={
                                        selectedProduct.status === "Approved"
                                    }
                                    className="flex items-center gap-2 px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
                                >
                                    <CheckCircle className="w-4 h-4" />
                                    Duyệt
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageProduct;
