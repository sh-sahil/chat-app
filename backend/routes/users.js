const express = require("express");
const User = require("../models/User");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");

// Get all users
router.get("/", authMiddleware, async (req, res) => {
  try {
    const loggedInUser = req.user;
    console.log(loggedInUser);
    const users = await User.find({ _id: { $ne: loggedInUser } }); // Exclude logged-in user
    res.json(users);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
