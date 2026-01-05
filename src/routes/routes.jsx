import { createBrowserRouter } from "react-router-dom";
import UserLayout from "../pages/user/UserLayout.jsx";
import AdminLayout from "../pages/admin/AdminLayout.jsx";
import ManageUser from "../pages/admin/ManageUser.jsx";
import Home from "../pages/user/Home.jsx";
import Login from "../pages/auth/Login.jsx";
import Register from "../pages/auth/Register.jsx";
import AuthLayout from "../pages/auth/AuthLayout.jsx";
import Product from "../pages/user/Product.jsx";
import Favorite from "../pages/user/Favorite.jsx";
import ManageProducts from "../pages/user/ManageProducts.jsx";
import PostProduct from "../pages/user/PostProduct.jsx";
import EditProduct from "../pages/user/EditProduct.jsx";
import Chat from "../pages/user/Chat.jsx";
import UserProfile from "../pages/user/UserProfile.jsx";
import ManageProduct from "../pages/admin/ManageProduct.jsx";
import Category from "../pages/user/Category.jsx";
import ProductListing from "../pages/user/ProductListing.jsx";
import SearchResults from "../pages/user/SearchResults.jsx";

export const router = createBrowserRouter([
    {
        path: "/",
        element: <UserLayout />,
        children: [
            { index: true, element: <Home /> },
            { path: "search", element: <SearchResults /> },
            { path: "product/:productId", element: <Product /> },
            { path: "favorites", element: <Favorite /> },
            { path: "product-management", element: <ManageProducts /> },
            { path: "post-product", element: <PostProduct /> },
            { path: "edit-product/:productId", element: <EditProduct /> },
            { path: "chat", element: <Chat /> },
            { path: "chat/:routeUserName", element: <Chat /> },
            { path: "profile/:userName", element: <UserProfile /> },
            { path: "categories/:categoryId", element: <Category /> },
            { path: "newest", element: <ProductListing type="newest" /> },
            { path: "popular", element: <ProductListing type="popular" /> },
            {
                path: "similar/:productId",
                element: <ProductListing type="similar" />,
            },
            {
                path: "user-products/:userName",
                element: <ProductListing type="user" />,
            },
        ],
    },
    {
        path: "/admin",
        element: <AdminLayout />,
        children: [
            { index: true, element: <div>Admin Dashboard</div> },
            { path: "users", element: <ManageUser /> },
            { path: "products", element: <ManageProduct /> },
            { path: "categories", element: <div>Category Management</div> },
            { path: "reports", element: <div>Reports</div> },
            { path: "orders", element: <div>Order Management</div> },
            { path: "settings", element: <div>Settings</div> },
        ],
    },
    {
        path: "/",
        element: <AuthLayout />,
        children: [
            { path: "login", element: <Login /> },
            { path: "register", element: <Register /> },
        ],
    },
]);
