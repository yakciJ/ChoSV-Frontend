import { formatDateLocal } from "../helpers/formatDate";
import { User } from "lucide-react";

export default function UserWallPost({ post }) {
    return (
        <div className="border rounded-lg p-4 mb-4 bg-white shadow">
            <div className="flex items-center mb-2">
                {post.posterAvatarImage ? (
                    <img
                        src={post.posterAvatarImage}
                        alt={post.posterUserName}
                        className="w-10 h-10 rounded-full object-cover"
                    />
                ) : (
                    <User className="w-10 h-10 text-gray-500 bg-gray-200 rounded-full p-1" />
                )}

                <div className="ml-2">
                    <p className="font-semibold">
                        {post.posterFullName || post.posterUserName}
                    </p>
                    <p className="text-gray-500 text-sm">
                        {formatDateLocal(post.createdAt)}
                    </p>
                </div>
            </div>
            <p className="mt-2 text-gray-800">{post.commentContent}</p>
        </div>
    );
}
