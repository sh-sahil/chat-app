const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const socketIo = require("socket.io");
const dotenv = require("dotenv");
const Message = require("./models/Message");
const User = require("./models/User"); // Import User model

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
    credentials: true,
  },
});

app.use(express.json());
app.use(cors());

const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const messageRoutes = require("./routes/messages");
const connectDB = require("./config/db");

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/messages", messageRoutes);

connectDB();

io.on("connection", socket => {
  console.log(`A user connected: ${socket.id}`);

  // Listen for the 'user-connected' event to set online status
  socket.on("user-connected", username => {
    console.log(`${username} is online`);

    // Broadcast the user's online status to all clients
    socket.emit("user-status", { username, isOnline: false });
  });

  socket.on("user-disconnected", username => {
    socket.emit("user-status", { username, isOnline: false });
  });

  // Listen for messages and save them to the database
  socket.on("send-message", message => {
    console.log("Message received:", message);
    const newMessage = new Message(message);
    newMessage
      .save()
      .then(() => {
        io.emit("new-message", message); // Broadcast new message to all users
        console.log("Message saved and broadcasted:", message);
      })
      .catch(err => {
        console.error("Error saving message:", err.message);
      });
  });

  // Update user's lastSeen status and set isOnline to false when they disconnect
  socket.on("disconnect", () => {
    console.log(`A user disconnected: ${socket.id}`);
  });
});

// Start server
server.listen(3000, () => {
  console.log("Server running on port 3000");
});
