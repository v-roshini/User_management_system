// src/pages/Attendance.jsx - NEW COMPONENT FOR USERS
import React, { useState, useEffect } from 'react';
import { Calendar } from 'react-calendar';
import axios from 'axios';
import Header from '../layouts/Header';
import Footer from '../layouts/Footer';
import AnimatedBackground from './AnimatedBackground';
import './styles/profile.css'; // Reuse styles

const API = process.env.REACT_APP_API_URL;
const userId = localStorage.getItem('userId');
const token = localStorage.getItem('token');

function Attendance() {
  const [value, setValue] = useState(new Date());
  const [attendance, setAttendance] = useState(null);
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  const today = new Date();
  today.setHours(0, 0, 0, 0); // Normalize to start of day

  const now = new Date();
  const istTime = now.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' });
  const [hours, minutes] = istTime.split(':').map(Number);
  const timeInMinutes = hours * 60 + minutes;

  const CHECKIN_DEADLINE = 9 * 60 + 30; // 9:30 AM
  const CHECKOUT_START = 18 * 60 + 30; // 6:30 PM

  useEffect(() => {
    fetchTodayAttendance();
  }, []);

  const fetchTodayAttendance = async () => {
    try {
      const res = await axios.get(`${API}/attendance/today/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTodayAttendance(res.data);
    } catch (err) {
      console.error('Error fetching attendance:', err);
    }
  };

  const handleCheckin = async () => {
    if (timeInMinutes > CHECKIN_DEADLINE) {
      setMsg('Check-in allowed only before 9:30 AM IST');
      return;
    }
    if (todayAttendance?.checkinTime) {
      setMsg('Already checked in today');
      return;
    }
    setLoading(true);
    try {
      await axios.post(`${API}/attendance/checkin`, { userId, date: today.toISOString().split('T')[0] });
      setMsg('Checked in successfully');
      fetchTodayAttendance();
    } catch (err) {
      setMsg(err.response?.data?.error || 'Check-in failed');
    }
    setLoading(false);
  };

  const handleCheckout = async () => {
    if (timeInMinutes < CHECKOUT_START) {
      setMsg('Check-out allowed only after 6:30 PM IST');
      return;
    }
    if (!todayAttendance?.checkinTime) {
      setMsg('Must check-in first');
      return;
    }
    if (todayAttendance?.checkoutTime) {
      setMsg('Already checked out today');
      return;
    }
    setLoading(true);
    try {
      await axios.post(`${API}/attendance/checkout`, { userId, date: today.toISOString().split('T')[0] });
      setMsg('Checked out successfully');
      fetchTodayAttendance();
    } catch (err) {
      setMsg(err.response?.data?.error || 'Check-out failed');
    }
    setLoading(false);
  };

  const handleEarlyCheckin = async () => {
    setLoading(true);
    try {
      await axios.post(`${API}/attendance/early-checkin`, { userId, date: today.toISOString().split('T')[0] });
      setMsg('Early check-in requested. Await admin approval.');
    } catch (err) {
      setMsg(err.response?.data?.error || 'Request failed');
    }
    setLoading(false);
  };

  const handleEarlyCheckout = async () => {
    setLoading(true);
    try {
      await axios.post(`${API}/attendance/early-checkout`, { userId, date: today.toISOString().split('T')[0] });
      setMsg('Early check-out requested. Await admin approval.');
    } catch (err) {
      setMsg(err.response?.data?.error || 'Request failed');
    }
    setLoading(false);
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
              <Calendar
                onChange={setValue}
                value={value}
                tileDisabled={({ date }) => date < today}
                className="attendance-calendar"
              />
              <div className="attendance-actions">
                <p>Today: {today.toLocaleDateString()}</p>
                <p>Time: {istTime} IST</p>
                {todayAttendance && (
                  <p>Status: Checked In {todayAttendance.checkinTime ? `@ ${todayAttendance.checkinTime}` : ''} {todayAttendance.checkoutTime ? `| Out @ ${todayAttendance.checkoutTime}` : ''}</p>
                )}
                <div>
                  <button className="btn-primary" onClick={handleCheckin} disabled={loading}>
                    {loading ? 'Processing...' : 'Check In'}
                  </button>
                  <button className="btn-primary" onClick={handleCheckout} disabled={loading}>
                    {loading ? 'Processing...' : 'Check Out'}
                  </button>
                  <button className="btn-secondary" onClick={handleEarlyCheckin} disabled={loading}>
                    Early Check In
                  </button>
                  <button className="btn-secondary" onClick={handleEarlyCheckout} disabled={loading}>
                    Early Check Out
                  </button>
                </div>
                {msg && <p className="info">{msg}</p>}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default Attendance;
