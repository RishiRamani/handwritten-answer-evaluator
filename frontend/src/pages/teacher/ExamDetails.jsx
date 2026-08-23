import React, { useEffect, useState } from "react";
import { ArrowLeft, AlertTriangle, FileText, Eye, RefreshCw } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import PageTitle from "../../components/PageTitle";
import { getExam, listSubmissions, normalizeSubmission } from "../../services/api";

export default function ExamDetails() {
  const { examId } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  async function loadDetails() {
    try {
      setLoading(true);
      const [examData, submissionData] = await Promise.all([
        getExam(examId),
        listSubmissions({ examId })
      ]);
      setExam(examData);
      setSubmissions(submissionData.map(normalizeSubmission));
      setError("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadDetails(); }, [examId]);

  if (loading) return <p>Loading examination details...</p>;
  if (error) return <div className="errorBox"><AlertTriangle size={16} />{error}</div>;
  if (!exam) return null;

  const questions = exam.questions || [];
  const totalMarks = questions.reduce((total, question) => total + Number(question.maxMarks || 0), 0);

  return (
    <>
      <PageTitle
        eyebrow="TEACHER · EXAMINATION"
        title={exam.title}
        desc={exam.subject || "Examination details"}
        action={<button className="btn btnSoft" onClick={() => navigate("/teacher/exams")}><ArrowLeft size={15} /> Back to examinations</button>}
      />

      <div className="statsGrid">
        <div className="statCard"><div><small>Questions</small><strong>{questions.length}</strong><span>In this examination</span></div></div>
        <div className="statCard"><div><small>Total marks</small><strong>{totalMarks}</strong><span>Maximum score</span></div></div>
        <div className="statCard"><div><small>Submissions</small><strong>{submissions.length}</strong><span>For this examination</span></div></div>
        <div className="statCard"><div><small>Evaluated</small><strong>{submissions.filter(submission => submission.status === "Evaluated").length}</strong><span>Completed reviews</span></div></div>
      </div>

      <div className="twoColumn">
        <div className="panel">
          <div className="panelHeader">
            <div><h2>Questions and marks</h2><p>Reference answers used by the AI evaluator.</p></div>
          </div>
          {questions.length === 0 ? <p className="muted">No questions have been added.</p> : questions.map((question, index) => (
            <div className="questionCard" key={question._id || index}>
              <div className="questionHeader">
                <div className="questionTitle"><span className="qNumber">Q{index + 1}</span><strong>{question.questionText}</strong></div>
                <strong>{question.maxMarks} marks</strong>
              </div>
              <div className="aiFeedback"><div><strong>Reference answer</strong><p>{question.answerKey}</p></div></div>
            </div>
          ))}
        </div>

        <div className="panel">
          <div className="panelHeader">
            <div><h2>Submissions</h2><p>Answer sheets uploaded for this exam.</p></div>
            <button className="btn btnSoft" onClick={loadDetails}><RefreshCw size={13} /> Refresh</button>
          </div>
          {submissions.length === 0 ? <p className="muted">No submissions for this examination yet.</p> : submissions.map(submission => (
            <div className="quickAction" key={submission.id}>
              <FileText size={17} />
              <div><strong>{submission.name}</strong><small>{submission.roll} · {submission.status}</small></div>
              <Link className="tableButton" to={`/teacher/results/${submission.submissionId}`}><Eye size={13} /> View</Link>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
