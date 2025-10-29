import { ArrowLeft } from "lucide-react";
import { Outlet, useNavigate } from "react-router-dom";

export default function AuthLayout() {
    const navigate = useNavigate();
    return (
        <div className="min-h-screen w-full bg-blue-100 flex flex-col md:flex-row overflow-y-auto">
            <div className="w-[50vw] hidden md:flex flex-1 flex-col items-center justify-center md:basis-[50%]">
                <div className="bg-white rounded-full h-52 w-52 flex items-center justify-center shadow-md mb-5">
                    <img src="/Logo.png" alt="Logo" className="h-40 w-40" />
                </div>
                <h1 className="text-3xl font-bold text-blue-600 mb-8">
                    Chợ Sinh Viên
                </h1>
            </div>
            <div className="flex flex-1 items-center justify-center min-h-screen md:min-h-0 md:basis-[50%]">
                <div
                    className="bg-white rounded-2xl min-h-[80vh] shadow-lg p-8 w-[80vw] md:w-[35vw]
        "
                >
                    <button
                        onClick={() => {
                            if (window.history.length > 1) navigate(-1);
                            else navigate("/");
                        }}
                        className="group flex flex-row items-center gap-1 mb-8 cursor-pointer bg-transparent border-none outline-none focus:outline-none focus:ring-0 active:outline-none active:ring-0"
                    >
                        <ArrowLeft className="text-black" />
                        <h2 className="text-base text-black font-bold text-left decoration-2 decoration-offset-4 group-hover:underline group-focus:underline">
                            Quay lại
                        </h2>
                    </button>
                    <Outlet />
                </div>
            </div>
        </div>
    );
}
