// frontend/src/layouts/Header.js
import React from "react";
import { Link } from "react-router-dom";
import "../components/styles/styles.css";
// Remove this line: import employeeIcon from "../assets/employee-icon.png"; 

function Header({ title, onLogout }) {
  return (
    <header className="app-header">
      <div className="page-wrap header-wrap">
        <div className="app-title-container">
          <h2 className="page-title">{title || "AdminSphere"}</h2>
          {/* Use the public path directly */}
          <img src="/assets/employee.png" alt="App Icon" className="app-icon" />
        </div>

        {onLogout ? (
          <button className="btn-logout" onClick={onLogout}>
            Logout
          </button>
        ) : (
          <Link to="/login" className="small-links">
            Login
          </Link>
        )}
      </div>
    </header>
  );
}

export default Header;
