import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { Calendar, Mail, MapPin, Phone, User } from "lucide-react";

import ProductCarousel from "../../components/ProductCarousel";

const formatDateTime = (iso) => {
    if (!iso) return "";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleString("vi-VN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
    });
};

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

const MOCK_PROFILE = {
    userId: "7ab31d6e-069b-47ab-8508-f8c80b54357c",
    userName: "trung",
    fullName: "NTr",
    email: "trungdzlhp@gmail.com",
    phoneNumber: "0355514203",
    avatarImage: null,
    bio: " ",
    address: "18 Cầu Đơ, Hà Đông, Hà Nội",
    createdAt: "2025-12-11T11:06:57.540894Z",
};

const MOCK_WALL_RESPONSE = {
    items: [
        {
            userWallPostId: 1,
            userWallOwnerId: "12c6daa1-cee5-4575-8213-639a49ef4233",
            posterId: "12c6daa1-cee5-4575-8213-639a49ef4233",
            posterAvatarImage:
                "https://localhost:7049/images/4779e573-9465-41ee-90de-f680ea17a7cd.jpg",
            posterUserName: "admin",
            posterFullName: "Đỗ Đăng Huy",
            commentContent: "Alo testing testing",
            createdAt: "2025-12-04T16:29:01.219348Z",
        },
        {
            userWallPostId: 2,
            userWallOwnerId: "12c6daa1-cee5-4575-8213-639a49ef4233",
            posterId: "7ab31d6e-069b-47ab-8508-f8c80b54357c",
            posterAvatarImage: null,
            posterUserName: "trung",
            posterFullName: "NTr",
            commentContent: "Mình là chủ profile, comment thử.",
            createdAt: "2025-12-05T09:10:11.219348Z",
        },
    ],
    totalCount: 2,
    page: 1,
    pageSize: 10,
    totalPages: 1,
    hasPrevious: false,
    hasNext: false,
};

// Minimal mock products for ProductCard (adjust fields if your ProductCard needs more)
const MOCK_PRODUCTS = [
    {
        productId: 101,
        productName: "Tai nghe Bluetooth",
        price: 150000,
        imageUrls: ["https://picsum.photos/seed/p101/600/400"],
    },
    {
        productId: 102,
        productName: "Sách lập trình",
        price: 90000,
        imageUrls: ["https://picsum.photos/seed/p102/600/400"],
    },
    {
        productId: 103,
        productName: "Bàn phím cơ",
        price: 450000,
        imageUrls: ["https://picsum.photos/seed/p103/600/400"],
    },
    {
        productId: 104,
        productName: "Chuột gaming",
        price: 220000,
        imageUrls: ["https://picsum.photos/seed/p104/600/400"],
    },
    {
        productId: 105,
        productName: "Màn hình 24 inch",
        price: 2100000,
        imageUrls: ["https://picsum.photos/seed/p105/600/400"],
    },
];

