import ProductCard from "./ProductCard";

export default function ProductGrid({ products, loading, title, compact = false }) {
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
            {title && (
                <h2 className="text-2xl font-bold text-left pb-4 text-blue-500">
                    {title}
                </h2>
            )}
            {products.length === 0 ? (
                <div className="flex justify-center items-center min-h-64">
                    <p className="text-gray-500 text-lg">
                        Không có sản phẩm nào
                    </p>
                </div>
            ) : (
                <div className={`grid justify-center gap-4 ${
                    compact 
                        ? "2xl:grid-cols-5 xl:grid-cols-4 lg:grid-cols-3 md:grid-cols-3 sm:grid-cols-2 grid-cols-2" 
                        : "xl:grid-cols-6 md:grid-cols-3 grid-cols-2"
                }`}>
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
