import mongoose from "mongoose";

const studentSchema = new mongoose.Schema(
  {
    roll: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    program: { type: String, default: "" },
    year: { type: String, default: "" }
  },
  { timestamps: true }
);

export default mongoose.model("Student", studentSchema);