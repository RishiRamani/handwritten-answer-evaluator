import * as adminService from "../services/admin.service.js";
import { successResponse } from "../utils/response.js";
import { createToken } from "../middleware/auth.middleware.js";

export async function adminLogin(req, res, next) {
  try {
    const { username, password } = req.body;
    const admin = await adminService.adminLogin({ username, password });
    const token = createToken({ role: "admin", username: admin.username });
    res.json(successResponse({ token, user: { username: admin.username, role: "admin" } }));
  } catch (err) {
    next(err);
  }
}

export async function createTeacher(req, res, next) {
  try {
    const { teacherId, name, password, department } = req.body;
    const teacher = await adminService.createTeacher({ teacherId, name, password, department });
    res.status(201).json(successResponse(teacher, "Teacher created"));
  } catch (err) {
    next(err);
  }
}

export async function createStudent(req, res, next) {
  try {
    const { roll, name, program, year } = req.body;
    const student = await adminService.createStudent({ roll, name, program, year });
    res.status(201).json(successResponse(student, "Student created"));
  } catch (err) {
    next(err);
  }
}

export async function listTeachers(req, res, next) {
  try {
    const teachers = await adminService.listTeachers();
    res.json(successResponse(teachers));
  } catch (err) {
    next(err);
  }
}

export async function listStudents(req, res, next) {
  try {
    const students = await adminService.listStudents();
    res.json(successResponse(students));
  } catch (err) {
    next(err);
  }
}

export async function deleteTeacher(req, res, next) {
  try {
    await adminService.deleteTeacher(req.params.teacherId);
    res.json(successResponse(null, "Teacher deleted"));
  } catch (err) {
    next(err);
  }
}

export async function deleteStudent(req, res, next) {
  try {
    await adminService.deleteStudent(req.params.roll);
    res.json(successResponse(null, "Student deleted"));
  } catch (err) {
    next(err);
  }
}