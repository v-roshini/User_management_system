import React, { useState, useEffect } from "react";
import axios from "axios";
import Header from "../layouts/Header";
import Footer from "../layouts/Footer";
import AnimatedBackground from "./AnimatedBackground";
import "./styles/profile.css"; // Reuse for neat formatting

const API = process.env.REACT_APP_API;

function Attendance() {
  const [attendance, setAttendance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const now = new Date();
  const istTime = now.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' });
  const [hours, minutes] = istTime.split(':').map(Number);
  const timeInMinutes = hours * 60 + minutes;
  const CHECKIN_DEADLINE = 9 * 60 + 30; // 9:30 AM
  const CHECKOUT_START = 18 * 60 + 30; // 6:30 PM

  const fetchTodayAttendance = async () => {
    if (!userId || !token) {
      setMsg("Please login again");
      return;
    }
    try {
      setLoading(true);
      const res = await axios.get(`${API}/attendance/today/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAttendance(res.data);
      setMsg("");
    } catch (err) {
      console.error("Error fetching attendance:", err);
      setAttendance(null);
      setMsg(err.response?.data?.error || "Failed to load attendance");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodayAttendance();
  }, []);

  const handleCheckin = async () => {
    if (timeInMinutes > CHECKIN_DEADLINE) return setMsg("Check-in only before 9:30 AM IST");
    if (attendance?.checkinTime) return setMsg("Already checked in today");
    setLoading(true);
    try {
      await axios.post(`${API}/attendance/checkin`, { userId, date: today.toISOString().split('T')[0] }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMsg("Checked in successfully!");
      fetchTodayAttendance();
    } catch (err) {
      setMsg(err.response?.data?.error || "Check-in failed");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = async () => {
    if (timeInMinutes < CHECKOUT_START) return setMsg("Check-out only after 6:30 PM IST");
    if (!attendance?.checkinTime) return setMsg("Must check-in first");
    if (attendance?.checkoutTime) return setMsg("Already checked out today");
    setLoading(true);
    try {
      await axios.post(`${API}/attendance/checkout`, { userId, date: today.toISOString().split('T')[0] }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMsg("Checked out successfully!");
      fetchTodayAttendance();
    } catch (err) {
      setMsg(err.response?.data?.error || "Check-out failed");
    } finally {
      setLoading(false);
    }
  };

  const handleEarlyCheckin = async () => {
    setLoading(true);
    try {
      await axios.post(`${API}/attendance/early-checkin`, { userId, date: today.toISOString().split('T')[0] }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMsg("Early check-in requested. Await admin approval.");
      fetchTodayAttendance();
    } catch (err) {
      setMsg(err.response?.data?.error || "Request failed");
    } finally {
      setLoading(false);
    }
  };

  const handleEarlyCheckout = async () => {
    setLoading(true);
    try {
      await axios.post(`${API}/attendance/early-checkout`, { userId, date: today.toISOString().split('T')[0] }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMsg("Early check-out requested. Await admin approval.");
      fetchTodayAttendance();
    } catch (err) {
      setMsg(err.response?.data?.error || "Request failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-page-wrapper">
      <AnimatedBackground />
      <Header title="Attendance" />
      <div className="profile-page">
        <div className="profile-content">
          <div className="page-wrap">
            <div className="panel-glass animated-panel">
              <h2>Mark Attendance</h2>
              <div className="attendance-actions" style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <p><strong>Today:</strong> {today.toLocaleDateString()}</p>
                <p><strong>Time:</strong> {istTime} IST</p>
                {attendance && (
                  <p><strong>Status:</strong> {attendance.checkinTime ? (attendance.checkoutTime ? 'Checked Out' : 'Checked In') : 'Pending'}</p>
                )}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                <button className="btn-primary" onClick={handleCheckin} disabled={loading}>
                  {loading ? "Processing..." : "Check In"}
                </button>
                <button className="btn-primary" onClick={handleCheckout} disabled={loading}>
                  {loading ? "Processing..." : "Check Out"}
                </button>
                <button className="btn-secondary" onClick={handleEarlyCheckin} disabled={loading}>
                  Early Check In
                </button>
                <button className="btn-secondary" onClick={handleEarlyCheckout} disabled={loading}>
                  Early Check Out
                </button>
              </div>
              {msg && <p className="info" style={{ textAlign: 'center', color: msg.includes('success') ? 'green' : 'red' }}>{msg}</p>}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default Attendance;
