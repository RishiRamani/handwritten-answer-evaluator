import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { CheckCircle2, AlertTriangle } from "lucide-react";
import PageTitle from "../../components/PageTitle";
import { getStudentResult, normalizeResult } from "../../services/api";

export default function StudentResultDetail() {
  const { roll } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getStudentResult(roll)
      .then(raw => setData(normalizeResult(raw)))
      .catch(err => setError(err.message));
  }, [roll]);

  if (error) return <div className="errorBox"><AlertTriangle size={16} />{error}</div>;
  if (!data) return <p>Loading result...</p>;

  return (
    <>
      <PageTitle eyebrow="STUDENT · RESULT" title={data.exam} desc={`Roll No. ${roll} · ${data.name}`} />
      <div className="resultHero">
        <div><span>YOUR SCORE</span><strong>{data.score}<small>/{data.totalMarks}</small></strong><p><CheckCircle2 size={15} /> Result published</p></div>
        <div className="resultHeroStats"><div><small>Questions</small><strong>{data.questions.length}</strong></div><div><small>AI confidence</small><strong>{data.confidence}%</strong></div></div>
      </div>
      <div className="panel">
        <div className="panelHeader"><div><h2>Question-wise Feedback</h2><p>See how each answer was evaluated.</p></div></div>
        {data.questions.map(q => (
          <div className="studentQuestion" key={q.no}>
            <div className="qLabel">{q.no}<span>{q.title}</span></div>
            <strong>{q.marks}/{q.total}</strong>
            <span className="confidence">{q.confidence}% confidence</span>
            <p>{q.feedback}</p>
          </div>
        ))}
      </div>
    </>
  );
}