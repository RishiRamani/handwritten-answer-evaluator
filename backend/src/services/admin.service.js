import Admin from "../models/Admin.js";
import Teacher from "../models/Teacher.js";
import Student from "../models/Student.js";

export async function createAdmin({ username, password }) {
  const existing = await Admin.findOne({ username });
  if (existing) {
    const err = new Error("Admin already exists");
    err.status = 400;
    throw err;
  }
  return Admin.create({ username, password });
}

export async function adminLogin({ username, password }) {
  const admin = await Admin.findOne({ username });
  if (!admin || admin.password !== password) {
    const err = new Error("Invalid admin credentials");
    err.status = 401;
    throw err;
  }
  return admin;
}

export async function createTeacher({ teacherId, name, password, department }) {
  const existing = await Teacher.findOne({ teacherId });
  if (existing) {
    const err = new Error("Teacher ID already exists");
    err.status = 400;
    throw err;
  }
  return Teacher.create({ teacherId, name, password, department });
}

export async function createStudent({ roll, name, program, year }) {
  const existing = await Student.findOne({ roll });
  if (existing) {
    const err = new Error("Student roll already exists");
    err.status = 400;
    throw err;
  }
  return Student.create({ roll, name, program, year });
}

export async function listTeachers() {
  return Teacher.find().select("-password");
}

export async function listStudents() {
  return Student.find();
}

export async function deleteTeacher(teacherId) {
  return Teacher.deleteOne({ teacherId });
}

export async function deleteStudent(roll) {
  return Student.deleteOne({ roll });
}