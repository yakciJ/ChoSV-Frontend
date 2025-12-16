import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, X } from "lucide-react";
import { getAllCategories } from "../services/categoryService";
import {
    getProduct,
    createProduct,
    updateProduct,
} from "../services/productService";
import { uploadImage } from "../services/imageService";
import { formatVND } from "../helpers/formatPrice";

export default function ProductForm({ mode, productId }) {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState([]);
    const [selectedParentCategory, setSelectedParentCategory] = useState(null);
    const [uploadingImage, setUploadingImage] = useState(false);

    const [formData, setFormData] = useState({
        productName: "",
        productDescription: "",
        price: "",
        parentCategoryId: null,
        childCategoryId: null,
        imageUrls: [],
    });

    const parsePrice = (formattedValue) => {
        return formattedValue.replace(/[^\d]/g, "");
    };

    // Fetch categories on mount
    useEffect(() => {
        fetchCategories();
        if (mode === "edit" && productId) {
            fetchProductData();
        }
    }, [mode, productId]);

    const fetchCategories = async () => {
        try {
            const data = await getAllCategories();
            console.log("Fetched categories:", data);
            setCategories(data);
        } catch (error) {
            console.error("Error fetching categories:", error);
        }
    };

    const fetchProductData = async () => {
        setLoading(true);
        try {
            const product = await getProduct(productId);
            console.log("Product data:", product);
            setFormData({
                productName: product.productName,
                productDescription: product.productDescription,
                price: product.price.toString(),
                parentCategoryId: product.parentCategoryId,
                childCategoryId: product.childCategoryId,
                imageUrls: product.productImages || [],
            });

            // Don't set selectedParentCategory here since categories might not be loaded yet
        } catch (error) {
            console.error("Error fetching product:", error);
        } finally {
            setLoading(false);
        }
    };

    // Add useEffect to set selectedParentCategory when both categories and formData.parentCategoryId are available
    useEffect(() => {
        if (categories.length > 0 && formData.parentCategoryId) {
            const parentCat = categories.find(
                (cat) => cat.categoryId === formData.parentCategoryId
            );
            setSelectedParentCategory(parentCat);
        }
    }, [categories, formData.parentCategoryId]);

    const handleImageUpload = async (file) => {
        setUploadingImage(true);

        try {
            const data = await uploadImage(file);
            setFormData((prev) => ({
                ...prev,
                imageUrls: [...prev.imageUrls, data.imageUrl],
            }));
        } catch (error) {
            console.error("Error uploading image:", error);
            alert("Lỗi khi tải ảnh lên");
        } finally {
            setUploadingImage(false);
        }
    };

    const handleFileSelect = (e) => {
        const files = Array.from(e.target.files);
        files.forEach((file) => {
            if (file.type.startsWith("image/")) {
                handleImageUpload(file);
            }
        });
        e.target.value = "";
    };

    const removeImage = (indexToRemove) => {
        setFormData((prev) => ({
            ...prev,
            imageUrls: prev.imageUrls.filter(
                (_, index) => index !== indexToRemove
            ),
        }));
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        if (name === "price") {
            // Remove existing formatting and only keep digits
            const numericValue = value.replace(/[^\d]/g, "");
            setFormData((prev) => ({
                ...prev,
                [name]: numericValue,
            }));
        } else {
            setFormData((prev) => ({
                ...prev,
                [name]: value,
            }));
        }
    };

    const handleParentCategoryChange = (e) => {
        const parentCategoryId = parseInt(e.target.value);
        const parentCategory = categories.find(
            (cat) => cat.categoryId === parentCategoryId
        );

        setSelectedParentCategory(parentCategory);
        setFormData((prev) => ({
            ...prev,
            parentCategoryId: parentCategoryId,
            childCategoryId: null, // Reset child category when parent changes
        }));
    };

    const handleChildCategoryChange = (e) => {
        const childCategoryId = parseInt(e.target.value);
        setFormData((prev) => ({
            ...prev,
            childCategoryId: childCategoryId,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (
            !formData.productName ||
            !formData.price ||
            !formData.parentCategoryId ||
            !formData.childCategoryId
        ) {
            alert("Vui lòng điền đầy đủ thông tin bắt buộc");
            return;
        }

        setLoading(true);

        const submitData = {
            productName: formData.productName,
            productDescription: formData.productDescription,
            price: parseFloat(parsePrice(formData.price)),
            categoryIds: [formData.childCategoryId], // Send child category ID in array
            imageUrls: formData.imageUrls,
        };

        try {
            if (mode === "create") {
                await createProduct(submitData);
                alert("Đăng tin thành công!");
            } else {
                await updateProduct(productId, submitData);
                alert("Cập nhật thành công!");
            }
            navigate("/product-management");
        } catch (error) {
            console.error("Error submitting product:", error);
            alert(`Lỗi: ${error.message || "Có lỗi xảy ra"}`);
        } finally {
            setLoading(false);
        }
    };

    const handlePriceKeyDown = (e) => {
        if (e.key === "Backspace" || e.key === "Delete") {
            const cursorPos = e.target.selectionStart;
            const value = e.target.value;

            // If cursor is at the end (after ₫), move it to before the currency symbol
            if (cursorPos >= value.length - 1) {
                const lastDigitIndex = value.search(/\d(?=[^\d]*$)/);
                if (lastDigitIndex >= 0) {
                    e.target.setSelectionRange(
                        lastDigitIndex + 1,
                        lastDigitIndex + 1
                    );
                }
            }
        }
    };

    if (loading && mode === "edit") {
        return (
            <div className="flex justify-center items-center h-64">
                Đang tải...
            </div>
        );
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="flex flex-col md:flex-row gap-8 p-6 bg-white rounded-lg border-gray-100 border-2 shadow-md"
        >
            {/* Left side - Image Upload */}
            <div className="flex-[3] space-y-4">
                <h3 className="text-lg font-semibold text-gray-700">
                    Hình ảnh sản phẩm
                </h3>

                {/* Upload Area */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
                    <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleFileSelect}
                        className="hidden"
                        id="image-upload"
                        disabled={uploadingImage}
                    />
                    <label
                        htmlFor="image-upload"
                        className="cursor-pointer block"
                    >
                        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                        <p className="text-sm text-gray-600">
                            {uploadingImage
                                ? "Đang tải ảnh..."
                                : "Nhấn để chọn ảnh hoặc kéo thả vào đây"}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                            PNG, JPG, GIF tối đa 5MB
                        </p>
                    </label>
                </div>

                {/* Image Preview */}
                {formData.imageUrls.length > 0 && (
                    <div className="space-y-3">
                        <h4 className="font-medium text-gray-700">
                            Ảnh đã tải lên ({formData.imageUrls.length})
                        </h4>
                        <div className="grid grid-cols-2 gap-3">
                            {formData.imageUrls.map((url, index) => (
                                <div key={index} className="relative group">
                                    <img
                                        src={url}
                                        alt={`Product ${index + 1}`}
                                        className="w-full aspect-square object-cover rounded-lg border"
                                        onError={(e) => {
                                            e.target.src =
                                                "/placeholder-image.jpg";
                                            e.target.alt = "Không thể tải ảnh";
                                        }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeImage(index)}
                                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                                        title="Xóa ảnh này"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Right side - Product Details */}
            <div className="flex-[7] space-y-6">
                <h3 className="text-lg font-semibold text-gray-700">
                    Thông tin sản phẩm
                </h3>

                {/* Product Name */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tên sản phẩm <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        name="productName"
                        value={formData.productName}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Nhập tên sản phẩm..."
                        required
                    />
                </div>

                {/* Price */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Giá <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        name="price"
                        value={
                            formData.price
                                ? formatVND(parseFloat(formData.price))
                                : ""
                        }
                        onChange={handleInputChange}
                        onKeyDown={handlePriceKeyDown}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0 ₫"
                        required
                    />
                </div>

                {/* Parent Category */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Danh mục chính <span className="text-red-500">*</span>
                    </label>
                    <select
                        value={formData.parentCategoryId || ""}
                        onChange={handleParentCategoryChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    >
                        <option value="" disabled>
                            Chọn danh mục chính...
                        </option>
                        {categories.map((category) => (
                            <option
                                key={category.categoryId}
                                value={category.categoryId}
                            >
                                {category.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Child Category */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Danh mục phụ <span className="text-red-500">*</span>
                    </label>
                    <select
                        value={formData.childCategoryId || ""}
                        onChange={handleChildCategoryChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={!selectedParentCategory}
                        required
                    >
                        <option value="" disabled>
                            {selectedParentCategory
                                ? "Chọn danh mục phụ..."
                                : "Vui lòng chọn danh mục chính trước"}
                        </option>
                        {selectedParentCategory?.childs?.map(
                            (childCategory) => (
                                <option
                                    key={childCategory.categoryId}
                                    value={childCategory.categoryId}
                                >
                                    {childCategory.name}
                                </option>
                            )
                        )}
                    </select>
                </div>

                {/* Description */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Mô tả sản phẩm
                    </label>
                    <textarea
                        name="productDescription"
                        value={formData.productDescription}
                        onChange={handleInputChange}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Nhập mô tả chi tiết về sản phẩm..."
                    />
                </div>

                {/* Submit Buttons */}
                <div className="flex gap-3 pt-4">
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                    >
                        Hủy
                    </button>
                    <button
                        type="submit"
                        disabled={loading || uploadingImage}
                        className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                        {loading
                            ? "Đang xử lý..."
                            : mode === "create"
                            ? "Đăng tin"
                            : "Cập nhật"}
                    </button>
                </div>
            </div>
        </form>
    );
}
