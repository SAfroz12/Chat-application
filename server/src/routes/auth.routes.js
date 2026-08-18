const express = require("express");
const passport=require("../config/passport")
const { registerUser ,loginUser,getMe,
    logoutUser,refreshAccessToken,googleCallback
} = require("../controllers/auth.controller");
const protectMiddleware=require("../middlewares/auth.middleware");
const router = express.Router();
router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me",protectMiddleware,getMe);
router.post("/logout", logoutUser);
router.post("/refresh", refreshAccessToken);
router.get("/google",passport.authenticate("google", {
    scope: ["profile", "email"],
     prompt: "select_account"
  })
);
router.get("/google/callback",passport.authenticate("google", {
    session: false,
    failureRedirect: `${process.env.CLIENT_URL}/login`,
  }),
  googleCallback
);

module.exports = router;