import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { fetchAllCategories } from "../../store/categorySlice";
import { searchProducts } from "../../services/productService";
import SearchProductGrid from "../../components/SearchProductGrid";
import { ChevronLeft, ChevronRight, ChevronDown, Filter } from "lucide-react";

export default function SearchResults() {
    const [searchParams, setSearchParams] = useSearchParams();
    const dispatch = useDispatch();
    const { data: categories, loading: categoriesLoading } = useSelector(
        (state) => state.categories
    );

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [hasNext, setHasNext] = useState(false);
    const [hasPrevious, setHasPrevious] = useState(false);
    const [showFilters, setShowFilters] = useState(false);

    // Search parameters
    const searchQuery = searchParams.get("search") || "";
    const selectedCategoryId = searchParams.get("categoryId") || "";
    const minPrice = searchParams.get("minPrice") || "";
    const maxPrice = searchParams.get("maxPrice") || "";
    const sortBy = searchParams.get("sortBy") || "relevance";

    // Filter states
    const [tempMinPrice, setTempMinPrice] = useState(minPrice);
    const [tempMaxPrice, setTempMaxPrice] = useState(maxPrice);

    const pageSize = 24;

    const sortOptions = [
        { value: "relevance", label: "Độ liên quan" },
        { value: "newest", label: "Mới nhất" },
        { value: "price_high", label: "Giá tăng dần" },
        { value: "price_low", label: "Giá giảm dần" },
    ];

    // Load categories if not already loaded
    useEffect(() => {
        if (categories.length === 0) {
            dispatch(fetchAllCategories());
        }
    }, [dispatch, categories.length]);

    // Fetch products when search params change
    useEffect(() => {
        const page = parseInt(searchParams.get("page")) || 1;
        setCurrentPage(page);
        fetchSearchResults();
    }, [searchParams]);

    const fetchSearchResults = async () => {
        setLoading(true);
        try {
            const page = parseInt(searchParams.get("page")) || 1;
            const response = await searchProducts(
                searchQuery,
                selectedCategoryId ? parseInt(selectedCategoryId) : null,
                minPrice ? parseFloat(minPrice) : null,
                maxPrice ? parseFloat(maxPrice) : null,
                page,
                pageSize,
                sortBy
            );

            setProducts(response.items || []);
            setTotalCount(response.totalCount || 0);
            setTotalPages(response.totalPages || 1);
            setHasNext(response.hasNext || false);
            setHasPrevious(response.hasPrevious || false);
        } catch (error) {
            console.error("Error fetching search results:", error);
            setProducts([]);
            setTotalCount(0);
            setTotalPages(1);
            setHasNext(false);
            setHasPrevious(false);
        } finally {
            setLoading(false);
        }
    };

    const updateSearchParams = (newParams) => {
        const currentParams = Object.fromEntries(searchParams);
        const updatedParams = { ...currentParams, ...newParams, page: "1" };

        // Remove empty parameters
        Object.keys(updatedParams).forEach((key) => {
            if (!updatedParams[key]) {
                delete updatedParams[key];
            }
        });

        setSearchParams(updatedParams);
    };

    const handleCategoryChange = (categoryId) => {
        updateSearchParams({ categoryId: categoryId || undefined });
    };

    const handleSortChange = (newSortBy) => {
        updateSearchParams({ sortBy: newSortBy });
    };

    const handlePriceFilter = () => {
        updateSearchParams({
            minPrice: tempMinPrice || undefined,
            maxPrice: tempMaxPrice || undefined,
        });
    };

    const clearPriceFilter = () => {
        setTempMinPrice("");
        setTempMaxPrice("");
        updateSearchParams({
            minPrice: undefined,
            maxPrice: undefined,
        });
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            const currentParams = Object.fromEntries(searchParams);
            setSearchParams({ ...currentParams, page: newPage.toString() });
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    };

    const renderCategoryTree = (cats, level = 0) => {
        return cats.map((category) => (
            <div
                key={category.categoryId}
                className={`${level > 0 ? "ml-4" : ""}`}
            >
                <label className="flex items-center py-1 cursor-pointer hover:bg-gray-50">
                    <input
                        type="radio"
                        name="category"
                        value={category.categoryId}
                        checked={
                            selectedCategoryId ===
                            category.categoryId.toString()
                        }
                        onChange={() =>
                            handleCategoryChange(category.categoryId)
                        }
                        className="mr-2"
                    />
                    <span className="text-sm text-gray-700">
                        {category.name}
                    </span>
                </label>
                {category.childs && category.childs.length > 0 && (
                    <div className="ml-4">
                        {renderCategoryTree(category.childs, level + 1)}
                    </div>
                )}
            </div>
        ));
    };

    if (categoriesLoading) {
        return (
            <div className="flex justify-center items-center min-h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 text-blue-500 w-full max-w-7xl mx-auto px-4">
            {/* Breadcrumb */}
            <div className="text-left">
                <nav className="flex items-center space-x-2 text-sm text-gray-600">
                    <Link to="/" className="hover:text-blue-500">
                        Trang chủ
                    </Link>
                    <span>/</span>
                    <span className="text-blue-500 font-medium">
                        Tìm kiếm: "{searchQuery}"
                    </span>
                </nav>
            </div>

            {/* Search Results Header */}
            <div className="bg-white rounded-lg p-4 border border-gray-200">
                <h1 className="text-2xl font-bold text-gray-800">
                    {totalCount > 0
                        ? `Tìm thấy ${totalCount} sản phẩm cho "${searchQuery}"`
                        : `Không tìm thấy sản phẩm nào cho "${searchQuery}"`}
                </h1>
            </div>

            <div className="flex gap-6">
                {/* Sidebar Filters */}
                <div
                    className={`lg:block ${
                        showFilters ? "block" : "hidden"
                    } w-full lg:w-64 flex-shrink-0`}
                >
                    <div className="bg-white rounded-lg p-4 border border-gray-200 sticky top-24">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-gray-800">
                                Bộ lọc
                            </h3>
                            <button
                                onClick={() => setShowFilters(false)}
                                className="lg:hidden text-gray-500"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Category Filter */}
                        <div className="mb-6">
                            <h4 className="font-medium text-gray-700 mb-3">
                                Danh mục
                            </h4>
                            <div className="max-h-48 overflow-y-auto">
                                <label className="flex items-center py-1 cursor-pointer hover:bg-gray-50">
                                    <input
                                        type="radio"
                                        name="category"
                                        value=""
                                        checked={!selectedCategoryId}
                                        onChange={() =>
                                            handleCategoryChange("")
                                        }
                                        className="mr-2"
                                    />
                                    <span className="text-sm text-gray-700 font-medium">
                                        Tất cả
                                    </span>
                                </label>
                                {renderCategoryTree(categories)}
                            </div>
                        </div>

                        {/* Price Filter */}
                        <div className="mb-6">
                            <h4 className="font-medium text-gray-700 mb-3">
                                Khoảng giá
                            </h4>
                            <div className="space-y-3">
                                <input
                                    type="number"
                                    placeholder="Giá từ"
                                    value={tempMinPrice}
                                    onChange={(e) =>
                                        setTempMinPrice(e.target.value)
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                                />
                                <input
                                    type="number"
                                    placeholder="Giá đến"
                                    value={tempMaxPrice}
                                    onChange={(e) =>
                                        setTempMaxPrice(e.target.value)
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                                />
                                <div className="flex gap-2">
                                    <button
                                        onClick={handlePriceFilter}
                                        className="flex-1 px-3 py-2 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600"
                                    >
                                        Áp dụng
                                    </button>
                                    <button
                                        onClick={clearPriceFilter}
                                        className="px-3 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50"
                                    >
                                        Xóa
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 min-w-0">
                    {/* Sort and Filter Toggle */}
                    <div className="flex items-center justify-between mb-4">
                        <button
                            onClick={() => setShowFilters(true)}
                            className="lg:hidden flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                        >
                            <Filter size={16} />
                            Bộ lọc
                        </button>
                        <div className="flex items-center gap-2 ml-auto">
                            <span className="text-sm text-gray-600">
                                Sắp xếp:
                            </span>
                            <div className="relative">
                                <select
                                    value={sortBy}
                                    onChange={(e) =>
                                        handleSortChange(e.target.value)
                                    }
                                    className="appearance-none bg-white border border-gray-300 rounded-md px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    {sortOptions.map((option) => (
                                        <option
                                            key={option.value}
                                            value={option.value}
                                        >
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                            </div>
                        </div>
                    </div>

                    {/* Products Grid - Use the new SearchProductGrid */}
                    <SearchProductGrid products={products} loading={loading} />

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="bg-white rounded-lg px-6 py-4 mt-6 border border-gray-200">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center text-sm text-gray-700">
                                    <span>
                                        Hiển thị{" "}
                                        {(currentPage - 1) * pageSize + 1} đến{" "}
                                        {Math.min(
                                            currentPage * pageSize,
                                            totalCount
                                        )}{" "}
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
                                                    pageNum =
                                                        totalPages - 4 + i;
                                                } else {
                                                    pageNum =
                                                        currentPage - 2 + i;
                                                }
                                                return (
                                                    <button
                                                        key={pageNum}
                                                        onClick={() =>
                                                            handlePageChange(
                                                                pageNum
                                                            )
                                                        }
                                                        className={`relative inline-flex items-center px-3 py-2 rounded-md border text-sm font-medium transition ${
                                                            pageNum ===
                                                            currentPage
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
            </div>
        </div>
    );
}
