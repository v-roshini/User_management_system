// backend/routes/admin.routes.js
import express from "express";
import {
  checkAdmin,
  getAllUsers,
  toggleUserStatus,
  updatePermissions,
  createHeadUser,          // NEW controller
} from "../controllers/admin.controller.js";
import { authMiddleware } from "../middleware/auth.js"; // should set req.user
import * as attendanceCtrl from "../controllers/attendance.controller.js"; // NEW import


const router = express.Router();

// all admin routes protected
router.use(authMiddleware);

// simple check route
router.get("/", checkAdmin);

// get all users
router.get("/users", getAllUsers);

// create a new head (admin-only, checked in controller)
router.post("/create-head", createHeadUser);

// activate / deactivate user
router.put("/users/:id/toggle-active", toggleUserStatus);

// update permissions
router.put("/users/:id/permissions", updatePermissions);
router.get("/attendance", authMiddleware, attendanceCtrl.getTodayAttendanceAdmin);
router.patch("/attendance/:id/approve-early-checkin", authMiddleware, attendanceCtrl.approveEarlyCheckin);
router.patch("/attendance/:id/approve-early-checkout", authMiddleware, attendanceCtrl.approveEarlyCheckout);
export default router;
