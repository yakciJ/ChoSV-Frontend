import { useParams } from "react-router-dom";
import ProductForm from "../../components/ProductForm";

export default function EditProduct() {
    const { productId } = useParams();

    return (
        <div className="container mx-auto px-4">
            <div className="bg-white rounded-lg shadow-md p-6">
                <h1 className="text-2xl font-bold text-gray-800 mb-6">
                    Chỉnh sửa tin
                </h1>
                <ProductForm mode="edit" productId={productId} />
            </div>
        </div>
    );
}
