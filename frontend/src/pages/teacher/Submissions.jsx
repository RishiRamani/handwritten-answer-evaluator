import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Search, UploadCloud, FileText, Eye, RefreshCw, AlertTriangle, RotateCcw, Trash2 } from "lucide-react";
import PageTitle from "../../components/PageTitle";
import { deleteSubmission, retrySubmission } from "../../services/api";

export default function Submissions({ papers, onRefresh }) {
  const [query, setQuery] = useState("");
  const [busyId, setBusyId] = useState(null);
  
  const filtered = papers.filter(p =>
    `${p.name} ${p.roll} ${p.exam}`.toLowerCase().includes(query.toLowerCase())
  );

  const getStatusBadge = (status) => {
    switch(status) {
      case "Evaluated": return "badge green";
      case "Failed": return "badge amber";
      case "OCR Processing":
      case "AI Evaluating": return "badge blue";
      default: return "badge amber";
    }
  };

  async function retry(id) {
    try {
      setBusyId(id);
      await retrySubmission(id);
      await onRefresh();
    } catch (err) {
      window.alert(err.message);
    } finally {
      setBusyId(null);
    }
  }

  async function remove(id) {
    if (!window.confirm("Delete this submission and its evaluation?")) return;
    try {
      setBusyId(id);
      await deleteSubmission(id);
      await onRefresh();
    } catch (err) {
      window.alert(err.message);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <>
      <PageTitle
        eyebrow="TEACHER · SUBMISSIONS"
        title="Student submissions"
        desc="Track uploaded answer sheets and their evaluation status."
        action={<Link className="btn btnPrimary" to="/teacher/upload"><UploadCloud size={17} /> Upload Paper</Link>}
      />
      <div className="panel">
        <div className="toolbar">
          <div className="searchBox"><Search size={16} /><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search student or roll number" /></div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span className="muted">{filtered.length} submissions</span>
            <button className="btn btnSoft" onClick={onRefresh}><RefreshCw size={13} /> Refresh</button>
          </div>
        </div>
        {papers.length === 0 ? (
          <p className="muted" style={{ textAlign: "center", padding: "20px 0" }}>
            No submissions yet. Upload a paper to get started.
          </p>
        ) : (
          <div className="tableWrap">
            <table>
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Roll No.</th>
                  <th>Exam</th>
                  <th>PDF</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p.id}>
                    <td><strong>{p.name}</strong></td>
                    <td>{p.roll}</td>
                    <td>{p.exam}</td>
                    <td><span className="filePill"><FileText size={13} />{p.file}</span></td>
                    <td><span className={getStatusBadge(p.status)}>{p.status}</span></td>
                    <td>
                      <Link className="tableButton" to={`/teacher/results/${p.submissionId}`}>
                        <Eye size={14} /> 
                        {p.status === "Evaluated" ? "Review" : "Check status"}
                      </Link>
                      {p.status === "Failed" && (
                        <button className="tableButton retryButton" onClick={() => retry(p.submissionId)} disabled={busyId === p.submissionId} style={{ marginLeft: 6 }}>
                          <RotateCcw size={13} /> Retry
                        </button>
                      )}
                      <button className="tableButton deleteButton" onClick={() => remove(p.submissionId)} disabled={busyId === p.submissionId} style={{ marginLeft: 6 }}>
                        <Trash2 size={13} /> Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}