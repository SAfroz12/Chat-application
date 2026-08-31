require("dotenv").config();
const http = require("http");
const app = require("./app");
const connectDB = require("./config/db");
const initializeSocket=require("./socket/socket")
const PORT = process.env.PORT || 5000;

// Create HTTP Server
const server = http.createServer(app);
// Connect Database
connectDB();

initializeSocket(server)
// Start Server
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});