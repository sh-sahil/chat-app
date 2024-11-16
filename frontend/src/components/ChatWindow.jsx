import React, { useState, useEffect } from "react";
import axios from "axios";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

function ChatWindow({ selectedUser, token, username }) {
  const [chatHistory, setChatHistory] = useState([]);
  const [message, setMessage] = useState("");

  // Fetch previous chat history when the selected user or token changes
  useEffect(() => {
    if (selectedUser) {
      axios
        .get("http://localhost:5000/api/messages", {
          headers: { Authorization: `Bearer ${token}` },
          params: { sender: username, receiver: selectedUser },
        })
        .then(response => setChatHistory(response.data))
        .catch(error => console.error("Error fetching messages", error));
    }
  }, [selectedUser, token, username]);

  // Listen for new messages and update the chat history in real-time
  useEffect(() => {
    socket.on("new-message", message => {
      if (
        (message.sender === username && message.receiver === selectedUser) ||
        (message.receiver === username && message.sender === selectedUser)
      ) {
        setChatHistory(prev => [...prev, message]);
      }
    });

    // Clean up the socket listener when component unmounts
    return () => {
      socket.off("new-message");
    };
  }, [selectedUser, username]);

  // Send a message
  const sendMessage = () => {
    if (!message) return;

    const newMessage = {
      sender: username,
      receiver: selectedUser,
      content: message,
    };

    socket.emit("send-message", newMessage);
    setMessage("");
  };

  return (
    <div>
      <div>
        {chatHistory.map((msg, idx) => (
          <div key={idx}>
            <strong>{msg.sender}:</strong> {msg.content}
            <span> ({new Date(msg.timestamp).toLocaleString()})</span>
          </div>
        ))}
      </div>
      <input
        type="text"
        value={message}
        onChange={e => setMessage(e.target.value)}
        placeholder="Type a message"
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
}

export default ChatWindow;
