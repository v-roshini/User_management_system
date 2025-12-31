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

export default router;
