import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FileCheck2, AlertTriangle, Clock } from "lucide-react";
import PageTitle from "../../components/PageTitle";
import { getAuth, getAllStudentResults, normalizeResult } from "../../services/api";

export default function StudentResults() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const auth = getAuth();
  const roll = auth?.user?.roll;

  useEffect(() => {
    if (roll) {
      getAllStudentResults(roll)
        .then(rawResults => {
          const normalized = (rawResults || []).map(normalizeResult);
          setResults(normalized);
          setLoading(false);
        })
        .catch(err => {
          setError(err.message);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [roll]);

  if (loading) return <p>Loading results...</p>;
  if (error) return <div className="errorBox"><AlertTriangle size={16} />{error}</div>;

  const publishedResults = results.filter(r => r.published);
  const pendingResults = results.filter(r => !r.published && r.status === "COMPLETED");

  return (
    <>
      <PageTitle eyebrow="STUDENT · RESULTS" title="My Results" desc="Your published and pending examination evaluations." />
      
      {publishedResults.length === 0 && pendingResults.length === 0 ? (
        <div className="panel" style={{ textAlign: "center", padding: "30px" }}>
          <p className="muted">No results available yet.</p>
          <p style={{ fontSize: "10px", color: "#6b7280" }}>Check back after your teacher publishes results.</p>
        </div>
      ) : (
        <>
          {/* Published Results */}
          {publishedResults.map((r, i) => (
            <div className="panel studentResultCard" key={r.submissionId || i}>
              <div className="resultIcon"><FileCheck2 /></div>
              <div className="grow">
                <span className="badge green">Published</span>
                <h2>{r.exam}</h2>
                <p>Roll No. {roll} · {r.confidence || 0}% AI confidence</p>
                <p style={{ fontSize: "9px", color: "#6b7280" }}>
                  {r.questions?.length || 0} questions · {r.teacherReviewed ? "✓ Teacher reviewed" : "AI evaluated"}
                </p>
              </div>

              <div style={{ marginLeft: "auto", display: "flex", flexDirection: "column", alignItems: "flex-start", justifyContent: "center", gap: "8px", minWidth: "150px" }}>
                <strong className="bigScore" style={{ display: "block", textAlign: "left", margin: 0 }}>
                  {r.score || 0}
                  <small>/{r.totalMarks || 0}</small>
                </strong>
                <Link 
                  className="btn btnPrimary" 
                  to={`/student/results/${roll}/${r.submissionId}`}
                  style={{ width: "fit-content" }}
                >
                  View Result
                </Link>
              </div>
            </div>
          ))}

          {/* Pending Results (Completed but not published) */}
          {pendingResults.map((r, i) => (
            <div className="panel studentResultCard" key={r.submissionId || i} style={{ opacity: 0.7 }}>
              <div className="resultIcon" style={{ background: "#fef3c7", color: "#d97706" }}><Clock /></div>
              <div className="grow">
                <span className="badge amber">Pending Publication</span>
                <h2>{r.exam}</h2>
                <p>Roll No. {roll} · Evaluation complete, waiting for teacher to publish</p>
              </div>

              <div style={{ marginLeft: "auto", display: "flex", flexDirection: "column", alignItems: "flex-start", justifyContent: "center", gap: "8px", minWidth: "150px" }}>
                <strong className="bigScore" style={{ display: "block", textAlign: "left", color: "#6b7280", margin: 0 }}>
                  {r.score || 0}
                  <small>/{r.totalMarks || 0}</small>
                </strong>
                <span className="btn btnSoft" style={{ cursor: "default", width: "fit-content" }}>
                  Awaiting Publication
                </span>
              </div>
            </div>
          ))}
        </>
      )}
    </>
  );
}