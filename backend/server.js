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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
