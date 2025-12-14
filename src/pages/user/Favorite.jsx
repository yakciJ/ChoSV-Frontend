import { useEffect, useState } from "react";
import { getFavorites } from "../../services/favoriteService";
import { Link } from "react-router-dom";
import FavoriteProductCard from "../../components/FavoriteProductCard";

export default function Favorite() {
    const [favoriteProducts, setFavoriteProducts] = useState([]);
    const [page, setPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [loading, setLoading] = useState(false);

    const pageSize = 10;
    const totalPages = Math.ceil(totalCount / pageSize);

    const fetchFavorites = async () => {
        setLoading(true);
        try {
            const response = await getFavorites(page, pageSize);
            setFavoriteProducts(response.items || []);
            setTotalCount(response.totalCount || 0);
        } catch (err) {
            console.error("Error fetching favorite products:", err);
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchFavorites();
    }, [page]);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setPage(newPage);
        }
    };

    return (
        <div className="min-h-screen flex flex-col w-11/12 sm:w-10/12  items-start">
            <div className="bg-white rounded-md flex-1 p-8 flex-row w-full">
                {/* breadcrumbs */}
                <div className="flex flex-col gap-4 w-full mb-4">
                    <div className="flex gap-2 text-gray-500 text-sm">
                        <Link
                            className="text-blue-500 hover:underline whitespace-nowrap"
                            to="/"
                        >
                            Trang chủ
                        </Link>
                        <span>&gt;</span>
                        <span className="truncate ">Sản phẩm yêu thích</span>
                    </div>
                    {totalCount > 0 && (
                        <p className="text-blue-500 text-2xl font-semibold">
                            Sản phẩm đã yêu thích: {totalCount} sản phẩm
                        </p>
                    )}
                </div>
                {/* content */}
                {loading ? (
                    <div className="flex justify-center items-center py-8">
                        <p className="text-gray-500">Đang tải...</p>
                    </div>
                ) : favoriteProducts.length > 0 ? (
                    <>
                        {favoriteProducts.map((product) => (
                            <FavoriteProductCard
                                key={product.id}
                                product={product}
                            />
                        ))}

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex justify-center items-center gap-2 mt-8">
                                <button
                                    onClick={() => handlePageChange(page - 1)}
                                    disabled={page === 1}
                                    className="px-3 py-2 rounded-md border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                >
                                    Trước
                                </button>

                                {[...Array(totalPages)].map((_, index) => {
                                    const pageNum = index + 1;
                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() =>
                                                handlePageChange(pageNum)
                                            }
                                            className={`px-3 py-2 rounded-md border ${
                                                page === pageNum
                                                    ? "bg-blue-500 text-white"
                                                    : "hover:bg-gray-50"
                                            }`}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                })}

                                <button
                                    onClick={() => handlePageChange(page + 1)}
                                    disabled={page === totalPages}
                                    className="px-3 py-2 rounded-md border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                >
                                    Sau
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <p className="text-gray-500">
                        Không có sản phẩm yêu thích nào.
                    </p>
                )}
            </div>
        </div>
    );
}
