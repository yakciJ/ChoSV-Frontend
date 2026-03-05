import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { loginUser, fetchCurrentUser, clearError } from "../../store/userSlice";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function Login() {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        mode: "onSubmit", // Only validate on submit
    });

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { loading, error } = useSelector((state) => state.user);
    const [showPassword, setShowPassword] = useState(false);

    // Clear error when component mounts
    useEffect(() => {
        dispatch(clearError());
    }, [dispatch]);

    const onSubmit = async (data) => {
        try {
            const loginData = {
                username: data.username,
                password: data.password,
                deviceInfo: navigator.userAgent,
                rememberMe: data.rememberMe || false,
            };
            const resultAction = await dispatch(loginUser(loginData));

            if (loginUser.fulfilled.match(resultAction)) {
                await dispatch(fetchCurrentUser());
                navigate("/");
            }
        } catch (err) {
            console.error("Unexpected error:", err);
        }
    };

    return (
        <div className="text-black flex flex-col items-center justify-center space-y-[5vh]">
            <h1 className="text-5xl font-bold">Đăng Nhập</h1>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-[5vh]">
                <div>
                    <h3 className="text-left text-2xl pb-2">Tên đăng nhập:</h3>
                    <input
                        type="text"
                        {...register("username", {
                            required: "Vui lòng nhập tên đăng nhập",
                        })}
                        className={`w-[65vw] md:w-[28vw] text-2xl rounded-sm border-2 border-black bg-white p-2 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-400 ${
                            errors.username
                                ? "border-red-500 focus:ring-red-300"
                                : "focus:ring-blue-300"
                        }`}
                    />
                    {errors.username && (
                        <p className="text-red-500 text-sm">
                            {errors.username.message}
                        </p>
                    )}
                </div>
                <div>
                    <h3 className="text-left text-2xl pb-2">Mật khẩu:</h3>
                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            {...register("password", {
                                required: "Vui lòng nhập mật khẩu",
                            })}
                            className={`w-[65vw] rounded-sm text-2xl md:w-[28vw] border-2 border-black bg-white p-2 pr-12 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-400 ${
                                errors.password
                                    ? "border-red-500 focus:ring-red-300"
                                    : "focus:ring-blue-300"
                            }`}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                            {showPassword ? (
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={1.5}
                                    stroke="currentColor"
                                    className="w-6 h-6"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88"
                                    />
                                </svg>
                            ) : (
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={1.5}
                                    stroke="currentColor"
                                    className="w-6 h-6"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
                                    />
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                                    />
                                </svg>
                            )}
                        </button>
                    </div>
                    {errors.password && (
                        <p className="text-red-500 text-sm">
                            {errors.password.message}
                        </p>
                    )}
                    {error && (
                        <div className="w-[65vw] md:w-[28vw] mt-3 -mb-3 text-red-500 text-lg text-center">
                            {error}
                        </div>
                    )}
                </div>
                <div className="flex items-center space-x-2">
                    <input
                        type="checkbox"
                        id="rememberMe"
                        {...register("rememberMe")}
                        className="w-4 h-4"
                    />
                    <label htmlFor="rememberMe" className="text-lg">
                        Ghi nhớ đăng nhập
                    </label>
                </div>
                <div className="text-right">
                    <Link
                        to="/forgot-password"
                        className="text-blue-500 hover:underline text-lg"
                    >
                        Quên mật khẩu?
                    </Link>
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    className={`text-2xl text-white px-4 py-2 rounded-md block mx-auto transition-colors ${
                        loading
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-blue-500 hover:bg-blue-600"
                    }`}
                >
                    {loading ? "Đang đăng nhập..." : "Đăng Nhập"}
                </button>
            </form>
            <div className="text-lg flex flex-row gap-1">
                <p>Bạn chưa có tài khoản?</p>
                <Link to="/register" className="text-blue-500 hover:underline">
                    Đăng ký ngay!
                </Link>
            </div>
        </div>
    );
}
