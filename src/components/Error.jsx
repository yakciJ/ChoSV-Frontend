export default function ErrorDisplay({ type, title, message }) {
    const errorConfig = {
        "not-found": {
            code: "404",
            title: title || "Không tìm thấy!",
            message: message || "Tài nguyên bạn tìm kiếm không tồn tại.",
        },
        "server-error": {
            code: "500",
            title: title || "Lỗi máy chủ!",
            message: message || "Đã xảy ra lỗi máy chủ, vui lòng thử lại sau.",
        },
        forbidden: {
            code: "403",
            title: title || "Không có quyền truy cập!",
            message:
                message || "Bạn không có quyền truy cập vào tài nguyên này.",
        },
        "network-error": {
            code: "ERR",
            title: title || "Lỗi kết nối!",
            message:
                message ||
                "Không thể kết nối đến máy chủ, vui lòng thử lại sau.",
        },
    };

    const config = errorConfig[type] || errorConfig["server-error"];

    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh]">
            <h1 className="text-9xl font-bold text-blue-500 mb-8">
                {config.code}
            </h1>
            <h2 className="text-4xl lg:text-7xl text-blue-500 font-semibold text-center">
                {config.title}
            </h2>
            <p className="text-xl text-gray-600 mt-8 text-center max-w">
                {config.message}
            </p>
        </div>
    );
}
