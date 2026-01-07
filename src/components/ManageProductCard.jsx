import { Trash2, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";
import { Edit3 } from "lucide-react";
import { formatVND } from "../helpers/formatPrice";
import { formatDateLocal } from "../helpers/formatDate";
import {
    deleteUserProduct,
    updateProductStatus,
} from "../services/productService";
import { useState } from "react";
import { useDialog } from "../hooks/useDialog";

export default function ManageProductCard({
    product,
    onDelete,
    onStatusChange,
}) {
    const [isDeleting, setIsDeleting] = useState(false);
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
    const [currentStatus, setCurrentStatus] = useState(product.status);

    const { confirmDelete, showError } = useDialog();

    const removeProduct = async () => {
        try {
            await confirmDelete("Bạn có chắc chắn muốn xóa sản phẩm này?", {
                title: "Xóa sản phẩm",
                confirmText: "Xóa",
            });

            setIsDeleting(true);
            await deleteUserProduct(product.productId);
            if (onDelete) {
                onDelete(product.productId);
            }
        } catch (error) {
            if (error !== false) {
                // false means user cancelled, don't show error
                console.error("Error deleting product:", error);
                showError("Xóa sản phẩm thất bại. Vui lòng thử lại.");
            }
        } finally {
            setIsDeleting(false);
        }
    };

    const toggleStatus = async () => {
        const newStatus = currentStatus === "Sold" ? "Approved" : "Sold";

        setIsUpdatingStatus(true);
        try {
            await updateProductStatus(product.productId, newStatus);
            setCurrentStatus(newStatus);
            if (onStatusChange) {
                onStatusChange(product.productId, newStatus);
            }
        } catch (error) {
            console.error("Error updating product status:", error);
            showError("Cập nhật trạng thái thất bại. Vui lòng thử lại.");
        } finally {
            setIsUpdatingStatus(false);
        }
    };

    // Only show status toggle for Approved or Sold products
    const canToggleStatus =
        currentStatus === "Approved" || currentStatus === "Sold";

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
                {canToggleStatus && (
                    <button
                        className={`flex text-white px-4 py-2 rounded-md transition-colors w-full disabled:opacity-50 disabled:cursor-not-allowed items-center justify-center ${
                            currentStatus === "Approved"
                                ? "bg-orange-500 hover:bg-orange-600"
                                : "bg-green-600 hover:bg-green-700"
                        }`}
                        onClick={toggleStatus}
                        disabled={isUpdatingStatus}
                    >
                        <RefreshCw
                            className={isUpdatingStatus ? "animate-spin" : ""}
                            size={18}
                        />
                        <p className="hidden lg:block mx-2">
                            {isUpdatingStatus
                                ? "Đang cập nhật..."
                                : currentStatus === "Approved"
                                ? "Đã bán"
                                : "Mở bán lại"}
                        </p>
                    </button>
                )}
                <button
                    className="bg-red-500 flex text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors w-full disabled:opacity-50 disabled:cursor-not-allowed items-center justify-center"
                    onClick={removeProduct}
                    disabled={isDeleting}
                >
                    <Trash2 size={18} />
                    <p className="hidden lg:block mx-2">
                        {isDeleting ? "Đang xóa..." : "Xóa sản phẩm"}
                    </p>
                </button>
            </div>
        </div>
    );
}
