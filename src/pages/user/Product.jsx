import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useParams } from "react-router-dom";
import { getProduct } from "../../services/productService";
import { formatVND } from "../../helpers/formatPrice";
import { useRef } from "react";
import {
    ChevronLeft,
    Heart,
    Clock9,
    Mail,
    Phone,
    User,
    MapPin,
} from "lucide-react";
import { useErrorHandler } from "../../hooks/ErrorHandler";
import ErrorDisplay from "../../components/Error";
import { addFavorite, removeFavorite } from "../../services/favoriteService";
import { formatDateLocal } from "../../helpers/formatDate";
import ProductCarousel from "../../components/ProductCarousel";
import { getUserWallPosts } from "../../services/userWallPostService";
import UserWallPost from "../../components/UserWallPost";

export default function Product() {
    const { productId } = useParams();
    const [selectedImage, setSelectedImage] = useState(0);
    const [isFavorite, setIsFavorite] = useState(false);
    const [product, setProduct] = useState(null);
    const { error, handleError, clearError } = useErrorHandler();
    const [showLeftButton, setShowLeftButton] = useState(false);
    const [showRightButton, setShowRightButton] = useState(false);
    const thumbnailContainerRef = useRef(null);
    const [userWallPosts, setUserWallPosts] = useState([]);

    const [newestProducts, setNewestProducts] = useState([]);
    const [popularProducts, setPopularProducts] = useState([]);
    const [recommendedProducts, setRecommendedProducts] = useState([]);
    const [relevantProducts, setRelevantProducts] = useState([]);

    // mẫu data
    //     {
    //   "productId": 3,
    //   "productName": "Điện thoại samsung mới",
    //   "sellerId": "12c6daa1-cee5-4575-8213-639a49ef4233",
    //   "sellerName": "admin",
    //   "sellerAddress": null,
    //   "sellerPhone": null,
    //   "productDescription": "Điện thoại mới 99%, mới dùng được 1 tuần",
    //   "price": 5000000,
    //   "status": "Approved",
    //   "createdDate": "2025-10-31T17:31:17.022442Z",
    //   "sellerFullName": null,
    //   "sellerAvatarImage": "https://localhost:7049/images/4779e573-9465-41ee-90de-f680ea17a7cd.jpg",
    //   "sellerEmail": "huydangdo2003@gmail.com",
    //   "sellerJoinedDate": "2025-10-30T09:57:16.053976Z",
    //   "productImages": [
    //     "https://localhost:7049/images/377d85fd-83a3-43a9-95f2-b0f348918624.jpg",
    //     "https://localhost:7049/images/00539480-c18b-4706-86bc-864cdf4aa9ea.jpg",
    //     "https://localhost:7049/images/c11eaa4f-d570-403a-a135-5af3a113bbb5.jpg",
    //     "https://localhost:7049/images/5b59864b-88ac-474e-bb8b-e85006ac1dd3.jpg",
    //     "https://localhost:7049/images/66c064af-0fad-41cd-9f54-5964e106d8ac.jpg",
    //     "https://localhost:7049/images/0d415910-1eab-40ce-b60f-63124e0c24cf.jpg"
    //   ],
    //   "favoriteCount": 0,
    //   "isFavorite": false,
    //   "parentCategoryId": 1,
    //   "parentCategoryName": "Đồ điện tử",
    //   "childCategoryId": 3,
    //   "childCategoryName": "Điện thoại"
    // }

    // viet Api service lay product o product service, sau do goi o day, lay productId tren url
    // Lay them danh sach san pham tuong tu o day nua
    // Lay them danh sach san pham co the ban thich o day nua nhugn ma co san o store
    // lay danh gia nguoi ban.

    const checkScrollButtons = () => {
        const container = thumbnailContainerRef.current;
        if (container) {
            setShowLeftButton(container.scrollLeft > 3);
            setShowRightButton(
                container.scrollLeft <
                    container.scrollWidth - container.clientWidth - 2
            );
        }
    };

    const centerSelectedImage = (index) => {
        const container = thumbnailContainerRef.current;
        if (container) {
            const thumbnailWidth = 100; // 96px + gap
            const containerWidth = container.clientWidth;
            const targetPosition =
                index * thumbnailWidth -
                containerWidth / 2 +
                thumbnailWidth / 2;

            container.scrollTo({
                left: Math.max(0, targetPosition),
                behavior: "smooth",
            });
        }
    };

    useEffect(() => {
        if (product?.productImages) {
            setTimeout(() => {
                checkScrollButtons();
                centerSelectedImage(selectedImage);
            }, 100);
        }
    }, [product, selectedImage]);

    const scrollThumbnails = (direction) => {
        const container = thumbnailContainerRef.current;
        if (container) {
            const scrollAmount = 220; // Adjust scroll distance
            container.scrollBy({
                left: direction === "left" ? -scrollAmount : scrollAmount,
                behavior: "smooth",
            });
        }
    };

    const handleFavorite = async () => {
        try {
            if (isFavorite) {
                await removeFavorite(productId);
                setIsFavorite(false);
            } else {
                await addFavorite(productId);
                setIsFavorite(true);
            }
        } catch (err) {
            handleError(err);
        }
    };

    const getProductDetails = async () => {
        try {
            if (error) {
                clearError(); // reset error
            }
            const response = await getProduct(productId);
            setIsFavorite(response.isFavorite);
            setProduct(response);
        } catch (err) {
            handleError(err);
            setProduct(null);
        }
    };

    const fetchUserWallPosts = async (userId, pageIndex, pageSize) => {
        try {
            const response = await getUserWallPosts(
                userId,
                pageIndex,
                pageSize
            );
            setUserWallPosts(response.items || []);
        } catch (err) {
            handleError(err);
        }
    };

    useEffect(() => {
        getProductDetails();
        window.scrollTo({
            top: 0,
            left: 0,
            behavior: "smooth",
        });
    }, [productId]);

    useEffect(() => {
        if (product?.sellerId) {
            fetchUserWallPosts(product.sellerId, 1, 2);
        }
    }, [product]);

    //if (!product) return <div>Loading...</div>;
    if (error) {
        return <ErrorDisplay type={error} />;
    }

    return (
        // div chinh product o day
        <div className="min-h-screen flex flex-col w-11/12 sm:w-10/12  items-start">
            {/* anh va thong tin san pham */}
            <div className="bg-white rounded-md flex-1 p-8 flex-row w-full">
                {/* breadcrumbs */}
                <div className="flex flex-col gap-4 w-full mb-6">
                    <div className="flex gap-2 text-gray-500 text-sm">
                        <Link
                            className="text-blue-500 hover:underline whitespace-nowrap"
                            to="/"
                        >
                            Trang chủ
                        </Link>
                        <span>&gt;</span>
                        <Link
                            className="text-blue-500 hover:underline whitespace-nowrap"
                            to={`/category/${product?.parentCategoryId}`}
                        >
                            {product?.parentCategoryName}
                        </Link>
                        <span>&gt;</span>
                        <Link
                            className="text-blue-500 hover:underline whitespace-nowrap"
                            to={`/category/${product?.childCategoryId}`}
                        >
                            {product?.childCategoryName}
                        </Link>
                        <span>&gt;</span>
                        <span className="truncate ">
                            {product?.productName}
                        </span>
                    </div>
                </div>
                {/* main content anh va thong tin san pham */}
                <div className="flex flex-col  lg:flex-row gap-8 w-full">
                    {/* anh san pham */}
                    <div className="flex flex-col gap-2 w-96 flex-shrink-0 self-center">
                        {/* anh lon */}
                        <div className="w-full h-96 flex items-center justify-center border border-black bg-black">
                            <img
                                src={product?.productImages[selectedImage]}
                                alt={product?.productName}
                                className="object-contain max-w-96 max-h-96"
                            />
                        </div>
                        {/* anh nho */}
                        <div className="relative">
                            {/* Left scroll button */}
                            {showLeftButton && (
                                <ChevronLeft
                                    className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 text-black bg-white bg-opacity-80 hover:bg-opacity-100 border border-gray-300 rounded-full w-8 h-8 flex items-center justify-center shadow-md transition-all duration-200 cursor-pointer"
                                    onClick={() => scrollThumbnails("left")}
                                />
                            )}

                            {/* Right scroll button */}
                            {showRightButton && (
                                <ChevronLeft
                                    className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 text-black bg-white bg-opacity-80 hover:bg-opacity-100 border border-gray-300 rounded-full w-8 h-8 flex items-center justify-center shadow-md transition-all duration-200 cursor-pointer rotate-180"
                                    onClick={() => scrollThumbnails("right")}
                                />
                            )}

                            {/* Thumbnail container */}
                            <div
                                ref={thumbnailContainerRef}
                                className="flex gap-1 overflow-x-hidden scroll-smooth"
                                onScroll={checkScrollButtons}
                                style={{
                                    scrollbarWidth: "none",
                                    msOverflowStyle: "none",
                                }}
                            >
                                {product?.productImages.map(
                                    (imageUrl, index) => (
                                        <img
                                            key={index}
                                            src={imageUrl}
                                            alt={product?.productName}
                                            onClick={() =>
                                                setSelectedImage(index)
                                            }
                                            className={`w-24 h-24 border border-black object-cover flex-shrink-0 hover:scale-105 cursor-pointer hover:border-blue-500 ${
                                                selectedImage === index
                                                    ? "border-blue-500"
                                                    : "border-black"
                                            }`}
                                        />
                                    )
                                )}
                            </div>

                            {/* Hide scrollbar with CSS */}
                            <style jsx>{`
                                div::-webkit-scrollbar {
                                    display: none;
                                }
                            `}</style>
                        </div>
                    </div>
                    {/* thong tin san pham */}
                    <div className="flex-1 min-w-0 text-black flex items-start flex-col gap-2">
                        <div className="w-full flex justify-between items-start gap-4">
                            <div>
                                <h1 className="text-3xl font-semibold break-words w-full text-left">
                                    {product?.productName}
                                </h1>
                                <h1 className="text-2xl mt-4 flex font-semibold flex-wrap">
                                    <div className="mr-4 whitespace-nowrap">
                                        Giá:{" "}
                                    </div>
                                    <div className="text-red-500 break-words">
                                        {formatVND(product?.price)}
                                    </div>
                                </h1>
                            </div>
                            <Heart
                                onClick={handleFavorite}
                                className={`self-center  cursor-pointer ${
                                    isFavorite ? "fill-red-500" : ""
                                }`}
                            />
                        </div>
                        <div className="flex mt-2">
                            <Clock9 />
                            <span className="ml-2">
                                Đăng ngày:{" "}
                                {formatDateLocal(product?.createdDate)}
                            </span>
                        </div>
                        <button className="mt-8 bg-blue-500 text-white px-6 py-3 rounded-md hover:bg-blue-600 transition w-full">
                            Liên hệ người bán
                        </button>
                        {/* thong tin nguoi ban */}
                        <div className="mt-6 w-full">
                            <div className="flex flex-row">
                                <div className="text-lg font-semibold flex items-center">
                                    {product?.sellerAvatarImage ? (
                                        <img
                                            src={product.sellerAvatarImage}
                                            alt="User Avatar"
                                            className="w-10 h-10 rounded-full object-cover"
                                        />
                                    ) : (
                                        <User className="w-10 h-10 text-gray-500 bg-gray-200 rounded-full p-1" />
                                    )}
                                    <span className="ml-4 text-black">
                                        {product?.sellerFullName ||
                                            product?.sellerName}
                                    </span>
                                </div>
                                <div className="ml-auto">
                                    <button className="bg-blue-500 text-sm text-white rounded-md hover:bg-blue-600 transition">
                                        Xem trang cá nhân
                                    </button>
                                </div>
                            </div>
                            <div className="mt-4 flex items-center">
                                <Mail />
                                <p className="ml-4 text-gray-900">
                                    {product?.sellerEmail ?? "Chưa cập nhật"}
                                </p>
                            </div>
                            <div className="mt-4 flex items-center">
                                <Phone />
                                <p className="ml-4 text-gray-900">
                                    {product?.sellerPhone ?? "Chưa cập nhật"}
                                </p>
                            </div>
                            <div className="mt-4 flex items-center">
                                <MapPin />
                                <p className="ml-4 text-gray-900">
                                    {product?.sellerAddress ?? "Chưa cập nhật"}
                                </p>
                            </div>
                        </div>
                        {/* chat nhanh */}
                        <div className="mt-6 w-full flex items-center   ">
                            <span className="text-lg font-semibold">
                                Chat nhanh:
                            </span>
                            <button className="ml-4 bg-gray-200 text-black px-4 py-2 rounded-full hover:bg-blue-500 hover:text-white transition">
                                Sản phẩm này còn không ạ?
                            </button>
                            <button className="ml-4 bg-gray-200 text-black px-4 py-2 rounded-full hover:bg-blue-500 hover:text-white transition">
                                Bạn có ship hàng không?
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            {/* mo ta chi tiet san pham va danh gia */}
            <div className="w-full flex flex-col lg:flex-row gap-4 mt-4 min-h-72">
                <div className="flex-1 basis-1/2 bg-white rounded-md p-6">
                    <h2 className="text-2xl font-semibold mb-2 border-b border-gray-300">
                        Mô tả chi tiết
                    </h2>
                    <p className="text-gray-800 whitespace-pre-line">
                        {product?.productDescription}
                    </p>
                </div>
                <div className="flex-1 basis-1/2 bg-white rounded-md p-6 pb-4">
                    <div className="flex border-b border-gray-300">
                        <h2 className="text-2xl font-semibold">Đánh giá</h2>
                        <Link
                            className="flex text-xl font-semibold ml-auto text-blue-500 hover:underline hover:text-blue-500"
                            to={`/user/${product?.sellerName}`}
                        >
                            <div>Xem thêm</div>
                            <ChevronLeft className="rotate-180 self-center" />
                        </Link>
                    </div>
                    <div className="mt-4">
                        {userWallPosts.length === 0 ? (
                            <p className="text-gray-600">
                                Chưa có đánh giá nào.
                            </p>
                        ) : (
                            userWallPosts.map((post) => (
                                <UserWallPost key={post.id} post={post} />
                            ))
                        )}
                    </div>
                    <div className="flex items-center"></div>
                </div>
            </div>

            <ProductCarousel
                title="Sản phẩm tương tự"
                products={relevantProducts}
                viewAllLink={`/category/${product?.childCategoryId}`}
            />
            {recommendedProducts && (
                <ProductCarousel
                    title="Sản phẩm bạn có thể thích"
                    products={recommendedProducts}
                    viewAllLink={`/category/${product?.childCategoryId}`}
                />
            )}
        </div>
    );
}
