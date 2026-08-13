const express = require("express");
const {sendMessage,getMessages} = require("../controllers/message.controller");
const protectMiddleware = require("../middlewares/auth.middleware");
const router = express.Router();
router.post("/",protectMiddleware,sendMessage);
router.get("/:conversationId",protectMiddleware,getMessages);
module.exports = router;