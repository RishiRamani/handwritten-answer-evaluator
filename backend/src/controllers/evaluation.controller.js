import * as evaluationService from "../services/evaluation.service.js";
import { successResponse } from "../utils/response.js";

export async function getResult(req, res, next) {
  try {
    const result = await evaluationService.getResultForSubmission(req.params.submissionId);
    res.json(successResponse(result));
  } catch (err) {
    next(err);
  }
}

export async function getStudentResult(req, res, next) {
  try {
    const result = await evaluationService.getPublishedResultForStudent(req.params.roll, req.user.roll);
    res.json(successResponse(result));
  } catch (err) {
    next(err);
  }
}

export async function getStudentResultBySubmission(req, res, next) {
  try {
    const { roll, submissionId } = req.params;
    if (roll !== req.user.roll) {
      return res.status(403).json({ success: false, message: "You can only view your own results" });
    }
    const result = await evaluationService.getResultForSubmission(submissionId);
    // Verify this submission belongs to the student
    if (result.studentRoll !== roll) {
      return res.status(403).json({ success: false, message: "You can only view your own results" });
    }
    res.json(successResponse(result));
  } catch (err) {
    next(err);
  }
}

export async function getAllStudentResults(req, res, next) {
  try {
    const results = await evaluationService.getAllStudentResults(req.params.roll);
    res.json(successResponse(results));
  } catch (err) {
    next(err);
  }
}