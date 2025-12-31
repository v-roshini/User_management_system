import prisma from "../utils/prisma.js";

export const getProfile = async (req, res) => {
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
      permissions: user.permissions,
      createdAt: user.createdAt,
      avatarUrl: user.avatarUrl || null, // NEW
    });
  } catch (err) {
    res.status(500).json({ error: "Profile fetch failed" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { name, email, avatarUrl } = req.body; // NEW

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
          avatarUrl: avatarUrl || null, // NEW
        },
      });

      return res.json({
        name: updated.name,
        email: updated.email,
        role: updated.role,
        active: updated.active,
        permissions: updated.permissions,
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
