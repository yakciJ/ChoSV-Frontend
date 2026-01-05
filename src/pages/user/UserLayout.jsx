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

export default function UserLayout() {
    const [query, setQuery] = useState("");
    const dispatch = useDispatch();
    const { info: user, isAuthenticated } = useSelector((state) => state.user);
    const { data: categories } = useSelector((state) => state.categories);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [expandedCategories, setExpandedCategories] = useState({});
    const dropdownRef = useRef(null);
    const sidebarRef = useRef(null);

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

    const handleLogout = async () => {
        localStorage.clear();
        dispatch({ type: "RESET_STORE" });
        await dispatch(logoutUser());
        setIsDropdownOpen(false);
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
                                    className="w-6 h-6 object-cover rounded"
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
                                className="p-1 hover:bg-gray-200 rounded"
                            >
                                <ChevronRight
                                    size={16}
                                    className={`text-gray-500 transition-transform ${
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
                        className="p-1 hover:bg-gray-100 rounded-full"
                    >
                        <X size={20} className="text-gray-600" />
                    </button>
                </div>

                {/* Category List */}
                <div className="overflow-y-auto h-[calc(100%-60px)]">
                    {categories.length > 0 ? (
                        renderCategoryTree(categories)
                    ) : (
                        <div className="p-4 text-center text-gray-500">
                            Đang tải danh mục...
                        </div>
                    )}
                </div>
            </div>

            <header className="sticky mb-8 top-0 left-0 right-0 bg-white flex-row flex p-3 items-center justify-between z-40">
                <button
                    data-sidebar-toggle
                    onClick={toggleSidebar}
                    className="ml-[1vw] flex-shrink-0 text-black hover:bg-gray-100 p-1 rounded"
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
                        <Bell
                            className="text-gray-600 hover:text-yellow-500 cursor-pointer"
                            size={24}
                        />
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
                        {isDropdownOpen && (
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
            <footer className="mt-8 p-4 bg-gray-800 text-white">
                &copy; 2025 Chợ Sinh Viên. All rights reserved.
            </footer>
        </div>
    );
}
