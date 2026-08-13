const Conversation = require("../models/conversation.model");
const User = require("../models/user.model");

const createConversation = async (req, res) => {
  try {
    const { userId } = req.body;

    const currentUserId = req.user._id;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    if (currentUserId.toString() === userId.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot create a conversatioi8n with yourself",
      });
    }

    // Check whether receiver exists
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check existing conversation
    const existingConversation = await Conversation.findOne({
      participants: {
        $all: [currentUserId, userId],
      },
    });

    if (existingConversation) {
      return res.status(200).json({
        success: true,
        message: "Conversation already exists",
        conversation: existingConversation,
      });
    }

    // Create conversation
    const conversation = await Conversation.create({
      participants: [currentUserId, userId],
    });

    res.status(201).json({
      success: true,
      message: "Conversation created",
      conversation,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
const getMyConversations = async (req, res) => {
  try {
    const userId = req.user._id;

    const conversations = await Conversation.find({
      participants: userId,
    })
      .populate("participants", "name email avatar")
      .populate("lastMessage")
      .sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      conversations,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const getConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;

    const userId = req.user._id;

    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: userId,
    })
      .populate("participants", "name email avatar")
      .populate("lastMessage");

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }

    res.status(200).json({
      success: true,
      conversation,
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
  createConversation,
  getMyConversations,
  getConversation,
};