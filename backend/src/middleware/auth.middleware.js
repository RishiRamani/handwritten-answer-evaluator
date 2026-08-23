import crypto from "crypto";
import { env } from "../config/environment.js";

function encode(value) {
  return Buffer.from(JSON.stringify(value)).toString("base64url");
}

function signature(payload) {
  return crypto.createHmac("sha256", env.authSecret).update(payload).digest("base64url");
}

export function createToken(user) {
  const payload = encode({ ...user, exp: Date.now() + 8 * 60 * 60 * 1000 });
  return `${payload}.${signature(payload)}`;
}

function readToken(token) {
  const [payload, suppliedSignature] = token.split(".");
  if (!payload || !suppliedSignature || signature(payload) !== suppliedSignature) return null;

  try {
    const user = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    return user.exp > Date.now() ? user : null;
  } catch {
    return null;
  }
}

export function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  const user = token ? readToken(token) : null;

  if (!user) return res.status(401).json({ success: false, message: "Authentication required" });
  req.user = user;
  next();
}

export function requireRole(...roles) {
  return (req, res, next) => {
    
    if (!roles.includes(req.user?.role)) {
      return res.status(403).json({ success: false, message: "You are not authorized for this action" });
    }
    next();
  };
}