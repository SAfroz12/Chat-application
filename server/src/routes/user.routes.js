const express = require("express");
const router = express.Router();

const {searchUsers,} = require("../controllers/user.controller");

const protectMiddleware = require("../middlewares/auth.middleware");

router.get("/search",protectMiddleware,searchUsers);

module.exports = router;