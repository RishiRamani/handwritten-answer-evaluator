import multer from "multer";
import path from "path";
import fs from "fs";
import { env } from "../config/environment.js";

if (!fs.existsSync(env.uploadDir)) {
  fs.mkdirSync(env.uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, env.uploadDir),
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  }
});

function fileFilter(req, file, cb) {
  const isPdf =
    file.mimetype === "application/pdf" ||
    path.extname(file.originalname).toLowerCase() === ".pdf";

  if (!isPdf) {
    return cb(new Error("Only PDF files are allowed."));
  }
  cb(null, true);
}

export const uploadAnswerSheet = multer({
  storage,
  fileFilter,
  limits: { fileSize: env.maxFileSizeMB * 1024 * 1024 }
}).single("file");