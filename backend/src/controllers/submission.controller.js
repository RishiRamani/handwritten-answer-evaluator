import * as submissionService from "../services/submission.service.js";
import { successResponse } from "../utils/response.js";

export async function createSubmission(req, res, next) {
  try {
    const { examId, studentRoll } = req.body;

    if (!examId || !studentRoll) {
      return res.status(400).json({
        success: false,
        message: "examId and studentRoll are required"
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "A PDF answer sheet file is required"
      });
    }

    const submission = await submissionService.createSubmission({
      examId,
      studentRoll,
      file: req.file
    });

    res.status(201).json(successResponse(submission, "Submission uploaded, evaluation started"));
  } catch (err) {
    next(err);
  }
}

export async function listSubmissions(req, res, next) {
  try {
    const { examId, studentRoll, published } = req.query;

    const filters = {};
    if (examId) filters.examId = examId;
    if (studentRoll) filters.studentRoll = studentRoll;
    if (published !== undefined) filters.published = published === "true";

    const submissions = await submissionService.listSubmissions(filters);
    res.json(successResponse(submissions));
  } catch (err) {
    next(err);
  }
}

export async function getSubmission(req, res, next) {
  try {
    const submission = await submissionService.getSubmissionById(req.params.id);
    res.json(successResponse(submission));
  } catch (err) {
    next(err);
  }
}

export async function publishSubmission(req, res, next) {
  try {
    const submission = await submissionService.publishSubmission(req.params.id);
    res.json(successResponse(submission, "Result published"));
  } catch (err) {
    next(err);
  }
}

export async function updateScore(req, res, next) {
  try {
    const { submissionId } = req.params;
    const { questionIndex, score } = req.body;
    
    if (questionIndex === undefined || score === undefined) {
      return res.status(400).json({
        success: false,
        message: "questionIndex and score are required"
      });
    }
    
    const submission = await submissionService.updateSubmissionScore(submissionId, questionIndex, score);
    res.json(successResponse(submission, "Score updated"));
  } catch (err) {
    next(err);
  }
}

export async function deleteSubmission(req, res, next) {
  try {
    const result = await submissionService.deleteSubmission(req.params.id);
    res.json(successResponse(result, "Submission deleted"));
  } catch (err) {
    next(err);
  }
}

export async function retrySubmission(req, res, next) {
  try {
    const submission = await submissionService.retrySubmission(req.params.id);
    res.json(successResponse(submission, "Submission retry started"));
  } catch (err) {
    next(err);
  }
}