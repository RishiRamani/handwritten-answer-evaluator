import { Router } from "express";
import * as adminController from "../controllers/admin.controller.js";
import { requireAuth, requireRole } from "../middleware/auth.middleware.js";

const router = Router();

// Public admin login (no auth required)
router.post("/login", adminController.adminLogin);

// All routes below require admin authentication
router.use(requireAuth, requireRole("admin"));

router.post("/teachers", adminController.createTeacher);
router.post("/students", adminController.createStudent);
router.get("/teachers", adminController.listTeachers);
router.get("/students", adminController.listStudents);
router.delete("/teachers/:teacherId", adminController.deleteTeacher);
router.delete("/students/:roll", adminController.deleteStudent);

export default router;