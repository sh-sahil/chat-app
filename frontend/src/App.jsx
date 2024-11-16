import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import axios from "axios";
import UserList from "./components/UserList";
import ChatWindow from "./components/ChatWindow";
import Login from "./components/Login";
import Register from "./components/Register";
import "./App.css";

function App() {
  const [token, setToken] = useState("");
  const [username, setUsername] = useState("");
  const [selectedUser, setSelectedUser] = useState("");

  const handleUserClick = username => {
    setSelectedUser(username);
  };

  const handleLogout = () => {
    setToken("");
    setUsername("");
  };

  useEffect(() => {
    if (token) {
      axios
        .get("http://localhost:3000/api/users", {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then(response => {
          setUsername(response.data.username); // Assuming response has username
          localStorage.setItem("username", response.data.username);
        })
        .catch(() => {
          handleLogout(); // If token is invalid, log out the user
        });
    }
  }, [token]);

  return (
    <Router>
      <div>
        <nav>
          <ul>
            {!token ? (
              <>
                <li>
                  <Link to="/login">Login</Link>
                </li>
                <li>
                  <Link to="/register">Register</Link>
                </li>
              </>
            ) : (
              <li>
                <button onClick={handleLogout}>Logout</button>
              </li>
            )}
          </ul>
        </nav>
        <Routes>
          <Route path="/login" element={<Login setToken={setToken} setUsername={setUsername} />} />
          <Route
            path="/register"
            element={<Register setToken={setToken} setUsername={setUsername} />}
          />
          <Route
            path="/"
            element={
              token ? (
                <>
                  <h1>Real-time Chat</h1>
                  <p>Welcome, {username}!</p>
                  <UserList token={token} onUserClick={handleUserClick} />
                  {selectedUser && (
                    <ChatWindow selectedUser={selectedUser} token={token} username={username} />
                  )}
                </>
              ) : (
                <h2>Please log in to access the chat</h2>
              )
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
