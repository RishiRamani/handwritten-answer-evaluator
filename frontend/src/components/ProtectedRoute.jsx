import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { getAuth } from "../services/api";

export default function ProtectedRoute({ role, children }) {
  const location = useLocation();
  const auth = getAuth();

  // Debug logging
  console.log(`[ProtectedRoute] Checking role: ${role}`, auth);

  // Check if user is authenticated
  if (!auth?.token) {
    console.log(`[ProtectedRoute] No token, redirecting to /${role}/login`);
    return <Navigate to={`/${role}/login`} replace state={{ from: location.pathname }} />;
  }

  // Check if the role matches
  if (auth.user?.role !== role) {
    console.log(`[ProtectedRoute] Role mismatch: expected ${role}, got ${auth.user?.role}`);
    // If role doesn't match, clear the auth and redirect to the correct login
    localStorage.removeItem("auth");
    return <Navigate to={`/${role}/login`} replace />;
  }

  // Additional validation for admin
  if (role === "admin" && auth.user?.role !== "admin") {
    console.log("[ProtectedRoute] Admin role validation failed");
    localStorage.removeItem("auth");
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}