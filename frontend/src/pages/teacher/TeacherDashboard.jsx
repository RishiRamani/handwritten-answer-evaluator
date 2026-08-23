import React from "react";
import { Link } from "react-router-dom";
import { UploadCloud, FileText, FileCheck2, Clock3, BarChart3, ClipboardList, ChevronRight } from "lucide-react";
import PageTitle from "../../components/PageTitle";
import Stat from "../../components/Stat";
import { getAuth } from "../../services/api";

export default function TeacherDashboard({ papers, loading }) {
  const auth = getAuth();
  const teacherName = auth?.user?.name || "Teacher";
  
  const evaluated = papers.filter(p => p.status === "Evaluated").length;
  const pending = papers.filter(p => p.status === "Pending" || p.status === "Uploaded" || p.status === "OCR Processing" || p.status === "AI Evaluating").length;
  const failed = papers.filter(p => p.status === "Failed").length;

  if (loading) {
    return (
      <>
        <PageTitle eyebrow="TEACHER · OVERVIEW" title="Loading..." desc="Please wait" />
        <p>Loading dashboard data...</p>
      </>
    );
  }

  return (
    <>
      <PageTitle
        eyebrow="TEACHER · OVERVIEW"
        title={`Welcome back, ${teacherName} 👋`}
        desc="Manage answer sheets, evaluations and student results."
        action={<Link className="btn btnPrimary" to="/teacher/upload"><UploadCloud size={17} /> Upload Paper</Link>}
      />

      <div className="statsGrid">
        <Stat icon={<FileText />} label="Papers uploaded" value={papers.length} sub="Total submissions" />
        <Stat icon={<FileCheck2 />} label="Evaluated papers" value={evaluated} sub="Ready for results" />
        <Stat icon={<Clock3 />} label="Pending evaluation" value={pending} sub="Needs attention" />
        <Stat icon={<BarChart3 />} label="Failed" value={failed} sub="Need re-upload" />
      </div>

      <div className="twoColumn">
        <div className="panel">
          <div className="panelHeader">
            <div><h2>Recent submissions</h2><p>Latest student answer sheets</p></div>
            <Link to="/teacher/submissions">View all <ChevronRight size={15} /></Link>
          </div>
          {papers.length === 0 ? (
            <p className="muted">No submissions yet. Upload a paper to get started.</p>
          ) : (
            <div className="tableWrap">
              <table>
                <thead>
                  <tr><th>Student</th><th>Roll No.</th><th>Exam</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {papers.slice(0, 5).map(p => (
                    <tr key={p.id}>
                      <td><strong>{p.name}</strong></td>
                      <td>{p.roll}</td>
                      <td>{p.exam}</td>
                      <td>
                        <span className={
                          p.status === "Evaluated" ? "badge green" :
                          p.status === "Failed" ? "badge amber" :
                          "badge blue"
                        }>
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="panel">
          <div className="panelHeader">
            <div><h2>Quick actions</h2><p>Common teacher tasks</p></div>
          </div>
          <Link className="quickAction" to="/teacher/upload">
            <UploadCloud size={17} />
            <div><strong>Upload student paper</strong><small>PDF up to 15 MB</small></div>
            <ChevronRight />
          </Link>
          <Link className="quickAction" to="/teacher/submissions">
            <ClipboardList size={17} />
            <div><strong>Review submissions</strong><small>Check pending papers</small></div>
            <ChevronRight />
          </Link>
          <Link className="quickAction" to="/teacher/results">
            <BarChart3 size={17} />
            <div><strong>View results</strong><small>Scores and analytics</small></div>
            <ChevronRight />
          </Link>
        </div>
      </div>
    </>
  );
}