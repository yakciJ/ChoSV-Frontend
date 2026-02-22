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
                    <input
                        type="password"
                        {...register("password", {
                            required: "Vui lòng nhập mật khẩu",
                            minLength: {
                                value: 6,
                                message: "Mật khẩu phải có ít nhất 6 ký tự",
                            },
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
                </div>

                <div>
                    <h3 className="text-left text-2xl pb-2">
                        Xác nhận mật khẩu:
                    </h3>
                    <input
                        type="password"
                        {...register("confirmPassword", {
                            required: "Vui lòng xác nhận mật khẩu",
                            validate: (value) =>
                                value === password ||
                                "Mật khẩu xác nhận không khớp",
                        })}
                        className={`w-[65vw] rounded-sm text-2xl md:w-[28vw] border-2 border-black bg-white p-2 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-400 ${
                            errors.confirmPassword
                                ? "border-red-500 focus:ring-red-300"
                                : "focus:ring-blue-300"
                        }`}
                    />
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
