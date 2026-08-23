import { Router } from "express";
import * as authController from "../controllers/auth.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/login", authController.login);
router.get("/me", requireAuth, authController.me);
router.put("/teacher/update", requireAuth, authController.updateTeacher);

export default router;