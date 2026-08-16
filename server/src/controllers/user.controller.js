const User = require("../models/user.model");
const searchUsers = async (req, res) => {
  try {
    const { search } = req.query;

    if (!search || !search.trim()) {
      return res.status(200).json({
        success: true,
        users: [],
      });
    }

    const users = await User.find({
      $or: [
        {
          name: {
            $regex: search,
            $options: "i",
          },
        },
        {
          email: {
            $regex: search,
            $options: "i",
          },
        },
      ],
      _id: {
        $ne: req.user._id,
      },
    }).select("_id name email avatar");

    res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    console.error("Search users error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to search users",
    });
  }
};

module.exports = {searchUsers};