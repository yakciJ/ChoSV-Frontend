import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { useState } from "react";
import { forgotPassword } from "../../services/authService";

export default function ForgotPassword() {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        mode: "onSubmit",
    });

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const onSubmit = async (data) => {
        setLoading(true);
        setMessage("");
        setError("");

        try {
            const response = await forgotPassword(data.email);
            setMessage(
                response.message ||
                    "Nếu email tồn tại, link đặt lại mật khẩu đã được gửi!",
            );
        } catch (err) {
            console.log("Forgot Password Error:", err);
            setError(
                err.response?.data?.message ||
                    "Có lỗi xảy ra. Vui lòng thử lại sau.",
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="text-black flex flex-col items-center justify-center space-y-[5vh]">
            <h1 className="text-5xl font-bold">Quên Mật Khẩu</h1>
            <p className="text-lg text-gray-600 text-center max-w-md">
                Nhập email của bạn và chúng tôi sẽ gửi link để đặt lại mật khẩu.
            </p>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-[5vh]">
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
                        placeholder="example@email.com"
                    />
                    {errors.email && (
                        <p className="text-red-500 text-sm">
                            {errors.email.message}
                        </p>
                    )}
                </div>

                {message && (
                    <div className="w-[65vw] md:w-[28vw] text-green-600 text-lg text-center bg-green-100 p-3 rounded-md">
                        {message}
                    </div>
                )}

                {error && (
                    <div className="w-[65vw] md:w-[28vw] text-red-500 text-lg text-center bg-red-100 p-3 rounded-md">
                        {error}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className={`text-2xl text-white px-4 py-2 rounded-md block mx-auto transition-colors ${
                        loading
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-blue-500 hover:bg-blue-600"
                    }`}
                >
                    {loading ? "Đang gửi..." : "Gửi Link Đặt Lại"}
                </button>
            </form>
            <div className="text-lg flex flex-row gap-1">
                <Link to="/login" className="text-blue-500 hover:underline">
                    ← Quay lại đăng nhập
                </Link>
            </div>
        </div>
    );
}