export default function UserProfile() {
    const { userId } = useParams();

    // if you don't have auth wired, this still works with mock
    const { info: currentUser, isAuthenticated } = useSelector(
        (state) => state.user
    );
    const currentUserId = currentUser?.userId;

    const [profile, setProfile] = useState(null);
    const [profileLoading, setProfileLoading] = useState(true);

    const [products, setProducts] = useState([]);
    const [productsLoading, setProductsLoading] = useState(false);

    const [posts, setPosts] = useState([]);
    const [postsLoading, setPostsLoading] = useState(false);

    const [page, setPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const pageSize = 10;
    const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

    const [newContent, setNewContent] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const [editingId, setEditingId] = useState(null);
    const [editingValue, setEditingValue] = useState("");
    const [savingEdit, setSavingEdit] = useState(false);

    // Steam-ish: keep list newest-first, and auto scroll to new posts
    const listTopRef = useRef(null);

    const isOwnerProfile = Boolean(
        currentUserId && userId && currentUserId === userId
    );

    const name = displayName(profile);

    // MOCK load
    useEffect(() => {
        setProfileLoading(true);
        setProductsLoading(true);
        setPostsLoading(true);

        const t = setTimeout(() => {
            // profile
            setProfile({
                ...MOCK_PROFILE,
                userId: userId || MOCK_PROFILE.userId,
            });
            setProfileLoading(false);

            // products
            setProducts(MOCK_PRODUCTS);
            setProductsLoading(false);

            // posts
            setPosts(MOCK_WALL_RESPONSE.items);
            setTotalCount(MOCK_WALL_RESPONSE.totalCount);
            setPostsLoading(false);
        }, 250);

        return () => clearTimeout(t);
    }, [userId]);

    const canEditOrDelete = (post) => {
        // own comment only
        if (!currentUserId) return false;
        return post?.posterId === currentUserId;
    };

    const handleSubmitNew = async () => {
        if (!isAuthenticated) return;
        const content = newContent.trim();
        if (!content || submitting) return;

        setSubmitting(true);
        try {
            // mock create
            const nowIso = new Date().toISOString();
            const newPost = {
                userWallPostId: Date.now(),
                userWallOwnerId: profile?.userId,
                posterId: currentUserId,
                posterAvatarImage: currentUser?.avatarImage ?? null,
                posterUserName: currentUser?.userName ?? "me",
                posterFullName: currentUser?.fullName ?? "",
                commentContent: content,
                createdAt: nowIso,
            };

            // add to top
            setPosts((prev) => [newPost, ...prev]);
            setTotalCount((c) => c + 1);
            setNewContent("");
            setPage(1);

            requestAnimationFrame(() => {
                listTopRef.current?.scrollIntoView({ behavior: "smooth" });
            });
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

    const saveEdit = async (postId) => {
        const content = editingValue.trim();
        if (!content || savingEdit) return;

        setSavingEdit(true);
        try {
            // mock update
            setPosts((prev) =>
                prev.map((p) =>
                    p.userWallPostId === postId
                        ? { ...p, commentContent: content }
                        : p
                )
            );
            setEditingId(null);
            setEditingValue("");
        } finally {
            setSavingEdit(false);
        }
    };

    const removePost = async (postId) => {
        const ok = window.confirm("Xóa bình luận này?");
        if (!ok) return;

        // mock delete
        setPosts((prev) => prev.filter((p) => p.userWallPostId !== postId));
        setTotalCount((c) => Math.max(0, c - 1));
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) setPage(newPage);
    };

    // Mock pagination: slice current "posts" list
    const pagedPosts = useMemo(() => {
        const start = (page - 1) * pageSize;
        return posts.slice(start, start + pageSize);
    }, [posts, page, pageSize]);

    if (profileLoading) {
        return (
            <div className="min-h-screen flex flex-col w-11/12 sm:w-10/12 items-start">
                <div className="bg-white rounded-md flex-1 p-8 w-full">
                    <p className="text-gray-500">Đang tải...</p>
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
                <div className="rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 sm:p-8">
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

                                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                    <div className="flex items-center gap-2 text-white/90">
                                        <Phone size={16} />
                                        <span className="truncate">
                                            {profile?.phoneNumber || "—"}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-white/90">
                                        <Mail size={16} />
                                        <span className="truncate">
                                            {profile?.email || "—"}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-white/90">
                                        <MapPin size={16} />
                                        <span className="truncate">
                                            {profile?.address || "—"}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-white/90">
                                        <Calendar size={16} />
                                        <span>
                                            Tham gia:{" "}
                                            {formatDateTime(profile?.createdAt)}
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
                    <ProductCarousel title="Sản phẩm" products={products} />
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
                        ) : pagedPosts.length > 0 ? (
                            <div className="space-y-3">
                                {pagedPosts.map((post) => {
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
                                                                {formatDateTime(
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
                                                                                    post.userWallPostId
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
                                                                                    post.userWallPostId
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
            </div>
        </div>
    );
}
