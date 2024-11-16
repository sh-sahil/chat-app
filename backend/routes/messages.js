const express = require("express");
const Message = require("../models/Message");
const router = express.Router();

// Middleware for authentication
const authMiddleware = require("../middleware/authMiddleware");

// Get message history
router.get("/:username", authMiddleware, async (req, res) => {
  const { sender, receiver } = req.body;
  try {
    const messages = await Message.find({
      $or: [{ sender, receiver }],
    }).sort({ timestamp: 1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

router.post("/", authMiddleware, async (req, res) => {
  const { sender, receiver, content } = req.body;
  try {
    const newMessage = new Message({ sender, receiver, content });
    await newMessage.save();
    res.json(newMessage);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
