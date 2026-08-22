import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import AppShell from "../../components/AppShell";
import StudentDashboard from "./StudentDashboard";
import StudentResults from "./StudentResults";
import StudentResultDetail from "./StudentResultDetail";
import StudentProfile from "./StudentProfile";

export default function StudentPortal() {
  return (
    <AppShell role="student">
      <Routes>
        <Route path="dashboard" element={<StudentDashboard />} />
        <Route path="results" element={<StudentResults />} />
        <Route path="results/:roll" element={<StudentResultDetail />} />
        <Route path="profile" element={<StudentProfile />} />
        <Route path="*" element={<Navigate to="dashboard" replace />} />
      </Routes>
    </AppShell>
  );
}