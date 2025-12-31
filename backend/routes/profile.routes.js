// backend/routes/profile.routes.js
import express from "express";
import prisma from "../utils/prisma.js";
import { authMiddleware } from "../middleware/auth.js";   // ← ADD / CHECK THIS
import { uploadAvatar } from "../middleware/uploadAvatar.js";
import cloudinary from "../utils/cloudinary.js";

const router = express.Router();

// GET /profile - fetch user profile
const getProfile = async (req, res) => {
  const email = req.headers.email;

  if (!email) return res.status(400).json({ error: "Email missing" });

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) return res.status(404).json({ error: "User not found" });

    res.json({
      name: user.name,
      email: user.email,
      role: user.role,
      active: user.active,
      permissions: user.permissions || [],
      createdAt: user.createdAt,
      avatarUrl: user.avatarUrl || null,
    });
  } catch (err) {
    res.status(500).json({ error: "Profile fetch failed" });
  }
};

// PUT /profile - update name, email, avatarUrl
const updateProfile = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { name, email, avatarUrl } = req.body;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    if (!name || !name.trim()) {
      return res.status(400).json({ error: "Name is required" });
    }
    if (!email || !email.trim()) {
      return res.status(400).json({ error: "Email is required" });
    }

    try {
      const updated = await prisma.user.update({
        where: { id: userId },
        data: {
          name: name.trim(),
          email: email.trim(),
          avatarUrl: avatarUrl || null,
        },
      });

      return res.json({
        name: updated.name,
        email: updated.email,
        role: updated.role,
        active: updated.active,
        permissions: updated.permissions || [],
        createdAt: updated.createdAt,
        avatarUrl: updated.avatarUrl || null,
      });
    } catch (err) {
      if (err.code === "P2002") {
        return res
          .status(400)
          .json({ error: "Email already in use. Choose another one." });
      }
      console.error("Profile update failed:", err);
      return res.status(500).json({ error: "Profile update failed" });
    }
  } catch (err) {
    console.error("Profile update outer error:", err);
    res.status(500).json({ error: "Profile update failed" });
  }
};

router.post(
  "/avatar",
  authMiddleware,
  uploadAvatar,
  async (req, res) => {
    try {
      const userId = req.user.id;
      if (!req.file) {
        return res.status(400).json({ error: "No image uploaded" });
      }

      // Wrap Cloudinary upload_stream in a Promise
      const uploadToCloudinary = (buffer) => {
        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              folder: "user_management/avatars",
              resource_type: "image",
            },
            (error, result) => {
              if (error) return reject(error);
              resolve(result);
            }
          );
          stream.end(buffer); // send file buffer
        });
      };

      const uploadResult = await uploadToCloudinary(req.file.buffer);

      // uploadResult.secure_url = HTTPS URL of the image
      const updated = await prisma.user.update({
        where: { id: userId },
        data: { avatarUrl: uploadResult.secure_url },
      });

      return res.json({ avatarUrl: updated.avatarUrl });
    } catch (err) {
      console.error("Avatar upload failed:", err);
      res.status(500).json({ error: "Upload failed" });
    }
  }
);


// Existing routes
router.get("/", authMiddleware, getProfile);
router.put("/", authMiddleware, updateProfile);

export default router; // ← CRITICAL: default export
