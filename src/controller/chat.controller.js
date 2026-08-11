const Chat = require("../model/chat.model")
const Message = require("../model/message.model")

const getMyChats = async (req, res, next) => {
    try {
        const chats = await Chat.find({
            participants: req.user._id
        })
        .populate("participants", "name")
        .populate("swap")
        .sort({ lastMessageAt: -1 });

        return res.status(200).json({
            success: true,
            count: chats.length,
            chats
        });

    } catch (error) {
        next(error);
    }
};

const getChatMessages = async (req, res, next) => {
    try {
        const chat = await Chat.findById(req.params.chatId);

        if (!chat) {
            return res.status(404).json({
                success: false,
                message: "Chat not found."
            });
        }

        // Only chat participants can view messages
        const isParticipant = chat.participants.some(
            participant =>
                participant.toString() === req.user._id.toString()
        );

        if (!isParticipant) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to access this chat."
            });
        }

        const messages = await Message.find({
            chat: chat._id
        })
            .populate("sender", "name")
            .sort({ createdAt: 1 });

        return res.status(200).json({
            success: true,
            count: messages.length,
            messages
        });

    } catch (error) {
        next(error);
    }
};

const sendMessage = async (req, res, next) => {
    try {
        const { message } = req.body;

        const chat = await Chat.findById(req.params.chatId);

        if (!chat) {
            return res.status(404).json({
                success: false,
                message: "Chat not found."
            });
        }

        // Only participants can send messages
        const isParticipant = chat.participants.some(
            participant =>
                participant.toString() === req.user._id.toString()
        );

        if (!isParticipant) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to send messages in this chat."
            });
        }

        // Message or attachment is required
        if (!message && (!req.files || req.files.length === 0)) {
            return res.status(400).json({
                success: false,
                message: "Message or attachment is required."
            });
        }

        // Prepare attachments
        const attachments = (req.files || []).map(file => ({
            url: `/uploads/chat/${file.filename}`,
            fileType: file.mimetype,
            fileName: file.originalname
        }));

        const newMessage = await Message.create({
            chat: chat._id,
            sender: req.user._id,
            message,
            attachments
        });

        // Update chat preview
        chat.lastMessage =
            message || `📎 ${attachments.length} attachment${attachments.length > 1 ? "s" : ""}`;

        chat.lastMessageAt = new Date();

        await chat.save();

        await newMessage.populate("sender", "name");

        return res.status(201).json({
            success: true,
            message: "Message sent successfully.",
            data: newMessage
        });

    } catch (error) {
        next(error);
    }
};

module.exports = { getMyChats, getChatMessages, sendMessage };