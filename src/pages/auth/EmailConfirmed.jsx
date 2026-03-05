import { Link, useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { confirmEmail } from "../../services/authService";

export default function EmailConfirmed() {
    const [searchParams] = useSearchParams();
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        const verifyEmail = async () => {
            const tokenParam = searchParams.get("token");
            const emailParam = searchParams.get("email");

            if (!tokenParam || !emailParam) {
                setError("Link xác nhận email không hợp lệ.");
                setLoading(false);
                return;
            }

            try {
                // Decode the URL-encoded parameters
                const decodedToken = decodeURIComponent(tokenParam);
                const decodedEmail = decodeURIComponent(emailParam);

                const response = await confirmEmail(decodedEmail, decodedToken);
                setMessage(
                    response.message ||
                        "Email của bạn đã được xác nhận thành công!",
                );
            } catch (err) {
                setError(
                    err.response?.data?.message ||
                        "Có lỗi xảy ra. Link có thể đã hết hạn hoặc không hợp lệ.",
                );
            } finally {
                setLoading(false);
            }
        };

        verifyEmail();
    }, [searchParams]);

    return (
        <div className="text-black flex flex-col items-center justify-center space-y-[5vh]">
            <h1 className="text-5xl font-bold">Xác Nhận Email</h1>

            {loading ? (
                <div className="flex flex-col items-center space-y-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                    <p className="text-lg text-gray-600">
                        Đang xác nhận email của bạn...
                    </p>
                </div>
            ) : message ? (
                <div className="text-center space-y-6">
                    <div className="w-[65vw] md:w-[28vw] text-green-600 text-lg bg-green-100 p-4 rounded-md">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="w-12 h-12 mx-auto mb-3"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                            />
                        </svg>
                        {message}
                    </div>
                    <Link
                        to="/login"
                        className="inline-block text-2xl text-white px-6 py-3 rounded-md bg-blue-500 hover:bg-blue-600 transition-colors"
                    >
                        Đăng nhập ngay
                    </Link>
                </div>
            ) : (
                <div className="text-center space-y-6">
                    <div className="w-[65vw] md:w-[28vw] text-red-500 text-lg bg-red-100 p-4 rounded-md">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="w-12 h-12 mx-auto mb-3"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                            />
                        </svg>
                        {error}
                    </div>
                    <div className="flex flex-col gap-3">
                        <Link
                            to="/login"
                            className="text-blue-500 hover:underline text-lg"
                        >
                            Quay lại đăng nhập
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}
