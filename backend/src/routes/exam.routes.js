import { Router } from "express";
import * as examController from "../controllers/exam.controller.js";
import { requireAuth, requireRole } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/", requireAuth, requireRole("teacher"), examController.createExam);
router.get("/", requireAuth, requireRole("teacher", "admin"), examController.listExams);
router.get("/:id", requireAuth, requireRole("teacher", "admin"), examController.getExam);
router.post("/:id/questions", requireAuth, requireRole("teacher"), examController.addQuestion);
router.delete("/:id", requireAuth, requireRole("teacher", "admin"), examController.deleteExam);

export default router;