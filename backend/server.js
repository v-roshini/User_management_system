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
app.use((err, req, res, next) => {
  console.error('🚨 Backend Error:', err.message, err.stack);
  res.status(500).json({ error: err.message });
});
app.get('/debug', async (req, res) => {
  try {
    const prisma = new PrismaClient();
    await prisma.$connect();
    const users = await prisma.user.findMany();
    res.json({ users: users.length, db: 'connected' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
app.get('/prisma-test', async (req, res) => {
  try {
    const { PrismaClient } = require('@prisma/client');
    res.json({ prisma: 'imported successfully' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
