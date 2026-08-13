const Message = require("../models/message.model");
const Conversation = require("../models/conversation.model");

const sendMessage = async (req, res) => {
    try {
        const { conversationId, content } = req.body;

        const senderId = req.user._id;

        // Check required fields
        if (!conversationId || !content) {
            return res.status(400).json({
                success: false,
                message: "Conversation ID and content are required",
            });
        }

        // Find conversation and check whether sender belongs to it
        const conversation = await Conversation.findOne({
            _id: conversationId,
            participants: senderId,
        });

        if (!conversation) {
            return res.status(404).json({
                success: false,
                message: "Conversation not found",
            });
        }

        // Create message
        const message = await Message.create({
            conversation: conversationId,
            sender: senderId,
            content,
        });

        // Update last message
        conversation.lastMessage = message._id;

        await conversation.save();

        // Populate sender information
        await message.populate(
            "sender",
            "name email avatar"
        );

        res.status(201).json({
            success: true,
            message: "Message sent successfully",
            data: message,
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};

const getMessages = async (req, res) => {
    try {
        const { conversationId } = req.params;

        const userId = req.user._id;


        const limit = Math.min(
            parseInt(req.query.limit) || 20,
            50
        );
        const { before } = req.query;//cursor

        // Check conversation access
        const conversation = await Conversation.findOne({
            _id: conversationId,
            participants: userId,
        });

        if (!conversation) {
            return res.status(404).json({
                success: false,
                message: "Conversation not found",
            });
        }

        const query = {
            conversation: conversationId,
        };

        // If cursor exists, get older messages
        if (before) {
            query._id = {
                $lt: before,
            };
        }

        // Get messages
        const messages = await Message.find(query)
            .populate("sender", "name email avatar")
            .sort({ _id: -1 })
            .limit(limit + 1);

        // Check whether more messages exist
        const hasMore = messages.length > limit;

        // Remove extra message
        if (hasMore) {
            messages.pop();
        }

        // Reverse so oldest appears first
        messages.reverse();

        // Create next cursor
        const nextCursor =
            messages.length > 0
                ? messages[0]._id
                : null;

        res.status(200).json({
            success: true,
            messages,
            pagination: {
                limit,
                hasMore,
                nextCursor,
            },
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};
module.exports = {
    sendMessage,
    getMessages,
};