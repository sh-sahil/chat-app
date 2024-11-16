import styles from "./Landing.module.css";
import { useNavigate } from "react-router-dom";
export default function Landing() {
  const navigate = useNavigate();
  return (
    <div className={styles.topLevelLanding}>
      <div className={styles.heading}>
        <h1>Chatting App</h1>
        <h2>Chat like never before!!</h2>
      </div>

      <div className={styles.landingContainer}>
        <p>
          Don't have an account?
          <button
            onClick={() => {
              navigate("/register");
            }}
          >
            Register
          </button>
        </p>
        <p>
          Already have an account?
          <button
            onClick={() => {
              navigate("/login");
            }}
          >
            Login
          </button>
        </p>
      </div>
    </div>
  );
}
