import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

import AnimatedBackground from "./AnimatedBackground";
import Header from "../layouts/Header";
import Footer from "../layouts/Footer";

import Attendance from "./Attendance"; // <-- your user attendance UI component

import "./styles/profile.css";
import "./styles/styles.css";
import "./styles/animated-bg.css";

function Profile() {
  const API = process.env.REACT_APP_API; // <-- standard env key
  const menuRef = useRef(null);

  // Permissions + menu
  const [permissions, setPermissions] = useState([]);
  const [activeMenu, setActiveMenu] = useState("dashboard");
  const [isMenuOpen, setIsMenuOpen] = useState(true);

  // Logout modal
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // User stored info
  const storedName = localStorage.getItem("name") || "";
  const storedEmail = localStorage.getItem("email") || "";
  const storedRole = localStorage.getItem("role") || "user";

  // Profile edit state
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [nameInput, setNameInput] = useState(storedName);
  const [emailInput, setEmailInput] = useState(storedEmail);

  // Avatar
  const storedAvatarUrl = localStorage.getItem("avatarUrl") || "";
  const [avatarUrl, setAvatarUrl] = useState(storedAvatarUrl);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(storedAvatarUrl);

  // Registration form (if user has permission)
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const can = (perm) => Array.isArray(permissions) && permissions.includes(perm);

  // Close menu on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch permissions
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");
    if (!API || !token || !userId) return;

    (async () => {
      try {
        const res = await axios.get(`${API}/user/permissions/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPermissions(res.data?.permissions || []);
      } catch (err) {
        console.error("Error fetching permissions:", err?.response?.data || err?.message);
        setPermissions([]);
      }
    })();
  }, [API]);

  // Fetch profile (name/email/avatar)
  useEffect(() => {
    const token = localStorage.getItem("token");
    const email = localStorage.getItem("email");
    if (!API || !token || !email) return;

    (async () => {
      try {
        const res = await axios.get(`${API}/profile`, {
          headers: { Authorization: `Bearer ${token}`, email },
        });

        if (res.data?.name) {
          localStorage.setItem("name", res.data.name);
          setNameInput(res.data.name);
        }
        if (res.data?.email) {
          localStorage.setItem("email", res.data.email);
          setEmailInput(res.data.email);
        }
        if (res.data?.avatarUrl) {
          localStorage.setItem("avatarUrl", res.data.avatarUrl);
          setAvatarUrl(res.data.avatarUrl);
          setAvatarPreview(res.data.avatarUrl);
        }
      } catch (err) {
        console.error("Error loading profile:", err?.response?.data || err?.message);
      }
    })();
  }, [API]);

  const toggleMenu = () => setIsMenuOpen((prev) => !prev);

  const handleLogout = () => setShowLogoutConfirm(true);
  const confirmLogout = () => {
    localStorage.clear();
    window.location.replace("/login");
  };

  // Avatar upload
  const handleAvatarFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const uploadAvatarIfNeeded = async () => {
    if (!avatarFile) return avatarUrl;

    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("avatar", avatarFile);

    const res = await axios.post(`${API}/profile/avatar`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });

    return res.data?.avatarUrl || avatarUrl;
  };

  const handleSaveProfile = async () => {
    const nameTrimmed = nameInput.trim();
    const emailTrimmed = emailInput.trim();
    if (!nameTrimmed || !emailTrimmed) return;

    setSaving(true);
    setError("");

    try {
      const finalAvatarUrl = await uploadAvatarIfNeeded();
      const token = localStorage.getItem("token");

      const res = await axios.put(
        `${API}/profile`,
        { name: nameTrimmed, email: emailTrimmed, avatarUrl: finalAvatarUrl },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      localStorage.setItem("name", res.data?.name || nameTrimmed);
      localStorage.setItem("email", res.data?.email || emailTrimmed);
      localStorage.setItem("avatarUrl", res.data?.avatarUrl || finalAvatarUrl);

      setNameInput(res.data?.name || nameTrimmed);
      setEmailInput(res.data?.email || emailTrimmed);
      setAvatarUrl(res.data?.avatarUrl || finalAvatarUrl);
      setAvatarPreview(res.data?.avatarUrl || finalAvatarUrl);

      setAvatarFile(null);
      setEditing(false);
    } catch (err) {
      setError(err?.response?.data?.error || err?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  // Registration form (if enabled)
  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setMsg("");
    setLoading(true);

    try {
      await axios.post(`${API}/auth/register`, {
        name: form.name,
        email: form.email,
        password: form.password,
        role: "user",
      });

      setMsg("User registered successfully. They can now login.");
      setForm({ name: "", email: "", password: "" });
    } catch (err) {
      setMsg(err?.response?.data?.error || "Registration failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-page-wrapper">
      <AnimatedBackground />
      <Header title="My Profile" onLogout={handleLogout} />

      <div className="profile-page">
        <div
          className={`overlay ${isMenuOpen ? "visible" : ""}`}
          onClick={() => setIsMenuOpen(false)}
        />

        <button
          className={`menu-toggler ${isMenuOpen ? "active" : ""}`}
          onClick={toggleMenu}
          type="button"
        >
          <span />
        </button>

        <nav ref={menuRef} className={`menu ${isMenuOpen ? "active" : ""}`}>
          <div className="menu-header">User Menu</div>

          <ul className="permissions">
            {can("dashboard") && (
              <li
                className={activeMenu === "dashboard" ? "active-menu-item" : ""}
                onClick={() => setActiveMenu("dashboard")}
              >
                Dashboard
              </li>
            )}

            {can("registrationForm") && (
              <li
                className={activeMenu === "register" ? "active-menu-item" : ""}
                onClick={() => setActiveMenu("register")}
              >
                Registration Form
              </li>
            )}

            {can("attendance") && (
              <li
                className={activeMenu === "attendance" ? "active-menu-item" : ""}
                onClick={() => setActiveMenu("attendance")}
              >
                Attendance
              </li>
            )}
          </ul>
        </nav>

        <div className={`profile-content ${isMenuOpen ? "shift" : ""}`}>
          <div className="page-wrap">
            <div className="panel-glass animated-panel">
              <h2 className="page-title" style={{ textAlign: "center" }}>
                Your Profile
              </h2>

              <div className="profile-panel">
                {/* LEFT */}
                <div className="profile-left">
                  <div className="avatar-circle">
                    {avatarPreview ? (
                      <img
                        src={avatarPreview}
                        alt="avatar"
                        style={{
                          width: 100,
                          height: 100,
                          borderRadius: "50%",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      <div className="avatar-placeholder">
                        {(nameInput || "U").charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>

                  {!editing ? (
                    <>
                      <h3>{nameInput}</h3>
                      <p className="muted">{emailInput}</p>
                      <p className="muted">{storedRole}</p>

                      <button
                        className="btn-primary"
                        type="button"
                        onClick={() => {
                          setNameInput(localStorage.getItem("name") || "");
                          setEmailInput(localStorage.getItem("email") || "");
                          setAvatarPreview(localStorage.getItem("avatarUrl") || "");
                          setEditing(true);
                          setError("");
                        }}
                        style={{ marginTop: "0.5rem" }}
                      >
                        Edit profile
                      </button>
                    </>
                  ) : (
                    <>
                      <label
                        className="btn-primary"
                        style={{ marginTop: "0.5rem", padding: "0.3rem 0.6rem", cursor: "pointer" }}
                      >
                        Upload from device
                        <input
                          type="file"
                          accept="image/*"
                          style={{ display: "none" }}
                          onChange={handleAvatarFileChange}
                        />
                      </label>

                      <p className="muted" style={{ marginTop: "0.4rem", fontSize: "0.8rem" }}>
                        Device photos will be saved permanently
                      </p>

                      <input
                        type="text"
                        value={nameInput}
                        onChange={(e) => setNameInput(e.target.value)}
                        placeholder="Your name"
                        disabled={saving}
                        style={{ padding: "0.4rem", marginTop: "0.6rem", marginBottom: "0.4rem", width: "100%" }}
                      />

                      <input
                        type="email"
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        placeholder="Your email"
                        disabled={saving}
                        style={{ padding: "0.4rem", marginBottom: "0.4rem", width: "100%" }}
                      />

                      <div style={{ display: "flex", gap: "0.5rem" }}>
                        <button
                          className="btn-primary"
                          type="button"
                          disabled={saving || !nameInput.trim() || !emailInput.trim()}
                          onClick={handleSaveProfile}
                        >
                          {saving ? "Saving..." : "Save"}
                        </button>

                        <button
                          className="btn-logout"
                          type="button"
                          disabled={saving}
                          onClick={() => {
                            setEditing(false);
                            setNameInput(localStorage.getItem("name") || "");
                            setEmailInput(localStorage.getItem("email") || "");
                            setAvatarUrl(localStorage.getItem("avatarUrl") || "");
                            setAvatarPreview(localStorage.getItem("avatarUrl") || "");
                            setAvatarFile(null);
                            setError("");
                          }}
                        >
                          Cancel
                        </button>
                      </div>

                      {error && (
                        <p className="info" style={{ marginTop: "0.4rem", color: "red" }}>
                          {error}
                        </p>
                      )}
                    </>
                  )}
                </div>

                {/* RIGHT */}
                <div className="profile-right">
                  {activeMenu === "dashboard" && can("dashboard") && (
                    <div>
                      <h3 style={{ marginBottom: "1rem" }}>Dashboard</h3>
                      <p>Welcome back, {nameInput}!</p>

                      <div className="cards-row">
                        <div className="card-small">
                          <h4>Your Email</h4>
                          <p>{emailInput}</p>
                        </div>

                        <div className="card-small">
                          <h4>Your Role</h4>
                          <p>{storedRole}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeMenu === "register" && can("registrationForm") && (
                    <div>
                      <h3 style={{ marginBottom: "1rem" }}>User Registration</h3>

                      <form className="auth-form" onSubmit={handleRegister}>
                        <label className="label">Name</label>
                        <input
                          type="text"
                          name="name"
                          placeholder="Full name"
                          value={form.name}
                          onChange={handleChange}
                          required
                          disabled={loading}
                        />

                        <label className="label">Email</label>
                        <input
                          type="email"
                          name="email"
                          placeholder="user@example.com"
                          value={form.email}
                          onChange={handleChange}
                          required
                          disabled={loading}
                        />

                        <label className="label">Password</label>
                        <input
                          type="password"
                          name="password"
                          placeholder="Create a password"
                          value={form.password}
                          onChange={handleChange}
                          required
                          disabled={loading}
                        />

                        <button className="btn-primary" type="submit" disabled={loading}>
                          {loading ? "Creating..." : "Create User"}
                        </button>

                        {msg && <div className="info" style={{ marginTop: "1rem" }}>{msg}</div>}
                      </form>
                    </div>
                  )}

                  {/* ✅ Attendance is rendered INSIDE Profile page */}
                  {activeMenu === "attendance" && can("attendance") && (
                    <Attendance />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Logout confirm modal */}
      {showLogoutConfirm && (
        <div className="modal">
          <div className="modal-card">
            <h3>Confirm Logout</h3>
            <p>Are you sure you want to logout?</p>
            <div className="modal-actions">
              <button className="btn-primary" onClick={confirmLogout}>
                Yes, Logout
              </button>
              <button className="btn-logout" onClick={() => setShowLogoutConfirm(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default Profile;
