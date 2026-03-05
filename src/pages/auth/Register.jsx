import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { register as registerAPI } from "../../services/authService";

export default function Register() {
    const {
        register,
        handleSubmit,
        formState: { errors },
        watch,
    } = useForm({
        mode: "onSubmit", // Only validate on submit
    });

    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Watch password for confirmation validation
    const password = watch("password");

    const onSubmit = async (data) => {
        setLoading(true);
        setError(null);

        try {
            const registerData = {
                userName: data.username,
                password: data.password,
                email: data.email,
            };

            const response = await registerAPI(registerData);

            if (response && response.message) {
                setSuccess(true);
                // Redirect to login after 2 seconds
                setTimeout(() => {
                    navigate("/login");
                }, 2000);
            }
        } catch (err) {
            console.error("Registration error:", err);
            if (err.response?.data?.error) {
                setError(err.response.data.error);
            } else if (err.response?.data?.message) {
                setError(err.response.data.message);
            } else if (err.message) {
                setError(err.message);
            } else {
                setError("Đã xảy ra lỗi không xác định");
            }
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="text-black flex flex-col items-center justify-center space-y-[5vh]">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-blue-600 mb-2">
                        Đăng ký thành công!
                    </h1>
                    <p className="text-lg text-gray-600">
                        Tài khoản của bạn đã được tạo thành công.
                    </p>
                    <p className="text-lg text-gray-600">
                        Đang chuyển hướng đến trang đăng nhập...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="text-black flex flex-col items-center justify-center space-y-[3vh]">
            <h1 className="text-5xl font-bold">Đăng Ký</h1>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-[1vh]">
                <div>
                    <h3 className="text-left text-2xl pb-2">Tên đăng nhập:</h3>
                    <input
                        type="text"
                        {...register("username", {
                            required: "Vui lòng nhập tên đăng nhập",
                            minLength: {
                                value: 3,
                                message:
                                    "Tên đăng nhập phải có ít nhất 3 ký tự",
                            },
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
                    <h3 className="text-left text-2xl pb-2">Email:</h3>
                    <input
                        type="email"
                        {...register("email", {
                            required: "Vui lòng nhập email",
                            pattern: {
                                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                message: "Email không hợp lệ",
                            },
                        })}
                        className={`w-[65vw] md:w-[28vw] text-2xl rounded-sm border-2 border-black bg-white p-2 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-400 ${
                            errors.email
                                ? "border-red-500 focus:ring-red-300"
                                : "focus:ring-blue-300"
                        }`}
                    />
                    {errors.email && (
                        <p className="text-red-500 text-sm">
                            {errors.email.message}
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
                                minLength: {
                                    value: 6,
                                    message: "Mật khẩu phải có ít nhất 6 ký tự",
                                },
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
                </div>

                <div>
                    <h3 className="text-left text-2xl pb-2">
                        Xác nhận mật khẩu:
                    </h3>
                    <div className="relative">
                        <input
                            type={showConfirmPassword ? "text" : "password"}
                            {...register("confirmPassword", {
                                required: "Vui lòng xác nhận mật khẩu",
                                validate: (value) =>
                                    value === password ||
                                    "Mật khẩu xác nhận không khớp",
                            })}
                            className={`w-[65vw] rounded-sm text-2xl md:w-[28vw] border-2 border-black bg-white p-2 pr-12 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-400 ${
                                errors.confirmPassword
                                    ? "border-red-500 focus:ring-red-300"
                                    : "focus:ring-blue-300"
                            }`}
                        />
                        <button
                            type="button"
                            onClick={() =>
                                setShowConfirmPassword(!showConfirmPassword)
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
                    {error && (
                        <div className="w-[65vw] md:w-[28vw] mt-3 -mb-3 text-red-500 text-lg text-center">
                            {error}
                        </div>
                    )}
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
                    {loading ? "Đang đăng ký..." : "Đăng Ký"}
                </button>
            </form>
            <div className="text-lg flex flex-row gap-1">
                <p>Bạn đã có tài khoản?</p>
                <Link to="/login" className="text-blue-500 hover:underline">
                    Đăng nhập ngay!
                </Link>
            </div>
        </div>
    );
}
