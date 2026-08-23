// backend/seed.js
import mongoose from "mongoose";
import Admin from "./src/models/Admin.js";
import { env } from "./src/config/environment.js";

async function seed() {
  await mongoose.connect(env.mongoUri);
  
  const existing = await Admin.findOne({ username: "admin" });
  if (!existing) {
    await Admin.create({
      username: "admin",
      password: "admin123"
    });
    console.log("✅ Admin created: admin / admin123");
  } else {
    console.log("⚠️ Admin already exists");
  }
  
  process.exit();
}

seed();