import React, { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import { faker } from "@faker-js/faker";
import styles from "./ChatWindow.module.css";

const socket = io("https://chat-app-wxag.onrender.com");

function ChatWindow({ token, username, handleLogout }) {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [message, setMessage] = useState("");

  const chatHistoryRef = useRef(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get("https://chat-app-wxag.onrender.com/api/users/", {
          body: { username },
          headers: { Authorization: `Bearer ${token}` },
        });
        const fetchedUsers = response.data;

        setUsers(
          fetchedUsers.map(user => ({
            ...user,
            avatar: faker.image.avatar(),
            isOnline: user.isOnline || true,
          }))
        );
      } catch (error) {
        console.error("Error fetching users", error);
      }
    };

    fetchUsers();
  }, [token]);

  useEffect(() => {
    if (selectedUser) {
      const fetchChatHistory = async () => {
        try {
          const response = await axios.get(
            `https://chat-app-wxag.onrender.com/api/messages/${username}`,
            {
              headers: { Authorization: `Bearer ${token}` },
              params: { receiver: selectedUser.username },
            }
          );
          setChatHistory(response.data);
        } catch (error) {
          console.error("Error fetching messages", error);
        }
      };

      fetchChatHistory();
    }
  }, [selectedUser, username, token]);

  useEffect(() => {
    const handleNewMessage = newMessage => {
      if (
        (newMessage.sender === username && newMessage.receiver === selectedUser?.username) ||
        (newMessage.receiver === username && newMessage.sender === selectedUser?.username)
      ) {
        setChatHistory(prev => [...prev, { ...newMessage, timestamp: new Date().toISOString() }]);
      }
    };

    socket.on("new-message", handleNewMessage);

    return () => {
      socket.off("new-message", handleNewMessage);
    };
  }, [selectedUser, username]);

  useEffect(() => {
    socket.emit("user-connected", username);

    const handleUserStatus = ({ username: user, isOnline }) => {
      setUsers(prev => prev.map(u => (u.username === user ? { ...u, isOnline } : u)));
    };

    socket.on("user-status", handleUserStatus);

    return () => {
      socket.emit("user-disconnected", username);
      socket.off("user-status", handleUserStatus);
    };
  }, [username]);

  const sendMessage = useCallback(() => {
    if (!message || !selectedUser) return;

    const newMessage = {
      sender: username,
      receiver: selectedUser.username,
      content: message,
    };

    socket.emit("send-message", newMessage);
    setMessage("");
  }, [message, selectedUser, username]);

  useEffect(() => {
    if (chatHistoryRef.current) {
      chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const handleKeyPress = event => {
    if (event.key === "Enter") {
      sendMessage();
    }
  };

  return (
    <div className={styles.chatContainer}>
      <div className={styles.navbar}>
        <span className={styles.username}>{username}</span>
        <button onClick={handleLogout}>Logout</button>
      </div>

      <div className={styles.mainContent}>
        <div className={styles.userList}>
          <div className={styles.leftChatHeader}>Chats</div>
          {users.map(user => (
            <div
              key={user.username}
              className={`${styles.userItem} ${
                selectedUser?.username === user.username ? styles.activeUser : ""
              }`}
              onClick={() => setSelectedUser(user)}
            >
              <img src={user.avatar} alt="Profile" className={styles.profilePicture} />
              <div className={styles.userDetails}>
                <span className={styles.userName}>{user.username}</span>
                <span className={styles.userStatus}>{user.isOnline ? "Online" : "Offline"}</span>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.chatWindow}>
          {selectedUser ? (
            <>
              <div className={styles.chatHeader}>
                <img
                  src={selectedUser.avatar}
                  alt="Profile"
                  className={styles.profilePictureHeader}
                />
                <span className={styles.chatHeaderUsername}>{selectedUser.username}</span>
              </div>

              <div className={styles.chatHistory} ref={chatHistoryRef}>
                {chatHistory.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`${styles.message} ${
                      msg.sender === username ? styles.sent : styles.received
                    }`}
                  >
                    <div className={styles.messageContent}>{msg.content}</div>
                    <span className={styles.timestamp}>
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </div>

              <div className={styles.chatInput}>
                <input
                  type="text"
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Type a message"
                />
                <button onClick={sendMessage}>Send</button>
              </div>
            </>
          ) : (
            <div className={styles.noChatSelected}>Select a user to chat</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default React.memo(ChatWindow);
