import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import AppShell from "../../components/AppShell";
import { listSubmissions, normalizeSubmission } from "../../services/api";
import TeacherDashboard from "./TeacherDashboard";
import UploadPaper from "./UploadPaper";
import Submissions from "./Submissions";
import TeacherResults from "./TeacherResults";
import TeacherEvaluation from "./TeacherEvaluation";
import Exams from "./Exams";
import TeacherSettings from "./TeacherSettings";

export default function TeacherPortal() {
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);

  async function refreshPapers() {
    try {
      const data = await listSubmissions();
      setPapers(data.map(normalizeSubmission));
    } catch (err) {
      console.error("Failed to load submissions:", err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { refreshPapers(); }, []);

  return (
    <AppShell role="teacher">
      <Routes>
        <Route path="dashboard" element={<TeacherDashboard papers={papers} loading={loading} />} />
        <Route path="upload" element={<UploadPaper onUploaded={refreshPapers} />} />
        <Route path="submissions" element={<Submissions papers={papers} onRefresh={refreshPapers} />} />
        <Route path="results" element={<TeacherResults papers={papers} />} />
        <Route path="results/:submissionId" element={<TeacherEvaluation />} />
        <Route path="exams" element={<Exams />} />
        <Route path="settings" element={<TeacherSettings />} />
        <Route path="*" element={<Navigate to="dashboard" replace />} />
      </Routes>
    </AppShell>
  );
}