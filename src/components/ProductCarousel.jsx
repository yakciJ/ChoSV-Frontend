import { Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import ProductCard from "./ProductCard";
import { useRef } from "react";
import { useEffect, useState } from "react";

export default function ProductCarousel({ title, products, viewAllLink }) {
    const [showLeftButton, setShowLeftButton] = useState(false);
    const [showRightButton, setShowRightButton] = useState(true);
    const containerRef = useRef(null);

    const checkScrollButtons = () => {
        const container = containerRef.current;
        if (container) {
            setShowLeftButton(container.scrollLeft > 3);
            setShowRightButton(
                container.scrollLeft <
                    container.scrollWidth - container.clientWidth - 2
            );
        }
    };

    const scrollProducts = (direction) => {
        const container = containerRef.current;
        if (container) {
            const scrollAmount = 500;
            container.scrollBy({
                left: direction === "left" ? -scrollAmount : scrollAmount,
                behavior: "smooth",
            });
        }
    };

    useEffect(() => {
        setTimeout(() => {
            checkScrollButtons();
        }, 100);
    }, [products]);

    if (!products || products.length === 0) {
        return null;
    }

    return (
        <div className="bg-white mt-4 rounded-xl justify-center p-4 w-full">
            {/* Header with title and optional "View All" link */}
            <div className="flex justify-between items-center pl-2 pb-4">
                <h2 className="text-2xl font-bold text-left">{title}</h2>
                {viewAllLink && (
                    <Link
                        to={viewAllLink}
                        className="text-blue-500 hover:underline text-sm font-medium"
                    >
                        Xem thêm →
                    </Link>
                )}
            </div>

            {/* Products carousel */}
            <div className="relative">
                {/* Left scroll button */}
                {showLeftButton && (
                    <ChevronLeft
                        className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 text-black bg-white bg-opacity-80 hover:bg-opacity-100 border border-gray-300 rounded-full w-10 h-10 flex items-center justify-center shadow-md transition-all duration-200 cursor-pointer"
                        onClick={() => scrollProducts("left")}
                    />
                )}

                {/* Right scroll button */}
                {showRightButton && (
                    <ChevronLeft
                        className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 text-black bg-white bg-opacity-80 hover:bg-opacity-100 border border-gray-300 rounded-full w-10 h-10 flex items-center justify-center shadow-md transition-all duration-200 cursor-pointer rotate-180"
                        onClick={() => scrollProducts("right")}
                    />
                )}

                {/* Products container */}
                <div
                    ref={containerRef}
                    className="flex overflow-x-auto gap-4 scroll-smooth px-2"
                    onScroll={checkScrollButtons}
                    style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                >
                    {products.map((product, index) => (
                        <div
                            key={product.productId || index}
                            className="flex-shrink-0"
                        >
                            <ProductCard {...product} />
                        </div>
                    ))}
                </div>
            </div>

            {/* Hide scrollbar with CSS */}
            <style jsx>{`
                div::-webkit-scrollbar {
                    display: none;
                }
            `}</style>
        </div>
    );
}
