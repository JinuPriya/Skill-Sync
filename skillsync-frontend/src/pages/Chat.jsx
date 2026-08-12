import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import Navbar from "../components/Navbar";
import api from "../services/api";
import "./Chat.css";

function formatTime(dateString) {
    return new Date(dateString).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatChatPreviewTime(dateString) {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function Chat() {
    const { chatId } = useParams();
    const navigate = useNavigate();

    const [myId, setMyId] = useState(null);
    const [chats, setChats] = useState([]);
    const [messages, setMessages] = useState([]);
    const [loadingChats, setLoadingChats] = useState(true);
    const [loadingMessages, setLoadingMessages] = useState(false);

    const [messageText, setMessageText] = useState("");
    const [attachments, setAttachments] = useState([]);
    const [sending, setSending] = useState(false);

    const messagesEndRef = useRef(null);

    const fetchChats = async () => {
        try {
            const [profileRes, chatsRes] = await Promise.all([
                api.get("/profile"),
                api.get("/chat/chats"),
            ]);

            setMyId(profileRes.data.profile._id);
            setChats(chatsRes.data.chats);

        } catch (error) {
            toast.error(error.response?.data?.message || "Unable to load chats.");
        } finally {
            setLoadingChats(false);
        }
    };

    useEffect(() => {
        fetchChats();

        const interval = setInterval(fetchChats, 8000);
        return () => clearInterval(interval);
    }, []);

    const fetchMessages = async (id) => {
        try {
            const response = await api.get(`/chat/chat/${id}/messages`);
            setMessages(response.data.messages);
        } catch (error) {
            toast.error(error.response?.data?.message || "Unable to load messages.");
        }
    };

    useEffect(() => {
        if (!chatId) {
            setMessages([]);
            return;
        }

        setLoadingMessages(true);
        fetchMessages(chatId).finally(() => setLoadingMessages(false));

        const interval = setInterval(() => fetchMessages(chatId), 4000);
        return () => clearInterval(interval);
    }, [chatId]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = async () => {
        if (!messageText.trim() && attachments.length === 0) return;

        setSending(true);

        const formData = new FormData();
        formData.append("message", messageText.trim());
        attachments.forEach((file) => formData.append("attachments", file));

        try {
            await api.post(`/chat/chat/${chatId}/messages`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            setMessageText("");
            setAttachments([]);
            fetchMessages(chatId);
            fetchChats();

        } catch (error) {
            toast.error(error.response?.data?.message || "Unable to send message.");
        } finally {
            setSending(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const getOtherParticipant = (chat) =>
        chat.participants.find((p) => p._id !== myId) || { name: "Unknown" };

    const activeChat = chats.find((c) => c._id === chatId);

    return (
        <>
            <Navbar />

            <main className="chat-page">
                <div className={`chat-sidebar ${chatId ? "chat-sidebar-hidden-mobile" : ""}`}>
                    <h2 className="chat-sidebar-title">Messages</h2>

                    {loadingChats ? (
                        <p className="chat-empty-text">Loading...</p>
                    ) : chats.length === 0 ? (
                        <p className="chat-empty-text">
                            No conversations yet. Accepted swaps will show up here.
                        </p>
                    ) : (
                        <div className="chat-list">
                            {chats.map((chat) => {
                                const other = getOtherParticipant(chat);

                                return (
                                    <button
                                        type="button"
                                        key={chat._id}
                                        className={`chat-list-item ${chat._id === chatId ? "chat-list-item-active" : ""}`}
                                        onClick={() => navigate(`/chat/${chat._id}`)}
                                    >
                                        <div className="chat-avatar">👤</div>
                                        <div className="chat-list-item-text">
                                            <div className="chat-list-item-top">
                                                <span className="chat-list-item-name">{other.name}</span>
                                                <span className="chat-list-item-time">
                                                    {formatChatPreviewTime(chat.lastMessageAt)}
                                                </span>
                                            </div>
                                            <p className="chat-list-item-preview">
                                                {chat.lastMessage || "Say hello 👋"}
                                            </p>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className={`chat-main ${chatId ? "" : "chat-main-hidden-mobile"}`}>
                    {!chatId ? (
                        <div className="chat-placeholder">
                            <p>Select a conversation to start chatting.</p>
                        </div>
                    ) : (
                        <>
                            <div className="chat-header">
                                <button
                                    type="button"
                                    className="chat-back-button"
                                    onClick={() => navigate("/chat")}
                                >
                                    ←
                                </button>
                                <h3>{activeChat ? getOtherParticipant(activeChat).name : "..."}</h3>
                            </div>

                            <div className="chat-messages">
                                {loadingMessages ? (
                                    <p className="chat-empty-text">Loading messages...</p>
                                ) : messages.length === 0 ? (
                                    <p className="chat-empty-text">No messages yet. Say hello 👋</p>
                                ) : (
                                    messages.map((msg) => {
                                        const isMine = msg.sender._id === myId;

                                        return (
                                            <div
                                                key={msg._id}
                                                className={`chat-bubble-row ${isMine ? "chat-bubble-row-mine" : ""}`}
                                            >
                                                <div className={`chat-bubble ${isMine ? "chat-bubble-mine" : ""}`}>
                                                    {msg.message && <p>{msg.message}</p>}

                                                    {msg.attachments && msg.attachments.map((att, i) => {
                                                        const fileUrl = `${import.meta.env.VITE_API_URL}${att.url}`;
                                                        const isImage = att.fileType && att.fileType.startsWith("image/");

                                                        if (isImage) {
                                                            return (
                                                                <a key={i} href={fileUrl} target="_blank" rel="noreferrer">
                                                                    <img
                                                                        src={fileUrl}
                                                                        alt={att.fileName}
                                                                        className="chat-attachment-image"
                                                                    />
                                                                </a>
                                                            );
                                                        }

                                                        return (
                                                            
                                                            <a    key={i}
                                                                href={fileUrl}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="chat-attachment-file"
                                                            >
                                                                📎 {att.fileName}
                                                            </a>
                                                        );
                                                    })}

                                                    <span className="chat-bubble-time">
                                                        {formatTime(msg.createdAt)}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {attachments.length > 0 && (
                                <div className="chat-attachment-preview">
                                    {attachments.map((file, i) => (
                                        <span key={i} className="chat-attachment-chip">
                                            📎 {file.name}
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setAttachments((prev) => prev.filter((_, idx) => idx !== i))
                                                }
                                            >
                                                ✕
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            )}

                            <div className="chat-input-bar">
                                <label className="chat-attach-button">
                                    📎
                                    <input
                                        type="file"
                                        multiple
                                        accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
                                        hidden
                                        onChange={(e) =>
                                            setAttachments((prev) => [...prev, ...Array.from(e.target.files)])
                                        }
                                    />
                                </label>

                                <textarea
                                    placeholder="Type a message..."
                                    value={messageText}
                                    onChange={(e) => setMessageText(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    rows={1}
                                />

                                <button
                                    type="button"
                                    className="chat-send-button"
                                    disabled={sending}
                                    onClick={handleSend}
                                >
                                    Send
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </main>
        </>
    );
}

export default Chat;