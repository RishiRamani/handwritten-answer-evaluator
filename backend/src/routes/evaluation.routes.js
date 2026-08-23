import { Router } from "express";
import * as evaluationController from "../controllers/evaluation.controller.js";
import { requireAuth, requireRole } from "../middleware/auth.middleware.js";

const router = Router();

// /student/:roll must come before /:submissionId, otherwise
// "student" gets matched as a submissionId and fails as an invalid ObjectId.
router.get("/student/:roll", requireAuth, requireRole("student"), evaluationController.getStudentResult);
router.get("/:submissionId", requireAuth, requireRole("teacher"), evaluationController.getResult);

export default router;