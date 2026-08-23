import React, { useEffect, useState } from "react";
import { AlertTriangle, BarChart3, BookOpen, Clock3, Target, Trophy } from "lucide-react";
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

  const publishedResults = results.filter(r => r.published);
  const pendingResults = results.filter(r => !r.published);
  const examScores = publishedResults.map(result => ({
    ...result,
    percentage: result.totalMarks > 0 ? Math.round((result.score / result.totalMarks) * 100) : 0
  }));
  const averagePercentage = examScores.length
    ? Math.round(examScores.reduce((total, result) => total + result.percentage, 0) / examScores.length)
    : 0;
  const bestPercentage = examScores.length ? Math.max(...examScores.map(result => result.percentage)) : 0;
  const completedQuestions = publishedResults.reduce((total, result) => total + result.questions.length, 0);

  return (
    <>
      <PageTitle
        eyebrow="STUDENT · DASHBOARD"
        title={`Hello, ${studentName} 👋`}
        desc={`Roll No. ${roll}`}
      />

      {publishedResults.length === 0 && pendingResults.length === 0 && (
        <div className="panel" style={{ textAlign: "center", padding: "30px" }}>
          <p className="muted">No results available yet. Check back after your teacher publishes results.</p>
        </div>
      )}

      <div className="twoColumn">
        <div className="panel">
          <div className="panelHeader">
            <div><h2>Exam performance</h2><p>Marks percentage for each published examination</p></div>
            <BarChart3 size={18} color="#6758e8" />
          </div>
          {examScores.length === 0 ? (
            <p className="muted">Your exam graph will appear after a result is published.</p>
          ) : (
            <div style={{ display: "flex", alignItems: "flex-end", gap: 16, minHeight: 230, padding: "22px 8px 0", overflowX: "auto" }}>
              {examScores.map(result => (
                <div key={result.submissionId} style={{ minWidth: 76, flex: "1 0 76px", display: "flex", flexDirection: "column", alignItems: "center", gap: 7 }}>
                  <strong style={{ fontSize: 12, color: "#252d3c" }}>{result.percentage}%</strong>
                  <div style={{ width: "100%", height: `${Math.max(result.percentage, 5) * 1.55}px`, maxHeight: 170, minHeight: 8, background: result.percentage >= 70 ? "#2b9b75" : result.percentage >= 50 ? "#d97706" : "#dc6262", borderRadius: "6px 6px 2px 2px" }} title={`${result.exam}: ${result.percentage}%`} />
                  <span style={{ fontSize: 9, color: "#697385", textAlign: "center", maxWidth: 86, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{result.exam}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="panel">
          <div className="panelHeader">
            <div><h2>Summary</h2><p>Your academic snapshot</p></div>
          </div>
          <div className="quickAction"><Target size={17} /><div><strong>Average percentage</strong><small>Across published exams</small></div><b>{averagePercentage}%</b></div>
          <div className="quickAction"><Trophy size={17} /><div><strong>Best performance</strong><small>Highest exam percentage</small></div><b>{bestPercentage}%</b></div>
          <div className="quickAction"><BookOpen size={17} /><div><strong>Exams completed</strong><small>Published results</small></div><b>{publishedResults.length}</b></div>
          <div className="quickAction"><Clock3 size={17} /><div><strong>Pending results</strong><small>Waiting for publication</small></div><b>{pendingResults.length}</b></div>
          <div className="quickAction"><BarChart3 size={17} /><div><strong>Questions evaluated</strong><small>Total published questions</small></div><b>{completedQuestions}</b></div>
        </div>
      </div>
    </>
  );
}