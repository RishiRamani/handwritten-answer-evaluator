import Answer from "../models/Answer.js";
import Evaluation from "../models/Evaluation.js";
import Question from "../models/Question.js";
import Submission from "../models/Submission.js";
import { getSubmissionById } from "./submission.service.js";
import { calculateTotals } from "../utils/score.js";

export async function getResultForSubmission(submissionId) {
  const submission = await getSubmissionById(submissionId);
  const answers = await Answer.find({ submissionId: submission._id });

  const items = [];

  for (const answer of answers) {
    const question = await Question.findById(answer.questionId);
    const evaluation = await Evaluation.findOne({ answerId: answer._id });

    if (!question || !evaluation) continue;

    items.push({
      questionId: question._id,
      question: question.questionText,
      studentAnswer: answer.ocrText,
      maxMarks: question.maxMarks,
      score: evaluation.score,
      correctness: evaluation.correctness,
      completeness: evaluation.completeness,
      relevance: evaluation.relevance,
      confidence: evaluation.confidence,
      feedback: evaluation.feedback
    });
  }

  const { totalScore, totalMarks, avgConfidence } = calculateTotals(
    items.map(i => ({ score: i.score, maxMarks: i.maxMarks, confidence: i.confidence }))
  );

  return {
    submissionId: submission._id,
    studentRoll: submission.studentRoll,
    studentName: submission.studentName,
    exam: submission.examId.title,
    status: submission.status,
    published: submission.published,
    totalScore,
    totalMarks,
    confidence: avgConfidence,
    questions: items
  };
}

export async function getPublishedResultForStudent(studentRoll) {
  const submission = await Submission.findOne({
    studentRoll,
    published: true
  }).sort({ createdAt: -1 });

  if (!submission) {
    const err = new Error("No published result found for this roll number");
    err.status = 404;
    throw err;
  }

  return getResultForSubmission(submission._id);
}