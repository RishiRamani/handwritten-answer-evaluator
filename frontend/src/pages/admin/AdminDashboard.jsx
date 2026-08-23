import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Users, UserPlus, BookOpen, BarChart3, UserCheck, ChevronRight } from "lucide-react";
import PageTitle from "../../components/PageTitle";
import Stat from "../../components/Stat";
import { adminGetTeachers, adminGetStudents, listExams, listSubmissions, getAuth } from "../../services/api";

export default function AdminDashboard() {
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [exams, setExams] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Verify admin role on mount
  useEffect(() => {
    const auth = getAuth();
    console.log("[AdminDashboard] Current auth:", auth);
    if (!auth || auth.user?.role !== "admin") {
      setError("You are not authorized for this action. Please login again.");
      setLoading(false);
      // Clear invalid auth
      localStorage.removeItem("auth");
    }
  }, []);

  useEffect(() => {
    if (error) return;
    loadData();
  }, [error]);

  async function loadData() {
    try {
      setLoading(true);
      const auth = getAuth();
      if (!auth || auth.user?.role !== "admin") {
        throw new Error("Not authorized");
      }
      
      const [teachersData, studentsData, examsData, submissionsData] = await Promise.all([
        adminGetTeachers(),
        adminGetStudents(),
        listExams(),
        listSubmissions()
      ]);
      setTeachers(teachersData || []);
      setStudents(studentsData || []);
      setExams(examsData || []);
      setSubmissions(submissionsData || []);
      setError("");
    } catch (err) {
      console.error("[AdminDashboard] Error loading data:", err);
      setError(err.message || "Failed to load data");
      if (err.message === "Not authorized") {
        localStorage.removeItem("auth");
      }
    } finally {
      setLoading(false);
    }
  }

  const totalTeachers = teachers.length;
  const totalStudents = students.length;
  const totalExams = exams.length;
  const totalSubmissions = submissions.length;

  // If not authorized, show error and redirect
  if (error === "You are not authorized for this action. Please login again.") {
    return (
      <>
        <PageTitle eyebrow="ADMIN · OVERVIEW" title="Admin Dashboard" desc="Manage teachers and student accounts." />
        <div className="errorBox" style={{ marginBottom: "16px", padding: "20px", fontSize: "14px" }}>
          <span>⚠️</span> {error}
          <Link to="/admin/login" className="btn btnPrimary" style={{ marginLeft: "auto" }}>
            Go to Admin Login
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <PageTitle
        eyebrow="ADMIN · OVERVIEW"
        title="Admin Dashboard"
        desc="Manage teachers and student accounts."
        action={
          <Link className="btn btnPrimary" to="/admin/create-teacher">
            <UserPlus size={17} /> Add Teacher
          </Link>
        }
      />

      {/* {error && <div className="errorBox" style={{ marginBottom: "16px" }}><span>⚠️</span> {error}</div>} */}

      <div className="statsGrid">
        <Stat icon={<Users />} label="Total Teachers" value={totalTeachers} sub="Registered teachers" />
        <Stat icon={<UserCheck />} label="Total Students" value={totalStudents} sub="Registered students" />
        <Stat icon={<BookOpen />} label="Exams" value={totalExams} sub="Total examinations" />
        <Stat icon={<BarChart3 />} label="Submissions" value={totalSubmissions} sub="Total submissions" />
      </div>

      <div className="twoColumn" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
        <div className="panel">
          <div className="panelHeader">
            <div><h2>Recent Teachers</h2><p>Teacher accounts</p></div>
            <Link to="/admin/teachers">View all <ChevronRight size={15} /></Link>
          </div>
          {loading ? (
            <p className="muted">Loading...</p>
          ) : teachers.length === 0 ? (
            <p className="muted">No teachers registered</p>
          ) : (
            <div className="tableWrap" style={{ overflowX: "auto" }}>
              <table style={{ minWidth: "auto" }}>
                <thead>
                  <tr><th>Teacher ID</th><th>Name</th><th>Department</th></tr>
                </thead>
                <tbody>
                  {teachers.slice(0, 5).map(t => (
                    <tr key={t.teacherId}>
                      <td><strong>{t.teacherId}</strong></td>
                      <td>{t.name}</td>
                      <td>{t.department || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="panel">
          <div className="panelHeader">
            <div><h2>Recent Students</h2><p>Student accounts</p></div>
            <Link to="/admin/students">View all <ChevronRight size={15} /></Link>
          </div>
          {loading ? (
            <p className="muted">Loading...</p>
          ) : students.length === 0 ? (
            <p className="muted">No students registered</p>
          ) : (
            <div className="tableWrap" style={{ overflowX: "auto" }}>
              <table style={{ minWidth: "auto" }}>
                <thead>
                  <tr><th>Roll</th><th>Name</th><th>Program</th></tr>
                </thead>
                <tbody>
                  {students.slice(0, 5).map(s => (
                    <tr key={s.roll}>
                      <td><strong>{s.roll}</strong></td>
                      <td>{s.name}</td>
                      <td>{s.program || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}