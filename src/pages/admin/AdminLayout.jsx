import React from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import {
    Home,
    Users,
    Package,
    ShoppingCart,
    BarChart3,
    Settings,
    Shield,
    FileText,
    MessageSquare,
    AlertTriangle,
} from "lucide-react";

const AdminLayout = () => {
    const location = useLocation();

    const sidebarItems = [
        { path: "/admin", label: "Tổng quan", icon: Home },
        { path: "/admin/users", label: "Quản lý người dùng", icon: Users },
        { path: "/admin/products", label: "Quản lý sản phẩm", icon: Package },
        {
            path: "/admin/categories",
            label: "Quản lý danh mục",
            icon: FileText,
        },
        {
            path: "/admin/reviews",
            label: "Quản lý đánh giá",
            icon: MessageSquare,
        },
        {
            path: "/admin/reports",
            label: "Quản lý báo cáo",
            icon: AlertTriangle,
        },
    ];

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar */}
            <aside className="w-64 bg-white shadow-lg flex flex-col">
                <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center space-x-3">
                        <img
                            src="/Logo.png"
                            alt="Logo"
                            className="h-10 w-10 rounded-full flex-shrink-0"
                        />
                        <div>
                            <h1 className="text-xl font-bold text-gray-800">
                                Admin Panel
                            </h1>
                            <p className="text-sm text-gray-500">
                                Chợ Sinh Viên
                            </p>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 p-4">
                    <ul className="space-y-2">
                        {sidebarItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = location.pathname === item.path;

                            return (
                                <li key={item.path}>
                                    <Link
                                        to={item.path}
                                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                                            isActive
                                                ? "bg-blue-500 text-white hover:text-white"
                                                : "text-gray-700 hover:bg-gray-100 hover:text-blue-500"
                                        }`}
                                    >
                                        <Icon className="w-5 h-5" />
                                        <span className="font-medium">
                                            {item.label}
                                        </span>
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                <div className="p-4 border-t border-gray-200">
                    <Link
                        to="/"
                        className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 hover:text-blue-500 rounded-lg transition-colors"
                    >
                        <Home className="w-5 h-5" />
                        <span className="font-medium">Về trang chủ</span>
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-hidden">
                <div className="flex-1 overflow-y-auto p-6">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
