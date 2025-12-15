import { formatVND } from "../helpers/formatPrice";
import { formatDateLocal } from "../helpers/formatDate";
import { removeFavorite, addFavorite } from "../services/favoriteService";
import { useState } from "react";
import { Heart, MessageSquare, Trash2, User } from "lucide-react";
import { Link } from "react-router-dom";

export default function FavoriteProductCard({ product }) {
    const [isFavorited, setIsFavorited] = useState(product.isFavorited);

    const removeFromFavorites = async () => {
        try {
            await removeFavorite(product.productId);
            setIsFavorited(false);
        } catch (error) {
            console.error("Failed to remove from favorites:", error);
        }
    };

    const addToFavorites = async () => {
        try {
            await addFavorite(product.productId);
            setIsFavorited(true);
        } catch (error) {
            console.error("Failed to add to favorites:", error);
        }
    };

    return (
        <div className="flex border gap-4 border-gray-300 rounded-md p-2 w-full my-4">
            <Link
                to={`/product/${product.productId}`}
                className="flex gap-4 flex-1 text-inherit no-underline"
            >
                <img
                    src={product.firstImageUrl}
                    alt={product.productName}
                    className="w-32 h-32 object-cover"
                />
                <div className="flex flex-col justify-between flex-1">
                    <div>
                        <h2 className="text-xl font-semibold mb-1">
                            {product.productName}
                        </h2>
                        <p className="text-blue-500 text-xl font-semibold mb-1">
                            Giá: {formatVND(product.price)}
                        </p>
                    </div>
                    <div className="text-gray-600 flex items-center">
                        {product.sellerAvatar ? (
                            <img
                                src={product.sellerAvatar}
                                alt={product.sellerName}
                                className="w-8 h-8 object-cover rounded-full mr-2"
                            />
                        ) : (
                            <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center mr-2">
                                <User size={14} className="text-gray-600" />
                            </div>
                        )}
                        <p className="mr-4">
                            {product.sellerFullName || product.sellerName}
                        </p>
                        <p>Đăng lúc: {formatDateLocal(product.createdDate)}</p>
                    </div>
                </div>
            </Link>
            <div className="flex flex-col items-center justify-center gap-2">
                <Link
                    className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors flex items-center justify-center hover:text-white w-full"
                    to={`/tin-nhan/${product.sellerName}`}
                >
                    <MessageSquare />
                    <p className="hidden lg:block mx-2">Nhắn tin</p>
                </Link>
                {isFavorited ? (
                    <button
                        className="bg-red-500 flex text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors w-full"
                        onClick={removeFromFavorites}
                    >
                        <Trash2 />
                        <p className="hidden lg:block mx-2">
                            Xóa khỏi yêu thích
                        </p>
                    </button>
                ) : (
                    <button
                        className="bg-blue-500 flex text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors w-full"
                        onClick={addToFavorites}
                    >
                        <Heart />
                        <p className="hidden lg:block mx-2">
                            Thêm vào yêu thích
                        </p>
                    </button>
                )}
            </div>
        </div>
    );
}
