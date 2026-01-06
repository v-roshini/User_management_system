import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// Helper: get "today" with time zeroed (for @db.Date or DATE column)
function getTodayDateOnly() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

// ================= USER SIDE =================

export const getTodayAttendance = async (req, res) => {
  try {
    const { userId } = req.params;
    const today = getTodayDateOnly();

    const attendance = await prisma.attendance.findFirst({
      where: {
        userId: Number(userId),
        date: today,
      },
    });

    return res.json(attendance || null);
  } catch (err) {
    console.error("getTodayAttendance error:", err);
    return res.status(500).json({ error: "Failed to fetch attendance" });
  }
};

export const checkin = async (req, res) => {
  try {
    const { userId, date } = req.body; // date from frontend: "YYYY-MM-DD"
    const today = getTodayDateOnly();
    const now = new Date();
    const timeStr = now.toTimeString().slice(0, 8); // "HH:MM:SS"

    const recordDate = date ? new Date(date) : today;
    recordDate.setHours(0, 0, 0, 0);

    const attendance = await prisma.attendance.upsert({
      where: {
        userId_date: {
          userId: Number(userId),
          date: recordDate,
        },
      },
      update: {
        checkinTime: timeStr,
        status: "checked_in",
      },
      create: {
        userId: Number(userId),
        date: recordDate,
        checkinTime: timeStr,
        status: "checked_in",
      },
    });

    return res.json({ message: "Checked in", attendance });
  } catch (err) {
    console.error("checkin error:", err);
    return res.status(500).json({ error: "Check-in failed" });
  }
};

export const checkout = async (req, res) => {
  try {
    const { userId, date } = req.body;
    const today = getTodayDateOnly();
    const now = new Date();
    const timeStr = now.toTimeString().slice(0, 8);

    const recordDate = date ? new Date(date) : today;
    recordDate.setHours(0, 0, 0, 0);

    const attendance = await prisma.attendance.update({
      where: {
        userId_date: {
          userId: Number(userId),
          date: recordDate,
        },
      },
      data: {
        checkoutTime: timeStr,
        status: "checked_out",
      },
    });

    return res.json({ message: "Checked out", attendance });
  } catch (err) {
    console.error("checkout error:", err);
    return res.status(500).json({ error: "Check-out failed" });
  }
};

export const earlyCheckin = async (req, res) => {
  try {
    const { userId, date } = req.body;
    const today = getTodayDateOnly();

    const recordDate = date ? new Date(date) : today;
    recordDate.setHours(0, 0, 0, 0);

    const attendance = await prisma.attendance.upsert({
      where: {
        userId_date: {
          userId: Number(userId),
          date: recordDate,
        },
      },
      update: {
        earlyCheckin: true,
        status: "pending",
      },
      create: {
        userId: Number(userId),
        date: recordDate,
        earlyCheckin: true,
        status: "pending",
      },
    });

    return res.json({
      message: "Early check-in request submitted",
      attendance,
    });
  } catch (err) {
    console.error("earlyCheckin error:", err);
    return res.status(500).json({ error: "Early check-in request failed" });
  }
};

export const earlyCheckout = async (req, res) => {
  try {
    const { userId, date } = req.body;
    const today = getTodayDateOnly();

    const recordDate = date ? new Date(date) : today;
    recordDate.setHours(0, 0, 0, 0);

    const attendance = await prisma.attendance.upsert({
      where: {
        userId_date: {
          userId: Number(userId),
          date: recordDate,
        },
      },
      update: {
        earlyCheckout: true,
        status: "pending",
      },
      create: {
        userId: Number(userId),
        date: recordDate,
        earlyCheckout: true,
        status: "pending",
      },
    });

    return res.json({
      message: "Early check-out request submitted",
      attendance,
    });
  } catch (err) {
    console.error("earlyCheckout error:", err);
    return res.status(500).json({ error: "Early check-out request failed" });
  }
};

// ================= ADMIN SIDE =================

export const getTodayAttendanceAdmin = async (_req, res) => {
  try {
    const today = getTodayDateOnly();

    const list = await prisma.attendance.findMany({
      where: { date: today },
      include: {
        user: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
      orderBy: { checkinTime: "asc" },
    });

    return res.json(list);
  } catch (err) {
    console.error("getTodayAttendanceAdmin error:", err);
    return res.status(500).json({ error: "Failed to load attendance list" });
  }
};

export const approveEarlyCheckin = async (req, res) => {
  try {
    const { id } = req.params;

    const attendance = await prisma.attendance.update({
      where: { id: Number(id) },
      data: {
        earlyCheckinApproved: true,
        status: "approved",
      },
    });

    return res.json({ message: "Early check-in approved", attendance });
  } catch (err) {
    console.error("approveEarlyCheckin error:", err);
    return res.status(500).json({ error: "Approval failed" });
  }
};

export const approveEarlyCheckout = async (req, res) => {
  try {
    const { id } = req.params;

    const attendance = await prisma.attendance.update({
      where: { id: Number(id) },
      data: {
        earlyCheckoutApproved: true,
        status: "approved",
      },
    });

    return res.json({ message: "Early check-out approved", attendance });
  } catch (err) {
    console.error("approveEarlyCheckout error:", err);
    return res.status(500).json({ error: "Approval failed" });
  }
};
