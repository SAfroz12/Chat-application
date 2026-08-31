const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const authRoutes = require("./routes/auth.routes")
const passport = require("./config/passport")
const conversationRoutes = require("./routes/conversation.routes")
const messageRoutes = require("./routes/message.routes")
const userRoutes = require("./routes/user.routes");
const uploadRoutes = require("./routes/upload.routes");
const app = express();
const allowedOrigins = [
  "http://localhost:5173",
  "https://chat-application-ten-orcin.vercel.app",
];
// Middleware
app.use(express.json());
app.use(passport.initialize());
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);
app.use(cookieParser());

// Health Check Route  for uptime Robot

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Chat Application Backend Running",
  });
});

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running",
  });
});
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/conversations", conversationRoutes);
app.use("/api/v1/messages", messageRoutes)
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/upload", uploadRoutes);
module.exports = app;