import mongoose from "mongoose";
import { env } from "./environment.js";

export async function connectDatabase() {
  try {
    await mongoose.connect(env.mongoUri);
    console.log("[database] connected:", env.mongoUri);
  } catch (err) {
    console.error("[database] connection failed:", err.message);
    process.exit(1);
  }
}