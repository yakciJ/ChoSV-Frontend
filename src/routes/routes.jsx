import { createBrowserRouter } from "react-router-dom";
import UserLayout from "../pages/user/UserLayout.jsx";
import Home from "../pages/user/Home.jsx";
import Login from "../pages/auth/Login.jsx";
import Register from "../pages/auth/Register.jsx";
import AuthLayout from "../pages/auth/AuthLayout.jsx";

export const router = createBrowserRouter([
    {
        path: "/",
        element: <UserLayout />,
        children: [{ index: true, element: <Home /> }],
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
