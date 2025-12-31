// backend/routes/user.routes.js
import express from "express";
import { getUserPermissions, getAllUsers } from "../controllers/user.controller.js";

const router = express.Router();

router.get("/permissions/:id", getUserPermissions); // TEMP NO AUTH for testing
router.get("/", getAllUsers);

export default router;
