import Exam from "../models/Exam.js";
import Question from "../models/Question.js";

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