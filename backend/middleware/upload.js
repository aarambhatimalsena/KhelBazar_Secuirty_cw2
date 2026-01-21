// middleware/upload.js
import multer from "multer";
import fs from "fs";
import path from "path";
import { writeAuditLog } from "../utils/audit.js";

// ---- make sure uploads/ folder exists ----
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// ---- multer disk storage (local temp) ----
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, uploadDir);
  },
  filename(req, file, cb) {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + "-" + file.originalname);
  },
});

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

const fileFilter = (req, file, cb) => {
  if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
    writeAuditLog({
      user: req.user?._id || req.user?.id || null,
      action: "FAKE_FILE_UPLOAD_ATTEMPT",
      req,
      metadata: {
        originalName: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
      },
    });
    return cb(new Error("Only JPEG, PNG, or WEBP images are allowed"), false);
  }
  cb(null, true);
};

const hasValidSignature = (buffer, mimetype) => {
  if (!buffer || buffer.length < 12) return false;

  if (mimetype === "image/jpeg") {
    return buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  }

  if (mimetype === "image/png") {
    return (
      buffer[0] === 0x89 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x4e &&
      buffer[3] === 0x47 &&
      buffer[4] === 0x0d &&
      buffer[5] === 0x0a &&
      buffer[6] === 0x1a &&
      buffer[7] === 0x0a
    );
  }

  if (mimetype === "image/webp") {
    return (
      buffer[0] === 0x52 &&
      buffer[1] === 0x49 &&
      buffer[2] === 0x46 &&
      buffer[3] === 0x46 &&
      buffer[8] === 0x57 &&
      buffer[9] === 0x45 &&
      buffer[10] === 0x42 &&
      buffer[11] === 0x50
    );
  }

  return false;
};

export const validateImageSignature = async (req, res, next) => {
  if (!req.file) return next();

  let fileHandle;
  try {
    fileHandle = await fs.promises.open(req.file.path, "r");
    const buffer = Buffer.alloc(12);
    await fileHandle.read(buffer, 0, 12, 0);

    const isValid = hasValidSignature(buffer, req.file.mimetype);
    if (!isValid) {
      await fs.promises.unlink(req.file.path).catch(() => {});

      await writeAuditLog({
        user: req.user?._id || req.user?.id || null,
        action: "FAKE_FILE_UPLOAD_ATTEMPT",
        req,
        metadata: {
          originalName: req.file.originalname,
          mimetype: req.file.mimetype,
          size: req.file.size,
        },
      });

      return res.status(400).json({ message: "Invalid image file." });
    }
  } catch (error) {
    await fs.promises.unlink(req.file.path).catch(() => {});
    return res.status(400).json({ message: "Invalid image file." });
  } finally {
    if (fileHandle) await fileHandle.close().catch(() => {});
  }

  return next();
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});

export default upload;
