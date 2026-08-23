import { Router } from "express";
import * as evaluationController from "../controllers/evaluation.controller.js";
import { requireAuth, requireRole } from "../middleware/auth.middleware.js";

const router = Router();

// IMPORTANT: More specific routes must come before generic ones

// Get all results for a student
router.get("/student/:roll/all", requireAuth, requireRole("student"), evaluationController.getAllStudentResults);

// Get specific result by submission ID for a student
router.get("/student/:roll/submission/:submissionId", requireAuth, requireRole("student"), evaluationController.getStudentResultBySubmission);

// Get latest published result for a student
router.get("/student/:roll", requireAuth, requireRole("student"), evaluationController.getStudentResult);

// Get result by submission ID (teacher only)
router.get("/:submissionId", requireAuth, requireRole("teacher"), evaluationController.getResult);

export default router;