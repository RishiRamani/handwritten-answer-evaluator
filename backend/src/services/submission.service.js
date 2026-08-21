import Submission from "../models/Submission.js";
import Answer from "../models/Answer.js";
import Evaluation from "../models/Evaluation.js";
import { getExamById } from "./exam.service.js";
import { processAnswerSheet } from "./ocr.service.js";
import { evaluateAnswer } from "./qwen.service.js";

export async function createSubmission({ examId, studentRoll, studentName, file }) {
  const exam = await getExamById(examId);

  const submission = await Submission.create({
    examId: exam._id,
    studentRoll,
    studentName,
    filePath: file.path,
    fileName: file.originalname,
    fileSize: file.size,
    status: "UPLOADED"
  });

  // Runs in the background so the upload request returns immediately.
  // The frontend polls GET /submissions/:id to track progress.
  runEvaluationPipeline(submission._id, exam).catch(err => {
    console.error("[pipeline] failed for submission", submission._id, err.message);
  });

  return submission;
}

export async function runEvaluationPipeline(submissionId, examArg) {
  const submission = await Submission.findById(submissionId);
  if (!submission) return;

  const exam = examArg || (await getExamById(submission.examId));

  try {
    submission.status = "OCR_PROCESSING";
    await submission.save();

    const ocrResults = await processAnswerSheet(submission.filePath, exam.questions);

    submission.status = "OCR_COMPLETED";
    await submission.save();

    const answers = await Answer.insertMany(
      exam.questions.map(q => ({
        submissionId: submission._id,
        questionId: q._id,
        ocrText: ocrResults[q._id.toString()] || ""
      }))
    );

    submission.status = "AI_EVALUATION";
    await submission.save();

    for (const answer of answers) {
      const question = exam.questions.find(
        q => String(q._id) === String(answer.questionId)
      );

      const result = await evaluateAnswer({
        question: question.questionText,
        answerKey: question.answerKey,
        studentAnswer: answer.ocrText,
        maxMarks: question.maxMarks
      });

      await Evaluation.create({
        answerId: answer._id,
        correctness: result.correctness,
        completeness: result.completeness,
        relevance: result.relevance,
        score: result.score,
        confidence: result.confidence,
        feedback: result.feedback
      });
    }

    submission.status = "COMPLETED";
    await submission.save();
  } catch (err) {
    submission.status = "FAILED";
    submission.failureReason = err.message;
    await submission.save();
    throw err;
  }
}

export async function listSubmissions(filters = {}) {
  const query = {};
  if (filters.examId) query.examId = filters.examId;
  if (filters.studentRoll) query.studentRoll = filters.studentRoll;
  if (filters.published !== undefined) query.published = filters.published;

  return Submission.find(query).sort({ createdAt: -1 }).populate("examId");
}

export async function getSubmissionById(submissionId) {
  const submission = await Submission.findById(submissionId).populate("examId");

  if (!submission) {
    const err = new Error("Submission not found");
    err.status = 404;
    throw err;
  }

  return submission;
}

export async function publishSubmission(submissionId) {
  const submission = await getSubmissionById(submissionId);

  if (submission.status !== "COMPLETED") {
    const err = new Error("Cannot publish a submission that is not fully evaluated");
    err.status = 400;
    throw err;
  }

  submission.published = true;
  await submission.save();
  return submission;
}