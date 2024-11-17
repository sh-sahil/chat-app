const express = require("express");
const Message = require("../models/Message");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

router.get("/:username", authMiddleware, async (req, res) => {
  const sender = req.params.username;
  const receiver = req.query.receiver;
  try {
    const messages = await Message.find({
      $or: [
        { sender, receiver },
        { sender: receiver, receiver: sender },
      ],
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
