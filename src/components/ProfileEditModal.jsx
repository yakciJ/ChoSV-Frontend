import { useState } from "react";
import { X, Upload, Camera } from "lucide-react";
import { updateUser, updateUserAvatar } from "../services/userService";

const ProfileEditModal = ({ isOpen, onClose, profile, onProfileUpdate }) => {
    const [formData, setFormData] = useState({
        fullName: profile?.fullName || "",
        bio: profile?.bio || "",
        address: profile?.address || "",
        phoneNumber: profile?.phoneNumber || "",
    });
    const [avatarUrl, setAvatarUrl] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

    if (!isOpen) return null;

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsUploadingAvatar(true);
        try {
            // TODO: Implement image upload service when available
            // For now, create a placeholder URL
            const placeholderUrl = `https://via.placeholder.com/150?text=${encodeURIComponent(
                file.name
            )}`;
            setAvatarUrl(placeholderUrl);
            alert(
                "Tính năng upload ảnh sẽ được triển khai sau. URL placeholder đã được tạo."
            );
        } catch (error) {
            console.error("Error uploading image:", error);
            alert("Có lỗi xảy ra khi upload ảnh.");
        } finally {
            setIsUploadingAvatar(false);
        }
    };

    const handleAvatarUpdate = async () => {
        if (!avatarUrl.trim()) return;

        setIsUploadingAvatar(true);
        try {
            await updateUserAvatar(avatarUrl);
            alert("Cập nhật avatar thành công!");
            setAvatarUrl("");
            onProfileUpdate?.();
        } catch (error) {
            console.error("Error updating avatar:", error);
            alert("Có lỗi xảy ra khi cập nhật avatar.");
        } finally {
            setIsUploadingAvatar(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            await updateUser(formData);
            alert("Cập nhật thông tin thành công!");
            onProfileUpdate?.();
            onClose();
        } catch (error) {
            console.error("Error updating profile:", error);
            alert("Có lỗi xảy ra khi cập nhật thông tin.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        if (isSubmitting || isUploadingAvatar) return;
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b">
                    <h2 className="text-xl font-bold text-gray-800">
                        Chỉnh sửa hồ sơ
                    </h2>
                    <button
                        onClick={handleClose}
                        disabled={isSubmitting || isUploadingAvatar}
                        className="p-2 hover:bg-gray-100 rounded-full disabled:opacity-50"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Avatar Section */}
                <div className="p-6 border-b">
                    <h3 className="font-semibold text-gray-800 mb-4">
                        Ảnh đại diện
                    </h3>
                    <div className="flex items-center gap-4">
                        <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                            {profile?.avatarImage ? (
                                <img
                                    src={profile.avatarImage}
                                    alt="Avatar"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <Camera size={24} className="text-gray-400" />
                            )}
                        </div>
                        <div className="flex-1">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="hidden"
                                id="avatar-upload"
                                disabled={isUploadingAvatar}
                            />
                            <label
                                htmlFor="avatar-upload"
                                className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 cursor-pointer disabled:opacity-50"
                            >
                                <Upload size={16} />
                                {isUploadingAvatar ? "Đang tải..." : "Chọn ảnh"}
                            </label>
                            <p className="text-sm text-gray-500 mt-2">
                                Chức năng upload ảnh đang được phát triển
                            </p>
                        </div>
                    </div>

                    {/* Avatar URL Input */}
                    <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            URL Avatar (tạm thời)
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="url"
                                value={avatarUrl}
                                onChange={(e) => setAvatarUrl(e.target.value)}
                                placeholder="https://example.com/avatar.jpg"
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                disabled={isUploadingAvatar}
                            />
                            <button
                                onClick={handleAvatarUpdate}
                                disabled={
                                    isUploadingAvatar || !avatarUrl.trim()
                                }
                                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isUploadingAvatar
                                    ? "Đang cập nhật..."
                                    : "Cập nhật"}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Họ và tên
                            </label>
                            <input
                                type="text"
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Nhập họ và tên"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Số điện thoại
                            </label>
                            <input
                                type="tel"
                                name="phoneNumber"
                                value={formData.phoneNumber}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Nhập số điện thoại"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Địa chỉ
                            </label>
                            <input
                                type="text"
                                name="address"
                                value={formData.address}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Nhập địa chỉ"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Giới thiệu
                            </label>
                            <textarea
                                name="bio"
                                value={formData.bio}
                                onChange={handleInputChange}
                                rows={4}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                placeholder="Viết vài dòng giới thiệu về bản thân..."
                            />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t">
                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={isSubmitting || isUploadingAvatar}
                            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting || isUploadingAvatar}
                            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? "Đang lưu..." : "Lưu thay đổi"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProfileEditModal;
