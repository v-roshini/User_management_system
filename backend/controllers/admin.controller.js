// backend/controllers/admin.controller.js
import prisma from "../utils/prisma.js";
import jwt from "jsonwebtoken"; // currently not used here, but available if needed

// Simple admin check route
export const checkAdmin = (req, res) => {
  res.send("Admin route working");
};

// Get all users
export const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    res.json({ users });
  } catch (error) {
    res.status(500).json({ error: "Error fetching users" });
  }
};

// Activate / deactivate user
export const toggleUserStatus = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await prisma.user.findUnique({
      where: { id: Number(id) },
    });

    if (!user) return res.status(404).json({ error: "User not found" });

    const updated = await prisma.user.update({
      where: { id: Number(id) },
      data: { active: !user.active },
    });

    res.json({ message: "User status updated", user: updated });
  } catch (err) {
    res.status(500).json({ error: "Could not update status" });
  }
};

// Update permissions
export const updatePermissions = async (req, res) => {
  const { id } = req.params;
  const { permissions } = req.body;

  try {
    const updated = await prisma.user.update({
      where: { id: Number(id) },
      data: {
        permissions,
      },
    });

    res.json({ message: "Permissions updated", user: updated });
  } catch (err) {
    res.status(500).json({ error: "Failed to update permissions" });
  }
};

// NEW: create head user (admin-only)
// NOTE: password is currently stored as plain text.
// In production you should hash it before saving (for example with bcrypt).
export const createHeadUser = async (req, res) => {
    console.log("createHeadUser req.user =", req.user);
  const { name, email, password } = req.body;

  try {
    // Require admin role from auth middleware (req.user populated from JWT)
    if (req.user?.role !== "head") {
      return res
        .status(403)
        .json({ error: "Only admin can create head users" });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ error: "Email already in use" });
    }

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password, // store as-is; change to hashed password in real apps
        role: "head",
        active: true,
        permissions: [],
      },
    });

    // Optional: issue a JWT for the new head user if needed
     const token = jwt.sign(
       { id: user.id, role: user.role },
       process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(201).json({ message: "Head user created", user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create head user" });
  }
};
