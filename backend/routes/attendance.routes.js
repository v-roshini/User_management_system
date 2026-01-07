import express from "express";
import * as attendanceCtrl from "../controllers/attendance.controller.js";
import { authMiddleware as auth } from "../middleware/auth.js";

const router = express.Router();

// User
router.get("/today/:userId", auth, attendanceCtrl.getTodayAttendance);
router.post("/checkin", auth, attendanceCtrl.checkin);
router.post("/checkout", auth, attendanceCtrl.checkout);
router.post("/early-checkin", auth, attendanceCtrl.earlyCheckin);
router.post("/early-checkout", auth, attendanceCtrl.earlyCheckout);

// Admin  
router.get("/admin/today", auth, attendanceCtrl.getTodayAttendanceAdmin);
router.patch("/admin/:id/approve-early-checkin", auth, attendanceCtrl.approveEarlyCheckin);
router.patch("/admin/:id/approve-early-checkout", auth, attendanceCtrl.approveEarlyCheckout);

export default router;
