import { useState, useEffect } from "react";
import { getMyProduct } from "../../services/productService";
import ManageProductCard from "../../components/ManageProductCard";

const PRODUCT_STATUSES = [
    { key: null, label: "Tất cả", value: null },
    { key: "Pending", label: "Chờ duyệt", value: "Pending" },
    { key: "Approved", label: "Đã duyệt", value: "Approved" },
    { key: "Rejected", label: "Bị từ chối", value: "Rejected" },
    { key: "Sold", label: "Đã bán", value: "Sold" },
];

export default function ManageProducts() {
    const [activeTab, setActiveTab] = useState("all");
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [error, setError] = useState(null);

    const pageSize = 10;
    const totalPages = Math.ceil(totalCount / pageSize);

    // Get current status value for API call
    const getCurrentStatus = () => {
        const currentTab = PRODUCT_STATUSES.find(
            (status) => status.key === activeTab
        );
        return currentTab ? currentTab.value : null;
    };

    const fetchProducts = async () => {
        setLoading(true);
        setError(null);
        try {
            const status = getCurrentStatus();
            const response = await getMyProduct(page, pageSize, status);
            setProducts(response.items || []);
            setTotalCount(response.totalCount || 0);
        } catch (err) {
            console.error("Error fetching products:", err);
            setError("Không thể tải danh sách sản phẩm");
        } finally {
            setLoading(false);
        }
    };

    // Fetch products when tab or page changes
    useEffect(() => {
        fetchProducts();
    }, [activeTab, page]);

    // Reset page when changing tabs
    const handleTabChange = (tabKey) => {
        setActiveTab(tabKey);
        setPage(1);
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setPage(newPage);
        }
    };

    // Handle product deletion
    const handleDeleteProduct = (productId) => {
        setProducts((prev) => prev.filter((p) => p.productId !== productId));
        setTotalCount((prev) => prev - 1);
    };

    // Handle product status change
    const handleStatusChange = (productId, newStatus) => {
        setProducts((prev) =>
            prev.map((p) =>
                p.productId === productId ? { ...p, status: newStatus } : p
            )
        );
    };

    return (
        <div className="min-h-screen flex flex-col w-11/12 sm:w-10/12 items-start">
            <div className="bg-white rounded-md flex-1 p-8 w-full">
                <h1 className="text-3xl font-bold text-blue-500 mb-6">
                    Quản lý sản phẩm
                </h1>

                {/* Tab Navigation */}
                <div className="border-b border-gray-200 mb-6">
                    <nav className="flex space-x-8">
                        {PRODUCT_STATUSES.map((status) => (
                            <button
                                key={status.key || "all"}
                                onClick={() =>
                                    handleTabChange(status.key || "all")
                                }
                                className={`py-2 px-1 border-b-4 w-full bg-white font-medium focus:outline-none text-sm ${
                                    activeTab === (status.key || "all")
                                        ? "border-blue-500 text-blue-600"
                                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                }`}
                            >
                                {status.label}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Content */}
                {loading ? (
                    <div className="flex justify-center items-center py-12">
                        <p className="text-gray-500">Đang tải...</p>
                    </div>
                ) : error ? (
                    <div className="flex justify-center items-center py-12">
                        <p className="text-red-500">{error}</p>
                    </div>
                ) : products.length > 0 ? (
                    <>
                        <div className="mb-4">
                            <p className="text-gray-600">
                                Hiển thị {products.length} trên tổng{" "}
                                {totalCount} sản phẩm
                            </p>
                        </div>
                        <div className="mb-8">
                            {products.map((product) => (
                                <div
                                    key={product.productId}
                                    className="relative"
                                >
                                    <ManageProductCard
                                        product={product}
                                        onDelete={handleDeleteProduct}
                                        onStatusChange={handleStatusChange}
                                    />
                                    {/* Status badge */}
                                    <div className="absolute top-3 left-3 z-10">
                                        <span
                                            className={`px-2 py-1 rounded text-xs font-medium ${
                                                product.status === "pending"
                                                    ? "bg-yellow-100 text-yellow-800"
                                                    : product.status ===
                                                      "approved"
                                                    ? "bg-green-100 text-green-800"
                                                    : product.status ===
                                                      "rejected"
                                                    ? "bg-red-100 text-red-800"
                                                    : product.status === "sold"
                                                    ? "bg-blue-100 text-blue-800"
                                                    : product.status ===
                                                      "hidden"
                                                    ? "bg-gray-100 text-gray-800"
                                                    : "bg-gray-100 text-gray-800"
                                            }`}
                                        >
                                            {PRODUCT_STATUSES.find(
                                                (s) =>
                                                    s.value === product.status
                                            )?.label || "Không xác định"}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex justify-center items-center gap-2">
                                <button
                                    onClick={() => handlePageChange(page - 1)}
                                    disabled={page === 1}
                                    className="px-4 py-2 rounded-md border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                >
                                    Trước
                                </button>

                                {[...Array(Math.min(5, totalPages))].map(
                                    (_, index) => {
                                        let pageNum;
                                        if (totalPages <= 5) {
                                            pageNum = index + 1;
                                        } else if (page <= 3) {
                                            pageNum = index + 1;
                                        } else if (page >= totalPages - 2) {
                                            pageNum = totalPages - 4 + index;
                                        } else {
                                            pageNum = page - 2 + index;
                                        }

                                        return (
                                            <button
                                                key={pageNum}
                                                onClick={() =>
                                                    handlePageChange(pageNum)
                                                }
                                                className={`px-4 py-2 rounded-md border ${
                                                    page === pageNum
                                                        ? "bg-blue-500 text-white border-blue-500"
                                                        : "hover:bg-gray-50"
                                                }`}
                                            >
                                                {pageNum}
                                            </button>
                                        );
                                    }
                                )}

                                <button
                                    onClick={() => handlePageChange(page + 1)}
                                    disabled={page === totalPages}
                                    className="px-4 py-2 rounded-md border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                >
                                    Sau
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center py-12">
                        <p className="text-gray-500 text-lg mb-4">
                            {activeTab === "all"
                                ? "Bạn chưa có sản phẩm nào"
                                : `Không có sản phẩm ${PRODUCT_STATUSES.find(
                                      (s) => s.key === activeTab
                                  )?.label.toLowerCase()}`}
                        </p>
                        <button
                            onClick={() => {
                                /* Navigate to create product page */
                            }}
                            className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 transition-colors"
                        >
                            Đăng sản phẩm mới
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
