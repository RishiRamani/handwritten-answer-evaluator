import mongoose from "mongoose";

const answerSchema = new mongoose.Schema(
  {
    submissionId: { type: mongoose.Schema.Types.ObjectId, ref: "Submission", required: true },
    questionId: { type: mongoose.Schema.Types.ObjectId, ref: "Question", required: true },
    ocrText: { type: String, default: "" },
    ocrConfidence: { type: Number, default: null, min: 0, max: 100 }
  },
  { timestamps: true }
);

export default mongoose.model("Answer", answerSchema);