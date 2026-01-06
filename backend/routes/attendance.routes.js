import express from "express";
import {
  getTodayAttendance,
  checkin,
  checkout,
  earlyCheckin,
  earlyCheckout,
  getTodayAttendanceAdmin,
  approveEarlyCheckin,
  approveEarlyCheckout,
} from "../controllers/attendance.controller.js";

import auth from "../middleware/auth.js";          // JWT auth
import { authorizeRole } from "../middleware/auth.js"; // if you have role-based helper

const router = express.Router();

// ===== USER ROUTES =====
// /attendance/today/:userId
router.get("/today/:userId", auth, getTodayAttendance);

// /attendance/checkin  { userId, date? }
router.post("/checkin", auth, checkin);

// /attendance/checkout { userId, date? }
router.post("/checkout", auth, checkout);

// /attendance/early-checkin { userId, date? }
router.post("/early-checkin", auth, earlyCheckin);

// /attendance/early-checkout { userId, date? }
router.post("/early-checkout", auth, earlyCheckout);

// ===== ADMIN ROUTES (head only) =====
// /attendance/admin/today
router.get(
  "/admin/today",
  auth,
  authorizeRole ? authorizeRole(["head"]) : (req, res, next) => next(),
  getTodayAttendanceAdmin
);

// /attendance/admin/:id/approve-early-checkin
router.patch(
  "/admin/:id/approve-early-checkin",
  auth,
  authorizeRole ? authorizeRole(["head"]) : (req, res, next) => next(),
  approveEarlyCheckin
);

// /attendance/admin/:id/approve-early-checkout
router.patch(
  "/admin/:id/approve-early-checkout",
  auth,
  authorizeRole ? authorizeRole(["head"]) : (req, res, next) => next(),
  approveEarlyCheckout
);

export default router;
