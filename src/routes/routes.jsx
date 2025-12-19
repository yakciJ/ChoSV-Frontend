import { createBrowserRouter } from "react-router-dom";
import UserLayout from "../pages/user/UserLayout.jsx";
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

export const router = createBrowserRouter([
    {
        path: "/",
        element: <UserLayout />,
        children: [
            { index: true, element: <Home /> },
            { path: "product/:productId", element: <Product /> },
            { path: "favorites", element: <Favorite /> },
            { path: "product-management", element: <ManageProducts /> },
            { path: "post-product", element: <PostProduct /> },
            { path: "edit-product/:productId", element: <EditProduct /> },
            { path: "chat", element: <Chat /> },
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
