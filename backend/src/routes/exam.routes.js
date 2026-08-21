import { Router } from "express";
import * as examController from "../controllers/exam.controller.js";

const router = Router();

router.post("/", examController.createExam);
router.get("/", examController.listExams);
router.get("/:id", examController.getExam);
router.post("/:id/questions", examController.addQuestion);

export default router;