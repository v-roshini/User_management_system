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
import Attendance from "./components/Attendance";  // ← ADD THIS

function ProtectedRoute({ children, allowedRoles }) {
  const role = localStorage.getItem("role");

  if (!role) {
    localStorage.setItem("returnPath", window.location.pathname);
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(role)) {
    const redirectPath = role === "head" ? "/admin" : "/profile";
    return <Navigate to={redirectPath} replace />;
  }

  return children;
}

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

        {/* admin-only routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["head"]}>
              <Admin />
            </ProtectedRoute>
          }
        >
          {/* ← NESTED INSIDE /admin */}
          <Route path="attendance" element={<Attendance />} />
        </Route>

        {/* catch-all */}
        <Route path="*" element={<Navigate to="/profile" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
