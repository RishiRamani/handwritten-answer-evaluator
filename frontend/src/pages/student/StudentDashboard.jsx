import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, AlertTriangle } from "lucide-react";
import PageTitle from "../../components/PageTitle";
import { getAuth, getAllStudentResults, normalizeResult } from "../../services/api";

export default function StudentDashboard() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const auth = getAuth();
  const roll = auth?.user?.roll;
  const studentName = auth?.user?.name || roll;

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
      setError("No roll number found. Please login again.");
    }
  }, [roll]);

  if (loading) return <p>Loading your results...</p>;
  if (error) return <div className="errorBox"><AlertTriangle size={16} />{error}</div>;

  const latest = results.length > 0 ? results[0] : null;
  const publishedResults = results.filter(r => r.published);
  const pendingResults = results.filter(r => !r.published);

  // Chart data for latest result
  const chartData = latest && latest.questions ? latest.questions.map(q => ({
    label: q.no,
    score: q.marks,
    total: q.total,
    percentage: q.total > 0 ? Math.round((q.marks / q.total) * 100) : 0
  })) : [];

  return (
    <>
      <PageTitle
        eyebrow="STUDENT · DASHBOARD"
        title={`Hello, ${studentName} 👋`}
        desc={`Roll No. ${roll}`}
      />

      {latest && latest.published && (
        <div className="studentScore">
          <div>
            <span>📊 LATEST RESULT</span>
            <h2>{latest.exam}</h2>
            <p>Published · {new Date().toLocaleDateString()}</p>
          </div>
          <strong>
            {latest.score}
            <small>/{latest.totalMarks}</small>
          </strong>
          
<Link className="btn btnPrimary" to={`/student/results/${roll}/${latest.submissionId}`}>
  View Detailed Result <ChevronRight size={16} />
</Link>
        </div>
      )}

      {publishedResults.length === 0 && pendingResults.length === 0 && (
        <div className="panel" style={{ textAlign: "center", padding: "30px" }}>
          <p className="muted">No results available yet. Check back after your teacher publishes results.</p>
        </div>
      )}

      <div className="twoColumn">
        {latest && latest.published && latest.questions && latest.questions.length > 0 && (
          <div className="panel">
            <div className="panelHeader">
              <div><h2>Performance Overview</h2><p>Question-wise score distribution</p></div>
            </div>
            {/* Chart */}
            <div style={{ marginBottom: "20px", background: "#f8f9fc", borderRadius: "8px", padding: "15px" }}>
              <div style={{ display: "flex", gap: "8px", alignItems: "flex-end", height: "120px" }}>
                {chartData.map((item, i) => (
                  <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <div
                      style={{
                        width: "100%",
                        height: `${Math.max(5, item.percentage)}%`,
                        background: item.percentage >= 70 ? "#2b9b75" : item.percentage >= 50 ? "#d97706" : "#dc2626",
                        borderRadius: "4px 4px 0 0",
                        minHeight: "10px",
                        transition: "height 0.5s ease"
                      }}
                    />
                    <span style={{ fontSize: "8px", marginTop: "4px", color: "#6b7280" }}>{item.label}</span>
                    <span style={{ fontSize: "7px", color: "#374151", fontWeight: 600 }}>{item.score}</span>
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", justifyContent: "center", gap: "16px", marginTop: "8px", fontSize: "8px", color: "#6b7280" }}>
                <span>✅ ≥70%</span>
                <span>⚠️ 50-69%</span>
                <span>❌ &lt;50%</span>
              </div>
            </div>

            {/* Score lines */}
            {latest.questions.map((q, idx) => (
              <div className="scoreLine" key={idx}>
                <span>{q.no}</span>
                <div>
                  <strong>{q.title}</strong>
                  <div className="progress">
                    <i style={{ width: `${q.total > 0 ? (q.marks / q.total) * 100 : 0}%` }} />
                  </div>
                </div>
                <b>{q.marks}/{q.total}</b>
              </div>
            ))}
          </div>
        )}

        <div className="panel">
          <div className="panelHeader">
            <div><h2>All Results</h2><p>Your complete history</p></div>
          </div>
          {results.length > 0 ? (
            results.map((r, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "10px 0",
                  borderBottom: i < results.length - 1 ? "1px solid #e5e7eb" : "none"
                }}
              >
                <div>
                  <strong style={{ fontSize: "12px" }}>{r.exam}</strong>
                  <br />
                  <span style={{ fontSize: "9px", color: r.published ? "#2b9b75" : "#d97706" }}>
                    {r.published ? "✅ Published" : "⏳ Pending"}
                  </span>
                </div>
                <div style={{ textAlign: "right" }}>
                  <strong style={{ fontSize: "16px" }}>{r.score || 0}</strong>
                  <small style={{ fontSize: "10px", color: "#6b7280" }}>/{r.totalMarks || 0}</small>
                  <br />
                  <span style={{ fontSize: "9px", color: "#6b7280" }}>{r.confidence || 0}% confidence</span>
                </div>
              </div>
            ))
          ) : (
            <p className="muted">No results available yet.</p>
          )}
        </div>
      </div>
    </>
  );
}