// frontend/src/layouts/Footer.js
import React from "react";
import "../components/styles/styles.css";
// Remove this line: import employeeIcon from "../assets/employee-icon.png"; 

function Footer() {
  return (
    <footer className="app-footer">
      <div className="page-wrap">
        <div className="footer-content-wrap">
          <p className="muted">
            © {new Date().getFullYear()} Your App Name
          </p>
          {/* Use the public path directly */}
          <img src="/assets/employee.png" alt="App Icon" className="app-icon-footer" />
        </div>
      </div>
    </footer>
  );
}

export default Footer;
