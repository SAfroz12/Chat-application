const { Server } = require("socket.io");
const { generateSmartReplies, } = require("../services/mistral.service");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const Conversation = require("../models/conversation.model")
const Message = require("../models/message.model")
const allowedOrigins = [
  "http://localhost:5173",
  "https://chat-application-ten-orcin.vercel.app",
];
const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: allowedOrigins,
      credentials: true,
    },
    pingInterval: 3000,
    pingTimeout: 3000,
  });

  // console.log(io)
  //   userId -socketId
  const onlineUsers = new Map();


  // Socket authentication middleware
  io.use((socket, next) => {
    try {
      const cookies = socket.handshake.headers.cookie;
      console.log(cookies)
      if (!cookies) {
        return next(new Error("Authentication required"));
      }

      const accessToken = cookies
        .split(";")
        .map((cookie) => cookie.trim())
        .find((cookie) =>
          cookie.startsWith("accessToken=")
        )
        ?.split("=")[1];

      if (!accessToken) {
        return next(new Error("Access token not found"));
      }

      const decoded = jwt.verify(
        accessToken,
        process.env.JWT_ACCESS_SECRET
      );
      //for socket.io
      socket.user = decoded;

      next();
    } catch (error) {
      console.error("Socket authentication failed:", error.message);

      next(new Error("Invalid or expired access token"));
    }
  });

  // Socket connection
  io.on("connection", (socket) => {
    const userId = socket.user.userId.toString();

    console.log("Userconnected:", userId);
    console.log("Socket ID:", socket.id);


    const isFirstConnection = !onlineUsers.has(userId);

    if (isFirstConnection) {
      onlineUsers.set(userId, new Set());
    }

    onlineUsers.get(userId).add(socket.id);

    console.log("Online users:", onlineUsers);

    // Tell everyone user is online
    if (isFirstConnection) {
      io.emit("userOnline", {
        userId,
      });
    }
    // Tell the newly connected user who is already online
    const currentlyOnlineUsers = Array.from(onlineUsers.keys());

    socket.emit("onlineUsers", {
      userIds: currentlyOnlineUsers,
    });


    // Join conversation
    socket.on("joinConversation", async (conversationId) => {
      try {
        if (!conversationId) {
          return socket.emit("joinConversationError", {
            message: "Conversation ID is required",
          });
        }

        const userId = socket.user.userId;

        const conversation = await Conversation.findOne({
          _id: conversationId,
          participants: userId,
        });

        if (!conversation) {
          return socket.emit("joinConversationError", {
            message: "Conversation not found or you are not a participant",
          });
        }

        socket.join(conversationId);

        console.log(`User ${userId} joined conversation ${conversationId}`);
      } catch (error) {
        console.error("Join conversation error:", error);
        socket.emit("joinConversationError", {
          message: "Failed to join conversation",
        });
      }
    });
    socket.on("sendMessage", async (data) => {
      try {
         console.log("SEND MESSAGE RECEIVED:", data);
        const { conversationId, text, image } = data;

        const userId = socket.user.userId;

        // Validate conversation
        if (!conversationId) {
          return socket.emit("messageError", {
            message: "Conversation ID is required",
          });
        }

        // Validate message
        if ((!text || !text.trim()) && !image) {
          return socket.emit("messageError", {
            message: "Message cannot be empty",
          });
        }
        // Check conversation + authorization
        const conversation = await Conversation.findOne({
          _id: conversationId,
          participants: userId,
        });

        if (!conversation) {
          return socket.emit("messageError", {
            message: "Conversation not found or you are not a participant",
          });
        }

        // Create message
        const message = await Message.create({
          conversation: conversationId,
          sender: userId,
          text: text ? text.trim() : "",
          image: image || "",
        });
        // Update last message
        conversation.lastMessage = message._id;

        await conversation.save();

        // Populate sender
        await message.populate(
          "sender",
          "name email avatar"
        );

        // Send to everyone in conversation
        io.to(conversationId).emit(
          "newMessage",
          message
        );


        //ai  Smart Reply
        if (text && text.trim()) {
          const suggestions = await generateSmartReplies(
            text.trim()
          );

          const receiverId = conversation.participants.find(
            (participantId) =>
              participantId.toString() !== userId.toString()
          );

          const receiverSocketIds =
            onlineUsers.get(receiverId.toString());

          if (
            receiverSocketIds &&
            suggestions.length > 0
          ) {
            receiverSocketIds.forEach((socketId) => {
              io.to(socketId).emit(
                "smartReplySuggestions",
                {
                  messageId: message._id,
                  suggestions,
                }
              );
            });
          }
        }

      } catch (error) {
        console.error("Send message error:", error);

        socket.emit("messageError", {
          message: "Failed to send message",
        });
      }
    });
    // typing
    socket.on("typing", async ({ conversationId }) => {
      try {
        if (!conversationId) {
          return;
        }

        const userId = socket.user.userId;

        const conversation = await Conversation.findOne({
          _id: conversationId,
          participants: userId,
        });

        if (!conversation) {
          return;
        }

        socket.to(conversationId).emit("userTyping", {
          userId,
        });

      } catch (error) {
        console.error("Typing error:", error);
      }
    });

    //stop typing
    socket.on(
      "stopTyping",
      async ({ conversationId }) => {
        try {
          if (!conversationId) {
            return;
          }

          const userId = socket.user.userId;

          const conversation =
            await Conversation.findOne({
              _id: conversationId,
              participants: userId,
            });

          if (!conversation) {
            return;
          }

          socket
            .to(conversationId)
            .emit("userStoppedTyping", {
              userId,
            });

        } catch (error) {
          console.error(
            "Stop typing error:",
            error
          );
        }
      }
    );
    //message delivered

    socket.on("messageDelivered", async ({ messageId, conversationId }) => {
      try {
        if (!messageId || !conversationId) {
          return;
        }

        const userId = socket.user.userId;

        // Check that the user belongs
        // to this conversation
        const conversation = await Conversation.findOne({
          _id: conversationId,
          participants: userId,
        });

        if (!conversation) {
          return;
        }

        // Find the message
        const message = await Message.findOne({
          _id: messageId,
          conversation: conversationId,
        });

        if (!message) {
          return;
        }

        // Don't mark your own message
        // as delivered by yourself
        if (message.sender.toString() === userId.toString()) {
          return;
        }

        // Change status
        message.status = "delivered";

        await message.save();

        // Tell the conversation that this message was delivered
        io.to(conversationId).emit("messageDelivered", {
          messageId,
        }
        );

      } catch (error) {
        console.error(
          "Message delivered error:",
          error
        );
      }
    }
    );
    //message read

    socket.on("messageRead",
      async ({ conversationId }) => {
        try {
          if (!conversationId) {
            return;
          }

          const userId = socket.user.userId;

          // Check whether user belongs
          // to this conversation
          const conversation = await Conversation.findOne({
            _id: conversationId,
            participants: userId,
          });

          if (!conversation) {
            return;
          }
          // Find all unread messages sent by the OTHER user
          const unreadMessages = await Message.find({
            conversation: conversationId,
            sender: { $ne: userId },
            status: { $ne: "read" },
          }).select("_id");
          if (unreadMessages.length === 0) {
            return;
          }
          //  Get all unread message IDs
          const messageIds = unreadMessages.map(
            (message) => message._id.toString()
          );
          // Mark all of them as read
          await Message.updateMany(
            {
              _id: { $in: messageIds },
            },
            {
              $set: {
                status: "read",
              },
            }
          );
          // Tell everyone in the conversation
          io.to(conversationId).emit("messageRead",
            {
              messageIds,
              userId,
            }
          );

        } catch (error) {
          console.error("Message read error:", error);
        }
      }
    );


    // Delete message
    socket.on("deleteMessage", async ({ messageId, conversationId }) => {
      try {
        if (!messageId || !conversationId) {
          return;
        }

        const userId = socket.user.userId;

        // Check whether user belongs to this conversation
        const conversation = await Conversation.findOne({
          _id: conversationId,
          participants: userId,
        });

        if (!conversation) {
          return;
        }

        // Find the message
        const message = await Message.findOne({
          _id: messageId,
          conversation: conversationId,
        });

        if (!message) {
          return;
        }

        // Only the sender can delete their own message
        if (message.sender.toString() !== userId.toString()) {
          return;
        }

        // Delete message
        await Message.findByIdAndDelete(messageId);

        // If this was the last message, update conversation.lastMessage
        if (
          conversation.lastMessage &&
          conversation.lastMessage.toString() === messageId.toString()
        ) {
          const previousMessage = await Message.findOne({
            conversation: conversationId,
          }).sort({ createdAt: -1 });

          conversation.lastMessage = previousMessage
            ? previousMessage._id
            : null;

          await conversation.save();
        }

        // Tell everyone in the conversation
        io.to(conversationId).emit("messageDeleted", {
          messageId,
          conversationId,
        });

      } catch (error) {
        console.error("Delete message error:", error);
      }
    });

    //edit message 
    socket.on("editMessage", async ({ messageId, conversationId, text }) => {
      try {
        if (!text?.trim()) {
          return;
        }

        const message = await Message.findById(messageId);

        if (!message) {
          return;
        }

        // Only the sender can edit the message
        if (message.sender.toString() !== socket.user.userId.toString()) {
          return;
        }

        message.text = text.trim();
        message.edited = true;

        await message.save();

        io.to(conversationId).emit("messageEdited", {
          messageId: message._id,
          text: message.text,
          edited: true,
        });

      } catch (error) {
        console.error("Edit message error:", error);
      }
    });
    // Disconnect
    socket.on("disconnect", (reason) => {

      const sockets = onlineUsers.get(userId);
      console.log("SOCKET DISCONNECTED");
      console.log("User:", userId);
      console.log("Socket:", socket.id);
      console.log("Reason:", reason);
      if (!sockets) {
        return;
      }
      // Remove only this socket
      sockets.delete(socket.id);

      // User is offline only when
      // no sockets remain
      if (sockets.size === 0) {

        onlineUsers.delete(userId);

        io.emit("userOffline", { userId, });

        console.log(`User ${userId} is offline`);
      }

      console.log("Online users:", onlineUsers);
    });

  });

  return io;
};

module.exports = initializeSocket;