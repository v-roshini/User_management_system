// frontend/src/components/Login.js (UPDATED WITH ANIMATED DESIGN)
import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import Header from "../layouts/Header";
import Footer from "../layouts/Footer";
import AnimatedBackground from "./AnimatedBackground";
import "./styles/styles.css";
import "./styles/animated-bg.css";

function Login() {
  const [roleType, setRoleType] = useState("user");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isAttemptingLogin, setIsAttemptingLogin] = useState(false);

  const API = process.env.REACT_APP_API;
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    // STEP 1: Frontend role mismatch check - NO BACKEND CALL
    if (roleType === "head" && email.includes("@user.com")) {
      setError(
        "User credentials cannot access Admin panel. Switch to User login and try again."
      );
      return;
    }

    if (roleType === "user" && email.includes("@admin.com")) {
      setError(
        "Admin credentials cannot access User panel. Switch to Admin login and try again."
      );
      return;
    }

    // STEP 2: Allow backend verification only for matching role patterns
    setIsAttemptingLogin(true);

    try {
      const res = await axios.post(
        `${API}/auth/login`,
        { email, password },
        { withCredentials: true }
      );

      // STEP 3: Double-check role AFTER backend success (final security)
      if (res.data.role !== roleType) {
        setError(
          `This account is registered as ${res.data.role}. Please select the correct role and try again.`
        );
        setIsAttemptingLogin(false);
        return;
      }

      // SUCCESS: Save user data
      localStorage.setItem("role", res.data.role);
      localStorage.setItem("email", res.data.email);
      localStorage.setItem("name", res.data.name);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("userId", res.data.userId);

      if (res.data.permissions) {
        localStorage.setItem(
          "permissions",
          JSON.stringify(res.data.permissions)
        );
      }

      // Smart return logic
      const returnPath =
        localStorage.getItem("returnPath") ||
        localStorage.getItem("previousPath") ||
        (res.data.role === "head" ? "/admin" : "/profile");

      localStorage.removeItem("returnPath");
      localStorage.removeItem("previousPath");

      navigate(returnPath, { replace: true });
    } catch (err) {
      // Generic error - encourages retry without revealing backend details
      const errorMsg =
        err.response?.status === 401
          ? "Invalid credentials for selected role. Please check and try again."
          : "Login failed. Please try again.";
      setError(errorMsg);
    } finally {
      setIsAttemptingLogin(false);
    }
  };

  return (
    <>
      <AnimatedBackground />
      <Header />

      <div className="auth-card login-card">
        <div className="auth-left">
          <div className="auth-hero">
            <div className="profile-image-circle">
              <img
                src="/assets/login-art.png"
                alt="Login Art"
                className="auth-illustration"
              />
            </div>
          </div>
        </div>

        <div className="auth-right">
          <div className="auth-panel animated-panel">
            <h2>Welcome back</h2>
            <p className="muted">Login to your account</p>

            <div className="role-box">
              <label className="role-option">
                <input
                  type="radio"
                  value="user"
                  checked={roleType === "user"}
                  onChange={() => setRoleType("user")}
                  disabled={isAttemptingLogin}
                />
                <span>User Login</span>
              </label>

              <label className="role-option">
                <input
                  type="radio"
                  value="head"
                  checked={roleType === "head"}
                  onChange={() => setRoleType("head")}
                  disabled={isAttemptingLogin}
                />
                <span>Admin Login</span>
              </label>
            </div>

            <form onSubmit={handleLogin} className="auth-form">
              <label>Email</label>
              <input
                type="email"
                placeholder="Email ID"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isAttemptingLogin}
              />

              <label>Password</label>
              <input
                type="password"
                placeholder="Enter Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isAttemptingLogin}
              />

              <button
                className="btn-primary"
                type="submit"
                disabled={isAttemptingLogin}
              >
                {isAttemptingLogin ? "Logging in..." : "Login"}
              </button>

              {error && <div className="error">{error}</div>}

              <div className="small-links">
                <Link to="/register" className="link">
                  Create Account
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}

export default Login;