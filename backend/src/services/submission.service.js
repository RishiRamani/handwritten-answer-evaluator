import Submission from "../models/Submission.js";
import Answer from "../models/Answer.js";
import Evaluation from "../models/Evaluation.js";
import Student from "../models/Student.js";
import fs from "fs/promises";
import { getExamById } from "./exam.service.js";
import { processAnswerSheet } from "./ocr.service.js";
import { evaluateAnswer } from "./qwen.service.js";

export async function createSubmission({ examId, studentRoll, file }) {
  const exam = await getExamById(examId);

  // Try to find existing student, if not found, create with roll as name
  let student = await Student.findOne({ roll: studentRoll });
  if (!student) {
    student = await Student.create({
      roll: studentRoll,
      name: `Student ${studentRoll}`
    });
  }

  const submission = await Submission.create({
    examId: exam._id,
    studentRoll,
    filePath: file.path,
    fileName: file.originalname,
    fileSize: file.size,
    status: "UPLOADED"
  });

  // Run evaluation pipeline in background
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
    // OCR Step
    submission.status = "OCR_PROCESSING";
    await submission.save();

    const ocrResults = await processAnswerSheet(submission.filePath, exam.questions);

    submission.status = "OCR_COMPLETED";
    await submission.save();

    // Create Answers
    const answers = await Answer.insertMany(
      exam.questions.map(q => ({
        submissionId: submission._id,
        questionId: q._id,
        ocrText: ocrResults[q._id.toString()]?.text || "",
        ocrConfidence: ocrResults[q._id.toString()]?.ocrConfidence ?? null
      }))
    );

    // AI Evaluation Step
    submission.status = "AI_EVALUATION";
    await submission.save();

    for (const answer of answers) {
      const question = exam.questions.find(
        q => String(q._id) === String(answer.questionId)
      );

      if (!answer.ocrText.trim()) {
        await Evaluation.create({
          answerId: answer._id,
          correctness: 0,
          completeness: 0,
          relevance: 0,
          score: 0,
          confidence: Number.isFinite(answer.ocrConfidence) ? answer.ocrConfidence : 0,
          feedback: "No answer text was extracted from the submitted answer sheet."
        });
        continue;
      }

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
        confidence: Number.isFinite(answer.ocrConfidence) ? answer.ocrConfidence : 0,
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

export async function updateSubmissionScore(submissionId, questionIndex, newScore) {
  const submission = await getSubmissionById(submissionId);
  
  if (!submission.manualEdits) {
    submission.manualEdits = new Map();
  }
  
  submission.manualEdits.set(questionIndex.toString(), newScore);
  submission.teacherReviewed = true;
  await submission.save();
  
  return submission;
}

export async function deleteSubmission(submissionId) {
  const submission = await Submission.findById(submissionId);
  if (!submission) {
    const err = new Error("Submission not found");
    err.status = 404;
    throw err;
  }

  const answers = await Answer.find({ submissionId }).select("_id");
  await Evaluation.deleteMany({ answerId: { $in: answers.map(answer => answer._id) } });
  await Answer.deleteMany({ submissionId });
  await Submission.deleteOne({ _id: submissionId });
  await fs.unlink(submission.filePath).catch(() => {});

  return { deleted: true };
}

export async function retrySubmission(submissionId) {
  const submission = await Submission.findById(submissionId);
  if (!submission) {
    const err = new Error("Submission not found");
    err.status = 404;
    throw err;
  }
  if (!["FAILED", "COMPLETED"].includes(submission.status)) {
    const err = new Error("Only failed or completed submissions can be retried");
    err.status = 400;
    throw err;
  }

  const exam = await getExamById(submission.examId);
  const answers = await Answer.find({ submissionId }).select("_id");
  await Evaluation.deleteMany({ answerId: { $in: answers.map(answer => answer._id) } });
  await Answer.deleteMany({ submissionId });

  submission.status = "UPLOADED";
  submission.failureReason = "";
  submission.published = false;
  submission.manualEdits = new Map();
  submission.teacherReviewed = false;
  await submission.save();

  runEvaluationPipeline(submission._id, exam).catch(err => {
    console.error("[pipeline] retry failed for submission", submission._id, err.message);
  });

  return submission;
}