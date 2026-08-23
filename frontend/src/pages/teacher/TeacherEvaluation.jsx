import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { CheckCircle2, Sparkles, AlertTriangle, Edit2, Save, X } from "lucide-react";
import PageTitle from "../../components/PageTitle";
import { getResult, publishSubmission, normalizeResult, updateScore } from "../../services/api";

export default function TeacherEvaluation() {
  const { submissionId } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [publishing, setPublishing] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editScore, setEditScore] = useState("");

  async function load() {
    try {
      const raw = await getResult(submissionId);
      setData(normalizeResult(raw));
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => { load(); }, [submissionId]);

  async function handlePublish() {
    try {
      setPublishing(true);
      await publishSubmission(submissionId);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setPublishing(false);
    }
  }

  async function handleSaveEdit(index) {
    const newScore = Number(editScore);
    if (isNaN(newScore) || newScore < 0) return;
    
    try {
      await updateScore(submissionId, index, newScore);
      await load();
      setEditingIndex(null);
      setEditScore("");
    } catch (err) {
      setError(err.message);
    }
  }

  function startEditing(index, currentScore) {
    setEditingIndex(index);
    setEditScore(String(currentScore));
  }

  if (error) return <div className="errorBox"><AlertTriangle size={16} />{error}</div>;
  if (!data) return <p>Loading evaluation...</p>;

  return (
    <>
      <PageTitle eyebrow="TEACHER · EVALUATION" title={`${data.name}'s evaluation`} desc={data.exam} />

      <div className="resultHero">
        <div>
          <span>FINAL SCORE</span>
          <strong>{data.score}<small>/{data.totalMarks}</small></strong>
          <p><CheckCircle2 size={15} /> AI confidence {data.confidence}%</p>
        </div>
        <div className="resultHeroStats">
          <div><small>Questions evaluated</small><strong>{data.questions.length}</strong></div>
          <div><small>Status</small><strong>{data.status}</strong></div>
        </div>
      </div>

      <div className="panel">
        <div className="panelHeader">
          <div><h2>Question-wise evaluation</h2><p>Review AI-generated scores and feedback. Click edit to manually adjust scores.</p></div>
          {data.published && <span className="badge green"><CheckCircle2 size={14} /> Published</span>}
          {data.teacherReviewed && <span className="badge blue">Teacher Reviewed</span>}
        </div>

        {data.questions.map((q, index) => (
          <div className="questionCard" key={index}>
            <div className="questionHeader">
              <div className="questionTitle">
                <span className="qNumber">Q{index + 1}</span>
                <div>
                  <strong>{q.title}</strong>
                  <small style={{ fontSize: "9px", color: "#6b7280", marginTop: "2px" }}>
                    Student answer: {q.studentAnswer?.slice(0, 100)}...
                  </small>
                </div>
              </div>
              <div className="questionScore" style={{ textAlign: "right" }}>
                {editingIndex === index ? (
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <input
                      type="number"
                      value={editScore}
                      onChange={e => setEditScore(e.target.value)}
                      style={{
                        width: "60px",
                        padding: "4px 6px",
                        border: "1px solid #6758e8",
                        borderRadius: "4px",
                        fontSize: "14px"
                      }}
                    />
                    <button
                      onClick={() => handleSaveEdit(index)}
                      style={{
                        background: "#6758e8",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        padding: "4px 8px",
                        cursor: "pointer"
                      }}
                    >
                      <Save size={14} />
                    </button>
                    <button
                      onClick={() => { setEditingIndex(null); setEditScore(""); }}
                      style={{
                        background: "#e5e7eb",
                        border: "none",
                        borderRadius: "4px",
                        padding: "4px 8px",
                        cursor: "pointer"
                      }}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <>
                    <strong style={{ fontSize: "19px" }}>
                      {q.marks}
                      <small style={{ fontSize: "10px", color: "#6b7280" }}>/{q.total}</small>
                    </strong>
                    {q.manuallyEdited && (
                      <span style={{ display: "block", color: "#d97706", fontSize: "8px" }}>
                        ✏️ Edited by teacher
                      </span>
                    )}
                    <span style={{ display: "block", color: "#2b9b75", fontSize: "8px" }}>
                      {q.confidence}% confidence
                    </span>
                    {!data.published && (
                      <button
                        onClick={() => startEditing(index, q.marks)}
                        style={{
                          background: "transparent",
                          border: "none",
                          color: "#6758e8",
                          cursor: "pointer",
                          fontSize: "9px",
                          marginTop: "4px"
                        }}
                      >
                        <Edit2 size={12} style={{ display: "inline", marginRight: "2px" }} />
                        Edit
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>

            <div className="aiFeedback">
              <Sparkles size={15} />
              <div><strong>AI Feedback</strong><p>{q.feedback}</p></div>
            </div>

            {q.confidence < 80 && (
              <div className="reviewFlag">
                <AlertTriangle size={16} />
                <div><strong>Manual review recommended</strong><p>AI confidence is below the review threshold.</p></div>
              </div>
            )}
          </div>
        ))}

        <div className="publishBar">
          <div>
            <strong>Ready to publish?</strong>
            <small>Students can view the result after publishing.</small>
          </div>
          <button
            className="btn btnPrimary"
            onClick={handlePublish}
            disabled={publishing || data.published}
          >
            <CheckCircle2 size={16} />
            {data.published ? "Published" : publishing ? "Publishing..." : "Save & Publish Result"}
          </button>
        </div>
      </div>
    </>
  );
}