import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { UploadCloud, FileCheck2, Trash2, AlertTriangle, BrainCircuit } from "lucide-react";
import PageTitle from "../../components/PageTitle";
import { MAX_FILE_SIZE } from "../../data/demoData";
import { listExams, uploadSubmission } from "../../services/api";

export default function UploadPaper({ onUploaded }) {
  const [exams, setExams] = useState([]);
  const [examId, setExamId] = useState("");
  const [roll, setRoll] = useState("");
  const [name, setName] = useState("");
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [drag, setDrag] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    listExams()
      .then(data => {
        setExams(data);
        if (data.length) setExamId(data[0]._id);
      })
      .catch(err => setError("Could not load exams: " + err.message));
  }, []);

  function validateFile(selected) {
    setError("");
    if (!selected) return;
    const isPdf = selected.type === "application/pdf" || selected.name.toLowerCase().endsWith(".pdf");
    if (!isPdf) { setFile(null); setError("Only PDF files are allowed."); return; }
    if (selected.size > MAX_FILE_SIZE) { setFile(null); setError("File is too large. Maximum allowed size is 15 MB."); return; }
    setFile(selected);
  }

  async function submit() {
    if (!examId) return setError("Select an examination.");
    if (!roll.trim()) return setError("Enter the student's roll number.");
    if (!name.trim()) return setError("Enter the student's name.");
    if (!file) return setError("Please select a PDF answer sheet.");

    try {
      setSubmitting(true);
      setError("");
      await uploadSubmission({ examId, studentRoll: roll.trim(), studentName: name.trim(), file });
      await onUploaded?.();
      navigate("/teacher/submissions");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <PageTitle
        eyebrow="TEACHER · UPLOAD"
        title="Upload student answer sheet"
        desc="Enter student details and upload the scanned written answer sheet as a PDF."
      />

      <div className="uploadGrid">
        <div className="panel">
          <div className="panelHeader">
            <div><h2>Student details</h2><p>These details will be attached to the evaluation.</p></div>
          </div>

          <label>Examination
            <select value={examId} onChange={e => setExamId(e.target.value)}>
              {exams.length === 0 && <option value="">No exams created yet</option>}
              {exams.map(ex => <option key={ex._id} value={ex._id}>{ex.title}</option>)}
            </select>
          </label>

          <label>Student Roll Number
            <input value={roll} onChange={e => setRoll(e.target.value)} placeholder="e.g. 2024CSE1234" />
          </label>

          <label>Student Name
            <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Rahul Sharma" />
          </label>

          {error && <div className="errorBox"><AlertTriangle size={16} />{error}</div>}

          <button className="btn btnPrimary full" onClick={submit} disabled={submitting}>
            <BrainCircuit size={17} /> {submitting ? "Uploading..." : "Upload & Start Evaluation"}
          </button>
        </div>

        <div className="panel">
          <div className="panelHeader">
            <div><h2>Answer Sheet PDF</h2><p>PDF only · Maximum file size: <b>15 MB</b></p></div>
          </div>

          <div
            className={drag ? "dropZone drag" : "dropZone"}
            onDragOver={e => { e.preventDefault(); setDrag(true); }}
            onDragLeave={() => setDrag(false)}
            onDrop={e => { e.preventDefault(); setDrag(false); validateFile(e.dataTransfer.files[0]); }}
          >
            {!file ? (
              <>
                <div className="uploadIcon"><UploadCloud size={30} /></div>
                <h3>Drop your PDF here</h3>
                <p>or choose a file from your computer</p>
                <label className="btn btnSoft browseButton">
                  Browse PDF
                  <input hidden type="file" accept=".pdf,application/pdf" onChange={e => validateFile(e.target.files[0])} />
                </label>
                <small>Maximum allowed size: 15 MB</small>
              </>
            ) : (
              <>
                <div className="fileSuccess"><FileCheck2 size={31} /></div>
                <h3>{file.name}</h3>
                <p>{(file.size / 1024 / 1024).toFixed(2)} MB · PDF verified</p>
                <button className="btn btnSoft" onClick={() => setFile(null)}><Trash2 size={15} /> Remove</button>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}