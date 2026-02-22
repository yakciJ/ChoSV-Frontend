import { Outlet } from "react-router-dom";
import { Link } from "react-router-dom";
import {
    CircleX,
    Search,
    Heart,
    MessageCircleMore,
    Bell,
    ChevronDown,
    Menu,
    User,
    ChevronRight,
    History,
    LogOut,
    Plus,
    Store,
    X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { initializeAuth, logoutUser } from "../../store/userSlice";
import { fetchAllCategories } from "../../store/categorySlice";
import { useNavigate } from "react-router-dom";
import { useRef } from "react";
import { useNotifications } from "../../hooks/useNotifications";
import NotificationDropdown from "../../components/NotificationDropdown";

export default function UserLayout() {
    const [query, setQuery] = useState("");
    const dispatch = useDispatch();
    const { info: user, isAuthenticated } = useSelector((state) => state.user);
    const { data: categories } = useSelector((state) => state.categories);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [expandedCategories, setExpandedCategories] = useState({});
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const dropdownRef = useRef(null);
    const sidebarRef = useRef(null);
    const notificationRef = useRef(null);

    // Use notifications hook
    const { unreadCount, handleMarkAllAsRead } = useNotifications();

    const navigate = useNavigate();

    useEffect(() => {
        window.__store = { dispatch };
        return () => {
            delete window.__store;
        };
    }, [dispatch]);

    useEffect(() => {
        dispatch(initializeAuth());
        if (categories.length === 0) {
            dispatch(fetchAllCategories());
        }
    }, [dispatch, categories.length]);

    const handleLogin = () => {
        navigate("/login");
    };

    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const closeSidebar = () => {
        setIsSidebarOpen(false);
    };

    const toggleCategoryExpand = (categoryId) => {
        setExpandedCategories((prev) => ({
            ...prev,
            [categoryId]: !prev[categoryId],
        }));
    };

    const toggleNotification = () => {
        if (!isNotificationOpen) {
            // When opening the dropdown, immediately reset the unread count
            handleMarkAllAsRead();
        }
        setIsNotificationOpen(!isNotificationOpen);
    };

    const closeNotification = () => {
        setIsNotificationOpen(false);
    };

    const handleLogout = async () => {
        localStorage.clear();
        dispatch({ type: "RESET_STORE" });
        await dispatch(logoutUser());
        setIsDropdownOpen(false);
        setIsNotificationOpen(false);
        navigate("/");
    };

    useEffect(() => {
        const handleStorageChange = (e) => {
            if (e.key === "access_token" && !e.newValue) {
                dispatch({ type: "RESET_STORE" });
                dispatch(logoutUser());
            }
        };

        window.addEventListener("storage", handleStorageChange);
        return () => {
            window.removeEventListener("storage", handleStorageChange);
        };
    }, [dispatch]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target)
            ) {
                setIsDropdownOpen(false);
            }
            if (
                sidebarRef.current &&
                !sidebarRef.current.contains(event.target) &&
                !event.target.closest("[data-sidebar-toggle]")
            ) {
                setIsSidebarOpen(false);
            }
            if (
                notificationRef.current &&
                !notificationRef.current.contains(event.target) &&
                !event.target.closest("[data-notification-toggle]")
            ) {
                setIsNotificationOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        if (query.trim()) {
            navigate(`/search?search=${encodeURIComponent(query.trim())}`);
        }
    };

    const handleSearchKeyPress = (e) => {
        if (e.key === "Enter") {
            handleSearch(e);
        }
    };

    // Render category tree recursively
    const renderCategoryTree = (categoryList, level = 0) => {
        return categoryList.map((category) => {
            const hasChildren = category.childs && category.childs.length > 0;
            const isExpanded = expandedCategories[category.categoryId];

            return (
                <div key={category.categoryId}>
                    <div
                        className={`flex items-center justify-between py-2 px-3 hover:bg-blue-50 cursor-pointer ${
                            level > 0 ? "pl-" + (level * 4 + 3) : ""
                        }`}
                        style={{
                            paddingLeft:
                                level > 0 ? `${level * 16 + 12}px` : undefined,
                        }}
                    >
                        <Link
                            to={`/categories/${category.categoryId}`}
                            className="flex items-center gap-2 flex-1 text-gray-700 hover:text-blue-600"
                            onClick={closeSidebar}
                        >
                            {category.imageUrl && (
                                <img
                                    src={category.imageUrl}
                                    alt={category.name}
                                    className="w-6 h-6 object-contain rounded"
                                />
                            )}
                            <span className="text-sm">{category.name}</span>
                        </Link>
                        {hasChildren && (
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    toggleCategoryExpand(category.categoryId);
                                }}
                                className="p-1 bg-white rounded"
                            >
                                <ChevronRight
                                    size={16}
                                    className={`text-gray-500 bg-white transition-transform ${
                                        isExpanded ? "rotate-90" : ""
                                    }`}
                                />
                            </button>
                        )}
                    </div>
                    {hasChildren && isExpanded && (
                        <div className="border-l border-gray-200 ml-4">
                            {renderCategoryTree(category.childs, level + 1)}
                        </div>
                    )}
                </div>
            );
        });
    };

    return (
        <div className="w-full bg-blue-100 flex flex-col text-blue-500">
            {/* Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-50"
                    onClick={closeSidebar}
                />
            )}

            {/* Sidebar */}
            <div
                ref={sidebarRef}
                className={`fixed top-0 left-0 h-full w-72 bg-white shadow-lg z-50 transform transition-transform duration-300 ease-in-out ${
                    isSidebarOpen ? "translate-x-0" : "-translate-x-full"
                }`}
            >
                {/* Sidebar Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-800">
                        Danh mục
                    </h2>
                    <button
                        onClick={closeSidebar}
                        className="p-1 hover:bg-gray-100 bg-white rounded-full"
                    >
                        <X size={20} className="text-gray-600 bg-white" />
                    </button>
                </div>

                {/* Category List */}
                <div className="overflow-y-auto h-[calc(100%-60px)]">
                    {categories.length > 0 ? (
                        renderCategoryTree(categories)
                    ) : (
                        <div className="p-4 text-center bg-white text-gray-500">
                            Đang tải danh mục...
                        </div>
                    )}
                </div>
            </div>

            <header className="sticky mb-8 top-0 left-0 right-0 bg-white flex-row flex p-3 items-center justify-between z-40">
                <button
                    data-sidebar-toggle
                    onClick={toggleSidebar}
                    className="ml-[1vw] flex-shrink-0 text-black hover:bg-gray-100 bg-white p-1 rounded"
                >
                    <Menu size={22} />
                </button>
                <Link
                    to="/"
                    className="flex items-center space-x-3"
                    onClick={() =>
                        window.scrollTo({ top: 0, left: 0, behavior: "smooth" })
                    }
                >
                    <img
                        src="/Logo.png"
                        alt="Logo"
                        className="h-10 w-10 rounded-full flex-shrink-0"
                    />
                    <span className="font-bold text-xl text-blue-600 pr-3 whitespace-nowrap hidden lg:block">
                        Chợ Sinh Viên
                    </span>
                </Link>
                <form
                    onSubmit={handleSearch}
                    className="relative w-full max-w-2xl font-sans ml-4 flex-1"
                >
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyPress={handleSearchKeyPress}
                        placeholder="Tìm kiếm sản phẩm..."
                        className="w-full pl-10 pr-4 py-2 text-base bg-gray-100 rounded-full border text-black  border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 "
                    />
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    {query && (
                        <CircleX
                            onClick={() => setQuery("")}
                            className="absolute right-3  top-1/2 -translate-y-1/2 cursor-pointer"
                        />
                    )}
                    <button
                        type="submit"
                        className="text-white absolute right-2 top-1/2 -translate-y-1/2 bg-blue-500 hover:bg-blue-600  p-2 rounded-full transition"
                    >
                        <Search size={14} />
                    </button>
                </form>
                <div className="flex items-center gap-4 ml-2 md:ml-0">
                    <div className="hidden md:flex flex-col md:flex-row md:items-center md:gap-4 lg:gap-6">
                        <Link to="/favorites">
                            <Heart
                                className="text-gray-600 hover:text-red-500 cursor-pointer"
                                size={24}
                            />
                        </Link>
                        <Link to="/chat">
                            <MessageCircleMore
                                className="text-gray-600 hover:text-blue-500 cursor-pointer"
                                size={24}
                            />
                        </Link>
                        <div className="relative" ref={notificationRef}>
                            <button
                                data-notification-toggle
                                onClick={toggleNotification}
                                className="relative p-1 rounded-full hover:bg-gray-100 transition-colors"
                            >
                                <Bell
                                    className="text-gray-600 hover:text-yellow-500 cursor-pointer"
                                    size={24}
                                />
                                {unreadCount > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                                        {unreadCount > 99 ? "99+" : unreadCount}
                                    </span>
                                )}
                            </button>
                            <NotificationDropdown
                                isOpen={isNotificationOpen}
                                onClose={closeNotification}
                            />
                        </div>
                        <Link
                            to="/product-management"
                            className="px-4 py-2 bg-gray-100 text-gray-800 rounded-3xl hover:bg-gray-200 transition whitespace-nowrap"
                        >
                            Quản lý tin
                        </Link>
                        <Link
                            to="/post-product"
                            className="px-4 py-2 bg-blue-500 text-white rounded-3xl hover:bg-blue-600 hover:text-white transition whitespace-nowrap"
                        >
                            Đăng tin
                        </Link>
                    </div>
                    <div className="relative" ref={dropdownRef}>
                        {/* Avatar */}
                        {isAuthenticated ? (
                            <button
                                onClick={toggleDropdown}
                                className="flex items-center bg-gray-100 gap-2 pl-0.5 pr-3 py-1 rounded-full hover:bg-gray-100 transition"
                            >
                                {user?.avatarImage ? (
                                    <img
                                        src={user.avatarImage}
                                        alt="User Avatar"
                                        className="w-8 h-8 rounded-full object-cover"
                                    />
                                ) : (
                                    <User className="w-8 h-8 text-gray-500 bg-gray-200 rounded-full p-1" />
                                )}
                                <span className="font-medium text-gray-800 hidden sm:block">
                                    {user.fullName || user.userName}
                                </span>
                                <ChevronDown className="w-4 h-4 text-gray-600" />
                            </button>
                        ) : (
                            <button
                                onClick={handleLogin}
                                className="flex items-center bg-gray-800 gap-2 px-3 py-2 rounded-full hover:bg-blue-400 transition"
                            >
                                <span className="text-white">Đăng nhập</span>
                            </button>
                        )}
                        {isDropdownOpen && isAuthenticated && user && (
                            <div className="absolute right-0 mt-4 w-52 bg-white border border-gray-200 rounded-md shadow-lg py-2 z-50">
                                <Link
                                    to={`profile/${user.userName}`}
                                    className="flex items-center justify-between px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                    <div className="flex items-center gap-2">
                                        <User className="mr-1" />
                                        <span className="text-left">Hồ sơ</span>
                                    </div>
                                    <ChevronRight className="flex items-center flex-shrink-0" />
                                </Link>
                                <Link
                                    to="post-product"
                                    className="flex items-center justify-between px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                    <div className="flex items-center gap-2">
                                        <Plus className="mr-1" />
                                        <span>Đăng bài</span>
                                    </div>
                                    <ChevronRight className="flex items-center flex-shrink-0" />
                                </Link>
                                <Link
                                    to="product-management"
                                    className="flex items-center justify-between px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                    <div className="flex items-center gap-2">
                                        <Store className="mr-1" />
                                        <span>Bài đăng của tôi</span>
                                    </div>
                                    <ChevronRight className="flex items-center flex-shrink-0" />
                                </Link>
                                <Link
                                    to="favorites"
                                    className="flex items-center justify-between px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                    <div className="flex items-center gap-2">
                                        <Heart className="mr-1" />
                                        <span>Yêu thích</span>
                                    </div>
                                    <ChevronRight className="flex items-center flex-shrink-0" />
                                </Link>
                                <Link
                                    to="/"
                                    className="flex items-center justify-between px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                    <div className="flex items-center gap-2">
                                        <History className="mr-1" />
                                        <span>Lịch sử</span>
                                    </div>
                                    <ChevronRight className="flex items-center flex-shrink-0" />
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center justify-between w-full px-4 py-2 text-center text-sm bg-white text-gray-700 hover:bg-gray-100 border-none hover:text-red-500"
                                >
                                    <div className="flex items-center gap-2">
                                        <LogOut className="mr-1" />
                                        <span>Đăng xuất</span>
                                    </div>
                                    <ChevronRight className="flex items-center flex-shrink-0" />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </header>
            <main className="flex-1 justify-center items-center flex">
                <Outlet />
            </main>
            <footer className="mt-8 bg-gray-900 text-gray-300">
                {/* Main Footer Content */}
                <div className="max-w-7xl mx-auto px-4 py-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {/* Brand Section */}
                        <div className="space-y-4">
                            <Link to="/" className="flex items-center gap-2">
                                <img
                                    src="/Logo.png"
                                    alt="Chợ Sinh Viên"
                                    className="h-10 w-auto"
                                />
                                <span className="text-xl font-bold text-white">
                                    Chợ Sinh Viên
                                </span>
                            </Link>
                            <p className="text-sm text-gray-400 leading-relaxed">
                                Nền tảng mua bán trực tuyến dành riêng cho sinh
                                viên. Kết nối cộng đồng, tiết kiệm chi phí.
                            </p>
                            <div className="flex gap-4">
                                <a
                                    href="https://www.facebook.com/ctsvdhkt"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors"
                                >
                                    <svg
                                        className="w-5 h-5"
                                        fill="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                    </svg>
                                </a>
                                <a
                                    href="https://instagram.com"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-pink-600 transition-colors"
                                >
                                    <svg
                                        className="w-5 h-5"
                                        fill="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                                    </svg>
                                </a>
                                <a
                                    href="https://youtube.com"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                                >
                                    <svg
                                        className="w-5 h-5"
                                        fill="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                                    </svg>
                                </a>
                                <a
                                    href="https://tiktok.com"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-600 transition-colors"
                                >
                                    <svg
                                        className="w-5 h-5"
                                        fill="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
                                    </svg>
                                </a>
                            </div>
                        </div>

                        {/* Quick Links */}
                        <div>
                            <h3 className="text-white font-semibold text-lg mb-4">
                                Liên kết nhanh
                            </h3>
                            <ul className="space-y-3">
                                <li>
                                    <Link
                                        to="/"
                                        className="text-gray-400 hover:text-white transition-colors text-sm"
                                    >
                                        Trang chủ
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        to="/products"
                                        className="text-gray-400 hover:text-white transition-colors text-sm"
                                    >
                                        Sản phẩm
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        to="/post-product"
                                        className="text-gray-400 hover:text-white transition-colors text-sm"
                                    >
                                        Đăng tin
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        to="/favorites"
                                        className="text-gray-400 hover:text-white transition-colors text-sm"
                                    >
                                        Yêu thích
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        to="/chat"
                                        className="text-gray-400 hover:text-white transition-colors text-sm"
                                    >
                                        Tin nhắn
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        {/* Support */}
                        <div>
                            <h3 className="text-white font-semibold text-lg mb-4">
                                Hỗ trợ
                            </h3>
                            <ul className="space-y-3">
                                <li>
                                    <Link
                                        to="/help"
                                        className="text-gray-400 hover:text-white transition-colors text-sm"
                                    >
                                        Trung tâm trợ giúp
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        to="/safety"
                                        className="text-gray-400 hover:text-white transition-colors text-sm"
                                    >
                                        An toàn mua bán
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        to="/terms"
                                        className="text-gray-400 hover:text-white transition-colors text-sm"
                                    >
                                        Điều khoản sử dụng
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        to="/privacy"
                                        className="text-gray-400 hover:text-white transition-colors text-sm"
                                    >
                                        Chính sách bảo mật
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        to="/faq"
                                        className="text-gray-400 hover:text-white transition-colors text-sm"
                                    >
                                        Câu hỏi thường gặp
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        {/* Contact */}
                        <div>
                            <h3 className="text-white font-semibold text-lg mb-4">
                                Liên hệ
                            </h3>
                            <ul className="space-y-3">
                                <li className="flex items-start gap-3">
                                    <svg
                                        className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                        />
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                        />
                                    </svg>
                                    <a
                                        href="https://hau.edu.vn/"
                                        className="text-gray-400 hover:text-white transition-colors text-sm"
                                    >
                                        Đại học Kiến Trúc Hà Nội
                                    </a>
                                </li>
                                <li className="flex items-center gap-3">
                                    <svg
                                        className="w-5 h-5 text-blue-500 flex-shrink-0"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                        />
                                    </svg>
                                    <a
                                        href="mailto:chosvvn24@gmail.com"
                                        className="text-gray-400 hover:text-white transition-colors text-sm"
                                    >
                                        chosvvn24@gmail.com
                                    </a>
                                </li>
                                <li className="flex items-center gap-3">
                                    <svg
                                        className="w-5 h-5 text-blue-500 flex-shrink-0"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                                        />
                                    </svg>
                                    <a
                                        href="tel:19001234"
                                        className="text-gray-400 hover:text-white transition-colors text-sm"
                                    >
                                        1900 1234
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-gray-800">
                    <div className="max-w-7xl mx-auto px-4 py-6">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                            <p className="text-sm text-gray-500">
                                &copy; {new Date().getFullYear()} Chợ Sinh Viên.
                                Tất cả quyền được bảo lưu.
                            </p>
                            <div className="flex items-center gap-6">
                                <Link
                                    to="/terms"
                                    className="text-sm text-gray-500 hover:text-white transition-colors"
                                >
                                    Điều khoản
                                </Link>
                                <Link
                                    to="/privacy"
                                    className="text-sm text-gray-500 hover:text-white transition-colors"
                                >
                                    Bảo mật
                                </Link>
                                <Link
                                    to="/cookies"
                                    className="text-sm text-gray-500 hover:text-white transition-colors"
                                >
                                    Cookies
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
