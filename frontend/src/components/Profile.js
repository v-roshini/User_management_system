import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import AnimatedBackground from "./AnimatedBackground";
import Header from "../layouts/Header";
import Footer from "../layouts/Footer";
import Attendance from "./Attendance";
import "./styles/profile.css";
import "./styles/styles.css";
import "./styles/animated-bg.css";

function Profile() {
  const API = process.env.REACT_APP_API;
  
  // ALL YOUR EXISTING STATE
  const [permissions, setPermissions] = useState([]);
  const [isMenuOpen, setIsMenuOpen] = useState(true);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [activeMenu, setActiveMenu] = useState("dashboard");
  const menuRef = useRef(null);

  const storedName = localStorage.getItem("name");
  const storedEmail = localStorage.getItem("email");
  const role = localStorage.getItem("role") || "user";

  // ALL YOUR EXISTING useEffects (click outside, fetch permissions)
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");
    if (!API || !token || !userId) return;

    const fetchPermissions = async () => {
      try {
        const res = await axios.get(`${API}/user/permissions/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setPermissions(res.data?.permissions || []);
      } catch (err) {
        console.error("Error fetching permissions:", err?.response?.data || err?.message);
        setPermissions([]);
      }
    };
    fetchPermissions();
  }, [API]);

  // ALL YOUR EXISTING HANDLERS
  const toggleMenu = () => setIsMenuOpen(p => !p);
  const handleLogout = () => setShowLogoutConfirm(true);
  const confirmLogout = () => {
    localStorage.clear();
    window.location.replace("/login");
  };

  const can = (perm) => Array.isArray(permissions) ? permissions.includes(perm) : false;

  // FIXED: Content rendering - Attendance tab now works perfectly
  return (
    <div className="profile-page-wrapper">
      <AnimatedBackground />
      <Header title="My Profile" onLogout={handleLogout} />
      <div className="profile-page">
        {/* EXACT SAME overlay + menu toggler */}
        <div className={`overlay ${isMenuOpen ? 'visible' : ''}`} onClick={() => setIsMenuOpen(false)} />
        <button className={`menu-toggler ${isMenuOpen ? 'active' : ''}`} onClick={toggleMenu} type="button">
          <span />
        </button>
        
        {/* EXACT SAME sidebar nav - just fixed attendance tab */}
        <nav ref={menuRef} className={`menu ${isMenuOpen ? 'active' : ''}`}>
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
            {/* FIXED: Attendance tab - now properly clickable + renders Attendance component */}
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

        {/* EXACT SAME profile-content structure */}
        <div className={`profile-content ${isMenuOpen ? 'shift' : ''}`}>
          <div className="page-wrap">
            <div className="panel-glass animated-panel">
              <h2 className="page-title" style={{ textAlign: 'center' }}>Your Profile</h2>
              
              <div className="profile-panel">
                {/* LEFT: EXACT SAME basic info */}
                <div className="profile-left">
                  <h3>{storedName}</h3>
                  <p className="muted">{storedEmail}</p>
                  <p className="muted">{role}</p>
                </div>

                {/* RIGHT: FIXED content switching */}
                <div className="profile-right" style={{ marginTop: '1rem' }}>
                  {/* Dashboard tab */}
                  {activeMenu === "dashboard" && can("dashboard") && (
                    <div>
                      <h3>Dashboard</h3>
                      <p>Welcome back, {storedName}!</p>
                    </div>
                  )}
                  
                  {/* FIXED: Attendance tab - now renders full Attendance component */}
                  {activeMenu === "attendance" && can("attendance") && (
                    <div style={{ width: '100%' }}>
                      <Attendance />
                    </div>
                  )}
                  
                  {/* No permission message */}
                  {!can(activeMenu) && (
                    <div style={{ textAlign: 'center', padding: '2rem' }}>
                      <p>No access to this section</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* EXACT SAME logout modal */}
      {showLogoutConfirm && (
        <div className="modal">
          <div className="modal-card">
            <h3>Confirm Logout</h3>
            <p>Are you sure you want to logout?</p>
            <div className="modal-actions">
              <button className="btn-primary" onClick={confirmLogout}>Yes, Logout</button>
              <button className="btn-logout" onClick={() => setShowLogoutConfirm(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default Profile;
