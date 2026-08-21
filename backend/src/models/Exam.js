import mongoose from "mongoose";

const examSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    subject: { type: String, trim: true, default: "" },
    teacherId: { type: String, trim: true, default: "" },
    questions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Question" }]
  },
  { timestamps: true }
);

export default mongoose.model("Exam", examSchema);