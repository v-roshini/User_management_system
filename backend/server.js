// backend/server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";  // ← ADD THIS LINE
import authRoutes from "./routes/auth.routes.js";
import profileRoutes from "./routes/profile.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import userRoutes from "./routes/user.routes.js";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL.split(',') || "http://localhost:3000",  // handles multiple
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);


app.use(express.json());

app.use("/auth", authRoutes);
app.use("/profile", profileRoutes);
app.use("/admin", adminRoutes);
app.use("/user", userRoutes);
app.use("/uploads", express.static(path.join(process.cwd(), "uploads"))); // ← Now works
// After all routes
// 1. Test @prisma/client exists
app.get('/debug/prisma-import', (req, res) => {
  try {
    const { PrismaClient } = require('@prisma/client');
    res.json({ status: 'PrismaClient imported ✓' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// 2. Test Prisma instantiation
app.get('/debug/prisma-instance', async (req, res) => {
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    await prisma.$connect();
    res.json({ status: 'Prisma connected ✓' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
