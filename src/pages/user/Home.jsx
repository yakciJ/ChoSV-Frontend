import ProductCard from "../../components/ProductCard";

export default function Home() {
    const products = [
        {
            id: 1,
            name: "Giày Sneaker",
            price: 350000,
            image: "https://cdn.chotot.com/sP3Z5-5NjFOL1Wt3kiJa1kXWRk_RoJBh7E1WfdALHRo/preset:listing/plain/636b4850ae226740dacad478e4c78734-2957678958690791633.jpg",
            sellerAvatar: "/images/seller2.jpg",
            sellerName: "Trần Thị B",
        },
        {
            id: 2,
            name: "Giày Sneaker",
            price: 350000,
            image: "https://cdn.chotot.com/sP3Z5-5NjFOL1Wt3kiJa1kXWRk_RoJBh7E1WfdALHRo/preset:listing/plain/636b4850ae226740dacad478e4c78734-2957678958690791633.jpg",
            sellerAvatar: "/images/seller2.jpg",
            sellerName: "Trần Thị B",
        },
        {
            id: 3,
            name: "Giày Sneaker",
            price: 350000,
            image: "https://cdn.chotot.com/sP3Z5-5NjFOL1Wt3kiJa1kXWRk_RoJBh7E1WfdALHRo/preset:listing/plain/636b4850ae226740dacad478e4c78734-2957678958690791633.jpg",
            sellerAvatar: "/images/seller2.jpg",
            sellerName: "Trần Thị B",
        },
        {
            id: 4,
            name: "Giày Sneaker",
            price: 350000,
            image: "https://cdn.chotot.com/sP3Z5-5NjFOL1Wt3kiJa1kXWRk_RoJBh7E1WfdALHRo/preset:listing/plain/636b4850ae226740dacad478e4c78734-2957678958690791633.jpg",
            sellerAvatar: "/images/seller2.jpg",
            sellerName: "Trần Thị B",
        },
        {
            id: 5,
            name: "Giày Sneaker",
            price: 350000,
            image: "https://cdn.chotot.com/sP3Z5-5NjFOL1Wt3kiJa1kXWRk_RoJBh7E1WfdALHRo/preset:listing/plain/636b4850ae226740dacad478e4c78734-2957678958690791633.jpg",
            sellerAvatar: "/images/seller2.jpg",
            sellerName: "Trần Thị B",
        },
        {
            id: 6,
            name: "Giày Sneaker",
            price: 350000,
            image: "https://cdn.chotot.com/sP3Z5-5NjFOL1Wt3kiJa1kXWRk_RoJBh7E1WfdALHRo/preset:listing/plain/636b4850ae226740dacad478e4c78734-2957678958690791633.jpg",
            sellerAvatar: "/images/seller2.jpg",
            sellerName: "Trần Thị B",
        },
    ];

    return (
        <div className="flex flex-col items-center mt-10 gap-12 text-blue-500">
            <h1 className="text-5xl font-raleway italic ">
                Sinh viên cần gì - Chợ sinh viên có đó!
            </h1>
            <div className="flex flex-col gap-8 items-center w-full px-4 md:px-12 lg:px-24">
                <div className="bg-white rounded-xl justify-center p-4 w-[85vw]">
                    <h2 className="text-2xl font-bold text-left pb-4">
                        Sản phẩm nổi bật
                    </h2>
                    <div className="grid justify-center gap-4 xl:grid-cols-6 md:grid-cols-3 grid-cols-2 ">
                        {products.map((product) => (
                            <ProductCard key={product.id} {...product} />
                        ))}
                    </div>
                </div>
                <div className="bg-white rounded-xl justify-center p-4 w-[85vw]">
                    <h2 className="text-2xl font-bold text-left pb-4">
                        Sản phẩm mới
                    </h2>
                    <div className="grid justify-center gap-4 xl:grid-cols-6 md:grid-cols-3 grid-cols-2 ">
                        {products.map((product) => (
                            <ProductCard key={product.id} {...product} />
                        ))}
                    </div>
                </div>
                <div className="bg-white rounded-xl justify-center p-4 w-[85vw]">
                    <h2 className="text-2xl font-bold text-left pb-4">
                        Sản phẩm dành cho bạn
                    </h2>
                    <div className="grid justify-center gap-4 xl:grid-cols-6 md:grid-cols-3 grid-cols-2 ">
                        {products.map((product) => (
                            <ProductCard key={product.id} {...product} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
