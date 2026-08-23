import React, { useEffect, useState } from "react";
import { AlertTriangle, BookOpen, Check, Plus, Trash2 } from "lucide-react";
import PageTitle from "../../components/PageTitle";
import { createExam, listExams } from "../../services/api";

const emptyQuestion = () => ({ questionText: "", answerKey: "", maxMarks: "" });

function ExamCard({ exam }) {
  const marks = exam.questions?.reduce((total, question) => total + Number(question.maxMarks || 0), 0) || 0;

  return (
    <div className="panel examCard">
      <div className="examIcon"><BookOpen /></div>
      <span className="badge blue">{exam.subject || "General"}</span>
      <h2>{exam.title}</h2>
      <p>{exam.questions?.length || 0} questions · {marks} marks</p>
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

          <label>Examination title
            <input value={title} onChange={event => setTitle(event.target.value)} placeholder="e.g. Data Structures Mid-Term" />
          </label>
          <label>Subject
            <input value={subject} onChange={event => setSubject(event.target.value)} placeholder="e.g. Data Structures" />
          </label>

          {questions.map((question, index) => (
            <div className="panel" key={index} style={{ marginTop: 16, padding: 16 }}>
              <div className="panelHeader">
                <div><h3>Question {index + 1}</h3></div>
                {questions.length > 1 && <button type="button" className="btn btnSoft" onClick={() => setQuestions(current => current.filter((_, questionIndex) => questionIndex !== index))}><Trash2 size={15} /> Remove</button>}
              </div>
              <label>Question
                <textarea value={question.questionText} onChange={event => updateQuestion(index, "questionText", event.target.value)} rows="2" placeholder="Enter the question" />
              </label>
              <label>Reference answer
                <textarea value={question.answerKey} onChange={event => updateQuestion(index, "answerKey", event.target.value)} rows="3" placeholder="Enter the answer used by Qwen for grading" />
              </label>
              <label>Maximum marks
                <input type="number" min="0.25" step="0.25" value={question.maxMarks} onChange={event => updateQuestion(index, "maxMarks", event.target.value)} placeholder="10" />
              </label>
            </div>
          ))}

          <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
            <button type="button" className="btn btnSoft" onClick={() => setQuestions(current => [...current, emptyQuestion()])}><Plus size={15} /> Add question</button>
            <button type="submit" className="btn btnPrimary" disabled={saving}><Check size={16} /> {saving ? "Creating..." : "Create Examination"}</button>
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