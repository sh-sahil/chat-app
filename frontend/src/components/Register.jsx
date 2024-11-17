import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import styles from "./Register.module.css";

export default function Register({ setToken, username, setUsername }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const response = await axios.post("https://chat-app-wxag.onrender.com/api/auth/register", {
        username,
        email,
        password,
      });
      setToken(response.data.token);
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("username", username);
      navigate("/");
    } catch (err) {
      console.log(err);
      if (err.response.status === 409) {
        alert(err.response.data.msg);
      }
    }
  };

  return (
    <div className={styles.topLevelLanding}>
      <div className={styles.signupContainer}>
        <form onSubmit={handleSubmit} className={styles.signupForm}>
          <h2>Register</h2>
          <input
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
            placeholder="Username"
            required
            className={styles.inputField}
          />
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Email"
            required
            className={styles.inputField}
          />
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Password"
            required
            className={styles.inputField}
          />
          <button type="submit" className={styles.submitBtn}>
            Register
          </button>
        </form>
      </div>
    </div>
  );
}
