import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import AppShell from "../../components/AppShell";
import AdminDashboard from "./AdminDashboard";
import AdminTeachers from "./AdminTeachers";
import AdminStudents from "./AdminStudents";
import CreateTeacher from "./CreateTeacher";
import CreateStudent from "./CreateStudent";

export default function AdminPortal() {
  return (
    <AppShell role="admin">
      <Routes>
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="teachers" element={<AdminTeachers />} />
        <Route path="students" element={<AdminStudents />} />
        <Route path="create-teacher" element={<CreateTeacher />} />
        <Route path="create-student" element={<CreateStudent />} />
        <Route path="*" element={<Navigate to="dashboard" replace />} />
      </Routes>
    </AppShell>
  );
}