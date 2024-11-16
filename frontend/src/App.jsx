import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import UserList from "./components/UserList";
import ChatWindow from "./components/ChatWindow";
import Login from "./components/Login";
import Register from "./components/Register";
import Landing from "./components/Landing";
import "./App.css";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [username, setUsername] = useState(localStorage.getItem("username") || "");
  const [selectedUser, setSelectedUser] = useState("");

  const handleUserClick = username => {
    setSelectedUser(username);
  };

  const handleLogout = () => {
    setToken("");
    setUsername("");
    localStorage.removeItem("token");
    localStorage.removeItem("username");
  };

  return (
    <Router>
      <div className="app">
        <Routes>
          {!token ? (
            <Route path="/" element={<Landing />} />
          ) : (
            <>
              <Route
                path="/"
                element={
                  <ChatWindow username={username} token={token} handleLogout={handleLogout} />
                }
              />
            </>
          )}
          <Route path="/login" element={<Login setToken={setToken} setUsername={setUsername} />} />
          <Route
            path="/register"
            element={<Register setToken={setToken} username={username} setUsername={setUsername} />}
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
