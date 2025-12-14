import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { loginUser, fetchCurrentUser, clearError } from "../../store/userSlice";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

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
                    <input
                        type="password"
                        {...register("password", {
                            required: "Vui lòng nhập mật khẩu",
                        })}
                        className={`w-[65vw] rounded-sm text-2xl md:w-[28vw] border-2 border-black bg-white p-2 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-400 ${
                            errors.password
                                ? "border-red-500 focus:ring-red-300"
                                : "focus:ring-blue-300"
                        }`}
                    />
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
