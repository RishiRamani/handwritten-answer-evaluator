import mongoose from "mongoose";

const teacherSchema = new mongoose.Schema(
  {
    teacherId: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    password: { type: String, required: true },
    department: { type: String, default: "" }
  },
  { timestamps: true }
);

export default mongoose.model("Teacher", teacherSchema);