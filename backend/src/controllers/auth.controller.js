import { env } from "../config/environment.js";
import { createToken } from "../middleware/auth.middleware.js";

export function login(req, res) {
  const { role, teacherId, password, roll } = req.body;

  if (role === "teacher") {
    if (teacherId !== env.teacherId || password !== env.teacherPassword) {
      return res.status(401).json({ success: false, message: "Invalid teacher credentials" });
    }
    return res.json({ success: true, data: { token: createToken({ role, teacherId }), user: { role, teacherId } } });
  }

  if (role === "student" && typeof roll === "string" && roll.trim()) {
    const normalizedRoll = roll.trim();
    return res.json({ success: true, data: { token: createToken({ role, roll: normalizedRoll }), user: { role, roll: normalizedRoll } } });
  }

  return res.status(400).json({ success: false, message: "Valid login details are required" });
}

export function me(req, res) {
  res.json({ success: true, data: req.user });
}