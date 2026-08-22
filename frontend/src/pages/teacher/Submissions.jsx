import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Search, UploadCloud, FileText, Eye, RefreshCw } from "lucide-react";
import PageTitle from "../../components/PageTitle";

export default function Submissions({ papers, onRefresh }) {
  const [query, setQuery] = useState("");
  const filtered = papers.filter(p =>
    `${p.name} ${p.roll} ${p.exam}`.toLowerCase().includes(query.toLowerCase())
  );

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
        <div className="tableWrap">
          <table>
            <thead><tr><th>Student</th><th>Roll No.</th><th>Exam</th><th>PDF</th><th>Status</th><th>Action</th></tr></thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id}>
                  <td><strong>{p.name}</strong></td>
                  <td>{p.roll}</td>
                  <td>{p.exam}</td>
                  <td><span className="filePill"><FileText size={13} />{p.file}</span></td>
                  <td><span className={p.status === "Pending" ? "badge amber" : p.status === "Failed" ? "badge amber" : "badge green"}>{p.status}</span></td>
                  <td><Link className="tableButton" to={`/teacher/results/${p.submissionId}`}><Eye size={14} /> {p.status === "Pending" ? "Check status" : "Review"}</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}