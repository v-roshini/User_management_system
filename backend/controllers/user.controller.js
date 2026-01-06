// backend/controllers/user.controller.js
import prisma from "../utils/prisma.js";

/**
 * GET USER PERMISSIONS
 * Route: GET /api/users/:id/permissions (or from token)
 */
export const getUserPermissions = async (req, res) => {
  try {
    // ✅ SAFELY get userId
    const userId = Number(req.user?.userId || req.params.id);

    if (!userId || isNaN(userId)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { permissions: true },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // ✅ Normalize permissions to array
    let permissionsArray = [];

    if (user.permissions) {
      if (Array.isArray(user.permissions)) {
        permissionsArray = user.permissions;
      } else if (typeof user.permissions === "object") {
        permissionsArray = Object.entries(user.permissions)
          .filter(([_, value]) => value === true)
          .map(([key]) => key);
      }
    }

    return res.json({ permissions: permissionsArray });
  } catch (error) {
    console.error("getUserPermissions error:", error);
    return res.status(500).json({ error: "Failed to fetch permissions" });
  }
};

/**
 * GET ALL USERS (ADMIN)
 * Route: GET /api/users
 */
export const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { id: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        active: true,
        permissions: true,
        createdAt: true,
      },
    });

    return res.json(users);
  } catch (error) {
    console.error("getAllUsers error:", error);
    return res.status(500).json({ error: "Failed to fetch users" });
  }
};
