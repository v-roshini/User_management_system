// src/App.js
import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
  useLocation,
} from "react-router-dom";

import Login from "./components/Login";
import Profile from "./components/Profile";
import Admin from "./components/Admin";
import Register from "./components/Register";

function ProtectedRoute({ children, allowedRoles }) {
  const role = localStorage.getItem("role");

  // Not logged in → send to login and remember path
  if (!role) {
    localStorage.setItem("returnPath", window.location.pathname);
    return <Navigate to="/login" replace />;
  }

  // Logged in but wrong role → send to correct default page
  if (!allowedRoles.includes(role)) {
    const redirectPath = role === "head" ? "/admin" : "/profile";
    return <Navigate to={redirectPath} replace />;
  }

  return children;
}

// Block direct login when already logged in
function LoginGuard() {
  const location = useLocation();
  const role = localStorage.getItem("role");

  useEffect(() => {
    if (role && location.pathname === "/login") {
      const defaultPath = role === "head" ? "/admin" : "/profile";
      window.location.replace(defaultPath);
    }
  }, [role, location.pathname]);

  return <Login />;
}

function App() {
  return (
    <Router>
      <Routes>
        {/* default */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* public routes */}
        <Route path="/login" element={<LoginGuard />} />
        <Route path="/register" element={<Register />} />

        {/* user-only */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute allowedRoles={["user"]}>
              <Profile />
            </ProtectedRoute>
          }
        />

        {/* admin-only main page */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["head"]}>
              <Admin />
            </ProtectedRoute>
          }
        />


        {/* catch-all */}
        <Route path="*" element={<Navigate to="/profile" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
