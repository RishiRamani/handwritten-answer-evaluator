import Answer from "../models/Answer.js";
import Evaluation from "../models/Evaluation.js";
import Question from "../models/Question.js";
import Submission from "../models/Submission.js";
import Student from "../models/Student.js";
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

    let finalScore = evaluation.score;
    const manualEdits = submission.manualEdits || new Map();
    const questionIndex = items.length;
    
    if (manualEdits.has(questionIndex.toString())) {
      finalScore = manualEdits.get(questionIndex.toString());
    }

    items.push({
      questionId: question._id,
      question: question.questionText,
      studentAnswer: answer.ocrText || "[No OCR text extracted]",
      maxMarks: question.maxMarks,
      score: finalScore,
      originalScore: evaluation.score,
      manuallyEdited: finalScore !== evaluation.score,
      correctness: evaluation.correctness,
      completeness: evaluation.completeness,
      relevance: evaluation.relevance,
      confidence: answer.ocrConfidence ?? 0,
      feedback: evaluation.feedback || "No feedback provided."
    });
  }

  const { totalScore, totalMarks, avgConfidence } = calculateTotals(
    items.map(i => ({ score: i.score, maxMarks: i.maxMarks, confidence: i.confidence }))
  );

  return {
    submissionId: submission._id,
    studentRoll: submission.studentRoll,
    studentName: await getStudentName(submission.studentRoll),
    exam: submission.examId?.title || "Unknown Exam",
    status: submission.status,
    published: submission.published || false,
    totalScore,
    totalMarks,
    confidence: avgConfidence,
    teacherReviewed: submission.teacherReviewed || false,
    questions: items
  };
}

async function getStudentName(roll) {
  const student = await Student.findOne({ roll });
  return student ? student.name : `Student ${roll}`;
}

export async function getPublishedResultForStudent(studentRoll, authenticatedRoll) {
  if (studentRoll !== authenticatedRoll) {
    const err = new Error("You can only view your own result");
    err.status = 403;
    throw err;
  }
  
  // Check if student exists
  const student = await Student.findOne({ roll: studentRoll });
  if (!student) {
    const err = new Error("Student not found. Please contact admin.");
    err.status = 404;
    throw err;
  }
  
  const submission = await Submission.findOne({
    studentRoll,
    published: true
  }).sort({ createdAt: -1 });

  if (!submission) {
    const err = new Error("No published result found for this roll number.");
    err.status = 404;
    throw err;
  }

  return getResultForSubmission(submission._id);
}

export async function getAllStudentResults(studentRoll) {
  // Check if student exists
  const student = await Student.findOne({ roll: studentRoll });
  if (!student) {
    const err = new Error("Student not found. Please contact admin.");
    err.status = 404;
    throw err;
  }
  
  const submissions = await Submission.find({
    studentRoll
  }).sort({ createdAt: -1 }).populate("examId");

  const results = [];
  for (const submission of submissions) {
    const result = await getResultForSubmission(submission._id);
    results.push(result);
  }
  
  return results;
}