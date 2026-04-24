import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Relative path to frontend uploads directory
// From nodejs/src/middlewares -> nodejs/../public_html/uploads
const UPLOAD_BASE_DIR =
  process.env.FILE_UPLOAD_BASE_URL ||
  path.join(__dirname, "../../public_html/uploads");

// Ensure uploads directory exists
const ensureUploadDir = () => {
  if (!fs.existsSync(UPLOAD_BASE_DIR)) {
    fs.mkdirSync(UPLOAD_BASE_DIR, { recursive: true });
  }
};

// Generate unique filename
const generateUniqueFilename = (originalName) => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  const ext = path.extname(originalName);
  const name = path.basename(originalName, ext);
  return `${name}-${timestamp}-${random}${ext}`;
};

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    ensureUploadDir();
    const productId = req.params.id;
    const uploadDir = path.join(UPLOAD_BASE_DIR, productId);

    // Create product-specific directory
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = generateUniqueFilename(file.originalname);
    cb(null, uniqueName);
  },
});

// File filter
const fileFilter = (req, file, cb) => {
  const allowedMimes = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
    "image/avif",
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed"), false);
  }
};

export const uploadMiddleware = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

// Verify that uploaded files actually exist on disk
export const verifyUploadedFiles = (req, res, next) => {
  if (!req.files || req.files.length === 0) {
    return next();
  }

  // Check if all files exist on disk
  const missingFiles = req.files.filter((file) => {
    const filePath = path.join(file.destination, file.filename);
    return !fs.existsSync(filePath);
  });

  if (missingFiles.length > 0) {
    // Clean up any uploaded files
    req.files.forEach((file) => {
      const filePath = path.join(file.destination, file.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    });

    return res.status(500).json({
      error: `Failed to save ${missingFiles.length} file(s) to disk`,
      details: "Upload failed during file system write operation",
    });
  }

  next();
};

// Verify file size on disk matches expected size
export const verifyFileSizes = (req, res, next) => {
  if (!req.files || req.files.length === 0) {
    return next();
  }

  const invalidFiles = req.files.filter((file) => {
    const filePath = path.join(file.destination, file.filename);
    if (!fs.existsSync(filePath)) {
      return true;
    }

    const stats = fs.statSync(filePath);
    // File size should match what multer thinks was uploaded
    return stats.size === 0;
  });

  if (invalidFiles.length > 0) {
    // Clean up corrupted files
    req.files.forEach((file) => {
      const filePath = path.join(file.destination, file.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    });

    return res.status(400).json({
      error: `${invalidFiles.length} file(s) failed validation - corrupted or empty`,
      details: "Files were created but contain no data",
    });
  }

  next();
};

// Get relative path that can be served via frontend domain
export const getRelativeImagePath = (productId, filename) => {
  return `/uploads/${productId}/${filename}`;
};

// Get absolute file path
export const getAbsoluteFilePath = (productId, filename) => {
  return path.join(UPLOAD_BASE_DIR, productId, filename);
};

// Delete uploaded file
export const deleteUploadedFile = (productId, filename) => {
  const filePath = getAbsoluteFilePath(productId, filename);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};
