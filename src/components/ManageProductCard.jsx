import { Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Edit3 } from "lucide-react";
import { User } from "lucide-react";
import { formatVND } from "../helpers/formatPrice";
import { formatDateLocal } from "../helpers/formatDate";

export default function ManageProductCard(product) {
    const removeProduct = () => {
        // Call API to remove product
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
                            Giá: {formatVND(product.productPrice)}
                        </p>
                    </div>
                    <div className="text-gray-600 flex items-center">
                        <p>Đăng lúc: {formatDateLocal(product.createdDate)}</p>
                    </div>
                </div>
            </Link>
            <div className="flex flex-col items-center justify-center gap-2">
                <Link
                    className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors flex items-center justify-center hover:text-white w-full"
                    to={`/edit-product/${product.productId}`}
                >
                    <Edit3 />
                    <p className="hidden lg:block mx-2">Sửa tin</p>
                </Link>
                <button
                    className="bg-blue-500 flex text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors w-full"
                    onClick={removeProduct()}
                >
                    <Trash2 />
                    <p className="hidden lg:block mx-2">Xóa sản phẩm</p>
                </button>
            </div>
        </div>
    );
}
