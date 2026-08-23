import React, { useState } from "react";
import { Link } from "react-router-dom";
import { BarChart3, BrainCircuit, AlertTriangle, Users, Eye, Search, FileCheck2 } from "lucide-react";
import PageTitle from "../../components/PageTitle";
import Stat from "../../components/Stat";

export default function TeacherResults({ papers }) {
  const [query, setQuery] = useState("");
  const evaluated = papers.filter(p => p.status === "Evaluated");
  
  const filtered = evaluated.filter(p =>
    `${p.name} ${p.roll} ${p.exam}`.toLowerCase().includes(query.toLowerCase())
  );

  const avgScore = evaluated.length > 0 
    ? Math.round(evaluated.reduce((sum, p) => sum + (p.score || 0), 0) / evaluated.length) 
    : 0;
  const avgConfidence = evaluated.length > 0 
    ? Math.round(evaluated.reduce((sum, p) => sum + (p.confidence || 0), 0) / evaluated.length) 
    : 0;

  return (
    <>
      <PageTitle eyebrow="TEACHER · RESULTS" title="Evaluation results" desc="View scores and detailed AI evaluations." />
      
      <div className="statsGrid">
        <Stat icon={<BarChart3 />} label="Average score" value={`${avgScore}%`} sub={`Across ${evaluated.length} papers`} />
        <Stat icon={<BrainCircuit />} label="AI confidence" value={`${avgConfidence}%`} sub="Average confidence" />
        <Stat icon={<AlertTriangle />} label="Manual reviews" value={evaluated.filter(p => p.manualReview).length || 0} sub="Needs attention" />
        <Stat icon={<Users />} label="Evaluated" value={evaluated.length} sub="Students completed" />
      </div>
      
      <div className="panel">
        <div className="panelHeader">
          <div><h2>Published & Evaluated Results</h2><p>Open a result to review question-wise evaluation.</p></div>
        </div>
        
        <div className="toolbar">
          <div className="searchBox">
            <Search size={16} />
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search by name or roll..." />
          </div>
          <span className="muted">{filtered.length} results</span>
        </div>
        
        {filtered.length === 0 ? (
          <p className="muted" style={{ textAlign: "center", padding: "20px 0" }}>
            {evaluated.length === 0 ? "No evaluated results yet. Upload and evaluate papers first." : "No results match your search."}
          </p>
        ) : (
          <div className="tableWrap">
            <table>
              <thead>
                <tr><th>Student</th><th>Roll No.</th><th>Exam</th><th>Score</th><th>Confidence</th><th>Status</th><th></th></tr>
              </thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p.id}>
                    <td><strong>{p.name}</strong></td>
                    <td>{p.roll}</td>
                    <td>{p.exam}</td>
                    <td><strong>{p.score || 0}/100</strong></td>
                    <td>{p.confidence || 0}%</td>
                    <td>
                      <span className={p.published ? "badge green" : "badge amber"}>
                        {p.published ? "✅ Published" : "⏳ Pending"}
                      </span>
                    </td>
                    <td>
                      <Link className="tableButton" to={`/teacher/results/${p.submissionId}`}>
                        <Eye size={14} /> Details
                      </Link>
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