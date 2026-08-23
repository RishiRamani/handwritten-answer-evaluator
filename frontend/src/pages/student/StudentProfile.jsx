import React, { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";
import PageTitle from "../../components/PageTitle";
import { getAuth, getAllStudentResults, normalizeResult } from "../../services/api";

export default function StudentProfile() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const auth = getAuth();
  const roll = auth?.user?.roll;
  const studentName = auth?.user?.name || `Student ${roll}`;

  useEffect(() => {
    if (roll) {
      getAllStudentResults(roll)
        .then(rawData => {
          const normalized = (rawData || []).map(normalizeResult);
          setResults(normalized);
          setLoading(false);
        })
        .catch(err => {
          setError(err.message);
          setLoading(false);
        });
    } else {
      setLoading(false);
      setError("No roll number found. Please login again.");
    }
  }, [roll]);

  if (loading) return <p>Loading profile...</p>;
  if (error) return <div className="errorBox"><AlertTriangle size={16} />{error}</div>;

  const publishedResults = results.filter(r => r.published);
  const totalScore = publishedResults.reduce((sum, r) => sum + (r.score || 0), 0);
  const totalMarks = publishedResults.reduce((sum, r) => sum + (r.totalMarks || 0), 0);
  const avgScore = publishedResults.length > 0 && totalMarks > 0 
    ? Math.round((totalScore / totalMarks) * 100) 
    : 0;
  const latest = results.length > 0 ? results[0] : null;

  return (
    <>
      <PageTitle eyebrow="STUDENT · PROFILE" title="My Profile" desc="Your student information and performance overview." />
      
      <div className="panel profileCard">
        <div className="largeAvatar">
          {studentName.slice(0, 2).toUpperCase()}
        </div>
        <h2>{studentName}</h2>
        <p>Roll No. {roll}</p>
        
        <div className="profileGrid">
          <div>
            <small>Total Results</small>
            <strong>{results.length}</strong>
          </div>
          <div>
            <small>Published Results</small>
            <strong>{publishedResults.length}</strong>
          </div>
          <div>
            <small>Overall Average</small>
            <strong>{avgScore}%</strong>
          </div>
          <div>
            <small>Latest Exam</small>
            <strong>{latest?.exam || "N/A"}</strong>
          </div>
        </div>
      </div>

      <div className="panel">
        <div className="panelHeader">
          <div><h2>All Results</h2><p>Complete examination history</p></div>
        </div>
        {results.length === 0 ? (
          <p className="muted">No results available yet.</p>
        ) : (
          results.map((r, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "12px 0",
                borderBottom: i < results.length - 1 ? "1px solid #e5e7eb" : "none"
              }}
            >
              <div>
                <strong style={{ fontSize: "13px" }}>{r.exam}</strong>
                <br />
                <span style={{ fontSize: "9px", color: r.published ? "#2b9b75" : "#d97706" }}>
                  {r.published ? "✅ Published" : "⏳ Pending"}
                </span>
              </div>
              <div style={{ textAlign: "right" }}>
                <strong style={{ fontSize: "18px" }}>{r.score || 0}</strong>
                <small style={{ fontSize: "11px", color: "#6b7280" }}>/{r.totalMarks || 0}</small>
                <br />
                <span style={{ fontSize: "9px", color: "#6b7280" }}>{r.confidence || 0}% confidence</span>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}