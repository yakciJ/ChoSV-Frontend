import ProductCard from "../../components/ProductCard";
import { useState, useEffect } from "react";
import {
    getNewestProducts,
    getPopularProducts,
    getRecommendedProducts,
} from "../../services/productService";
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { fetchAllCategories } from "../../store/categorySlice";

export default function Home() {
    const [newestProducts, setNewestProducts] = useState([]);
    const [popularProducts, setPopularProducts] = useState([]);
    const [recommendedProducts, setRecommendedProducts] = useState([]);
    const [showRecommended, setShowRecommended] = useState(false);
    const {
        data: categories,
        loading,
        error,
    } = useSelector((state) => state.categories);

    const dispatch = useDispatch();

    const fetchNewestProducts = async () => {
        try {
            const response = await getNewestProducts();
            setNewestProducts(response.items || []);
        } catch (err) {
            console.error("Error fetching newest products:", err);
        }
    };

    const fetchPopularProducts = async () => {
        try {
            const response = await getPopularProducts();
            setPopularProducts(response.items || []);
        } catch (err) {
            console.error("Error fetching popular products:", err);
        }
    };

    const fetchRecommendedProducts = async () => {
        try {
            const response = await getRecommendedProducts();
            setRecommendedProducts(response.items || []);
            setShowRecommended(true);
        } catch (err) {
            console.error("Error fetching recommended products:", err);
            setShowRecommended(false);
        }
    };

    useEffect(() => {
        fetchNewestProducts();
        fetchPopularProducts();
        fetchRecommendedProducts();
    }, []);

    useEffect(() => {
        if (categories.length === 0) {
            dispatch(fetchAllCategories());
        }
    }, [dispatch, categories.length]);

    const rootCategories = categories;

    return (
        <div className="flex flex-col items-center gap-12 text-blue-500 ">
            <h1 className="sm:text-5xl text-4xl font-raleway italic text-center leading-[1.3]">
                Sinh viên cần gì
                <span className="hidden lg:inline"> – </span>
                <br className="lg:hidden " />
                Chợ sinh viên có đó!
            </h1>
            {/* category section */}
            <div className="bg-white grid justify-center gap-x-16 sm:gap-6 sm:py-4 py-6 px-6 rounded-xl lg:grid-cols-6 sm:grid-cols-3 grid-cols-2">
                {rootCategories.map((category) => (
                    <Link
                        to={`/categories/${category.categoryId}`}
                        key={category.categoryId}
                        className="text-blue-500 hover:underline items-center flex flex-col text-center"
                    >
                        <img
                            src={category.imageUrl}
                            alt={category.name}
                            className="w-16 h-16 object-cover "
                        />
                        <p className="text-sm mt-2 leading-tight max-w-[120px]">
                            {category.name}
                        </p>
                    </Link>
                ))}
            </div>
            <div className="flex flex-col gap-8 items-center w-full">
                <div className="bg-white rounded-xl justify-center p-4 w-[85vw]">
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-bold text-left pb-4">
                            Sản phẩm nổi bật
                        </h2>
                        <Link
                            // to trang cac san pham duoc goi y
                            className="text-blue-500 hover:underline text-sm font-medium"
                        >
                            Xem thêm →
                        </Link>
                    </div>
                    <div className="grid justify-center gap-4 xl:grid-cols-6 md:grid-cols-3 grid-cols-2 ">
                        {popularProducts.map((product) => (
                            <ProductCard key={product.id} {...product} />
                        ))}
                    </div>
                </div>
                <div className="bg-white rounded-xl justify-center p-4 w-[85vw]">
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-bold text-left pb-4">
                            Sản phẩm mới
                        </h2>
                        <Link
                            // to trang cac san pham duoc goi y
                            className="text-blue-500 hover:underline text-sm font-medium"
                        >
                            Xem thêm →
                        </Link>
                    </div>
                    <div className="grid justify-center gap-4 xl:grid-cols-6 md:grid-cols-3 grid-cols-2 ">
                        {newestProducts.map((product) => (
                            <ProductCard key={product.id} {...product} />
                        ))}
                    </div>
                </div>
                {showRecommended && (
                    <div className="bg-white rounded-xl justify-center p-4 w-[85vw]">
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-bold text-left pb-4">
                                Sản phẩm dành cho bạn
                            </h2>
                            <Link
                                // to trang cac san pham duoc goi y
                                className="text-blue-500 hover:underline text-sm font-medium"
                            >
                                Xem thêm →
                            </Link>
                        </div>

                        <div className="grid justify-center gap-4 xl:grid-cols-6 md:grid-cols-3 grid-cols-2 ">
                            {recommendedProducts.map((product) => (
                                <ProductCard key={product.id} {...product} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
