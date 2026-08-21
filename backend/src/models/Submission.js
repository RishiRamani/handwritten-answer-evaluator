import mongoose from "mongoose";

export const SUBMISSION_STATUS = [
  "UPLOADED",
  "OCR_PROCESSING",
  "OCR_COMPLETED",
  "AI_EVALUATION",
  "COMPLETED",
  "FAILED"
];

const submissionSchema = new mongoose.Schema(
  {
    examId: { type: mongoose.Schema.Types.ObjectId, ref: "Exam", required: true },
    studentRoll: { type: String, required: true, trim: true },
    studentName: { type: String, required: true, trim: true },
    filePath: { type: String, required: true },
    fileName: { type: String, required: true },
    fileSize: { type: Number, required: true },
    status: { type: String, enum: SUBMISSION_STATUS, default: "UPLOADED" },
    published: { type: Boolean, default: false },
    failureReason: { type: String, default: "" }
  },
  { timestamps: true }
);

export default mongoose.model("Submission", submissionSchema);