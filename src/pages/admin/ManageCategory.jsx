import React, { useState, useEffect } from "react";
import {
    Search,
    Plus,
    Edit,
    Trash2,
    X,
    ImageIcon,
    Save,
    AlertTriangle,
    Upload,
} from "lucide-react";
import {
    getAllCategories,
    createCategory,
    updateCategory,
    deleteCategory,
} from "../../services/categoryService";
import { uploadImage } from "../../services/imageService";
import { useDialog } from "../../hooks/useDialog";

const ManageCategory = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [error, setError] = useState(null);
    const [uploadingImage, setUploadingImage] = useState(false);

    // Modal states
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);

    const { confirmDelete, showSuccess, showError } = useDialog();

    // Form states
    const [formData, setFormData] = useState({
        name: "",
        imageUrl: "",
        description: "",
        parentCategoryId: null,
    });

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => {
                setError(null);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [error]);

    const fetchCategories = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await getAllCategories();
            setCategories(response || []);
        } catch (error) {
            console.error("Error fetching categories:", error);
            setError("Không thể tải danh sách danh mục. Vui lòng thử lại.");
        } finally {
            setLoading(false);
        }
    };

    const handleCreateCategory = async () => {
        try {
            setError(null);
            await createCategory(formData);
            showSuccess("Tạo danh mục thành công!");
            setShowAddModal(false);
            resetForm();
            fetchCategories();
        } catch (error) {
            console.error("Error creating category:", error);
            showError("Không thể tạo danh mục. Vui lòng thử lại.");
        }
    };

    const handleUpdateCategory = async () => {
        try {
            setError(null);
            const updateData = {
                ...formData,
                categoryId: selectedCategory.categoryId,
            };
            await updateCategory(updateData);
            showSuccess("Cập nhật danh mục thành công!");
            setShowEditModal(false);
            resetForm();
            fetchCategories();
        } catch (error) {
            console.error("Error updating category:", error);
            showError("Không thể cập nhật danh mục. Vui lòng thử lại.");
        }
    };

    const openAddModal = () => {
        resetForm();
        setShowAddModal(true);
    };

    const openEditModal = (category) => {
        setSelectedCategory(category);
        setFormData({
            name: category.name,
            imageUrl: category.imageUrl,
            description: category.description || "",
            parentCategoryId: category.parentCategoryId || null,
        });
        setShowEditModal(true);
    };

    const handleDeleteClick = async (category) => {
        try {
            await confirmDelete(
                `Bạn có chắc chắn muốn xóa danh mục "${category.name}" không?${
                    category.childs && category.childs.length > 0
                        ? `\nDanh mục này có ${category.childs.length} danh mục con!`
                        : ""
                }`,
                {
                    title: "Xóa danh mục",
                    confirmText: "Xóa",
                }
            );

            setError(null);
            await deleteCategory(category.categoryId);
            showSuccess("Xóa danh mục thành công!");
            fetchCategories();
        } catch (error) {
            if (error !== false) {
                // false means user cancelled, don't show error
                console.error("Error deleting category:", error);
                showError("Không thể xóa danh mục. Vui lòng thử lại.");
            }
        }
    };

    const resetForm = () => {
        setFormData({
            name: "",
            imageUrl: "",
            description: "",
            parentCategoryId: null,
        });
        setSelectedCategory(null);
    };

    const handleImageUpload = async (file) => {
        setUploadingImage(true);
        try {
            const data = await uploadImage(file);
            setFormData((prev) => ({
                ...prev,
                imageUrl: data.imageUrl,
            }));
        } catch (error) {
            console.error("Error uploading image:", error);
            setError("Không thể tải ảnh lên. Vui lòng thử lại.");
        } finally {
            setUploadingImage(false);
        }
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file && file.type.startsWith("image/")) {
            handleImageUpload(file);
        }
        e.target.value = "";
    };

    const removeImage = () => {
        setFormData((prev) => ({
            ...prev,
            imageUrl: "",
        }));
    };

    const closeModals = () => {
        setShowAddModal(false);
        setShowEditModal(false);
        resetForm();
    };

    // Flatten categories for easy searching
    const flattenCategories = (categories, level = 0) => {
        let result = [];
        categories.forEach((category) => {
            result.push({ ...category, level });
            if (category.childs && category.childs.length > 0) {
                result = result.concat(
                    flattenCategories(category.childs, level + 1)
                );
            }
        });
        return result;
    };

    const filteredCategories = flattenCategories(categories).filter(
        (category) =>
            category.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const parentCategories = flattenCategories(categories).filter(
        (cat) => cat.level === 0
    );

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Quản lý danh mục
                    </h1>
                    <p className="text-gray-600 mt-1">
                        Tổng cộng {filteredCategories.length} danh mục
                    </p>
                </div>
                <button
                    onClick={openAddModal}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    Thêm danh mục
                </button>
            </div>

            {/* Alert Messages */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    {error}
                </div>
            )}

            {/* Search and Filters */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <div className="flex gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm danh mục..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 text-black bg-white pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                </div>
            </div>

            {/* Categories Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Danh mục
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Hình ảnh
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Mô tả
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Danh mục con
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Thao tác
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredCategories.map((category) => (
                                <tr
                                    key={category.categoryId}
                                    className="hover:bg-gray-50"
                                >
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div
                                                style={{
                                                    marginLeft: `${
                                                        category.level * 20
                                                    }px`,
                                                }}
                                            >
                                                <div className="text-sm font-medium text-gray-900">
                                                    {category.name}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    ID: {category.categoryId}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {category.imageUrl ? (
                                            <img
                                                src={category.imageUrl}
                                                alt={category.name}
                                                className="w-10 h-10 rounded-lg object-cover"
                                            />
                                        ) : (
                                            <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                                                <ImageIcon className="w-5 h-5 text-gray-400" />
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-gray-900 max-w-xs truncate">
                                            {category.description ||
                                                "Không có mô tả"}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-sm text-gray-500">
                                            {category.childs
                                                ? category.childs.length
                                                : 0}{" "}
                                            danh mục con
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() =>
                                                    openEditModal(category)
                                                }
                                                className="inline-flex items-center px-3 py-1.5 rounded-md text-xs font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors"
                                            >
                                                <Edit className="w-3 h-3 mr-1" />
                                                Sửa
                                            </button>
                                            <button
                                                onClick={() =>
                                                    handleDeleteClick(category)
                                                }
                                                className="inline-flex items-center px-3 py-1.5 rounded-md text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
                                            >
                                                <Trash2 className="w-3 h-3 mr-1" />
                                                Xóa
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add Category Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">
                                Thêm danh mục mới
                            </h2>
                            <button
                                onClick={closeModals}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Tên danh mục *
                                </label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    value={formData.name}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            name: e.target.value,
                                        })
                                    }
                                    placeholder="Nhập tên danh mục"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Hình ảnh danh mục
                                </label>
                                <div className="space-y-3">
                                    {/* Current Image Preview */}
                                    {formData.imageUrl && (
                                        <div className="relative inline-block">
                                            <img
                                                src={formData.imageUrl}
                                                alt="Preview"
                                                className="w-24 h-24 rounded-lg object-cover border"
                                            />
                                            <button
                                                type="button"
                                                onClick={removeImage}
                                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    )}

                                    {/* File Upload */}
                                    <div className="flex items-center justify-center w-full">
                                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                {uploadingImage ? (
                                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                                                ) : (
                                                    <>
                                                        <Upload className="w-8 h-8 mb-4 text-gray-500" />
                                                        <p className="mb-2 text-sm text-gray-500">
                                                            <span className="font-semibold">
                                                                Click để tải ảnh
                                                            </span>
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            PNG, JPG hoặc JPEG
                                                        </p>
                                                    </>
                                                )}
                                            </div>
                                            <input
                                                type="file"
                                                className="hidden"
                                                accept="image/*"
                                                onChange={handleFileSelect}
                                                disabled={uploadingImage}
                                            />
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Mô tả
                                </label>
                                <textarea
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    rows="3"
                                    value={formData.description}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            description: e.target.value,
                                        })
                                    }
                                    placeholder="Nhập mô tả danh mục"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Danh mục cha
                                </label>
                                <select
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    value={formData.parentCategoryId || ""}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            parentCategoryId: e.target.value
                                                ? parseInt(e.target.value)
                                                : null,
                                        })
                                    }
                                >
                                    <option value="">
                                        Không có danh mục cha
                                    </option>
                                    {parentCategories.map((category) => (
                                        <option
                                            key={category.categoryId}
                                            value={category.categoryId}
                                        >
                                            {category.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="flex justify-end space-x-3 mt-6">
                            <button
                                onClick={closeModals}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleCreateCategory}
                                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
                            >
                                <Save className="w-4 h-4" />
                                Tạo danh mục
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Category Modal */}
            {showEditModal && selectedCategory && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">
                                Chỉnh sửa danh mục
                            </h2>
                            <button
                                onClick={closeModals}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Tên danh mục *
                                </label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    value={formData.name}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            name: e.target.value,
                                        })
                                    }
                                    placeholder="Nhập tên danh mục"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Hình ảnh danh mục
                                </label>
                                <div className="space-y-3">
                                    {/* Current Image Preview */}
                                    {formData.imageUrl && (
                                        <div className="relative inline-block">
                                            <img
                                                src={formData.imageUrl}
                                                alt="Preview"
                                                className="w-24 h-24 rounded-lg object-cover border"
                                            />
                                            <button
                                                type="button"
                                                onClick={removeImage}
                                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    )}

                                    {/* File Upload */}
                                    <div className="flex items-center justify-center w-full">
                                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                {uploadingImage ? (
                                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                                                ) : (
                                                    <>
                                                        <Upload className="w-8 h-8 mb-4 text-gray-500" />
                                                        <p className="mb-2 text-sm text-gray-500">
                                                            <span className="font-semibold">
                                                                Click để tải ảnh
                                                            </span>
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            PNG, JPG hoặc JPEG
                                                        </p>
                                                    </>
                                                )}
                                            </div>
                                            <input
                                                type="file"
                                                className="hidden"
                                                accept="image/*"
                                                onChange={handleFileSelect}
                                                disabled={uploadingImage}
                                            />
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Mô tả
                                </label>
                                <textarea
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    rows="3"
                                    value={formData.description}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            description: e.target.value,
                                        })
                                    }
                                    placeholder="Nhập mô tả danh mục"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Danh mục cha
                                </label>
                                <select
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    value={formData.parentCategoryId || ""}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            parentCategoryId: e.target.value
                                                ? parseInt(e.target.value)
                                                : null,
                                        })
                                    }
                                >
                                    <option value="">
                                        Không có danh mục cha
                                    </option>
                                    {parentCategories
                                        .filter(
                                            (cat) =>
                                                cat.categoryId !==
                                                selectedCategory.categoryId
                                        )
                                        .map((category) => (
                                            <option
                                                key={category.categoryId}
                                                value={category.categoryId}
                                            >
                                                {category.name}
                                            </option>
                                        ))}
                                </select>
                            </div>
                        </div>

                        <div className="flex justify-end space-x-3 mt-6">
                            <button
                                onClick={closeModals}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleUpdateCategory}
                                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
                            >
                                <Save className="w-4 h-4" />
                                Cập nhật
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageCategory;
