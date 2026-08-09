const User = require("../models/user.model");
const jwt = require("jsonwebtoken")
const { generateAccessToken,
  generateRefreshToken } = require("../utils/token");

const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check required fields;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Check existing user
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User already exists",
      });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
    });

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log(email);
    console.log(password);

    // Check required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and Password are required",
      });
    }

    // Find User
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Compare Password
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Generate Tokens
    const accessToken = generateAccessToken(user._id);

    const refreshToken = generateRefreshToken(user._id);

    const cookieOptions = {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
    };

    res.cookie("accessToken", accessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000, // 15 minutes
    })
      .cookie("refreshToken", refreshToken, {
        ...cookieOptions,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      })
      .status(200)
      .json({
        success: true,
        message: "Login Successful",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
        },
      });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const logoutUser = async (req, res) => {
  try {
    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
    })
      .clearCookie("refreshToken", {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
      })
      .status(200)
      .json({
        success: true,
        message: "Logged out successfully",
      });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
const getMe = async (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user,
  });
};
const refreshAccessToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: "Refresh token not found",
      });
    }

    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET
    );

    const user = await User.findById(decoded.userId);
    console.log(user)
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    const newAccessToken = generateAccessToken(user._id);

    res.cookie("accessToken", newAccessToken, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        maxAge: 15 * 60 * 1000,
      })
      .status(200)
      .json({
        success: true,
        message: "Access token refreshed successfully",
      });
  } catch (error) {
    console.error(error);

    return res.status(401).json({
      success: false,
      message: "Invalid or expired refresh token",
    });
  }
};

const googleCallback = async (req, res) => {
  try {
    const accessToken = generateAccessToken(req.user._id);
    const refreshToken = generateRefreshToken(req.user._id);

    res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        maxAge: 15 * 60 * 1000,
      })
      .cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .redirect(process.env.CLIENT_URL);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Google authentication failed",
    });
  }
};
module.exports = {
  registerUser,
  loginUser,
  getMe,
  logoutUser,
  refreshAccessToken,
  googleCallback
};