import { useNavigate } from "react-router-dom";
import { formatVND } from "../helpers/formatPrice";
import { useState } from "react";
import { User } from "lucide-react";

export default function ProductCard(props) {
    const navigate = useNavigate();
    const [avatarError, setAvatarError] = useState(false);

    return (
        <div
            onClick={() => navigate(`/product/${props.productId}`)}
            className="md:w-[25vw] xl:w-[13vw] w-[37vw] bg-gray-100 shadow-md rounded-sm border-black border overflow-hidden hover:border-blue-500 hover:shadow-lg hover:shadow-blue-100 hover:-translate-y-1 transition"
        >
            <img
                src={props.firstImageUrl}
                alt={props.productName}
                className="w-full aspect-square object-cover"
            />
            <div className="px-4 py-2 text-left">
                <h3 className="text-black text-lg font-semibold line-clamp-2 h-12 leading-tight">
                    {props.productName}
                </h3>
                <p className="text-lg text-blue-600 font-bold mb-2">
                    {formatVND(props.price)}
                </p>
                <div className="flex-row flex gap-2">
                    {!avatarError && props.sellerAvatar ? (
                        <img
                            src={props.sellerAvatar}
                            alt={props.sellerName}
                            className="w-6 h-6 rounded-full"
                            onError={() => setAvatarError(true)}
                        />
                    ) : (
                        <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center">
                            <User size={14} className="text-gray-600" />
                        </div>
                    )}
                    <span className="text-gray-600 text-base">
                        {props.sellerFullName || props.sellerName}
                    </span>
                </div>
            </div>
        </div>
    );
}
