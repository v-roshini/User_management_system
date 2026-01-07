// backend/routes/attendance.routes.js
import express from "express";
import { auth } from "../middleware/auth.js"; // ✅ Named import
import * as attendanceCtrl from "../controllers/attendance.controller.js";

const router = express.Router();

// User attendance
router.get("/today/:userId", auth, attendanceCtrl.getTodayAttendance);
router.post("/checkin", auth, attendanceCtrl.checkin);
router.post("/checkout", auth, attendanceCtrl.checkout);
router.post("/early-checkin", auth, attendanceCtrl.requestEarlyCheckin);
router.post("/early-checkout", auth, attendanceCtrl.requestEarlyCheckout);

// Admin
router.get("/admin/today", auth, attendanceCtrl.getAdminTodayAttendance);
router.patch("/admin/:id/approve-early-checkin", auth, attendanceCtrl.approveEarlyCheckin);
router.patch("/admin/:id/approve-early-checkout", auth, attendanceCtrl.approveEarlyCheckout);

export default router;
