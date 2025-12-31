import React, { useState } from "react";
import axios from "axios";
import AnimatedBackground from "./AnimatedBackground";
import "./styles/styles.css";
import "./styles/profile.css";
import Header from "../layouts/Header";
import Footer from "../layouts/Footer";

function Register() {
  const API = process.env.REACT_APP_API;

  const [avatarUrl, setAvatarUrl] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");

  // role is always "user" here
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAvatarFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    setAvatarFile(file);
    setAvatarPreview(previewUrl);
  };

  const uploadAvatarIfNeeded = async () => {
    if (!avatarFile) return avatarUrl;

    const formData = new FormData();
    formData.append("avatar", avatarFile);

    const res = await axios.post(`${API}/profile/avatar-public`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return res.data.avatarUrl;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    setLoading(true);

    try {
      let finalAvatarUrl = "";
      if (avatarFile) {
        finalAvatarUrl = await uploadAvatarIfNeeded();
        setAvatarUrl(finalAvatarUrl);
      }

      await axios.post(`${API}/auth/register`, {
        ...form,
        role: "user", // force user role
      });

      setMsg("Account created successfully!");
      setForm({ name: "", email: "", password: "" });
      setAvatarFile(null);
      setAvatarPreview("");
    } catch (err) {
      console.error("Register failed:", err);
      const text =
        err.response?.data?.error || err.message || "Failed to create user";
      setMsg(text);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-page-wrapper">
          <AnimatedBackground />
          <Header title="Register User" />
    <div className="profile-page-wrapper">
    

      <div className="profile-page">
        <div className="page-wrap">
          <div className="panel-glass profile-panel animated-panel">
            <h2 className="page-title" style={{ textAlign: "center" }}>
              Create Account
            </h2>

            <div className="profile-panel">
              {/* LEFT: avatar selection */}
              <div className="profile-left">
                <div className="avatar-circle">
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt="avatar"
                      style={{
                        width: "100%",
                        height: "100%",
                        borderRadius: "50%",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    (form.name || "U").charAt(0).toUpperCase()
                  )}
                </div>

                <div style={{ marginTop: "0.5rem" }}>
                  <p className="muted">Upload a profile picture:</p>

                  <label
                    className="btn-primary"
                    style={{ padding: "0.3rem 0.6rem", cursor: "pointer" }}
                  >
                    Upload from device
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={handleAvatarFileChange}
                    />
                  </label>
                </div>
              </div>

              {/* RIGHT: registration form */}
              <div className="profile-right">
                <div className="auth-panel register-panel">
                  <form onSubmit={handleSubmit} className="auth-form">
                    <label>Name</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) =>
                        setForm({ ...form, name: e.target.value })
                      }
                      required
                      disabled={loading}
                    />

                    <label>Email</label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) =>
                        setForm({ ...form, email: e.target.value })
                      }
                      required
                      disabled={loading}
                    />

                    <label>Password</label>
                    <input
                      type="password"
                      value={form.password}
                      onChange={(e) =>
                        setForm({ ...form, password: e.target.value })
                      }
                      required
                      disabled={loading}
                    />

                    {/* role selector removed - always user */}

                    <button
                      className="btn-primary"
                      type="submit"
                      disabled={loading}
                    >
                      {loading ? "Registering..." : "Register"}
                    </button>

                    {msg && (
                      <div className="info" style={{ marginTop: "0.5rem" }}>
                        {msg}
                      </div>
                    )}
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
</div>
      <Footer />
    </div>
  );
}

export default Register;
