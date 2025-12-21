import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getNewestProducts } from "../../services/productService";
import ProductGrid from "../../components/ProductGrid";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function NewestProduct() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [hasNext, setHasNext] = useState(false);
    const [hasPrevious, setHasPrevious] = useState(false);
    const pageSize = 24;

    // Fetch products when page changes
    useEffect(() => {
        fetchProducts();
    }, [currentPage]);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const response = await getNewestProducts(currentPage, pageSize);

            setProducts(response.items || []);
            setTotalCount(response.totalCount || 0);
            setTotalPages(response.totalPages || 1);
            setHasNext(response.hasNext || false);
            setHasPrevious(response.hasPrevious || false);
        } catch (error) {
            console.error("Error fetching newest products:", error);
            setProducts([]);
            setTotalCount(0);
            setTotalPages(1);
            setHasNext(false);
            setHasPrevious(false);
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    };

    return (
        <div className="flex flex-col items-center gap-8 text-blue-500 w-full">
            {/* Breadcrumb */}
            <div className="w-[85vw] text-left">
                <nav className="flex items-center space-x-2 text-sm text-gray-600">
                    <Link to="/" className="hover:text-blue-500">
                        Trang chủ
                    </Link>
                    <span>/</span>
                    <span className="text-blue-500 font-medium">
                        Sản phẩm mới nhất
                    </span>
                </nav>
            </div>

            {/* Products Grid */}
            <div className="w-[85vw]">
                <ProductGrid
                    products={products}
                    loading={loading}
                    title={`Sản phẩm mới nhất (${totalCount} sản phẩm)`}
                />
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="bg-white rounded-lg px-6 py-4 w-[85vw] border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center text-sm text-gray-700">
                            <span>
                                Hiển thị {(currentPage - 1) * pageSize + 1} đến{" "}
                                {Math.min(currentPage * pageSize, totalCount)}{" "}
                                trong tổng số {totalCount} sản phẩm
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() =>
                                    handlePageChange(currentPage - 1)
                                }
                                disabled={!hasPrevious}
                                className="relative inline-flex items-center px-3 py-2 rounded-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
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
                                                className={`relative inline-flex items-center px-3 py-2 rounded-md border text-sm font-medium transition ${
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
                                className="relative inline-flex items-center px-3 py-2 rounded-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                            >
                                Sau
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
