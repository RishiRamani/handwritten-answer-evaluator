import Exam from "../models/Exam.js";
import Question from "../models/Question.js";
import Submission from "../models/Submission.js";
import Answer from "../models/Answer.js";
import Evaluation from "../models/Evaluation.js";
import fs from "fs/promises";

export async function createExam({ title, subject, teacherId, questions }) {
  const exam = await Exam.create({ title, subject, teacherId });

  const createdQuestions = await Question.insertMany(
    questions.map(q => ({
      examId: exam._id,
      questionText: q.questionText,
      answerKey: q.answerKey,
      maxMarks: q.maxMarks
    }))
  );

  exam.questions = createdQuestions.map(q => q._id);
  await exam.save();

  return getExamById(exam._id);
}

export async function listExams() {
  return Exam.find().sort({ createdAt: -1 }).populate("questions");
}

export async function getExamById(examId) {
  const exam = await Exam.findById(examId).populate("questions");

  if (!exam) {
    const err = new Error("Exam not found");
    err.status = 404;
    throw err;
  }

  return exam;
}

export async function addQuestion(examId, questionData) {
  const exam = await getExamById(examId);

  const question = await Question.create({
    examId,
    questionText: questionData.questionText,
    answerKey: questionData.answerKey,
    maxMarks: questionData.maxMarks
  });

  exam.questions.push(question._id);
  await exam.save();

  return question;
}

export async function deleteExam(examId) {
  const exam = await Exam.findById(examId);
  if (!exam) {
    const err = new Error("Exam not found");
    err.status = 404;
    throw err;
  }

  const submissions = await Submission.find({ examId }).select("_id filePath");
  const submissionIds = submissions.map(submission => submission._id);
  const answers = await Answer.find({ submissionId: { $in: submissionIds } }).select("_id");
  const answerIds = answers.map(answer => answer._id);

  await Evaluation.deleteMany({ answerId: { $in: answerIds } });
  await Answer.deleteMany({ submissionId: { $in: submissionIds } });
  await Submission.deleteMany({ examId });
  await Question.deleteMany({ examId });
  await Exam.deleteOne({ _id: examId });

  await Promise.all(submissions.map(async submission => {
    if (submission.filePath) await fs.unlink(submission.filePath).catch(() => {});
  }));

  return { deleted: true };
}