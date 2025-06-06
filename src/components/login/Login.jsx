import React, { useState } from "react";
import "./Login.css";
import PracticeTime from "../../assets/practiceTime.jpg";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import firebaseServices from "../firebase/firebaseSetup";
import { FaArrowRight } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { IoEyeOffOutline, IoEyeOutline } from "react-icons/io5";

const Login = ({ onLoginSuccess }) => {
  const { auth, db, ref, set } = firebaseServices;
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const handleUsernamePasswordAuth = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!username || !password) {
      setError("Username and password are required");
      setLoading(false);
      return;
    }

    // Convert username to email format by appending @gmail.com
    const email = `${username}@gmail.com`;

    try {
      let userCredential;

      if (isSignUp) {
        // Create new user account
        userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
      } else {
        // Sign in existing user
        userCredential = await signInWithEmailAndPassword(
          auth,
          email,
          password
        );
      }

      const user = userCredential.user;

      if (user) {
        // Save user data in Realtime Database if signing up
        if (isSignUp) {
          const userRef = ref(db, `users/${user.uid}`);
          await set(userRef, {
            name: username,
            email: user.email,
            uid: user.uid,
            loginDate: new Date().toISOString(),
          });
        }

        // Save user login status in localStorage
        localStorage.setItem(
          "user",
          JSON.stringify({
            name: username,
            email: user.email,
            uid: user.uid,
          })
        );

        // Use the onLoginSuccess prop instead of navigate
        onLoginSuccess();
      }
    } catch (error) {
      console.error("Authentication error:", error);

      // Handle specific error codes
      if (
        error.code === "auth/wrong-password" ||
        error.code === "auth/user-not-found"
      ) {
        setError("Invalid username or password");
      } else if (error.code === "auth/email-already-in-use") {
        setError("Username already exists. Please try another or sign in.");
      } else if (error.code === "auth/weak-password") {
        setError("Password is too weak. Use at least 6 characters.");
      } else {
        setError(`Authentication failed: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="loginWrapper">
      <div className="loginContainer">
        {/* <img src={PracticeTime} alt="Practice Time" /> */}
        <img
          src={PracticeTime}
          alt="Practice Time"
          onClick={() => navigate("/")}
          style={{ cursor: "pointer" }} // Optional: change cursor to pointer
        />

        <form onSubmit={handleUsernamePasswordAuth} className="loginForm">
          <div className="login-text-box">
            {error && <div className="errorMessage">{error}</div>}

            <div className="formGroup">
              <input
                type="text"
                placeholder="Enter User Name or Phone Number"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="formGroup">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter Your Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
              <span
                className="eyeIcon"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <IoEyeOffOutline /> : <IoEyeOutline />}
              </span>
            </div>
          </div>

          <button type="submit" className="loginButton" disabled={loading}>
            {loading ? (
              "Processing..."
            ) : (
              <>
                {isSignUp ? "Sign Up" : "Login"}{" "}
                <FaArrowRight className="arrowIcon" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
