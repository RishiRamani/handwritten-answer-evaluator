import dotenv from "dotenv";

dotenv.config();

export const env = {
  port: process.env.PORT || 5000,
  mongoUri: process.env.MONGO_URI || "mongodb://127.0.0.1:27017/sih-evaluation",
  maxFileSizeMB: Number(process.env.MAX_FILE_SIZE_MB) || 15,
  uploadDir: process.env.UPLOAD_DIR || "uploads"
};