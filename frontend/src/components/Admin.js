import React, { useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";
import AnimatedBackground from "../components/AnimatedBackground";
import Header from "../layouts/Header";
import Footer from "../layouts/Footer";
import "./styles/profile.css";
import "./styles/styles.css";
import "./styles/animated-bg.css";

function Admin() {
  const API = process.env.REACT_APP_API;

  const [users, setUsers] = useState([]);
  const [activeMenu, setActiveMenu] = useState("dashboard");
  const [isMenuOpen, setIsMenuOpen] = useState(true);
  const menuRef = useRef(null);

  /* ================= FETCH USERS ================= */
  const loadUsers = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!API || !token) return;

    try {
      const res = await axios.get(`${API}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data.users || res.data || []);
    } catch (err) {
      console.error("Failed to load users", err);
      setUsers([]);
    }
  }, [API]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  /* ================= MENU CLOSE ON OUTSIDE CLICK ================= */
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* ================= ACTIVATE / DEACTIVATE ================= */
  const toggleActive = async (userId) => {
    const token = localStorage.getItem("token");
    try {
      await axios.put(
        `${API}/admin/users/${userId}/toggle-active`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      loadUsers();
    } catch (err) {
      console.error("Toggle failed", err);
    }
  };

  /* ================= TABLES ================= */
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
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.id}</td>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>{u.role}</td>
                <td>
                  <span className={`tag ${u.active ? "active" : "inactive"}`}>
                    {u.active ? "Active" : "Inactive"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    }

    if (activeMenu === "manageUsers") {
      return (
        <table className="user-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.id}</td>
                <td>{u.name}</td>
                <td>
                  <button
                    className="btn-primary"
                    onClick={() => toggleActive(u.id)}
                  >
                    {u.active ? "Deactivate" : "Activate"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    }

    if (activeMenu === "attendance") {
      return (
        <table className="user-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Date</th>
              <th>Check In</th>
              <th>Check Out</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.name}</td>
                <td>{new Date().toLocaleDateString()}</td>
                <td>09:15</td>
                <td>18:45</td>
                <td>
                  <span className="tag inactive">Early Pending</span>
                </td>
                <td>
                  <button className="btn-primary">Approve</button>
                  <button className="btn-secondary">Reject</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    }

    return <p style={{ textAlign: "center" }}>Reports coming soon…</p>;
  };

  /* ================= UI ================= */
  return (
    <div className="profile-page-wrapper">
      <AnimatedBackground />
      <Header title="Admin Dashboard" />

      <div className="profile-page">
        <nav ref={menuRef} className={`menu ${isMenuOpen ? "active" : ""}`}>
          <ul className="permissions">
            <li onClick={() => setActiveMenu("dashboard")}>📊 Dashboard</li>
            <li onClick={() => setActiveMenu("manageUsers")}>👥 Manage Users</li>
            <li onClick={() => setActiveMenu("attendance")}>🕒 Attendance</li>
            <li onClick={() => setActiveMenu("reports")}>📈 Reports</li>
          </ul>
        </nav>

        <div className="profile-content">
          <div className="panel-glass animated-panel">
            {renderTable()}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default Admin;
