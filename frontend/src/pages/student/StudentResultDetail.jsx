import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { CheckCircle2, AlertTriangle, ChevronLeft } from "lucide-react";
import PageTitle from "../../components/PageTitle";
import { getStudentResultBySubmission, normalizeResult } from "../../services/api";

export default function StudentResultDetail() {
  const { roll, submissionId } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (roll && submissionId) {
      getStudentResultBySubmission(roll, submissionId)
        .then(raw => {
          const normalized = normalizeResult(raw);
          setData(normalized);
          setLoading(false);
        })
        .catch(err => {
          setError(err.message);
          setLoading(false);
        });
    } else if (roll) {
      // Fallback: if no submissionId, get latest (for backward compatibility)
      import("../../services/api").then(({ getStudentResult }) => {
        getStudentResult(roll)
          .then(raw => {
            const normalized = normalizeResult(raw);
            setData(normalized);
            setLoading(false);
          })
          .catch(err => {
            setError(err.message);
            setLoading(false);
          });
      });
    } else {
      setLoading(false);
      setError("No roll number found");
    }
  }, [roll, submissionId]);

  if (loading) return <p>Loading result...</p>;
  if (error) return <div className="errorBox"><AlertTriangle size={16} />{error}</div>;
  if (!data) return <p>No data available.</p>;

  const chartData = data.questions && data.questions.length > 0 
    ? data.questions.map(q => ({
        label: q.no,
        score: q.marks,
        total: q.total,
        percentage: q.total > 0 ? Math.round((q.marks / q.total) * 100) : 0
      }))
    : [];

  return (
    <>
      <PageTitle
        eyebrow="STUDENT · RESULT"
        title={data.exam || "Exam"}
        desc={`Roll No. ${roll} · ${data.name || "Student"}`}
        action={
          <Link className="btn btnSoft" to="/student/results">
            <ChevronLeft size={16} /> Back to Results
          </Link>
        }
      />

      <div className="resultHero">
        <div>
          <span>YOUR SCORE</span>
          <strong>{data.score || 0}<small>/{data.totalMarks || 0}</small></strong>
          <p>
            <CheckCircle2 size={15} /> 
            {data.published ? "Result published" : "Result pending publication"}
          </p>
          {data.teacherReviewed && (
            <p style={{ fontSize: "9px", color: "#a5b4fc", marginTop: "2px" }}>
              ✏️ Teacher reviewed
            </p>
          )}
        </div>
        <div className="resultHeroStats">
          <div><small>Questions</small><strong>{data.questions?.length || 0}</strong></div>
          <div><small>AI confidence</small><strong>{data.confidence || 0}%</strong></div>
          <div><small>Status</small><strong>{data.published ? "Published" : "Pending"}</strong></div>
        </div>
      </div>

      {data.questions && data.questions.length > 0 && (
        <>
          <div className="panel">
            <div className="panelHeader">
              <div><h2>Score Overview</h2><p>Visual representation of your performance</p></div>
            </div>
            <div style={{ display: "flex", gap: "8px", alignItems: "flex-end", height: "150px", padding: "10px 0" }}>
              {chartData.map((item, i) => (
                <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <div
                    style={{
                      width: "100%",
                      height: `${Math.max(5, item.percentage)}%`,
                      background: item.percentage >= 70 ? "#2b9b75" : item.percentage >= 50 ? "#d97706" : "#dc2626",
                      borderRadius: "4px 4px 0 0",
                      minHeight: "10px",
                      transition: "height 0.5s ease",
                      position: "relative"
                    }}
                  />
                  <span style={{ fontSize: "8px", marginTop: "4px", color: "#6b7280" }}>{item.label}</span>
                  <span style={{ fontSize: "7px", color: "#374151", fontWeight: 600 }}>{item.score}/{item.total}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="panel">
            <div className="panelHeader">
              <div>
                <h2>Question-wise Feedback</h2>
                <p>See how each answer was evaluated.</p>
              </div>
            </div>
            {data.questions.map((q, index) => (
              <div className="studentQuestion" key={index}>
                <div className="qLabel">
                  {q.no}
                  <span style={{ fontSize: "8px", color: "#6b7280", fontWeight: "normal" }}>
                    {q.confidence || 0}% confidence
                  </span>
                  {q.manuallyEdited && (
                    <span style={{ fontSize: "7px", color: "#d97706", fontWeight: "bold" }}>
                      ✏️ Edited
                    </span>
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <strong style={{ fontSize: "12px" }}>{q.title}</strong>
                  <p style={{ fontSize: "9px", color: "#6b7280", margin: "4px 0 0" }}>
                    {q.feedback || "No feedback available."}
                  </p>
                  {q.studentAnswer && (
                    <details style={{ marginTop: "4px" }}>
                      <summary style={{ fontSize: "8px", color: "#6b7280", cursor: "pointer" }}>
                        View student answer
                      </summary>
                      <p style={{ fontSize: "8px", color: "#374151", background: "#f3f4f6", padding: "6px", borderRadius: "4px", margin: "4px 0 0" }}>
                        {q.studentAnswer}
                      </p>
                    </details>
                  )}
                </div>
                <strong style={{ fontSize: "17px", minWidth: "60px", textAlign: "right" }}>
                  {q.marks || 0}/{q.total || 0}
                </strong>
              </div>
            ))}
          </div>
        </>
      )}
    </>
  );
}