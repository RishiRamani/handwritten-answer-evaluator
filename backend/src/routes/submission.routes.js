import { Router } from "express";
import * as submissionController from "../controllers/submission.controller.js";
import { uploadAnswerSheet } from "../middleware/upload.middleware.js";
import { requireAuth, requireRole } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/", requireAuth, requireRole("teacher"), uploadAnswerSheet, submissionController.createSubmission);
router.get("/", requireAuth, requireRole("teacher"), submissionController.listSubmissions);
router.get("/:id", requireAuth, requireRole("teacher"), submissionController.getSubmission);
router.patch("/:id/publish", requireAuth, requireRole("teacher"), submissionController.publishSubmission);

export default router;