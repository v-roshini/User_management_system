import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const getTodayAttendance = async (req, res) => {
  const { userId } = req.params;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const attendance = await prisma.attendance.findFirst({
    where: {
      userId: parseInt(userId),
      date: today.toISOString().split('T')[0]
    }
  });
  res.json(attendance || {});
};

export const checkin = async (req, res) => {
  const { userId, date } = req.body;
  await prisma.attendance.upsert({
    where: { userId_date: { userId: parseInt(userId), date } },
    update: { checkinTime: new Date().toISOString() },
    create: { userId: parseInt(userId), date, checkinTime: new Date().toISOString() }
  });
  res.json({ message: 'Checked in' });
};

export const checkout = async (req, res) => {
  const { userId, date } = req.body;
  await prisma.attendance.updateMany({
    where: { userId: parseInt(userId), date },
    data: { checkoutTime: new Date().toISOString() }
  });
  res.json({ message: 'Checked out' });
};
