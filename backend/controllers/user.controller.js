// backend/controllers/user.controller.js
import prisma from "../utils/prisma.js";

export const getUserPermissions = async (req, res) => {
  const userId = req.user?.userId || req.params.id; // Fallback for testing

  try {
    const user = await prisma.user.findUnique({
      where: { id: Number(userId) },
      select: { permissions: true },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    let permissionsArray = [];
    if (user.permissions) {
      if (Array.isArray(user.permissions)) {
        permissionsArray = user.permissions;
      } else if (typeof user.permissions === 'object') {
        permissionsArray = Object.keys(user.permissions).filter(key => user.permissions[key]);
      }
    }

    res.json({ permissions: permissionsArray });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch permissions" });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        active: true,
        permissions: true,
      },
    });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
};
