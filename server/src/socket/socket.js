const { Server } = require("socket.io");
const { generateSmartReplies, } = require("../services/mistral.service");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const Conversation = require("../models/conversation.model")
const Message = require("../models/message.model")
const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL,
      credentials: true,
    },
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
        const { conversationId, text } = data;

        const userId = socket.user.userId;

        // Validate conversation
        if (!conversationId) {
          return socket.emit("messageError", {
            message: "Conversation ID is required",
          });
        }

        // Validate message
        if (!text || !text.trim()) {
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
          text: text.trim(),
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
        const suggestions = await generateSmartReplies(message.text);

        // Find receiver
        const receiverId = conversation.participants.find(
          (participantId) =>
            participantId.toString() !== userId.toString()
        );

        // Find receiver's socket
        const receiverSocketId = onlineUsers.get(receiverId.toString());

        // Send AI suggestions only to receiver
        if (receiverSocketId &&suggestions.length > 0) {
          io.to(receiverSocketId).emit(
            "smartReplySuggestions",
            {
              messageId: message._id,
              suggestions,
            }
          );
        }
      }

      catch (error) {
        console.error("Send message error:", error);

        socket.emit("messageError", {
          message: "Failed to send message",
        });
      }
    });




    // TYPING
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
      async ({ messageId, conversationId }) => {
        try {
          if (!messageId || !conversationId) {
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

          // Find the message
          const message = await Message.findOne({
            _id: messageId,
            conversation: conversationId,
          });

          if (!message) {
            return;
          }

          // Don't mark your own message
          // as read
          if (message.sender.toString() === userId.toString()) {
            return;
          }

          // Update status
          if (message.status !== "read") {
            message.status = "read";
            await message.save();
          }
          // Tell everyone in the conversation
          io.to(conversationId).emit("messageRead",
            {
              messageId,
              userId,
            }
          );

        } catch (error) {
          console.error(
            "Message read error:",
            error
          );
        }
      }
    );
    // Disconnect
    socket.on("disconnect", () => {
      const sockets = onlineUsers.get(userId);
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