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
} from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCurrentUser, initializeAuth } from "../../store/userSlice";
import { useNavigate } from "react-router-dom";

export default function UserLayout() {
    const [query, setQuery] = useState("");
    const dispatch = useDispatch();
    const { info: user, isAuthenticated } = useSelector((state) => state.user);

    useEffect(() => {
        // Initialize auth state from localStorage
        dispatch(initializeAuth());
    }, [dispatch]);

    useEffect(() => {
        if (isAuthenticated && !user) {
            dispatch(fetchCurrentUser());
        }
    }, [dispatch, isAuthenticated, user]);

    const navigate = useNavigate();

    const handleLogin = () => {
        navigate("/login");
    };

    return (
        <div className="min-h-screen w-full bg-blue-100 flex flex-col">
            <header className="fixed top-0 left-0 right-0 bg-white flex-row flex p-3 items-center justify-between z-50">
                <TextAlignJustify
                    className="ml-5 flex-shrink-0 text-black"
                    size={22}
                />
                <Link to="/" className="flex items-center space-x-3 ">
                    <img
                        src="/Logo.png"
                        alt="Logo"
                        className="h-10 w-10 rounded-full flex-shrink-0"
                    />
                    <span className="font-bold text-xl text-blue-600 pr-3 whitespace-nowrap hidden sm:block">
                        Chợ Sinh Viên
                    </span>
                </Link>
                <div className="relative w-full max-w-2xl font-sans ml-4 flex-1">
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Tìm kiếm sản phẩm..."
                        className="w-full pl-10 pr-4 py-2 text-base bg-gray-100 rounded-full border  border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 "
                    />
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    {query && (
                        <CircleX
                            onClick={() => setQuery("")}
                            className="absolute right-3 top-1/2 -translate-y-1/2"
                        />
                    )}
                    <Search
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full transition"
                        size={30}
                    />
                </div>
                <div className="flex items-center gap-4">
                    <Heart
                        className="text-gray-600 hover:text-red-500 cursor-pointer"
                        size={24}
                    />
                    <MessageCircleMore
                        className="text-gray-600 hover:text-blue-500 cursor-pointer"
                        size={24}
                    />
                    <Bell
                        className="text-gray-600 hover:text-yellow-500 cursor-pointer"
                        size={24}
                    />
                    <Link
                        to="/quan-ly-tin"
                        className="px-4 py-2 bg-gray-100 text-gray-800 rounded-3xl hover:bg-gray-200 transition whitespace-nowrap"
                    >
                        Quản lý tin
                    </Link>
                    <Link
                        to="/dang-tin"
                        className="px-4 py-2 bg-blue-500 text-white rounded-3xl hover:bg-blue-600 hover:text-white transition whitespace-nowrap"
                    >
                        Đăng tin
                    </Link>
                    {/* Avatar */}
                    {isAuthenticated ? (
                        <button className="flex items-center bg-gray-100 gap-2 px-3 py-2 rounded-full hover:bg-gray-100 transition">
                            {user?.avatarUrl ? (
                                <img
                                    src={user.avatarUrl}
                                    alt="User Avatar"
                                    className="w-8 h-8 rounded-full object-cover"
                                />
                            ) : (
                                <User className="w-8 h-8 text-gray-500 bg-gray-200 rounded-full p-1" />
                            )}
                            <span className="font-medium text-gray-800 hidden sm:block">
                                {user?.fullName ? user.fullName : user.userName}
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
                </div>
            </header>
            <main className="flex-1">
                <Outlet />
            </main>
            <footer className="mt-8 p-4 bg-gray-800 text-white">
                &copy; 2025 Chợ Sinh Viên. All rights reserved.
            </footer>
        </div>
    );
}
