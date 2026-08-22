import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { CheckCircle2, Sparkles, AlertTriangle } from "lucide-react";
import PageTitle from "../../components/PageTitle";
import { getResult, publishSubmission, normalizeResult } from "../../services/api";

export default function TeacherEvaluation() {
  const { submissionId } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [publishing, setPublishing] = useState(false);

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
        </div>
      </div>

      <div className="panel">
        <div className="panelHeader">
          <div><h2>Question-wise evaluation</h2><p>Review AI-generated scores and feedback before publishing.</p></div>
          {data.published && <span className="badge green"><CheckCircle2 size={14} /> Published</span>}
        </div>

        {data.questions.map(q => (
          <div className="questionCard" key={q.no}>
            <div className="questionHeader">
              <div className="questionTitle">
                <span className="qNumber">{q.no}</span>
                <div><strong>{q.title}</strong><small>Student answer extracted from PDF</small></div>
              </div>
              <div className="questionScore">
                <strong>{q.marks}<small>/{q.total}</small></strong>
                <span>{q.confidence}% confidence</span>
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
                <button className="btn btnSoft">Review</button>
              </div>
            )}
          </div>
        ))}

        <div className="publishBar">
          <div><strong>Ready to publish?</strong><small>Students can view the result after publishing.</small></div>
          <button className="btn btnPrimary" onClick={handlePublish} disabled={publishing || data.published}>
            <CheckCircle2 size={16} /> {data.published ? "Published" : publishing ? "Publishing..." : "Save & Publish Result"}
          </button>
        </div>
      </div>
    </>
  );
}