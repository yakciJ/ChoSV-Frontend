import ProductCard from "../../components/ProductCard";
import { useState, useEffect } from "react";
import {
    getNewestProducts,
    getPopularProducts,
    getRecommendedProducts,
} from "../../services/productService";

export default function Home() {
    const [newestProducts, setNewestProducts] = useState([]);
    const [popularProducts, setPopularProducts] = useState([]);
    const [recommendedProducts, setRecommendedProducts] = useState([]);
    const [showRecommended, setShowRecommended] = useState(false);

    const fetchNewestProducts = async () => {
        try {
            const response = await getNewestProducts();
            console.log("Newest Products Response:", response);
            setNewestProducts(response.items || []);
        } catch (err) {
            console.error("Error fetching newest products:", err);
        }
    };

    const fetchPopularProducts = async () => {
        try {
            const response = await getPopularProducts();
            console.log("Popular Products Response:", response);
            setPopularProducts(response.items || []);
        } catch (err) {
            console.error("Error fetching popular products:", err);
        }
    };

    const fetchRecommendedProducts = async () => {
        try {
            const response = await getRecommendedProducts();
            console.log("Recommended Products Response:", response);
            setRecommendedProducts(response.items || []);
            setShowRecommended(true);
        } catch (err) {
            console.error("Error fetching recommended products:", err);
            // Don't show recommended section if 401 or any other error
            setShowRecommended(false);
        }
    };

    useEffect(() => {
        fetchNewestProducts();
        fetchPopularProducts();
        fetchRecommendedProducts();
    }, []);

    return (
        <div className="flex flex-col items-center gap-12 text-blue-500 ">
            <h1 className="sm:text-5xl text-4xl font-raleway italic text-center leading-[1.3]">
                Sinh viên cần gì
                <span className="hidden lg:inline"> – </span>
                <br className="lg:hidden " />
                Chợ sinh viên có đó!
            </h1>
            <div className="flex flex-col gap-8 items-center w-full px-4 md:px-12 lg:px-24">
                <div className="bg-white rounded-xl justify-center p-4 w-[85vw]">
                    <h2 className="text-2xl font-bold text-left pb-4">
                        Sản phẩm nổi bật
                    </h2>
                    <div className="grid justify-center gap-4 xl:grid-cols-6 md:grid-cols-3 grid-cols-2 ">
                        {popularProducts.map((product) => (
                            <ProductCard key={product.id} {...product} />
                        ))}
                    </div>
                </div>
                <div className="bg-white rounded-xl justify-center p-4 w-[85vw]">
                    <h2 className="text-2xl font-bold text-left pb-4">
                        Sản phẩm mới
                    </h2>
                    <div className="grid justify-center gap-4 xl:grid-cols-6 md:grid-cols-3 grid-cols-2 ">
                        {newestProducts.map((product) => (
                            <ProductCard key={product.id} {...product} />
                        ))}
                    </div>
                </div>
                {showRecommended && (
                    <div className="bg-white rounded-xl justify-center p-4 w-[85vw]">
                        <h2 className="text-2xl font-bold text-left pb-4">
                            Sản phẩm dành cho bạn
                        </h2>
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
