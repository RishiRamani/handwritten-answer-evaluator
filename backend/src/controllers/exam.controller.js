import * as examService from "../services/exam.service.js";
import { successResponse } from "../utils/response.js";

export async function createExam(req, res, next) {
  try {
    const { title, subject, teacherId, questions } = req.body;

    if (!title || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({
        success: false,
        message: "title and at least one question are required"
      });
    }

    const exam = await examService.createExam({ title, subject, teacherId, questions });
    res.status(201).json(successResponse(exam, "Exam created"));
  } catch (err) {
    next(err);
  }
}

export async function listExams(req, res, next) {
  try {
    const exams = await examService.listExams();
    res.json(successResponse(exams));
  } catch (err) {
    next(err);
  }
}

export async function getExam(req, res, next) {
  try {
    const exam = await examService.getExamById(req.params.id);
    res.json(successResponse(exam));
  } catch (err) {
    next(err);
  }
}

export async function addQuestion(req, res, next) {
  try {
    const { questionText, answerKey, maxMarks } = req.body;

    if (!questionText || !answerKey || !maxMarks) {
      return res.status(400).json({
        success: false,
        message: "questionText, answerKey and maxMarks are required"
      });
    }

    const question = await examService.addQuestion(req.params.id, {
      questionText,
      answerKey,
      maxMarks
    });

    res.status(201).json(successResponse(question, "Question added"));
  } catch (err) {
    next(err);
  }
}