import mongoose from "mongoose";

const questionSchema = new mongoose.Schema(
  {
    examId: { type: mongoose.Schema.Types.ObjectId, ref: "Exam", required: true },
    questionText: { type: String, required: true },
    answerKey: { type: String, required: true },
    maxMarks: { type: Number, required: true }
  },
  { timestamps: true }
);

export default mongoose.model("Question", questionSchema);