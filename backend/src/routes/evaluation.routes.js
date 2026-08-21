import { Router } from "express";
import * as evaluationController from "../controllers/evaluation.controller.js";

const router = Router();

// /student/:roll must come before /:submissionId, otherwise
// "student" gets matched as a submissionId and fails as an invalid ObjectId.
router.get("/student/:roll", evaluationController.getStudentResult);
router.get("/:submissionId", evaluationController.getResult);

export default router;