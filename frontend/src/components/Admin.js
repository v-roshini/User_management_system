// frontend/src/pages/Admin.jsx - UPDATED WITH ANIMATED DESIGN
import React, { useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";
import AnimatedBackground from "../components/AnimatedBackground";
import "./styles/profile.css";
import "./styles/styles.css";
import "./styles/animated-bg.css";
import Header from "../layouts/Header";
import Footer from "../layouts/Footer";

function Admin() {
  const API = process.env.REACT_APP_API;

  const [users, setUsers] = useState([]);
  const [activeMenu, setActiveMenu] = useState("dashboard");
  const [isMenuOpen, setIsMenuOpen] = useState(true);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const menuRef = useRef(null);

  // admin profile state
  const storedName = localStorage.getItem("name") || "Admin";
  const storedEmail = localStorage.getItem("email") || "";
  const rawRole = localStorage.getItem("role") || "admin";

  // Treat head as admin in UI
  const role = rawRole === "head" ? "admin" : rawRole;

  const storedAvatarUrl = localStorage.getItem("avatarUrl") || "";
  const [avatarUrl, setAvatarUrl] = useState(storedAvatarUrl);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(storedAvatarUrl || "");
  const [nameInput, setNameInput] = useState(storedName);
  const [emailInput, setEmailInput] = useState(storedEmail);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // permissions modal state
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [permissions, setPermissions] = useState({
    dashboard: false,
    attendance: false,
    registrationForm: false,
  });

  // NEW: create head user form state
  const [createHeadForm, setCreateHeadForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [creatingHead, setCreatingHead] = useState(false);
  const [createHeadMsg, setCreateHeadMsg] = useState("");

  // Block back to login
  useEffect(() => {
    const handlePopState = () => {
      const r = localStorage.getItem("role");
      if (r === "head" && window.location.pathname === "/admin") {
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

  // Fetch all users
  const loadUsers = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!API || !token) return;

    try {
      const res = await axios.get(`${API}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data.users || res.data || []);
    } catch (err) {
      console.error("Error fetching users:", err.response?.data || err.message);
      setUsers([]);
    }
  }, [API]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // Fetch admin profile (for avatar/name/email)
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
        console.error("Error loading admin profile", err);
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

  const toggleMenu = () => setIsMenuOpen((prev) => !prev);

  const handleLogout = () => setShowLogoutConfirm(true);

  const confirmLogout = () => {
    localStorage.clear();
    window.location.replace("/login");
  };

  // Avatar handlers
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
        {
          name: nameTrimmed,
          email: emailTrimmed,
          avatarUrl: finalAvatarUrl,
        },
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

  // Toggle user active
  const toggleActive = async (userId) => {
    const token = localStorage.getItem("token");
    try {
      const res = await axios.put(
        `${API}/admin/users/${userId}/toggle-active`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const updatedUser = res.data.user || { id: userId, active: res.data.active };
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, active: updatedUser.active } : u))
      );
    } catch (err) {
      console.error("Toggle active failed:", err.response?.data || err.message);
    }
  };

  // Permissions modal
const openPermissions = (user) => {
  setSelectedUser(user);
  // FIXED: Safety check prevents crash
  const perms = Array.isArray(user.permissions) ? user.permissions : [];
  setPermissions({
    dashboard: perms.includes("dashboard"),
    attendance: perms.includes("attendance"),
    registrationForm: perms.includes("registrationForm"),
  });
  setShowModal(true);
};


  const savePermissions = async () => {
    if (!selectedUser) return;
    const token = localStorage.getItem("token");
    const newPerms = Object.entries(permissions)
      .filter(([, v]) => v)
      .map(([k]) => k);

    try {
      const res = await axios.put(
        `${API}/admin/users/${selectedUser.id}/permissions`,
        { permissions: newPerms },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setUsers((prev) =>
        prev.map((u) =>
          u.id === selectedUser.id ? { ...u, permissions: res.data.permissions } : u
        )
      );
      setShowModal(false);
    } catch (err) {
      console.error("Save permissions failed:", err.response?.data || err.message);
    }
  };


  // NEW: create head user from admin page
  const handleCreateHead = async (e) => {
    e.preventDefault();
    setCreateHeadMsg("");
    if (!createHeadForm.name || !createHeadForm.email || !createHeadForm.password) return;

    try {
      setCreatingHead(true);
      const token = localStorage.getItem("token");

      await axios.post(
        `${API}/admin/create-head`,
        {
          ...createHeadForm,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setCreateHeadMsg("Head user created successfully");
      setCreateHeadForm({ name: "", email: "", password: "" });
      await loadUsers();
    } catch (err) {
      setCreateHeadMsg(
        err.response?.data?.error || err.message || "Failed to create head user"
      );
    } finally {
      setCreatingHead(false);
    }
  };

  // Tables per menu
  const renderTable = () => {
    if (activeMenu === "dashboard") {
      return (
        <table className="user-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: "center" }}>
                  No users found
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td className="role-tag">{user.role}</td>
                  <td>
                    {user.active ? (
                      <span className="tag active">Active</span>
                    ) : (
                      <span className="tag inactive">Inactive</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      );
    }

    if (activeMenu === "manageUsers") {
      return (
        <>
          {/* create head form only visible here */}
          <div className="panel-glass" style={{ marginBottom: "1rem" }}>
            <h3>Create Head User</h3>
            <form onSubmit={handleCreateHead} className="auth-form">
              <label>Name</label>
              <input
                type="text"
                value={createHeadForm.name}
                onChange={(e) =>
                  setCreateHeadForm({ ...createHeadForm, name: e.target.value })
                }
                disabled={creatingHead}
                required
              />
              <label>Email</label>
              <input
                type="email"
                value={createHeadForm.email}
                onChange={(e) =>
                  setCreateHeadForm({ ...createHeadForm, email: e.target.value })
                }
                disabled={creatingHead}
                required
              />
              <label>Password</label>
              <input
                type="password"
                value={createHeadForm.password}
                onChange={(e) =>
                  setCreateHeadForm({ ...createHeadForm, password: e.target.value })
                }
                disabled={creatingHead}
                required
              />
              <button className="btn-primary" type="submit" disabled={creatingHead}>
                {creatingHead ? "Creating..." : "Create Head"}
              </button>
              {createHeadMsg && (
                <div className="info" style={{ marginTop: "0.5rem" }}>
                  {createHeadMsg}
                </div>
              )}
            </form>
          </div>

          <table className="user-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name of Employee</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan="3" style={{ textAlign: "center" }}>
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.id}</td>
                    <td>{user.name}</td>
                    <td>
                      <button
                        className="btn-primary"
                        onClick={() => toggleActive(user.id)}
                      >
                        {user.active ? "Deactivate" : "Activate"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </>
      );
    }

    if (activeMenu === "permissions") {
      return (
        <table className="user-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name of Employee</th>
              <th>Permissions</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan="4" style={{ textAlign: "center" }}>
                  No users found
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.name}</td>
                  <td>
                    <button
                      className="btn-secondary"
                      onClick={() => openPermissions(user)}
                    >
                      View / Edit Permissions
                    </button>
                  </td>
                  <td>
                    <button
                      className="btn-primary"
                      onClick={() => toggleActive(user.id)}
                    >
                      {user.active ? "Deactivate" : "Activate"}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      );
    }

    return <p style={{ textAlign: "center" }}>Reports coming soon…</p>;
  };

  return (
    <div className="profile-page-wrapper">
      <AnimatedBackground />
      <Header title="Admin Dashboard" onLogout={handleLogout} />

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

        {/* Sidebar menu */}
        <nav ref={menuRef} className={`menu ${isMenuOpen ? "active" : ""}`}>
          <div className="menu-header">Admin Dashboard</div>
          <ul className="permissions">
            <li
              className={activeMenu === "dashboard" ? "active-menu-item" : ""}
              onClick={() => setActiveMenu("dashboard")}
            >
              📊 Dashboard
            </li>
            <li
              className={activeMenu === "manageUsers" ? "active-menu-item" : ""}
              onClick={() => setActiveMenu("manageUsers")}
            >
              👥 Manage Users
            </li>
            <li
              className={activeMenu === "permissions" ? "active-menu-item" : ""}
              onClick={() => setActiveMenu("permissions")}
            >
              ⚙️ Permissions
            </li>
            <li
              className={activeMenu === "reports" ? "active-menu-item" : ""}
              onClick={() => setActiveMenu("reports")}
            >
              📈 Reports
            </li>
          </ul>
        </nav>

        <div className={`profile-content ${isMenuOpen ? "shift" : ""}`}>
          <div className="page-wrap">
            <div className="panel-glass animated-panel">
              <h2 className="page-title" style={{ textAlign: "center" }}>
                {activeMenu === "dashboard" && "Admin Dashboard"}
                {activeMenu === "manageUsers" && "Manage Users"}
                {activeMenu === "permissions" && "Permissions"}
                {activeMenu === "reports" && "Reports"}
              </h2>

              <div className="profile-panel">
                {/* LEFT: admin profile */}
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
                      (nameInput || storedName)?.charAt(0)?.toUpperCase() || "A"
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
                        Edit Profile
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
                          disabled={saving || !nameInput.trim() || !emailInput.trim()}
                          onClick={handleSaveProfile}
                        >
                          {saving ? "Saving..." : "Save Profile"}
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
                

                {/* RIGHT: tables */}
                <div className="profile-right">
                  <div className="profile-info">
                    <p>
                      <strong>Name:</strong> {nameInput || storedName}
                    </p>
                    <p>
                      <strong>Email:</strong> {emailInput || storedEmail}
                    </p>
                    <p>
                      <strong>Role:</strong> {role}
                    </p>
                  </div>

                  <div style={{ marginTop: "2rem" }}>{renderTable()}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Permissions modal */}
        {showModal && (
          <div className="modal">
            <div className="modal-card">
              <h3>Edit Permissions for {selectedUser?.name}</h3>

              <label>
                <input
                  type="checkbox"
                  checked={permissions.dashboard}
                  onChange={(e) =>
                    setPermissions({
                      ...permissions,
                      dashboard: e.target.checked,
                    })
                  }
                />
                Dashboard
              </label>

              <label>
                <input
                  type="checkbox"
                  checked={permissions.attendance}
                  onChange={(e) =>
                    setPermissions({
                      ...permissions,
                      attendance: e.target.checked,
                    })
                  }
                />
                Attendance
              </label>

              <label>
                <input
                  type="checkbox"
                  checked={permissions.registrationForm}
                  onChange={(e) =>
                    setPermissions({
                      ...permissions,
                      registrationForm: e.target.checked,
                    })
                  }
                />
                Registration Form
              </label>

              <div className="modal-actions">
                <button className="btn-primary" onClick={savePermissions}>
                  Save
                </button>
                <button
                  className="btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
        

        {/* Logout Confirmation Modal */}
        {showLogoutConfirm && (
          <div className="modal">
            <div className="modal-card">
              <h3>Confirm Logout</h3>
              <p>Are you sure you want to logout from Admin?</p>
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

export default Admin;
