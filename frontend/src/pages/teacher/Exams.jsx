import React, { useEffect, useState } from "react";
import { AlertTriangle, BookOpen, Check, Plus, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import PageTitle from "../../components/PageTitle";
import { createExam, deleteExam, listExams } from "../../services/api";

const emptyQuestion = () => ({ questionText: "", answerKey: "", maxMarks: "" });

function ExamCard({ exam }) {
  const [deleting, setDeleting] = useState(false);
  const navigate = useNavigate();
  const marks = exam.questions?.reduce((total, question) => total + Number(question.maxMarks || 0), 0) || 0;

  async function remove() {
    if (!window.confirm(`Delete ${exam.title}? This also deletes its submissions and results.`)) return;
    try {
      setDeleting(true);
      await deleteExam(exam._id);
      window.location.reload();
    } catch (error) {
      window.alert(error.message);
      setDeleting(false);
    }
  }

  return (
    <div className="panel examCard" role="button" tabIndex="0" onClick={() => navigate(`/teacher/exams/${exam._id}`)} onKeyDown={event => event.key === "Enter" && navigate(`/teacher/exams/${exam._id}`)}>
      <div className="examIcon"><BookOpen /></div>
      <span className="badge blue">{exam.subject || "General"}</span>
      <h2 style={{ fontSize: "15px", margin: "13px 0 4px" }}>{exam.title}</h2>
      <p style={{ fontSize: "10px", color: "#8991a0", margin: "0 0 17px" }}>
        {exam.questions?.length || 0} questions · {marks} marks
      </p>
      <button className="btn btnSoft full" onClick={event => { event.stopPropagation(); remove(); }} disabled={deleting}>
        <Trash2 size={14} /> {deleting ? "Deleting..." : "Delete Examination"}
      </button>
    </div>
  );
}

export default function Exams() {
  const [exams, setExams] = useState([]);
  const [creating, setCreating] = useState(false);
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [questions, setQuestions] = useState([emptyQuestion()]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function loadExams() {
    try {
      setExams(await listExams());
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => { loadExams(); }, []);

  function updateQuestion(index, field, value) {
    setQuestions(current => current.map((question, questionIndex) => (
      questionIndex === index ? { ...question, [field]: value } : question
    )));
  }

  function resetForm() {
    setTitle("");
    setSubject("");
    setQuestions([emptyQuestion()]);
    setCreating(false);
  }

  async function submit(event) {
    event.preventDefault();
    setError("");

    if (!title.trim()) return setError("Enter an examination title.");
    if (questions.some(question => !question.questionText.trim() || !question.answerKey.trim() || Number(question.maxMarks) <= 0)) {
      return setError("Complete every question and enter marks greater than zero.");
    }

    try {
      setSaving(true);
      await createExam({
        title: title.trim(),
        subject: subject.trim(),
        questions: questions.map(question => ({
          questionText: question.questionText.trim(),
          answerKey: question.answerKey.trim(),
          maxMarks: Number(question.maxMarks)
        }))
      });
      await loadExams();
      resetForm();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <PageTitle
        eyebrow="TEACHER · EXAMS"
        title="Examinations"
        desc="Manage examinations for answer-sheet uploads."
        action={!creating && <button className="btn btnPrimary" onClick={() => { setError(""); setCreating(true); }}><Plus size={17} /> Create Examination</button>}
      />

      {error && <div className="errorBox"><AlertTriangle size={16} />{error}</div>}

      {creating && (
        <form className="panel" onSubmit={submit} style={{ marginBottom: 24 }}>
          <div className="panelHeader">
            <div><h2>Create examination</h2><p>Add the questions and answer keys used for evaluation.</p></div>
            <button type="button" className="btn btnSoft" onClick={resetForm}>Cancel</button>
          </div>

          <label style={{ display: "block", fontSize: "10px", fontWeight: "800", color: "#566073", marginBottom: "15px" }}>
            Examination title
            <input
              value={title}
              onChange={event => setTitle(event.target.value)}
              placeholder="e.g. Data Structures Mid-Term"
              style={{ display: "block", width: "100%", marginTop: "7px", border: "1px solid #dfe2e9", borderRadius: "9px", padding: "11px 12px", outline: "0", background: "#fff", color: "#252d3c" }}
            />
          </label>
          <label style={{ display: "block", fontSize: "10px", fontWeight: "800", color: "#566073", marginBottom: "15px" }}>
            Subject
            <input
              value={subject}
              onChange={event => setSubject(event.target.value)}
              placeholder="e.g. Data Structures"
              style={{ display: "block", width: "100%", marginTop: "7px", border: "1px solid #dfe2e9", borderRadius: "9px", padding: "11px 12px", outline: "0", background: "#fff", color: "#252d3c" }}
            />
          </label>

          {questions.map((question, index) => (
            <div className="panel" key={index} style={{ marginTop: 16, padding: 16 }}>
              <div className="panelHeader">
                <div><h3 style={{ fontSize: "12px", margin: 0 }}>Question {index + 1}</h3></div>
                {questions.length > 1 && (
                  <button
                    type="button"
                    className="btn btnSoft"
                    onClick={() => setQuestions(current => current.filter((_, questionIndex) => questionIndex !== index))}
                    style={{ padding: "6px 10px", fontSize: "10px" }}
                  >
                    <Trash2 size={14} /> Remove
                  </button>
                )}
              </div>
              <label style={{ display: "block", fontSize: "10px", fontWeight: "800", color: "#566073", marginBottom: "15px" }}>
                Question
                <textarea
                  value={question.questionText}
                  onChange={event => updateQuestion(index, "questionText", event.target.value)}
                  rows="2"
                  placeholder="Enter the question"
                  style={{ display: "block", width: "100%", marginTop: "7px", border: "1px solid #dfe2e9", borderRadius: "9px", padding: "11px 12px", outline: "0", background: "#fff", color: "#252d3c", resize: "vertical", lineHeight: "1.5" }}
                />
              </label>
              <label style={{ display: "block", fontSize: "10px", fontWeight: "800", color: "#566073", marginBottom: "15px" }}>
                Reference answer
                <textarea
                  value={question.answerKey}
                  onChange={event => updateQuestion(index, "answerKey", event.target.value)}
                  rows="3"
                  placeholder="Enter the answer used by Qwen for grading"
                  style={{ display: "block", width: "100%", marginTop: "7px", border: "1px solid #dfe2e9", borderRadius: "9px", padding: "11px 12px", outline: "0", background: "#fff", color: "#252d3c", resize: "vertical", lineHeight: "1.5" }}
                />
              </label>
              <label style={{ display: "block", fontSize: "10px", fontWeight: "800", color: "#566073", marginBottom: "15px" }}>
                Maximum marks
                <input
                  type="number"
                  min="0.25"
                  step="0.25"
                  value={question.maxMarks}
                  onChange={event => updateQuestion(index, "maxMarks", event.target.value)}
                  placeholder="10"
                  style={{ display: "block", width: "100%", marginTop: "7px", border: "1px solid #dfe2e9", borderRadius: "9px", padding: "11px 12px", outline: "0", background: "#fff", color: "#252d3c" }}
                />
              </label>
            </div>
          ))}

          <div style={{ display: "flex", gap: 10, marginTop: 18, flexWrap: "wrap" }}>
            <button type="button" className="btn btnSoft" onClick={() => setQuestions(current => [...current, emptyQuestion()] )}>
              <Plus size={15} /> Add question
            </button>
            <button type="submit" className="btn btnPrimary" disabled={saving}>
              <Check size={16} /> {saving ? "Creating..." : "Create Examination"}
            </button>
          </div>
        </form>
      )}

      <div className="examGrid">
        {exams.map(exam => <ExamCard key={exam._id} exam={exam} />)}
        {!exams.length && !creating && <div className="panel"><p className="muted">No examinations created yet.</p></div>}
      </div>
    </>
  );
}