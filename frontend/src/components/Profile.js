// UPDATED Profile.js with animated background
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import AnimatedBackground from "./AnimatedBackground";
import "./styles/profile.css";
import "./styles/styles.css";
import "./styles/animated-bg.css";
import Header from "../layouts/Header";
import Footer from "../layouts/Footer";

function Profile() {
  const API = process.env.REACT_APP_API;

  const [permissions, setPermissions] = useState([]);
  const [isMenuOpen, setIsMenuOpen] = useState(true);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [activeMenu, setActiveMenu] = useState("dashboard");
  const menuRef = useRef(null);

  const storedName = localStorage.getItem("name") || "User";
  const storedEmail = localStorage.getItem("email") || "";
  const role = localStorage.getItem("role");

  // avatar state
  const storedAvatarUrl = localStorage.getItem("avatarUrl") || "";
  const [avatarUrl, setAvatarUrl] = useState(storedAvatarUrl);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(storedAvatarUrl || "");

  // Edit profile state
  const [editing, setEditing] = useState(false);
  const [nameInput, setNameInput] = useState(storedName);
  const [emailInput, setEmailInput] = useState(storedEmail);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Dashboard data
  const name = localStorage.getItem("name") || "User";
  const email = localStorage.getItem("email") || "";
  const userRole = localStorage.getItem("role") || "";

  // Registration form state (for users with registrationForm permission)
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // Block back to login
  useEffect(() => {
    const handlePopState = () => {
      const role = localStorage.getItem("role");
      if (role && window.location.pathname === "/profile") {
        window.history.pushState(null, "", window.location.href);
      }
    };

    window.addEventListener("popstate", handlePopState);
    window.history.pushState(null, "", window.location.pathname);

    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // Remember previous path
  useEffect(() => {
    localStorage.setItem("previousPath", window.location.pathname);
  }, []);

  // Fetch permissions
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");
    if (!API || !token || !userId) return;

    async function fetchPermissions() {
      try {
        const res = await axios.get(`${API}/user/permissions/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPermissions(res.data.permissions || []);
      } catch (err) {
        console.error(
          "Error fetching permissions:",
          err.response?.data || err.message
        );
        setPermissions([]);
      }
    }

    fetchPermissions();
  }, [API]);

  // Fetch profile (name + email + avatar) from backend
  useEffect(() => {
    const token = localStorage.getItem("token");
    const email = localStorage.getItem("email");
    if (!API || !token || !email) return;

    (async () => {
      try {
        const res = await axios.get(`${API}/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
            email,
          },
        });
        if (res.data) {
          if (res.data.name) {
            localStorage.setItem("name", res.data.name);
            setNameInput(res.data.name);
          }
          if (res.data.email) {
            localStorage.setItem("email", res.data.email);
            setEmailInput(res.data.email);
          }
          if (res.data.avatarUrl) {
            localStorage.setItem("avatarUrl", res.data.avatarUrl);
            setAvatarUrl(res.data.avatarUrl);
            setAvatarPreview(res.data.avatarUrl);
          }
        }
      } catch (err) {
        console.error("Error loading profile", err);
      }
    })();
  }, [API]);

  // Click outside menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const handleLogout = () => setShowLogoutConfirm(true);

  const confirmLogout = () => {
    localStorage.clear();
    window.location.replace("/login");
  };

  const can = (perm) => permissions.includes(perm);

  // Registration form handlers
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
      const errText =
        err.response?.data?.error || "Registration failed. Try again.";
      setMsg(errText);
    } finally {
      setLoading(false);
    }
  };

  // avatar handlers
  const handleAvatarFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    setAvatarFile(file);
    setAvatarPreview(previewUrl);
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
    return res.data.avatarUrl;
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

      localStorage.setItem("name", res.data.name);
      localStorage.setItem("email", res.data.email);
      localStorage.setItem("avatarUrl", res.data.avatarUrl || "");

      setNameInput(res.data.name);
      setEmailInput(res.data.email);
      setAvatarUrl(res.data.avatarUrl || "");
      setAvatarPreview(res.data.avatarUrl || "");
      setAvatarFile(null);

      setEditing(false);
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Update failed");
    } finally {
      setSaving(false);
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
          className={`menu__toggler ${isMenuOpen ? "active" : ""}`}
          onClick={toggleMenu}
        >
          <span />
        </button>

        <nav ref={menuRef} className={`menu ${isMenuOpen ? "active" : ""}`}>
          <div className="menu-header">User Menu</div>
          <ul className="permissions">
            {can("dashboard") && (
              <li
                className={activeMenu === "dashboard" ? "active" : ""}
                onClick={() => setActiveMenu("dashboard")}
              >
                Dashboard
              </li>
            )}

            {can("registrationForm") && (
              <li
                className={activeMenu === "register" ? "active" : ""}
                onClick={() => setActiveMenu("register")}
              >
                Registration Form
              </li>
            )}

            {can("attendance") && (
              <li
                className={activeMenu === "attendance" ? "active" : ""}
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
                {/* LEFT: avatar + editable profile */}
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
                      (nameInput || storedName)?.charAt(0)?.toUpperCase() || "U"
                    )}
                  </div>

                  {editing && (
                    <div style={{ marginTop: "0.5rem" }}>
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

                      <p
                        className="muted"
                        style={{ marginTop: "0.4rem", fontSize: "0.8rem" }}
                      >
                        ✓ Device photos will be saved permanently
                      </p>
                    </div>
                  )}

                  {!editing ? (
                    <>
                      <h3>{nameInput || storedName}</h3>
                      <p className="muted">{emailInput || storedEmail}</p>
                      <p className="muted">{role}</p>
                      <button
                        className="btn-primary"
                        type="button"
                        onClick={() => {
                          setNameInput(localStorage.getItem("name") || "");
                          setEmailInput(localStorage.getItem("email") || "");
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
                      <input
                        type="text"
                        value={nameInput}
                        onChange={(e) => setNameInput(e.target.value)}
                        placeholder="Your name"
                        disabled={saving}
                        style={{
                          padding: "0.4rem",
                          marginTop: "0.6rem",
                          marginBottom: "0.4rem",
                          width: "100%",
                        }}
                      />
                      <input
                        type="email"
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        placeholder="Your email"
                        disabled={saving}
                        style={{
                          padding: "0.4rem",
                          marginBottom: "0.4rem",
                          width: "100%",
                        }}
                      />
                      <div style={{ display: "flex", gap: "0.5rem" }}>
                        <button
                          className="btn-primary"
                          type="button"
                          disabled={
                            saving ||
                            !nameInput.trim() ||
                            !emailInput.trim()
                          }
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
                            setNameInput(
                              localStorage.getItem("name") || ""
                            );
                            setEmailInput(
                              localStorage.getItem("email") || ""
                            );
                            setAvatarUrl(
                              localStorage.getItem("avatarUrl") || ""
                            );
                            setAvatarPreview(
                              localStorage.getItem("avatarUrl") || ""
                            );
                            setAvatarFile(null);
                            setError("");
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                      {error && (
                        <p
                          className="info"
                          style={{ marginTop: "0.4rem", color: "red" }}
                        >
                          {error}
                        </p>
                      )}
                      <p className="muted" style={{ marginTop: "0.4rem" }}>
                        {role}
                      </p>
                    </>
                  )}
                </div>

                {/* RIGHT: dashboard / forms */}
                <div className="profile-right">
                  <div style={{ marginTop: "1rem" }}>
                    {activeMenu === "dashboard" && can("dashboard") && (
                      <div>
                        <h3 style={{ marginBottom: "1rem" }}>Dashboard</h3>
                        <p>Welcome back, {name}!</p>

                        <div className="cards-row">
                          <div className="card-small">
                            <h4>Your Email</h4>
                            <p>{email}</p>
                          </div>

                          <div className="card-small">
                            <h4>Your Role</h4>
                            <p>{userRole}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeMenu === "register" &&
                      can("registrationForm") && (
                        <div>
                          <h3 style={{ marginBottom: "1rem" }}>
                            User Registration
                          </h3>

                          <form
                            className="auth-form"
                            onSubmit={handleRegister}
                          >
                            <label>Name</label>
                            <input
                              type="text"
                              name="name"
                              placeholder="Full name"
                              value={form.name}
                              onChange={handleChange}
                              required
                              disabled={loading}
                            />

                            <label>Email</label>
                            <input
                              type="email"
                              name="email"
                              placeholder="user@example.com"
                              value={form.email}
                              onChange={handleChange}
                              required
                              disabled={loading}
                            />

                            <label>Password</label>
                            <input
                              type="password"
                              name="password"
                              placeholder="Create a password"
                              value={form.password}
                              onChange={handleChange}
                              required
                              disabled={loading}
                            />

                            <button
                              className="btn-primary"
                              type="submit"
                              disabled={loading}
                            >
                              {loading ? "Creating..." : "Create User"}
                            </button>

                            {msg && (
                              <div
                                className="info"
                                style={{ marginTop: "1rem" }}
                              >
                                {msg}
                              </div>
                            )}
                          </form>
                        </div>
                      )}

                    {activeMenu === "attendance" && can("attendance") && (
                      <p>Attendance page coming soon…</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {showLogoutConfirm && (
          <div className="modal">
            <div className="modal-card">
              <h3>Confirm Logout</h3>
              <p>Are you sure you want to logout?</p>
              <div className="modal-actions">
                <button className="btn-primary" onClick={confirmLogout}>
                  Yes, Logout
                </button>
                <button
                  className="btn-logout"
                  onClick={() => setShowLogoutConfirm(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}

export default Profile;
