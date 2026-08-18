const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const authRoutes=require("./routes/auth.routes")
const passport=require("./config/passport")
const conversationRoutes=require("./routes/conversation.routes")
const messageRoutes=require("./routes/message.routes")
const userRoutes = require("./routes/user.routes");
const app = express();

// Middleware
app.use(express.json());
app.use(passport.initialize());
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);
app.use(cookieParser());

// Health Check Route
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Chat Application Backend Running",
  });
});
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/conversations",conversationRoutes);
app.use("/api/v1/messages",messageRoutes)
app.use("/api/v1/users", userRoutes);
module.exports = app;