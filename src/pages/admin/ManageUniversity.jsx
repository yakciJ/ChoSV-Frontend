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
    ChevronLeft,
    ChevronRight,
    Mail,
    Building2,
} from "lucide-react";
import {
    getAllUniversities,
    createUniversity,
    updateUniversity,
    deleteUniversity,
} from "../../services/universityService";
import { uploadImage } from "../../services/imageService";
import { useDialog } from "../../hooks/useDialog";

const ManageUniversity = () => {
    const [universities, setUniversities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [hasNext, setHasNext] = useState(false);
    const [hasPrevious, setHasPrevious] = useState(false);
    const [error, setError] = useState(null);
    const [uploadingImage, setUploadingImage] = useState(false);

    // Modal states
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedUniversity, setSelectedUniversity] = useState(null);

    const { confirmDelete, showSuccess, showError } = useDialog();

    // Form states
    const [formData, setFormData] = useState({
        universityName: "",
        universityEmail: "",
        universityLogo: "",
    });

    const fetchUniversities = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await getAllUniversities(currentPage, pageSize);
            const data = response;

            setUniversities(data.items || []);
            setTotalCount(data.totalCount || 0);
            setTotalPages(data.totalPages || 1);
            setHasNext(data.hasNext || false);
            setHasPrevious(data.hasPrevious || false);
        } catch (error) {
            console.error("Error fetching universities:", error);
            setError(
                "Không thể tải danh sách trường đại học. Vui lòng thử lại.",
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUniversities();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPage, pageSize]);

    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => {
                setError(null);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [error]);

    const handleCreateUniversity = async () => {
        try {
            setError(null);
            await createUniversity(formData);
            showSuccess("Tạo trường đại học thành công!");
            setShowAddModal(false);
            resetForm();
            fetchUniversities();
        } catch (error) {
            console.error("Error creating university:", error);
            showError("Không thể tạo trường đại học. Vui lòng thử lại.");
        }
    };

    const handleUpdateUniversity = async () => {
        try {
            setError(null);
            await updateUniversity(selectedUniversity.universityId, formData);
            showSuccess("Cập nhật trường đại học thành công!");
            setShowEditModal(false);
            resetForm();
            fetchUniversities();
        } catch (error) {
            console.error("Error updating university:", error);
            showError("Không thể cập nhật trường đại học. Vui lòng thử lại.");
        }
    };

    const openAddModal = () => {
        resetForm();
        setShowAddModal(true);
    };

    const openEditModal = (university) => {
        setSelectedUniversity(university);
        setFormData({
            universityName: university.universityName,
            universityEmail: university.universityEmail,
            universityLogo: university.universityLogo || "",
        });
        setShowEditModal(true);
    };

    const handleDeleteClick = async (university) => {
        try {
            await confirmDelete(
                `Bạn có chắc chắn muốn xóa trường đại học "${university.universityName}" không?`,
                {
                    title: "Xóa trường đại học",
                    confirmText: "Xóa",
                },
            );

            setError(null);
            await deleteUniversity(university.universityId);
            showSuccess("Xóa trường đại học thành công!");
            fetchUniversities();
        } catch (error) {
            if (error !== false) {
                // false means user cancelled, don't show error
                console.error("Error deleting university:", error);
                showError("Không thể xóa trường đại học. Vui lòng thử lại.");
            }
        }
    };

    const resetForm = () => {
        setFormData({
            universityName: "",
            universityEmail: "",
            universityLogo: "",
        });
        setSelectedUniversity(null);
    };

    const handleImageUpload = async (file) => {
        setUploadingImage(true);
        try {
            const data = await uploadImage(file);
            setFormData((prev) => ({
                ...prev,
                universityLogo: data.imageUrl,
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
            universityLogo: "",
        }));
    };

    const closeModals = () => {
        setShowAddModal(false);
        setShowEditModal(false);
        resetForm();
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    // Filter universities based on search query
    const filteredUniversities = universities.filter((university) => {
        const searchLower = searchQuery.toLowerCase();
        return (
            university.universityName?.toLowerCase().includes(searchLower) ||
            university.universityEmail?.toLowerCase().includes(searchLower)
        );
    });

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
                        Quản lý trường đại học
                    </h1>
                    <p className="text-gray-600 mt-1">
                        Tổng cộng {totalCount} trường đại học
                    </p>
                </div>
                <button
                    onClick={openAddModal}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    Thêm trường đại học
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
                            placeholder="Tìm kiếm trường đại học..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 text-black bg-white pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    <select
                        value={pageSize}
                        onChange={(e) => {
                            setPageSize(Number(e.target.value));
                            setCurrentPage(1);
                        }}
                        className="px-3 py-2 bg-white text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value={5}>5 trên trang</option>
                        <option value={10}>10 trên trang</option>
                        <option value={20}>20 trên trang</option>
                        <option value={50}>50 trên trang</option>
                    </select>
                </div>
            </div>

            {/* Universities Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    ID
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Logo
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Tên trường
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Email
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Thao tác
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredUniversities.map((university) => (
                                <tr
                                    key={university.universityId}
                                    className="hover:bg-gray-50"
                                >
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">
                                            {university.universityId}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {university.universityLogo ? (
                                            <img
                                                src={university.universityLogo}
                                                alt={university.universityName}
                                                className="w-10 h-10 rounded-lg object-cover"
                                            />
                                        ) : (
                                            <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                                                <Building2 className="w-5 h-5 text-gray-400" />
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-medium text-gray-900">
                                            {university.universityName}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center text-sm text-gray-900">
                                            <Mail className="w-4 h-4 mr-2 text-gray-400" />
                                            {university.universityEmail}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() =>
                                                    openEditModal(university)
                                                }
                                                className="inline-flex items-center px-3 py-1.5 rounded-md text-xs font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors"
                                            >
                                                <Edit className="w-3 h-3 mr-1" />
                                                Sửa
                                            </button>
                                            <button
                                                onClick={() =>
                                                    handleDeleteClick(
                                                        university,
                                                    )
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

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                        <div className="flex-1 flex justify-between sm:hidden">
                            <button
                                onClick={() =>
                                    handlePageChange(currentPage - 1)
                                }
                                disabled={!hasPrevious}
                                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Trước
                            </button>
                            <button
                                onClick={() =>
                                    handlePageChange(currentPage + 1)
                                }
                                disabled={!hasNext}
                                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Sau
                            </button>
                        </div>
                        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm text-gray-700">
                                    Hiển thị{" "}
                                    <span className="font-medium">
                                        {(currentPage - 1) * pageSize + 1}
                                    </span>{" "}
                                    đến{" "}
                                    <span className="font-medium">
                                        {Math.min(
                                            currentPage * pageSize,
                                            totalCount,
                                        )}
                                    </span>{" "}
                                    trong tổng số{" "}
                                    <span className="font-medium">
                                        {totalCount}
                                    </span>{" "}
                                    trường đại học
                                </p>
                            </div>
                            <div>
                                <nav
                                    className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                                    aria-label="Pagination"
                                >
                                    <button
                                        onClick={() =>
                                            handlePageChange(currentPage - 1)
                                        }
                                        disabled={!hasPrevious}
                                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <span className="sr-only">
                                            Trang trước
                                        </span>
                                        <ChevronLeft
                                            className="h-5 w-5"
                                            aria-hidden="true"
                                        />
                                    </button>
                                    {Array.from(
                                        { length: totalPages },
                                        (_, i) => i + 1,
                                    ).map((page) => (
                                        <button
                                            key={page}
                                            onClick={() =>
                                                handlePageChange(page)
                                            }
                                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                                page === currentPage
                                                    ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                                                    : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                                            }`}
                                        >
                                            {page}
                                        </button>
                                    ))}
                                    <button
                                        onClick={() =>
                                            handlePageChange(currentPage + 1)
                                        }
                                        disabled={!hasNext}
                                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <span className="sr-only">
                                            Trang sau
                                        </span>
                                        <ChevronRight
                                            className="h-5 w-5"
                                            aria-hidden="true"
                                        />
                                    </button>
                                </nav>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Add University Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">
                                Thêm trường đại học mới
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
                                    Tên trường đại học *
                                </label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    value={formData.universityName}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            universityName: e.target.value,
                                        })
                                    }
                                    placeholder="Nhập tên trường đại học"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Email trường đại học *
                                </label>
                                <input
                                    type="email"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    value={formData.universityEmail}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            universityEmail: e.target.value,
                                        })
                                    }
                                    placeholder="example@university.edu.vn"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Logo trường đại học
                                </label>
                                <div className="space-y-3">
                                    {/* Current Image Preview */}
                                    {formData.universityLogo && (
                                        <div className="relative inline-block">
                                            <img
                                                src={formData.universityLogo}
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
                                                                Click để tải
                                                                logo
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
                        </div>

                        <div className="flex justify-end space-x-3 mt-6">
                            <button
                                onClick={closeModals}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleCreateUniversity}
                                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
                            >
                                <Save className="w-4 h-4" />
                                Tạo trường đại học
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit University Modal */}
            {showEditModal && selectedUniversity && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">
                                Chỉnh sửa trường đại học
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
                                    Tên trường đại học *
                                </label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    value={formData.universityName}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            universityName: e.target.value,
                                        })
                                    }
                                    placeholder="Nhập tên trường đại học"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Email trường đại học *
                                </label>
                                <input
                                    type="email"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    value={formData.universityEmail}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            universityEmail: e.target.value,
                                        })
                                    }
                                    placeholder="example@university.edu.vn"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Logo trường đại học
                                </label>
                                <div className="space-y-3">
                                    {/* Current Image Preview */}
                                    {formData.universityLogo && (
                                        <div className="relative inline-block">
                                            <img
                                                src={formData.universityLogo}
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
                                                                Click để tải
                                                                logo
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
                        </div>

                        <div className="flex justify-end space-x-3 mt-6">
                            <button
                                onClick={closeModals}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleUpdateUniversity}
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

export default ManageUniversity;
