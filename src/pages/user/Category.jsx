import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { fetchAllCategories } from "../../store/categorySlice";
import { getProductsByCategoryId } from "../../services/categoryService";
import ProductGrid from "../../components/ProductGrid";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Category() {
    const { categoryId } = useParams();
    const dispatch = useDispatch();
    const { data: categories, loading: categoriesLoading } = useSelector(
        (state) => state.categories,
    );

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [hasNext, setHasNext] = useState(false);
    const [hasPrevious, setHasPrevious] = useState(false);
    const [currentCategory, setCurrentCategory] = useState(null);
    const [displayCategories, setDisplayCategories] = useState([]);
    const pageSize = 24;

    // Load categories if not already loaded
    useEffect(() => {
        if (categories.length === 0) {
            dispatch(fetchAllCategories());
        }
    }, [dispatch, categories.length]);

    // Find current category and set display categories
    useEffect(() => {
        if (categories.length > 0 && categoryId) {
            const findCategory = (cats) => {
                for (const cat of cats) {
                    if (cat.categoryId === parseInt(categoryId)) {
                        return cat;
                    }
                    if (cat.childs && cat.childs.length > 0) {
                        const found = findCategory(cat.childs);
                        if (found) return found;
                    }
                }
                return null;
            };

            const category = findCategory(categories);
            setCurrentCategory(category);

            if (category) {
                // If it's a parent category, show its children
                if (category.childs && category.childs.length > 0) {
                    setDisplayCategories([category, ...category.childs]);
                } else {
                    // If it's a child category, find its parent and show all siblings
                    const findParent = (cats) => {
                        for (const cat of cats) {
                            if (
                                cat.childs &&
                                cat.childs.some(
                                    (child) =>
                                        child.categoryId ===
                                        category.categoryId,
                                )
                            ) {
                                return cat;
                            }
                        }
                        return null;
                    };

                    const parentCategory = findParent(categories);
                    if (parentCategory) {
                        setDisplayCategories([
                            parentCategory,
                            ...parentCategory.childs,
                        ]);
                    } else {
                        // It's a root category without children
                        setDisplayCategories([category]);
                    }
                }
            }
        }
    }, [categories, categoryId]);

    // Fetch products when category or page changes
    useEffect(() => {
        if (categoryId) {
            fetchProducts();
        }
    }, [categoryId, currentPage]);

    // Reset page when category changes
    useEffect(() => {
        setCurrentPage(1);
    }, [categoryId]);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const response = await getProductsByCategoryId(
                parseInt(categoryId),
                currentPage,
                pageSize,
            );

            // Since axios instance returns response.data directly
            const categoryData = response;
            const productsData = categoryData.products;

            setProducts(productsData.items || []);
            setTotalCount(productsData.totalCount || 0);
            setTotalPages(productsData.totalPages || 1);
            setHasNext(productsData.hasNext || false);
            setHasPrevious(productsData.hasPrevious || false);

            // Update current category with the fetched data (in case it has more details)
            if (categoryData) {
                setCurrentCategory((prev) => ({
                    ...prev,
                    ...categoryData,
                    productCount: categoryData.productCount,
                }));
            }
        } catch (error) {
            console.error("Error fetching products:", error);
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

    if (categoriesLoading) {
        return (
            <div className="flex justify-center items-center min-h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center gap-8 text-blue-500 w-full">
            {/* Category Navigation */}
            <div className="bg-white py-6 px-6 rounded-xl w-[85vw]">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 justify-items-center">
                    {displayCategories.map((category) => (
                        <Link
                            key={category.categoryId}
                            to={`/categories/${category.categoryId}`}
                            className={`text-blue-500 hover:underline items-center flex flex-col text-center transition-all w-full max-w-[120px] ${
                                parseInt(categoryId) === category.categoryId
                                    ? "bg-blue-50 p-3 rounded-lg border-2 border-blue-200"
                                    : "p-2"
                            }`}
                        >
                            <img
                                src={category.imageUrl}
                                alt={category.name}
                                className="w-16 h-16 object-contain rounded-lg mx-auto"
                                onError={(e) => {
                                    e.target.src = "/placeholder-image.jpg";
                                }}
                            />
                            <p className="text-sm mt-2 leading-tight font-medium text-center">
                                {category.name}
                            </p>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Breadcrumb */}
            {currentCategory && (
                <div className="w-[85vw] text-left">
                    <nav className="flex items-center space-x-2 text-sm text-gray-600">
                        <Link to="/" className="hover:text-blue-500">
                            Trang chủ
                        </Link>
                        <span>/</span>
                        <span className="text-blue-500 font-medium">
                            {currentCategory.name}
                        </span>
                    </nav>
                </div>
            )}

            {/* Products Grid */}
            <div className="w-[85vw]">
                <ProductGrid
                    products={products}
                    loading={loading}
                    title={
                        currentCategory
                            ? `${currentCategory.name} (${totalCount} sản phẩm)`
                            : null
                    }
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
                                    },
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
