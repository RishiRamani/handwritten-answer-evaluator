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
    const result = await evaluationService.getPublishedResultForStudent(req.params.roll);
    res.json(successResponse(result));
  } catch (err) {
    next(err);
  }
}