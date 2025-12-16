import ProductForm from "../../components/ProductForm";

export default function PostProduct() {
    return (
        <div className="container mx-auto px-4">
            <div className="bg-white rounded-lg shadow-md p-6">
                <h1 className="text-2xl font-bold text-gray-800 mb-6">
                    Đăng tin mới
                </h1>
                <ProductForm mode="create" />
            </div>
        </div>
    );
}
