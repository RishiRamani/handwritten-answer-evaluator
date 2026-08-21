import { Router } from "express";
import * as submissionController from "../controllers/submission.controller.js";
import { uploadAnswerSheet } from "../middleware/upload.middleware.js";

const router = Router();

router.post("/", uploadAnswerSheet, submissionController.createSubmission);
router.get("/", submissionController.listSubmissions);
router.get("/:id", submissionController.getSubmission);
router.patch("/:id/publish", submissionController.publishSubmission);

export default router;