const express = require("express");
const User = require("../models/User");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");

// Get all users
router.get("/", authMiddleware, async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.user.userId } }); // Exclude logged-in user
    res.json(users);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
