import { useState, useEffect } from "react";
import {
    X,
    Upload,
    Camera,
    GraduationCap,
    Lock,
    Eye,
    EyeOff,
} from "lucide-react";
import {
    updateUser,
    updateUserAvatar,
    changePassword,
} from "../services/userService";
import { uploadImage } from "../services/imageService";
import { getAllUniversities } from "../services/universityService";
import { useDialog } from "../hooks/useDialog";

const ProfileEditModal = ({ isOpen, onClose, profile, onProfileUpdate }) => {
    const [formData, setFormData] = useState({
        fullName: profile?.fullName || "",
        bio: profile?.bio || "",
        address: profile?.address || "",
        phoneNumber: profile?.phoneNumber || "",
        universityId: profile?.universityId || null,
    });
    const [universities, setUniversities] = useState([]);
    const [universitiesLoading, setUniversitiesLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

    // Change password states
    const [showChangePassword, setShowChangePassword] = useState(false);
    const [passwordData, setPasswordData] = useState({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
    });
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const { showSuccess, showError } = useDialog();

    useEffect(() => {
        if (isOpen) {
            fetchUniversities();
            // Reset form data when modal opens
            setFormData({
                fullName: profile?.fullName || "",
                bio: profile?.bio || "",
                address: profile?.address || "",
                phoneNumber: profile?.phoneNumber || "",
                universityId: profile?.universityId || null,
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, profile]);

    const fetchUniversities = async () => {
        setUniversitiesLoading(true);
        try {
            const response = await getAllUniversities(1, 100); // Get all universities
            setUniversities(response.items || []);
        } catch (error) {
            console.error("Error fetching universities:", error);
            showError("Không thể tải danh sách trường đại học.");
        } finally {
            setUniversitiesLoading(false);
        }
    };

    if (!isOpen) return null;

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]:
                name === "universityId"
                    ? value
                        ? parseInt(value)
                        : null
                    : value,
        }));
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsUploadingAvatar(true);
        try {
            // Upload image to server
            const uploadResponse = await uploadImage(file);
            const imageUrl =
                uploadResponse.url || uploadResponse.imageUrl || uploadResponse;

            if (!imageUrl) {
                throw new Error("Không nhận được URL ảnh từ server");
            }

            // Automatically update user avatar
            await updateUserAvatar(imageUrl);

            showSuccess("Cập nhật avatar thành công!");
            onProfileUpdate?.();
        } catch (error) {
            console.error("Error uploading image:", error);
            showError(
                "Có lỗi xảy ra khi upload ảnh: " +
                    (error.message || "Lỗi không xác định"),
            );
        } finally {
            setIsUploadingAvatar(false);
            // Reset file input
            e.target.value = "";
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            await updateUser(formData);
            showSuccess("Cập nhật thông tin thành công!");
            onProfileUpdate?.();
            onClose();
        } catch (error) {
            console.error("Error updating profile:", error);
            showError("Có lỗi xảy ra khi cập nhật thông tin.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        if (isSubmitting || isUploadingAvatar || isChangingPassword) return;
        setShowChangePassword(false);
        setPasswordData({
            oldPassword: "",
            newPassword: "",
            confirmPassword: "",
        });
        onClose();
    };

    const handlePasswordInputChange = (e) => {
        const { name, value } = e.target;
        setPasswordData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            showError("Mật khẩu xác nhận không khớp!");
            return;
        }

        if (passwordData.newPassword.length < 6) {
            showError("Mật khẩu mới phải có ít nhất 6 ký tự!");
            return;
        }

        setIsChangingPassword(true);
        try {
            await changePassword(
                passwordData.oldPassword,
                passwordData.newPassword,
                passwordData.confirmPassword,
            );
            showSuccess("Đổi mật khẩu thành công!");
            setShowChangePassword(false);
            setPasswordData({
                oldPassword: "",
                newPassword: "",
                confirmPassword: "",
            });
        } catch (error) {
            console.error("Error changing password:", error);
            showError(
                error.response?.data?.message ||
                    error.message ||
                    "Có lỗi xảy ra khi đổi mật khẩu.",
            );
        } finally {
            setIsChangingPassword(false);
        }
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
                                className={`inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 cursor-pointer transition-colors ${
                                    isUploadingAvatar
                                        ? "opacity-50 cursor-not-allowed"
                                        : "hover:bg-gray-50"
                                }`}
                            >
                                <Upload size={16} />
                                {isUploadingAvatar
                                    ? "Đang upload..."
                                    : "Chọn ảnh mới"}
                            </label>
                            <p className="text-sm text-gray-500 mt-2">
                                {isUploadingAvatar
                                    ? "Đang tải ảnh lên và cập nhật avatar..."
                                    : "Chọn ảnh để tự động cập nhật avatar"}
                            </p>
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
                                disabled={isSubmitting || isUploadingAvatar}
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
                                disabled={isSubmitting || isUploadingAvatar}
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
                                disabled={isSubmitting || isUploadingAvatar}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Trường đại học
                            </label>
                            <div className="relative">
                                <GraduationCap className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <select
                                    name="universityId"
                                    value={formData.universityId || ""}
                                    onChange={handleInputChange}
                                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
                                    disabled={
                                        isSubmitting ||
                                        isUploadingAvatar ||
                                        universitiesLoading
                                    }
                                >
                                    <option value="">
                                        Chọn trường đại học
                                    </option>
                                    {universities.map((university) => (
                                        <option
                                            key={university.universityId}
                                            value={university.universityId}
                                        >
                                            {university.universityName}
                                        </option>
                                    ))}
                                </select>
                                {universitiesLoading && (
                                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                                    </div>
                                )}
                            </div>
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
                                disabled={isSubmitting || isUploadingAvatar}
                            />
                        </div>

                        {/* Change Password Section */}
                        <div className="pt-4 border-t">
                            <button
                                type="button"
                                onClick={() =>
                                    setShowChangePassword(!showChangePassword)
                                }
                                disabled={
                                    isSubmitting ||
                                    isUploadingAvatar ||
                                    isChangingPassword
                                }
                                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50"
                            >
                                <Lock size={18} />
                                {showChangePassword
                                    ? "Ẩn đổi mật khẩu"
                                    : "Đổi mật khẩu"}
                            </button>

                            {showChangePassword && (
                                <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Mật khẩu hiện tại
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={
                                                    showOldPassword
                                                        ? "text"
                                                        : "password"
                                                }
                                                name="oldPassword"
                                                value={passwordData.oldPassword}
                                                onChange={
                                                    handlePasswordInputChange
                                                }
                                                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="Nhập mật khẩu hiện tại"
                                                disabled={isChangingPassword}
                                            />
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setShowOldPassword(
                                                        !showOldPassword,
                                                    )
                                                }
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                            >
                                                {showOldPassword ? (
                                                    <EyeOff size={18} />
                                                ) : (
                                                    <Eye size={18} />
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Mật khẩu mới
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={
                                                    showNewPassword
                                                        ? "text"
                                                        : "password"
                                                }
                                                name="newPassword"
                                                value={passwordData.newPassword}
                                                onChange={
                                                    handlePasswordInputChange
                                                }
                                                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="Nhập mật khẩu mới (ít nhất 6 ký tự)"
                                                disabled={isChangingPassword}
                                            />
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setShowNewPassword(
                                                        !showNewPassword,
                                                    )
                                                }
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                            >
                                                {showNewPassword ? (
                                                    <EyeOff size={18} />
                                                ) : (
                                                    <Eye size={18} />
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Xác nhận mật khẩu mới
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={
                                                    showConfirmPassword
                                                        ? "text"
                                                        : "password"
                                                }
                                                name="confirmPassword"
                                                value={
                                                    passwordData.confirmPassword
                                                }
                                                onChange={
                                                    handlePasswordInputChange
                                                }
                                                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="Nhập lại mật khẩu mới"
                                                disabled={isChangingPassword}
                                            />
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setShowConfirmPassword(
                                                        !showConfirmPassword,
                                                    )
                                                }
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                            >
                                                {showConfirmPassword ? (
                                                    <EyeOff size={18} />
                                                ) : (
                                                    <Eye size={18} />
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={handleChangePassword}
                                        disabled={
                                            isChangingPassword ||
                                            !passwordData.oldPassword ||
                                            !passwordData.newPassword ||
                                            !passwordData.confirmPassword
                                        }
                                        className="w-full px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        {isChangingPassword
                                            ? "Đang đổi mật khẩu..."
                                            : "Xác nhận đổi mật khẩu"}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t">
                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={isSubmitting || isUploadingAvatar}
                            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
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
