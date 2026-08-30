import Teacher from "../models/Teacher.js";
import Student from "../models/Student.js";
import { createToken } from "../middleware/auth.middleware.js";

export async function login(req, res) {
  const { role, teacherId, password, roll } = req.body;

  if (role === "teacher") {
    const teacher = await Teacher.findOne({ teacherId });
    if (!teacher) {
      return res.status(401).json({ success: false, message: "Teacher ID not found. Please contact admin." });
    }
    if (teacher.password !== password) {
      return res.status(401).json({ success: false, message: "Invalid password." });
    }
    return res.json({
      success: true,
      data: {
        token: createToken({ 
          role, 
          teacherId, 
          teacherName: teacher.name,
          department: teacher.department || ""
        }),
        user: { 
          role, 
          teacherId, 
          name: teacher.name,
          department: teacher.department || ""
        }
      }
    });
  }

  if (role === "student") {
    if (!roll || !roll.trim()) {
      return res.status(400).json({ success: false, message: "Roll number is required." });
    }
    
    const normalizedRoll = roll.trim();
    const student = await Student.findOne({ roll: normalizedRoll });
    
    if (!student) {
      return res.status(401).json({ 
        success: false, 
        message: "Student not found. Please contact admin to register." 
      });
    }
    
    return res.json({
      success: true,
      data: {
        token: createToken({
          role,
          roll: normalizedRoll,
          name: student.name,
          program: student.program || "",
          year: student.year || ""
        }),
        user: {
          role,
          roll: normalizedRoll,
          name: student.name,
          program: student.program || "",
          year: student.year || ""
        }
      }
    });
  }

  return res.status(400).json({ success: false, message: "Valid login details are required" });
}

export function me(req, res) {
  res.json({ success: true, data: req.user });
}

export async function updateTeacher(req, res) {
  try {
    const { teacherId, name, department, password } = req.body;
    const teacher = await Teacher.findOne({ teacherId });
    
    if (!teacher) {
      return res.status(404).json({ success: false, message: "Teacher not found" });
    }
    
    if (name) teacher.name = name;
    if (department) teacher.department = department;
    if (password && password.length >= 4) teacher.password = password;
    
    await teacher.save();
    
    // Update the token with new info
    const token = createToken({ 
      role: "teacher", 
      teacherId, 
      teacherName: teacher.name,
      department: teacher.department
    });
    
    res.json({
      success: true,
      message: "Profile updated successfully",
      data: {
        token,
        user: {
          role: "teacher",
          teacherId,
          name: teacher.name,
          department: teacher.department
        }
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}