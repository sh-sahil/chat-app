import React, { useState, useEffect } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import styles from "./ChatWindow.module.css"; // Import the CSS module

const socket = io("http://localhost:3000");

function ChatWindow({ token, username, handleLogout }) {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [message, setMessage] = useState("");

  // Fetch all users
  useEffect(() => {
    axios
      .get("http://localhost:3000/api/users/", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(response => setUsers(response.data))
      .catch(error => console.error("Error fetching users", error));
  }, [token]);

  // Fetch chat history for the selected user
  useEffect(() => {
    if (selectedUser) {
      axios
        .get(`http://localhost:3000/api/messages/${username}`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { receiver: selectedUser.username },
        })
        .then(response => setChatHistory(response.data))
        .catch(error => console.error("Error fetching messages", error));
    }
  }, [selectedUser, token, username]);

  // Listen for new messages
  useEffect(() => {
    socket.on("new-message", newMessage => {
      if (
        (newMessage.sender === username && newMessage.receiver === selectedUser?.username) ||
        (newMessage.receiver === username && newMessage.sender === selectedUser?.username)
      ) {
        console.log(newMessage);
        setChatHistory(prev => [...prev, { ...newMessage, timestamp: new Date().toISOString() }]);
      }
    });

    return () => {
      socket.off("new-message");
    };
  }, [selectedUser, username]);

  // Send a message
  const sendMessage = () => {
    if (!message || !selectedUser) return;

    const newMessage = {
      sender: username,
      receiver: selectedUser.username,
      content: message,
    };

    socket.emit("send-message", newMessage);

    setMessage("");
  };

  return (
    <div className={styles.chatContainer}>
      {/* Navbar */}
      <div className={styles.navbar}>
        <span className={styles.username}>{username}</span>
        <button onClick={handleLogout}>Logout</button>
      </div>

      {/* Main Content: Left Section (User List) and Right Section (Chat Window) */}
      <div className={styles.mainContent}>
        {/* Left Section: User List */}
        <div className={styles.userList}>
          {users.map(user => (
            <div
              key={user.username}
              className={`${styles.userItem} ${
                selectedUser?.username === user.username ? styles.activeUser : ""
              }`}
              onClick={() => setSelectedUser(user)} // Set the full user object
            >
              {user.username}
            </div>
          ))}
        </div>

        {/* Right Section: Chat Window */}
        <div className={styles.chatWindow}>
          {selectedUser ? (
            <>
              <div className={styles.chatHeader}>
                Chat with <strong>{selectedUser.username}</strong>
              </div>
              <div className={styles.chatHistory}>
                {chatHistory.length > 0 ? (
                  chatHistory.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`${styles.message} ${
                        msg.sender === username ? styles.sent : styles.received
                      }`}
                    >
                      <strong>{msg.sender}:</strong> {msg.content}
                      <span className={styles.timestamp}>
                        ({new Date(msg.timestamp).toLocaleTimeString()})
                      </span>
                    </div>
                  ))
                ) : (
                  <p>No messages yet.</p>
                )}
              </div>
              <div className={styles.chatInput}>
                <input
                  type="text"
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="Type a message"
                />
                <button onClick={sendMessage}>Send</button>
              </div>
            </>
          ) : (
            <div className={styles.noChatSelected}>Select a user to start chatting</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ChatWindow;
