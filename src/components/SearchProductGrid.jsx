import ProductCard from "./ProductCard";

export default function SearchProductGrid({ products, loading }) {
    if (loading) {
        return (
            <div className="bg-white rounded-xl p-4 w-full">
                <div className="flex justify-center items-center min-h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl p-4 w-full">
            {products.length === 0 ? (
                <div className="flex justify-center items-center min-h-64">
                    <p className="text-gray-500 text-lg">
                        Không có sản phẩm nào
                    </p>
                </div>
            ) : (
                <div className="grid gap-4 2xl:grid-cols-4 xl:grid-cols-3 lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-2 grid-cols-1">
                    {products.map((product) => (
                        <ProductCard
                            key={product.productId || product.id}
                            {...product}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
