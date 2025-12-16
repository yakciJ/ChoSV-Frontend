import { Outlet } from "react-router-dom";
import { Link } from "react-router-dom";
import {
    CircleX,
    Search,
    Heart,
    MessageCircleMore,
    Bell,
    ChevronDown,
    TextAlignJustify,
    User,
    ChevronRight,
    History,
    LogOut,
    FilePlus,
    Plus,
    Store,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { initializeAuth } from "../../store/userSlice";
import { useNavigate } from "react-router-dom";
import { useRef } from "react";

export default function UserLayout() {
    const [query, setQuery] = useState("");
    const dispatch = useDispatch();
    const { info: user, isAuthenticated } = useSelector((state) => state.user);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        window.__store = { dispatch };
        return () => {
            delete window.__store;
        };
    }, [dispatch]);

    useEffect(() => {
        dispatch(initializeAuth());
    }, [dispatch]);

    const navigate = useNavigate();

    const handleLogin = () => {
        navigate("/login");
    };

    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    const handleLogout = () => {
        localStorage.clear();
        dispatch({ type: "RESET_STORE" });
        dispatch({ type: "user/logout" });
        setIsDropdownOpen(false);
        navigate("/");
    };

    useEffect(() => {
        const handleStorageChange = (e) => {
            if (e.key === "access_token" && !e.newValue) {
                dispatch({ type: "RESET_STORE" });
                dispatch({ type: "user/logout" });
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
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <div className=" w-full bg-blue-100 flex flex-col text-blue-500">
            <header className="sticky mb-8 top-0 left-0 right-0 bg-white flex-row flex p-3 items-center justify-between z-50">
                <TextAlignJustify
                    className="ml-[1vw] flex-shrink-0 text-black"
                    size={22}
                />
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
                <div className="relative w-full max-w-2xl font-sans ml-4 flex-1">
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Tìm kiếm sản phẩm..."
                        className="w-full pl-10 pr-4 py-2 text-base bg-gray-100 rounded-full border text-black  border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 "
                    />
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    {query && (
                        <CircleX
                            onClick={() => setQuery("")}
                            className="absolute right-3  top-1/2 -translate-y-1/2"
                        />
                    )}
                    <Search
                        className="text-white absolute right-2 top-1/2 -translate-y-1/2 bg-blue-500 hover:bg-blue-600  p-2 rounded-full transition"
                        size={30}
                    />
                </div>
                <div className="flex items-center gap-4 ml-2 md:ml-0">
                    <div className="hidden md:flex flex-col md:flex-row md:items-center md:gap-4 lg:gap-6">
                        <Link to="/favorites">
                            <Heart
                                className="text-gray-600 hover:text-red-500 cursor-pointer"
                                size={24}
                            />
                        </Link>
                        <MessageCircleMore
                            className="text-gray-600 hover:text-blue-500 cursor-pointer"
                            size={24}
                        />
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
                                    to="/"
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
