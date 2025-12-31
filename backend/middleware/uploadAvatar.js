// backend/middleware/uploadAvatar.js
import multer from "multer";

const storage = multer.memoryStorage(); // keep file in memory

export const uploadAvatar = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only images allowed"), false);
    }
  },
}).single("avatar");
