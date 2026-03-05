import { useForm } from "react-hook-form";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { resetPassword } from "../../services/authService";

export default function ResetPassword() {
    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm({
        mode: "onSubmit",
    });

    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [token, setToken] = useState("");
    const [email, setEmail] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    useEffect(() => {
        // Get token and email from URL query params (already URL encoded)
        const tokenParam = searchParams.get("token");
        const emailParam = searchParams.get("email");

        if (!tokenParam || !emailParam) {
            setError(
                "Link đặt lại mật khẩu không hợp lệ. Vui lòng yêu cầu link mới.",
            );
        } else {
            // Decode the URL-encoded parameters
            setToken(decodeURIComponent(tokenParam));
            setEmail(decodeURIComponent(emailParam));
        }
    }, [searchParams]);

    const password = watch("password");

    const onSubmit = async (data) => {
        if (!token || !email) {
            setError("Link đặt lại mật khẩu không hợp lệ.");
            return;
        }

        setLoading(true);
        setMessage("");
        setError("");

        try {
            const response = await resetPassword(
                email,
                token,
                data.password,
                data.confirmPassword,
            );
            setMessage(response.message || "Đặt lại mật khẩu thành công!");

            // Redirect to login after 3 seconds
            setTimeout(() => {
                navigate("/login");
            }, 3000);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                    "Có lỗi xảy ra. Link có thể đã hết hạn. Vui lòng yêu cầu link mới.",
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="text-black flex flex-col items-center justify-center space-y-[5vh]">
            <h1 className="text-5xl font-bold">Đặt Lại Mật Khẩu</h1>

            {email && (
                <p className="text-lg text-gray-600 text-center">
                    Đặt lại mật khẩu cho:{" "}
                    <span className="font-semibold">{email}</span>
                </p>
            )}

            {!token || !email ? (
                <div className="text-center space-y-4">
                    <div className="w-[65vw] md:w-[28vw] text-red-500 text-lg bg-red-100 p-3 rounded-md">
                        {error || "Link đặt lại mật khẩu không hợp lệ."}
                    </div>
                    <Link
                        to="/forgot-password"
                        className="text-blue-500 hover:underline text-lg"
                    >
                        Yêu cầu link mới
                    </Link>
                </div>
            ) : (
                <>
                    <form
                        onSubmit={handleSubmit(onSubmit)}
                        className="space-y-[5vh]"
                    >
                        <div>
                            <h3 className="text-left text-2xl pb-2">
                                Mật khẩu mới:
                            </h3>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    {...register("password", {
                                        required: "Vui lòng nhập mật khẩu mới",
                                        minLength: {
                                            value: 6,
                                            message:
                                                "Mật khẩu phải có ít nhất 6 ký tự",
                                        },
                                    })}
                                    className={`w-[65vw] md:w-[28vw] text-2xl rounded-sm border-2 border-black bg-white p-2 pr-12 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-400 ${
                                        errors.password
                                            ? "border-red-500 focus:ring-red-300"
                                            : "focus:ring-blue-300"
                                    }`}
                                />
                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowPassword(!showPassword)
                                    }
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
                        </div>

                        <div>
                            <h3 className="text-left text-2xl pb-2">
                                Xác nhận mật khẩu:
                            </h3>
                            <div className="relative">
                                <input
                                    type={
                                        showConfirmPassword
                                            ? "text"
                                            : "password"
                                    }
                                    {...register("confirmPassword", {
                                        required: "Vui lòng xác nhận mật khẩu",
                                        validate: (value) =>
                                            value === password ||
                                            "Mật khẩu xác nhận không khớp",
                                    })}
                                    className={`w-[65vw] md:w-[28vw] text-2xl rounded-sm border-2 border-black bg-white p-2 pr-12 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-400 ${
                                        errors.confirmPassword
                                            ? "border-red-500 focus:ring-red-300"
                                            : "focus:ring-blue-300"
                                    }`}
                                />
                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowConfirmPassword(
                                            !showConfirmPassword,
                                        )
                                    }
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                >
                                    {showConfirmPassword ? (
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
                            {errors.confirmPassword && (
                                <p className="text-red-500 text-sm">
                                    {errors.confirmPassword.message}
                                </p>
                            )}
                        </div>

                        {message && (
                            <div className="w-[65vw] md:w-[28vw] text-green-600 text-lg text-center bg-green-100 p-3 rounded-md">
                                {message}
                                <p className="text-sm mt-2">
                                    Đang chuyển hướng đến trang đăng nhập...
                                </p>
                            </div>
                        )}

                        {error && (
                            <div className="w-[65vw] md:w-[28vw] text-red-500 text-lg text-center bg-red-100 p-3 rounded-md">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading || message}
                            className={`text-2xl text-white px-4 py-2 rounded-md block mx-auto transition-colors ${
                                loading || message
                                    ? "bg-gray-400 cursor-not-allowed"
                                    : "bg-blue-500 hover:bg-blue-600"
                            }`}
                        >
                            {loading ? "Đang xử lý..." : "Đặt Lại Mật Khẩu"}
                        </button>
                    </form>
                    <div className="text-lg flex flex-row gap-1">
                        <Link
                            to="/login"
                            className="text-blue-500 hover:underline"
                        >
                            ← Quay lại đăng nhập
                        </Link>
                    </div>
                </>
            )}
        </div>
    );
}
