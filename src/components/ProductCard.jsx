export default function ProductCard(props) {
    return (
        <div className="md:w-[25vw] xl:w-[13vw] w-[37vw] bg-gray-100 shadow-md rounded-sm border-black border overflow-hidden hover:border-blue-500 hover:shadow-lg hover:shadow-blue-100 hover:-translate-y-1 transition">
            <img
                src={props.image}
                alt={props.name}
                className="w-full aspect-square object-cover"
            />
            <div className="px-4 py-2 text-left">
                <h3 className="text-black text-lg font-semibold">
                    {props.name}
                </h3>
                <p className="text-lg text-blue-600 font-bold my-2">
                    {props.price}₫
                </p>
                <div className="flex-row flex gap-2">
                    <img
                        src={props.sellerAvatar}
                        alt={props.sellerName}
                        className="w-4 h-4 rounded-full"
                    />
                    <span className="text-gray-600 text-sm">
                        {props.sellerName}
                    </span>
                </div>
            </div>
        </div>
    );
}
