const express = require("express");

const { registerUser ,loginUser,getMe} = require("../controllers/auth.controller");
const protectMiddleware=require("../middlewares/auth.middleware");
const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me",protectMiddleware,getMe);



module.exports = router;