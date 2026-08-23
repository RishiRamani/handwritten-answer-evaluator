import mongoose from "mongoose";

const evaluationSchema = new mongoose.Schema(
  {
    answerId: { type: mongoose.Schema.Types.ObjectId, ref: "Answer", required: true },
    correctness: { type: Number, required: true },
    completeness: { type: Number, required: true },
    relevance: { type: Number, required: true },
    score: { type: Number, required: true },
    confidence: { type: Number, required: true },
    feedback: { type: String, default: "" },
    manuallyEdited: { type: Boolean, default: false },
    teacherScore: { type: Number, default: null }
  },
  { timestamps: true }
);

export default mongoose.model("Evaluation", evaluationSchema);