import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import {
    Calendar,
    Mail,
    MapPin,
    Phone,
    MoreVertical,
    Flag,
    Edit,
} from "lucide-react";
import { formatDateLocal } from "../../helpers/formatDate";
import { useDialog } from "../../hooks/useDialog";

import ProductCarousel from "../../components/ProductCarousel";
import ProfileEditModal from "../../components/ProfileEditModal";
import { getUser } from "../../services/userService";
import { getUserProducts } from "../../services/productService";
import {
    createUserWallPost,
    deleteUserWallPost,
    getUserWallPosts,
    updateUserWallPost,
} from "../../services/userWallPostService";

const displayName = (profile) =>
    (profile?.fullName && profile.fullName.trim()) ||
    profile?.userName ||
    "Người dùng";

const EmptyAvatar = ({ name }) => {
    const initials = useMemo(() => {
        if (!name) return "U";
        const parts = name.trim().split(/\s+/);
        return parts
            .slice(0, 2)
            .map((p) => (p?.[0] ? p[0].toUpperCase() : ""))
            .join("");
    }, [name]);

    return (
        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold text-3xl border-4 border-white shadow">
            {initials || "U"}
        </div>
    );
};

export default function UserProfile() {
    // route: /profile/:userName
    const { userName } = useParams();

    const { info: currentUser, isAuthenticated } = useSelector(
        (state) => state.user
    );
    const currentUserId = currentUser?.userId;
    
    const { confirm, showError } = useDialog();

    const [profile, setProfile] = useState(null);
    const [profileLoading, setProfileLoading] = useState(true);
    const [profileError, setProfileError] = useState(null);

    const [products, setProducts] = useState([]);
    const [productsLoading, setProductsLoading] = useState(false);

    const [posts, setPosts] = useState([]);
    const [postsLoading, setPostsLoading] = useState(false);
    const [postsError, setPostsError] = useState(null);

    const [page, setPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const pageSize = 10;
    const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

    const [newContent, setNewContent] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const [editingId, setEditingId] = useState(null);
    const [editingValue, setEditingValue] = useState("");
    const [savingEdit, setSavingEdit] = useState(false);

    // Dropdown and modal states
    const [showDropdown, setShowDropdown] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);

    const listTopRef = useRef(null);
    const dropdownRef = useRef(null);

    // Once we have profile, we can compute ownership correctly
    const isOwnerProfile = Boolean(
        currentUserId && profile?.userId && currentUserId === profile.userId
    );

    const name = displayName(profile);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target)
            ) {
                setShowDropdown(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const fetchProfile = async () => {
        if (!userName) return;
        setProfileLoading(true);
        setProfileError(null);
        try {
            // axiosInstance returns response.data already
            const res = await getUser(userName);
            setProfile(res);
        } catch (e) {
            console.error(e);
            setProfileError("Không thể tải hồ sơ người dùng.");
            setProfile(null);
        } finally {
            setProfileLoading(false);
        }
    };

    const fetchProducts = async () => {
        if (!userName) return;
        setProductsLoading(true);
        try {
            // axiosInstance returns response.data already
            const res = await getUserProducts(userName, 1, 12);

            // tolerate either {items: []} or [] response
            const items = Array.isArray(res) ? res : res?.items || [];
            setProducts(items);
        } catch (e) {
            console.error(e);
            setProducts([]);
        } finally {
            setProductsLoading(false);
        }
    };

    const fetchWallPosts = async () => {
        if (!userName) return;
        setPostsLoading(true);
        setPostsError(null);
        try {
            // axiosInstance returns response.data already
            const res = await getUserWallPosts(userName, page, pageSize);
            setPosts(res?.items || []);
            setTotalCount(res?.totalCount || 0);
        } catch (e) {
            console.error(e);
            setPostsError("Không thể tải bình luận.");
            setPosts([]);
            setTotalCount(0);
        } finally {
            setPostsLoading(false);
        }
    };

    const handleProfileUpdate = () => {
        fetchProfile();
        setShowEditModal(false);
        setShowDropdown(false);
    };

    const handleReport = () => {
        setShowDropdown(false);
        showError("Tính năng báo cáo sẽ được triển khai sau.");
    };

    const handleEditProfile = () => {
        setShowDropdown(false);
        setShowEditModal(true);
    };

    useEffect(() => {
        setPage(1);
        fetchProfile();
        fetchProducts();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userName]);

    useEffect(() => {
        fetchWallPosts();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userName, page]);

    const canEditOrDelete = (post) => {
        if (!currentUserId) return false;
        return post?.posterId === currentUserId;
    };

    const handleSubmitNew = async () => {
        if (!isAuthenticated) return;
        const content = newContent.trim();
        if (!content || submitting) return;
        if (!profile?.userId) return;

        setSubmitting(true);
        try {
            await createUserWallPost({
                userWallOwnerId: profile.userId,
                commentContent: content,
            });

            setNewContent("");
            setPage(1);
            await fetchWallPosts();

            requestAnimationFrame(() => {
                listTopRef.current?.scrollIntoView({ behavior: "smooth" });
            });
        } catch (e) {
            console.error(e);
            showError("Không thể đăng bình luận.");
        } finally {
            setSubmitting(false);
        }
    };

    const startEdit = (post) => {
        setEditingId(post.userWallPostId);
        setEditingValue(post.commentContent || "");
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditingValue("");
    };

    const saveEdit = async (post) => {
        const content = editingValue.trim();
        if (!content || savingEdit) return;

        setSavingEdit(true);
        try {
            await updateUserWallPost({
                userWallPostId: post.userWallPostId,
                commentContent: content,
            });

            setEditingId(null);
            setEditingValue("");
            await fetchWallPosts();
        } catch (e) {
            console.error(e);
            showError("Không thể cập nhật bình luận.");
        } finally {
            setSavingEdit(false);
        }
    };

    const removePost = async (post) => {
        try {
            await confirm("Xóa bình luận này?", {
                title: "Xóa bình luận",
                confirmText: "Xóa",
                type: "warning"
            });

            await deleteUserWallPost(post.userWallPostId);

            // if deleting last item, keep page valid
            const nextCount = Math.max(0, totalCount - 1);
            const nextTotalPages = Math.max(1, Math.ceil(nextCount / pageSize));
            if (page > nextTotalPages) {
                setPage(nextTotalPages);
            } else {
                await fetchWallPosts();
            }
        } catch (error) {
            if (error !== false) { // false means user cancelled, don't show error
                console.error(error);
                showError("Không thể xóa bình luận.");
            }
        }
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) setPage(newPage);
    };

    if (profileLoading) {
        return (
            <div className="min-h-screen flex flex-col w-11/12 sm:w-10/12 items-start">
                <div className="bg-white rounded-md flex-1 p-8 w-full">
                    <p className="text-gray-500">Đang tải...</p>
                </div>
            </div>
        );
    }

    if (profileError) {
        return (
            <div className="min-h-screen flex flex-col w-11/12 sm:w-10/12 items-start">
                <div className="bg-white rounded-md flex-1 p-8 w-full">
                    <p className="text-red-500">{profileError}</p>
                    <Link className="text-blue-500 hover:underline" to="/">
                        Về trang chủ
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col w-11/12 sm:w-10/12 items-start">
            <div className="bg-white rounded-md flex-1 p-6 sm:p-8 w-full">
                {/* breadcrumbs */}
                <div className="flex gap-2 text-gray-500 text-sm mb-4">
                    <Link className="text-blue-500 hover:underline" to="/">
                        Trang chủ
                    </Link>
                    <span>&gt;</span>
                    <span className="truncate">Hồ sơ</span>
                </div>

                {/* Steam-ish Header */}
                <div className="rounded-xl border border-gray-100 shadow-sm overflow-hidden relative">
                    {/* Three-dot menu */}
                    <div
                        className="absolute top-4 right-4 z-10"
                        ref={dropdownRef}
                    >
                        <button
                            onClick={() => setShowDropdown(!showDropdown)}
                            className="p-2 rounded-full bg-white/80 hover:bg-white/90 shadow-md transition-colors"
                        >
                            <MoreVertical size={20} className="text-gray-600" />
                        </button>

                        {showDropdown && (
                            <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border py-1 z-20">
                                {isOwnerProfile ? (
                                    <button
                                        onClick={handleEditProfile}
                                        className="flex items-center gap-3 w-full px-4 py-2 text-left hover:bg-gray-50 text-gray-700"
                                    >
                                        <Edit size={16} />
                                        Chỉnh sửa hồ sơ
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleReport}
                                        className="flex items-center gap-3 w-full px-4 py-2 text-left hover:bg-gray-50 text-red-600"
                                    >
                                        <Flag size={16} />
                                        Báo cáo người dùng
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 sm:p-8">
                        {/* centered on mobile, normal row on sm+ */}
                        <div className="flex flex-col items-center text-center sm:text-left sm:flex-row sm:items-center gap-5">
                            <div className="shrink-0">
                                {profile?.avatarImage ? (
                                    <img
                                        src={profile.avatarImage}
                                        alt={name}
                                        className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-4 border-white shadow"
                                    />
                                ) : (
                                    <EmptyAvatar name={name} />
                                )}
                            </div>

                            <div className="text-white flex-1 min-w-0">
                                <div className="flex flex-col gap-1">
                                    <h1 className="text-2xl sm:text-3xl font-bold truncate">
                                        {name}
                                    </h1>
                                    {profile?.fullName?.trim() ? (
                                        <p className="text-white/80 text-sm truncate">
                                            @{profile.userName}
                                        </p>
                                    ) : null}
                                </div>

                                {/* Balanced 2-column on md+, 1 column on mobile */}
                                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                    <div className="flex justify-center sm:justify-start items-center gap-2 text-white/90">
                                        <Phone size={16} />
                                        <span className="truncate">
                                            {profile?.phoneNumber || "—"}
                                        </span>
                                    </div>

                                    <div className="flex justify-center sm:justify-start items-center gap-2 text-white/90">
                                        <Mail size={16} />
                                        <span className="truncate">
                                            {profile?.email || "—"}
                                        </span>
                                    </div>

                                    <div className="flex justify-center sm:justify-start items-center gap-2 text-white/90">
                                        <MapPin size={16} />
                                        <span className="truncate">
                                            {profile?.address || "—"}
                                        </span>
                                    </div>

                                    <div className="flex justify-center sm:justify-start items-center gap-2 text-white/90">
                                        <Calendar size={16} />
                                        <span>
                                            Tham gia:{" "}
                                            {formatDateLocal(
                                                profile?.createdAt
                                            )}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bio */}
                    <div className="p-6 sm:p-8">
                        <h2 className="text-lg font-semibold text-gray-800 mb-2">
                            Giới thiệu
                        </h2>
                        <p className="text-gray-600 whitespace-pre-wrap">
                            {profile?.bio?.trim()
                                ? profile.bio
                                : "Chưa có giới thiệu."}
                        </p>
                    </div>
                </div>

                {/* Products */}
                <div className="mt-8">
                    <ProductCarousel
                        title="Sản phẩm"
                        products={products}
                        viewAllLink={`/user-products/${userName}`}
                    />
                    {productsLoading ? (
                        <p className="text-gray-500 mt-2">Đang tải...</p>
                    ) : null}
                </div>

                {/* Wall / Comments */}
                <div className="mt-10">
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-xl font-bold text-blue-500">
                            Bình luận
                        </h2>
                        {totalCount > 0 ? (
                            <span className="text-sm text-gray-500">
                                {totalCount} bình luận
                            </span>
                        ) : null}
                    </div>

                    {/* Create new */}
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                        {isAuthenticated ? (
                            <>
                                <textarea
                                    value={newContent}
                                    onChange={(e) =>
                                        setNewContent(e.target.value)
                                    }
                                    rows={3}
                                    placeholder="Viết bình luận lên tường..."
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                />
                                <div className="flex items-center justify-end mt-3 gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setNewContent("")}
                                        className="px-4 py-2 rounded-md border hover:bg-white"
                                        disabled={submitting}
                                    >
                                        Xóa
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleSubmitNew}
                                        disabled={
                                            submitting || !newContent.trim()
                                        }
                                        className="px-4 py-2 rounded-md bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {submitting ? "Đang đăng..." : "Đăng"}
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="text-gray-600 flex items-center justify-between flex-col sm:flex-row gap-3">
                                <span>Bạn cần đăng nhập để bình luận.</span>
                                <Link
                                    to="/login"
                                    className="text-blue-500 hover:underline"
                                >
                                    Đăng nhập
                                </Link>
                            </div>
                        )}
                    </div>

                    <div ref={listTopRef} />

                    {/* List */}
                    <div className="mt-4">
                        {postsLoading ? (
                            <div className="py-8 text-center text-gray-500">
                                Đang tải...
                            </div>
                        ) : postsError ? (
                            <div className="py-8 text-center text-red-500">
                                {postsError}
                            </div>
                        ) : posts.length > 0 ? (
                            <div className="space-y-3">
                                {posts.map((post) => {
                                    const canManage = canEditOrDelete(post);
                                    const posterName =
                                        (post.posterFullName &&
                                            post.posterFullName.trim()) ||
                                        post.posterUserName ||
                                        "Người dùng";

                                    return (
                                        <div
                                            key={post.userWallPostId}
                                            className="border border-gray-200 rounded-xl p-4 bg-white"
                                        >
                                            <div className="flex items-start gap-3">
                                                {post.posterAvatarImage ? (
                                                    <img
                                                        src={
                                                            post.posterAvatarImage
                                                        }
                                                        alt={posterName}
                                                        className="w-10 h-10 rounded-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-semibold">
                                                        {posterName
                                                            .slice(0, 1)
                                                            .toUpperCase()}
                                                    </div>
                                                )}

                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between gap-3">
                                                        <div className="min-w-0">
                                                            <p className="font-semibold text-gray-900 truncate">
                                                                {posterName}
                                                            </p>
                                                            <p className="text-xs text-gray-500">
                                                                {formatDateLocal(
                                                                    post.createdAt
                                                                )}
                                                            </p>
                                                        </div>

                                                        {canManage ? (
                                                            <div className="flex items-center gap-2 shrink-0">
                                                                {editingId ===
                                                                post.userWallPostId ? (
                                                                    <>
                                                                        <button
                                                                            onClick={
                                                                                cancelEdit
                                                                            }
                                                                            className="text-sm px-3 py-1 rounded-md border hover:bg-gray-50"
                                                                            disabled={
                                                                                savingEdit
                                                                            }
                                                                        >
                                                                            Hủy
                                                                        </button>
                                                                        <button
                                                                            onClick={() =>
                                                                                saveEdit(
                                                                                    post
                                                                                )
                                                                            }
                                                                            className="text-sm px-3 py-1 rounded-md bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50"
                                                                            disabled={
                                                                                savingEdit ||
                                                                                !editingValue.trim()
                                                                            }
                                                                        >
                                                                            {savingEdit
                                                                                ? "Đang lưu..."
                                                                                : "Lưu"}
                                                                        </button>
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <button
                                                                            onClick={() =>
                                                                                startEdit(
                                                                                    post
                                                                                )
                                                                            }
                                                                            className="text-sm px-3 py-1 rounded-md border hover:bg-gray-50"
                                                                        >
                                                                            Sửa
                                                                        </button>
                                                                        <button
                                                                            onClick={() =>
                                                                                removePost(
                                                                                    post
                                                                                )
                                                                            }
                                                                            className="text-sm px-3 py-1 rounded-md border border-red-200 text-red-600 hover:bg-red-50"
                                                                        >
                                                                            Xóa
                                                                        </button>
                                                                    </>
                                                                )}
                                                            </div>
                                                        ) : null}
                                                    </div>

                                                    <div className="mt-3 text-gray-700 whitespace-pre-wrap">
                                                        {editingId ===
                                                        post.userWallPostId ? (
                                                            <textarea
                                                                value={
                                                                    editingValue
                                                                }
                                                                onChange={(e) =>
                                                                    setEditingValue(
                                                                        e.target
                                                                            .value
                                                                    )
                                                                }
                                                                rows={3}
                                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                                            />
                                                        ) : (
                                                            post.commentContent
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="py-8 text-center text-gray-500">
                                Chưa có bình luận nào.
                            </div>
                        )}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex justify-center items-center gap-2 mt-6">
                            <button
                                onClick={() => handlePageChange(page - 1)}
                                disabled={page === 1}
                                className="px-3 py-2 rounded-md border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                            >
                                Trước
                            </button>

                            {[...Array(totalPages)].map((_, index) => {
                                const pageNum = index + 1;
                                return (
                                    <button
                                        key={pageNum}
                                        onClick={() =>
                                            handlePageChange(pageNum)
                                        }
                                        className={`px-3 py-2 rounded-md border ${
                                            page === pageNum
                                                ? "bg-blue-500 text-white"
                                                : "hover:bg-gray-50"
                                        }`}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            })}

                            <button
                                onClick={() => handlePageChange(page + 1)}
                                disabled={page === totalPages}
                                className="px-3 py-2 rounded-md border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                            >
                                Sau
                            </button>
                        </div>
                    )}
                </div>

                {/* Profile Edit Modal */}
                <ProfileEditModal
                    isOpen={showEditModal}
                    onClose={() => setShowEditModal(false)}
                    profile={profile}
                    onProfileUpdate={handleProfileUpdate}
                />
            </div>
        </div>
    );
}
