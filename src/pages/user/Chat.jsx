import { useState, useRef, useEffect } from "react";
import { MessageCircle, Send, Menu, X } from "lucide-react";
import {
    getChatHistory,
    getRecentChats,
    markAsRead,
    sendMessage,
    chatSignalR,
} from "../../services/chatService.js";
import { useSelector } from "react-redux";

const Chat = () => {
    const [selectedChat, setSelectedChat] = useState(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [newMessage, setNewMessage] = useState("");
    const [recentChats, setRecentChats] = useState([]);
    const [chatHistory, setChatHistory] = useState({});
    const [loading, setLoading] = useState(false);
    const [sendingMessage, setSendingMessage] = useState(false);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const messagesEndRef = useRef(null);

    const { info: user } = useSelector((state) => state.user);
    const currentUserId = user?.userId;

    // Avoid stale closure inside realtime callbacks
    const selectedChatIdRef = useRef(null);
    useEffect(() => {
        selectedChatIdRef.current = selectedChat?.otherUserId ?? null;
    }, [selectedChat]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const loadRecentChats = async () => {
        try {
            const chats = await getRecentChats();
            setRecentChats(chats);
        } catch (error) {
            console.error("Error loading recent chats:", error);
        }
    };

    const loadChatHistory = async (otherUserId) => {
        try {
            setLoading(true);
            const response = await getChatHistory(otherUserId);
            setChatHistory((prev) => ({
                ...prev,
                [otherUserId]: response.items || [],
            }));
        } catch (error) {
            console.error("Error loading chat history:", error);
            setChatHistory((prev) => ({
                ...prev,
                [otherUserId]: [],
            }));
        } finally {
            setLoading(false);
        }
    };

    const updateRecentChatsWithNewMessage = (message) => {
        const otherUserId =
            message.senderId === currentUserId
                ? message.receiverId
                : message.senderId;

        setRecentChats((prev) => {
            const existingChatIndex = prev.findIndex(
                (chat) => chat.otherUserId === otherUserId
            );

            if (existingChatIndex >= 0) {
                const updatedChats = [...prev];
                updatedChats[existingChatIndex] = {
                    ...updatedChats[existingChatIndex],
                    content: message.content,
                    createdDate: message.createdDate,
                    isRead: message.senderId === currentUserId ? true : false,
                };

                const [updatedChat] = updatedChats.splice(existingChatIndex, 1);
                return [updatedChat, ...updatedChats];
            } else {
                const newChat = {
                    messageId: message.messageId,
                    senderId: message.senderId,
                    receiverId: message.receiverId,
                    content: message.content,
                    createdDate: message.createdDate,
                    isRead: message.senderId === currentUserId ? true : false,
                    otherUserId: otherUserId,
                    otherUserFullName: message.senderUserName || "Unknown User",
                    otherUserAvatar: null,
                };

                return [newChat, ...prev];
            }
        });
    };

    // Load recent chats once (page data)
    useEffect(() => {
        loadRecentChats().catch(console.error);
    }, []);

    // Subscribe to realtime events (NO SignalR .on here)
    useEffect(() => {
        const unsubReceive = chatSignalR.subscribe(
            "ReceiveMessage",
            (message) => {
                setChatHistory((prev) => ({
                    ...prev,
                    [message.senderId]: [
                        ...(prev[message.senderId] || []),
                        message,
                    ],
                }));

                updateRecentChatsWithNewMessage(message);

                if (selectedChatIdRef.current === message.senderId) {
                    setTimeout(scrollToBottom, 100);
                }
            }
        );

        const unsubSent = chatSignalR.subscribe("MessageSent", (message) => {
            setChatHistory((prev) => ({
                ...prev,
                [message.receiverId]: [
                    ...(prev[message.receiverId] || []),
                    message,
                ],
            }));

            updateRecentChatsWithNewMessage(message);
            setTimeout(scrollToBottom, 100);
        });

        const unsubRead = chatSignalR.subscribe(
            "MessageMarkedAsRead",
            (data) => {
                setChatHistory((prev) => {
                    const updated = { ...prev };
                    Object.keys(updated).forEach((userId) => {
                        updated[userId] = updated[userId].map((msg) =>
                            msg.messageId === data.messageId
                                ? { ...msg, isRead: true }
                                : msg
                        );
                    });
                    return updated;
                });
            }
        );

        const unsubOnlineUsers = chatSignalR.subscribe(
            "OnlineUsers",
            (users) => {
                setOnlineUsers(users || []);
            }
        );

        const unsubUserOnline = chatSignalR.subscribe(
            "UserOnline",
            (userId) => {
                setOnlineUsers((prev) =>
                    prev.includes(userId) ? prev : [...prev, userId]
                );
            }
        );

        const unsubUserOffline = chatSignalR.subscribe(
            "UserOffline",
            (userId) => {
                setOnlineUsers((prev) => prev.filter((id) => id !== userId));
            }
        );

        return () => {
            unsubReceive();
            unsubSent();
            unsubRead();
            unsubOnlineUsers();
            unsubUserOnline();
            unsubUserOffline();
        };
    }, [currentUserId]);

    useEffect(() => {
        scrollToBottom();
    }, [chatHistory, selectedChat]);

    const handleChatSelect = async (chat) => {
        setSelectedChat(chat);
        setIsSidebarOpen(false);

        if (!chatHistory[chat.otherUserId]) {
            await loadChatHistory(chat.otherUserId);
        }

        const unreadMessages =
            chatHistory[chat.otherUserId]?.filter(
                (msg) => !msg.isRead && msg.senderId !== currentUserId
            ) || [];

        for (const message of unreadMessages) {
            try {
                await markAsRead(message.messageId);
            } catch (error) {
                console.error("Failed to mark message as read:", error);
            }
        }
    };

    const handleSendMessage = async () => {
        if (!newMessage.trim() || !selectedChat || sendingMessage) return;
        setSendingMessage(true);
        try {
            await sendMessage(selectedChat.otherUserId, newMessage.trim());
            setNewMessage("");
        } catch (error) {
            console.error("Failed to send message:", error);
        } finally {
            setSendingMessage(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const getInitials = (name) => {
        return name
            ? name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
            : "U";
    };

    const isUserOnline = (userId) => {
        return onlineUsers.includes(userId);
    };

    if (loading) {
        return (
            <div className="min-h-[77.5vh] flex items-center justify-center">
                <div className="flex items-center space-x-2">
                    <span>Đang tải...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-[77.5vh] max-h-[77.5vh] flex flex-col w-full items-start">
            <div className="bg-white rounded-md flex-1 w-full flex relative overflow-hidden">
                {/* Sidebar */}
                <div
                    className={`
                        ${
                            isSidebarOpen
                                ? "translate-x-0"
                                : "-translate-x-full"
                        } 
                        md:translate-x-0 transition-transform duration-300 ease-in-out
                        fixed md:relative z-40 w-80 bg-white border-r border-gray-200 flex flex-col
                        h-screen md:h-full
                        top-0 md:top-auto
                    `}
                >
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-bold text-gray-800">
                                Tin nhắn
                            </h2>
                            <button
                                className="md:hidden text-gray-500 hover:text-gray-700"
                                onClick={() => setIsSidebarOpen(false)}
                            >
                                <X size={20} />
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        {recentChats.map((chat) => (
                            <div
                                key={chat.otherUserId}
                                className={`
                                    flex items-center p-4 cursor-pointer hover:bg-gray-50 border-b border-gray-100
                                    ${
                                        selectedChat?.otherUserId ===
                                        chat.otherUserId
                                            ? "bg-blue-50 border-r-4 border-r-blue-500"
                                            : ""
                                    }
                                `}
                                onClick={() => handleChatSelect(chat)}
                            >
                                <div className="relative mr-3">
                                    {chat.otherUserAvatar ? (
                                        <img
                                            src={chat.otherUserAvatar}
                                            alt={chat.otherUserFullName}
                                            className="w-12 h-12 rounded-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold">
                                            {getInitials(
                                                chat.otherUserFullName
                                            )}
                                        </div>
                                    )}
                                    {!chat.isRead && (
                                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white"></div>
                                    )}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="font-semibold text-gray-900 truncate">
                                        {chat.otherUserFullName}
                                    </div>
                                    <div className="text-sm text-gray-500 truncate">
                                        {chat.content.length > 30
                                            ? chat.content.substring(0, 30) +
                                              "..."
                                            : chat.content}
                                    </div>
                                </div>

                                <div className="text-xs text-gray-400 ml-2">
                                    {formatTime(chat.createdDate)}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Main Chat Area */}
                <div className="flex-1 flex flex-col">
                    {selectedChat ? (
                        <>
                            {/* Chat Header */}
                            <div className="p-6 border-b border-gray-200 bg-white">
                                <div className="flex items-center">
                                    {/* Mobile Menu Button - moved here next to avatar */}
                                    <button
                                        className="md:hidden mr-3 bg-gray-100 text-gray-600 p-2 rounded-lg hover:bg-gray-200"
                                        onClick={() =>
                                            setIsSidebarOpen(!isSidebarOpen)
                                        }
                                    >
                                        <Menu size={20} />
                                    </button>

                                    <div className="mr-3">
                                        {selectedChat.otherUserAvatar ? (
                                            <img
                                                src={
                                                    selectedChat.otherUserAvatar
                                                }
                                                alt={
                                                    selectedChat.otherUserFullName
                                                }
                                                className="w-10 h-10 rounded-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold">
                                                {getInitials(
                                                    selectedChat.otherUserFullName
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900">
                                            {selectedChat.otherUserFullName}
                                        </h3>
                                        <span className="text-sm text-green-500">
                                            {isUserOnline(
                                                selectedChat.otherUserId
                                            )
                                                ? "Đang hoạt động"
                                                : "Ngoại tuyến"}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Messages Area */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-4">
                                {chatHistory[selectedChat.otherUserId]?.map(
                                    (message) => (
                                        <div
                                            key={message.messageId}
                                            className={`flex ${
                                                message.senderId ===
                                                currentUserId
                                                    ? "justify-end"
                                                    : "justify-start"
                                            }`}
                                        >
                                            <div
                                                className={`max-w-xs lg:max-w-md ${
                                                    message.senderId ===
                                                    currentUserId
                                                        ? "order-2"
                                                        : "order-1"
                                                }`}
                                            >
                                                <div
                                                    className={`
                        px-4 py-2 rounded-2xl
                        ${
                            message.senderId === currentUserId
                                ? "bg-blue-500 text-white rounded-br-sm"
                                : "bg-gray-100 text-gray-900 rounded-bl-sm"
                        }
                      `}
                                                >
                                                    {message.content}
                                                </div>
                                                <div
                                                    className={`text-xs text-gray-500 mt-1 ${
                                                        message.senderId ===
                                                        currentUserId
                                                            ? "text-right"
                                                            : "text-left"
                                                    }`}
                                                >
                                                    {formatTime(
                                                        message.createdDate
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Message Input */}
                            <div className="p-6 border-t border-gray-200 bg-white">
                                <div className="flex items-end space-x-3">
                                    <div className="flex-1">
                                        <textarea
                                            value={newMessage}
                                            onChange={(e) =>
                                                setNewMessage(e.target.value)
                                            }
                                            onKeyPress={handleKeyPress}
                                            placeholder="Nhập tin nhắn..."
                                            rows="1"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                                            style={{ maxHeight: "120px" }}
                                        />
                                    </div>
                                    <button
                                        onClick={handleSendMessage}
                                        disabled={!newMessage.trim()}
                                        className="bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <Send size={20} />
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center bg-gray-50">
                            {/* Mobile Menu Button - for when no chat is selected */}
                            <button
                                className="md:hidden fixed top-20 left-4 z-50 bg-blue-500 text-white p-2 rounded-lg shadow-md"
                                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            >
                                <Menu size={20} />
                            </button>

                            <div className="text-center">
                                <MessageCircle
                                    size={64}
                                    className="mx-auto text-gray-400 mb-4"
                                />
                                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                                    Chọn một cuộc trò chuyện
                                </h3>
                                <p className="text-gray-500">
                                    Chọn một người để bắt đầu nhắn tin
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Mobile Overlay */}
                {isSidebarOpen && (
                    <div
                        className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
                        onClick={() => setIsSidebarOpen(false)}
                    />
                )}
            </div>
        </div>
    );
};

export default Chat;
