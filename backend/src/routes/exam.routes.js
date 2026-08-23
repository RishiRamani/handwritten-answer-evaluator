import { Router } from "express";
import * as examController from "../controllers/exam.controller.js";
import { requireAuth, requireRole } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/", requireAuth, requireRole("teacher"), examController.createExam);
router.get("/", requireAuth, examController.listExams);
router.get("/:id", requireAuth, examController.getExam);
router.post("/:id/questions", requireAuth, requireRole("teacher"), examController.addQuestion);

export default router;