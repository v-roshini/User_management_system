// backend/controllers/auth.controller.js
import jwt from "jsonwebtoken";
import prisma from "../utils/prisma.js";

const JWT_SECRET = process.env.JWT_SECRET || "12345";

export const register = async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(400).json({ error: "Email already exists" });

    const user = await prisma.user.create({
      data: { name, email, password, role: role || "user" },
    });

    res.json({ message: "Registered", user });
  } catch (err) {
    res.status(500).json({ error: "Registration failed" });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || user.password !== password)
      return res.status(401).json({ error: "Invalid email or password" });
    
    if (!user.active)
      return res.status(403).json({ error: "Your account is deactivated. Contact Admin." });

    // GENERATE JWT TOKEN
  // Change from 24h → 7 days (or "30d")
const token = jwt.sign(
  { userId: user.id, email: user.email, role: user.role },
  JWT_SECRET,
  { expiresIn: "7d" }  // ← 7 days instead of "24h"
);

    res.json({
      message: "Login success",
      token,
      userId: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      permissions: user.permissions || [],
    });
  } catch (err) {
    res.status(500).json({ error: "Login failed" });
  }
};
