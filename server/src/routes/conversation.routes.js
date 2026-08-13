const express = require("express");
const {
  createConversation,
  getMyConversations,
  getConversation,
} = require("../controllers/conversation.controller");
const protectMiddleware = require("../middlewares/auth.middleware");
const router = express.Router();
router.post("/",protectMiddleware,createConversation);
router.get("/",protectMiddleware,getMyConversations);
router.get("/:conversationId",protectMiddleware,getConversation);

module.exports = router;