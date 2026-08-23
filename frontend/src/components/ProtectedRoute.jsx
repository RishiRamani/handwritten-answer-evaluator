import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { getAuth } from "../services/api";

export default function ProtectedRoute({ role, children }) {
  const location = useLocation();
  const auth = getAuth();

  if (!auth?.token || auth.user?.role !== role) {
    return <Navigate to={`/${role}/login`} replace state={{ from: location.pathname }} />;
  }

  return children;
}