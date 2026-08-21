import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import {
  BrowserRouter, Routes, Route, Link, Navigate, useNavigate, useLocation,
  useParams
} from "react-router-dom";
import {
  Sparkles, ShieldCheck, UploadCloud, FileText, FileCheck2, BarChart3,
  ClipboardList, Home, Settings, LogOut, Menu, X, Search, ChevronRight,
  UserRound, BrainCircuit, Clock3, Users, AlertTriangle, CheckCircle2,
  GraduationCap, BookOpen, Eye, Trash2
} from "lucide-react";
import "./styles.css";

const MAX_FILE_SIZE = 15 * 1024 * 1024;

const demoPapers = [
  {
    id: 1, roll: "2024CSE1021", name: "Aarav Sharma",
    exam: "Data Structures Mid-Term", file: "aarav-answer-sheet.pdf",
    size: "8.4 MB", status: "Evaluated", score: 86, confidence: 94
  },
  {
    id: 2, roll: "2024CSE1044", name: "Riya Verma",
    exam: "Data Structures Mid-Term", file: "riya-answer-sheet.pdf",
    size: "11.2 MB", status: "Evaluated", score: 91, confidence: 96
  },
  {
    id: 3, roll: "2024CSE1078", name: "Kabir Singh",
    exam: "Data Structures Mid-Term", file: "kabir-answer-sheet.pdf",
    size: "6.8 MB", status: "Pending", score: null, confidence: null
  }
];

const demoResults = {
  "2024CSE1021": {
    name: "Aarav Sharma",
    exam: "Data Structures Mid-Term",
    score: 86,
    confidence: 94,
    questions: [
      { no: "Q1", title: "Binary Search", marks: 9, total: 10, confidence: 96, feedback: "Correct concept and complexity. Good explanation." },
      { no: "Q2", title: "Stack Applications", marks: 8, total: 10, confidence: 92, feedback: "Good explanation; one relevant example was missing." },
      { no: "Q3", title: "Linked List", marks: 9, total: 10, confidence: 95, feedback: "Accurate answer with appropriate terminology." },
      { no: "Q4", title: "Trees", marks: 8, total: 10, confidence: 89, feedback: "Correct definition; traversal explanation can be improved." },
      { no: "Q5", title: "Graph Traversal", marks: 7, total: 10, confidence: 76, feedback: "The concept is correct but the answer needs more detail." }
    ]
  },
  "2024CSE1044": {
    name: "Riya Verma",
    exam: "Data Structures Mid-Term",
    score: 91,
    confidence: 96,
    questions: [
      { no: "Q1", title: "Binary Search", marks: 10, total: 10, confidence: 98, feedback: "Excellent answer." },
      { no: "Q2", title: "Stack Applications", marks: 9, total: 10, confidence: 97, feedback: "Strong explanation with examples." },
      { no: "Q3", title: "Linked List", marks: 9, total: 10, confidence: 95, feedback: "Accurate and complete." },
      { no: "Q4", title: "Trees", marks: 8, total: 10, confidence: 91, feedback: "Good answer with minor omissions." },
      { no: "Q5", title: "Graph Traversal", marks: 9, total: 10, confidence: 94, feedback: "Clear comparison of BFS and DFS." }
    ]
  }
};

function Logo() {
  return (
    <Link to="/" className="logo">
      <span className="logoMark"><Sparkles size={17} /></span>
      <span>Eval<span>X</span></span>
    </Link>
  );
}

function Landing() {
  return (
    <div className="landing">
      <header className="landingNav">
        <Logo />
        <nav className="landingLinks">
          <a href="#features">Features</a>
          <a href="#workflow">Workflow</a>
          <a href="#about">About</a>
        </nav>
        <div className="navButtons">
          <Link className="btn btnLight" to="/student/login">Student Login</Link>
          <Link className="btn btnPrimary" to="/teacher/login">
            Teacher Portal <ChevronRight size={16} />
          </Link>
        </div>
      </header>

      <section className="hero">
        <div className="heroText">
          <div className="eyebrow"><ShieldCheck size={15} /> AI-POWERED WRITTEN EXAM EVALUATION</div>
          <h1>Evaluate written exams <em>smarter.</em></h1>
          <p>
            A centralized portal for teachers to upload student answer-sheet PDFs,
            evaluate short answers, review AI feedback and publish transparent results.
          </p>
          <div className="heroButtons">
            <Link className="btn btnPrimary btnLarge" to="/teacher/login">
              Open Teacher Portal <ChevronRight size={18} />
            </Link>
            <Link className="btn btnSoft btnLarge" to="/student/login">
              Check Student Result
            </Link>
          </div>
          <div className="heroTrust">
            <span><CheckCircle2 size={15} /> PDF upload up to <b>15 MB</b></span>
            <i></i>
            <span><CheckCircle2 size={15} /> Teacher review controls</span>
          </div>
        </div>

        {/* Intentionally empty: the dashboard preview/mockup has been removed. */}
        <div className="heroEmpty"></div>
      </section>

      <section className="features" id="features">
        <div className="sectionTitle">
          <span>CORE FEATURES</span>
          <h2>Everything your project needs</h2>
        </div>
        <div className="featureGrid">
          <Feature icon={<UploadCloud />} title="PDF Upload" text="Teachers upload student written answer sheets as PDF files with a strict 15 MB maximum." />
          <Feature icon={<BrainCircuit />} title="Automated Evaluation" text="The interface supports AI-based scoring, confidence values and question-wise feedback." />
          <Feature icon={<FileCheck2 />} title="Teacher Review" text="Low-confidence answers can be flagged for teacher verification before publishing." />
          <Feature icon={<GraduationCap />} title="Student Results" text="Students use their roll number to access published marks and feedback." />
        </div>
      </section>

      <section className="workflow" id="workflow">
        <div className="sectionTitle">
          <span>WORKFLOW</span>
          <h2>From answer sheet to result</h2>
        </div>
        <div className="steps">
          <Step n="01" title="Teacher Login" text="Teacher enters their Teacher ID to access the portal." />
          <Step n="02" title="Upload PDF" text="Teacher enters roll number and uploads the student's answer sheet." />
          <Step n="03" title="Evaluate" text="The system generates question-wise scores and AI feedback." />
          <Step n="04" title="Publish" text="Teacher reviews the result and publishes it for the student." />
        </div>
      </section>

      <footer id="about">EvalX · Automated Evaluation System for Short-Answer Written Exam Papers</footer>
    </div>
  );
}

function Feature({ icon, title, text }) {
  return <div className="featureCard">
    <div className="featureIcon">{icon}</div>
    <h3>{title}</h3>
    <p>{text}</p>
  </div>;
}

function Step({ n, title, text }) {
  return <div className="step">
    <span>{n}</span>
    <h3>{title}</h3>
    <p>{text}</p>
  </div>;
}

function TeacherLogin() {
  const [teacherId, setTeacherId] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  function login() {
    if (!teacherId.trim()) {
      setError("Please enter your Teacher ID.");
      return;
    }
    setError("");
    sessionStorage.setItem("teacherId", teacherId.trim());
    navigate("/teacher/dashboard");
  }

  return (
    <div className="loginPage">
      <div className="loginCard">
        <Logo />
        <div className="loginIcon"><ShieldCheck size={27} /></div>
        <h1>Teacher Portal</h1>
        <p>Enter your Teacher ID to access the evaluation dashboard.</p>

        <label>
          Teacher ID
          <input
            value={teacherId}
            onChange={(e) => setTeacherId(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && login()}
            placeholder="e.g. TCH001"
          />
        </label>

        {error && <div className="errorBox"><AlertTriangle size={16} />{error}</div>}

        <button className="btn btnPrimary full" onClick={login}>
          Login to Teacher Portal <ChevronRight size={17} />
        </button>

        <small className="demoHint">Demo Teacher ID: TCH001</small>
        <Link className="switchLogin" to="/student/login">Go to Student Login</Link>
      </div>
    </div>
  );
}

function StudentLogin() {
  const [roll, setRoll] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  function login() {
    if (!roll.trim()) {
      setError("Please enter your Roll Number.");
      return;
    }
    setError("");
    navigate("/student/results/" + roll.trim());
  }

  return (
    <div className="loginPage">
      <div className="loginCard">
        <Logo />
        <div className="loginIcon"><GraduationCap size={27} /></div>
        <h1>Student Result Portal</h1>
        <p>Enter your Roll Number to access your published results.</p>

        <label>
          Roll Number
          <input
            value={roll}
            onChange={(e) => setRoll(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && login()}
            placeholder="e.g. 2024CSE1021"
          />
        </label>

        {error && <div className="errorBox"><AlertTriangle size={16} />{error}</div>}

        <button className="btn btnPrimary full" onClick={login}>
          View My Result <ChevronRight size={17} />
        </button>

        <small className="demoHint">Demo Roll Number: 2024CSE1021</small>
        <Link className="switchLogin" to="/teacher/login">Go to Teacher Login</Link>
      </div>
    </div>
  );
}

function AppShell({ role, children }) {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const teacherItems = [
    { to: "/teacher/dashboard", label: "Dashboard", icon: <Home /> },
    { to: "/teacher/upload", label: "Upload Paper", icon: <UploadCloud /> },
    { to: "/teacher/submissions", label: "Submissions", icon: <ClipboardList /> },
    { to: "/teacher/results", label: "Results", icon: <BarChart3 /> },
    { to: "/teacher/exams", label: "Examinations", icon: <BookOpen /> },
    { to: "/teacher/settings", label: "Settings", icon: <Settings /> }
  ];

  const studentItems = [
    { to: "/student/dashboard", label: "Dashboard", icon: <Home /> },
    { to: "/student/results", label: "My Results", icon: <BarChart3 /> },
    { to: "/student/profile", label: "Profile", icon: <UserRound /> }
  ];

  const items = role === "teacher" ? teacherItems : studentItems;
  const teacherId = sessionStorage.getItem("teacherId") || "TCH001";

  function logout() {
    if (role === "teacher") sessionStorage.removeItem("teacherId");
    window.location.href = "/";
  }

  return (
    <div className="appShell">
      <aside className={mobileOpen ? "sidebar open" : "sidebar"}>
        <div className="sideTop">
          <Logo />
          <button className="closeMenu" onClick={() => setMobileOpen(false)}><X /></button>
        </div>

        <div className="portalLabel">
          {role === "teacher" ? "TEACHER PORTAL" : "STUDENT PORTAL"}
        </div>

        <nav className="sideNav">
          {items.map(item => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setMobileOpen(false)}
              className={location.pathname.startsWith(item.to) ? "sideLink active" : "sideLink"}
            >
              {item.icon}<span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <button className="sideLink logoutButton" onClick={logout}>
          <LogOut /><span>Exit portal</span>
        </button>
      </aside>

      <main className="mainArea">
        <header className="appHeader">
          <button className="menuButton" onClick={() => setMobileOpen(true)}><Menu /></button>
          <div className="headerSearch"><Search size={17} /><input placeholder="Search..." /></div>
          <div className="headerUser">
            <div className="avatar">{role === "teacher" ? "DS" : "RS"}</div>
            <div>
              <strong>{role === "teacher" ? "Dr. Sharma" : "Rahul Sharma"}</strong>
              <small>{role === "teacher" ? `Teacher ID: ${teacherId}` : "Roll: 2024CSE1234"}</small>
            </div>
          </div>
        </header>
        <div className="content">{children}</div>
      </main>
    </div>
  );
}

function TeacherPortal() {
  const [papers, setPapers] = useState(demoPapers);

  return (
    <AppShell role="teacher">
      <Routes>
        <Route path="dashboard" element={<TeacherDashboard papers={papers} />} />
        <Route path="upload" element={<UploadPaper setPapers={setPapers} />} />
        <Route path="submissions" element={<Submissions papers={papers} />} />
        <Route path="results" element={<TeacherResults papers={papers} />} />
        <Route path="results/:roll" element={<TeacherEvaluation />} />
        <Route path="exams" element={<Exams />} />
        <Route path="settings" element={<TeacherSettings />} />
        <Route path="*" element={<Navigate to="dashboard" replace />} />
      </Routes>
    </AppShell>
  );
}

function PageTitle({ eyebrow, title, desc, action }) {
  return <div className="pageTitle">
    <div>
      <span className="eyebrow small">{eyebrow}</span>
      <h1>{title}</h1>
      {desc && <p>{desc}</p>}
    </div>
    {action}
  </div>;
}

function Stat({ icon, label, value, sub }) {
  return <div className="statCard">
    <div className="statIcon">{icon}</div>
    <div>
      <small>{label}</small>
      <strong>{value}</strong>
      <span>{sub}</span>
    </div>
  </div>;
}

function TeacherDashboard({ papers }) {
  const evaluated = papers.filter(p => p.status === "Evaluated").length;

  return <>
    <PageTitle
      eyebrow="TEACHER · OVERVIEW"
      title="Good evening, Dr. Sharma 👋"
      desc="Manage answer sheets, evaluations and student results."
      action={<Link className="btn btnPrimary" to="/teacher/upload"><UploadCloud size={17} /> Upload Paper</Link>}
    />

    <div className="statsGrid">
      <Stat icon={<FileText />} label="Papers uploaded" value={papers.length} sub="+12 this week" />
      <Stat icon={<FileCheck2 />} label="Evaluated papers" value={evaluated} sub="Ready for results" />
      <Stat icon={<Clock3 />} label="Pending evaluation" value={papers.length - evaluated} sub="Needs attention" />
      <Stat icon={<BarChart3 />} label="Average score" value="88%" sub="Current exam" />
    </div>

    <div className="twoColumn">
      <div className="panel">
        <div className="panelHeader">
          <div><h2>Recent submissions</h2><p>Latest student answer sheets</p></div>
          <Link to="/teacher/submissions">View all <ChevronRight size={15} /></Link>
        </div>
        <Table papers={papers} />
      </div>

      <div className="panel">
        <div className="panelHeader">
          <div><h2>Quick actions</h2><p>Common teacher tasks</p></div>
        </div>
        <QuickAction to="/teacher/upload" icon={<UploadCloud />} title="Upload student paper" sub="PDF up to 15 MB" />
        <QuickAction to="/teacher/submissions" icon={<ClipboardList />} title="Review submissions" sub="Check pending papers" />
        <QuickAction to="/teacher/results" icon={<BarChart3 />} title="View results" sub="Scores and analytics" />
      </div>
    </div>
  </>;
}

function QuickAction({ to, icon, title, sub }) {
  return <Link className="quickAction" to={to}>
    {icon}<div><strong>{title}</strong><small>{sub}</small></div><ChevronRight />
  </Link>;
}

function Table({ papers }) {
  return <div className="tableWrap">
    <table>
      <thead><tr><th>Student</th><th>Roll No.</th><th>Exam</th><th>Status</th><th>Score</th></tr></thead>
      <tbody>
        {papers.map(p => <tr key={p.id}>
          <td><strong>{p.name}</strong></td>
          <td>{p.roll}</td>
          <td>{p.exam}</td>
          <td><span className={p.status === "Pending" ? "badge amber" : "badge green"}>{p.status}</span></td>
          <td><strong>{p.score ? `${p.score}/100` : "—"}</strong></td>
        </tr>)}
      </tbody>
    </table>
  </div>;
}

function UploadPaper({ setPapers }) {
  const [roll, setRoll] = useState("");
  const [name, setName] = useState("");
  const [exam, setExam] = useState("Data Structures Mid-Term");
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [drag, setDrag] = useState(false);
  const navigate = useNavigate();

  function validateFile(selected) {
    setError("");
    if (!selected) return;
    const isPdf = selected.type === "application/pdf" || selected.name.toLowerCase().endsWith(".pdf");
    if (!isPdf) {
      setFile(null);
      setError("Only PDF files are allowed.");
      return;
    }
    if (selected.size > MAX_FILE_SIZE) {
      setFile(null);
      setError("File is too large. Maximum allowed size is 15 MB.");
      return;
    }
    setFile(selected);
  }

  function submit() {
    if (!roll.trim()) return setError("Enter the student's roll number.");
    if (!name.trim()) return setError("Enter the student's name.");
    if (!file) return setError("Please select a PDF answer sheet.");

    const newPaper = {
      id: Date.now(),
      roll: roll.trim(),
      name: name.trim(),
      exam,
      file: file.name,
      size: (file.size / 1024 / 1024).toFixed(2) + " MB",
      status: "Pending",
      score: null,
      confidence: null
    };

    setPapers(prev => [newPaper, ...prev]);
    navigate("/teacher/submissions");
  }

  return <>
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
          <select value={exam} onChange={e => setExam(e.target.value)}>
            <option>Data Structures Mid-Term</option>
            <option>DBMS Internal Assessment</option>
            <option>Computer Networks Unit Test</option>
          </select>
        </label>

        <label>Student Roll Number
          <input value={roll} onChange={e => setRoll(e.target.value)} placeholder="e.g. 2024CSE1234" />
        </label>

        <label>Student Name
          <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Rahul Sharma" />
        </label>

        {error && <div className="errorBox"><AlertTriangle size={16} />{error}</div>}

        <button className="btn btnPrimary full" onClick={submit}>
          <BrainCircuit size={17} /> Upload & Start Evaluation
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
          {!file ? <>
            <div className="uploadIcon"><UploadCloud size={30} /></div>
            <h3>Drop your PDF here</h3>
            <p>or choose a file from your computer</p>
            <label className="btn btnSoft browseButton">
              Browse PDF
              <input hidden type="file" accept=".pdf,application/pdf" onChange={e => validateFile(e.target.files[0])} />
            </label>
            <small>Maximum allowed size: 15 MB</small>
          </> : <>
            <div className="fileSuccess"><FileCheck2 size={31} /></div>
            <h3>{file.name}</h3>
            <p>{(file.size / 1024 / 1024).toFixed(2)} MB · PDF verified</p>
            <button className="btn btnSoft" onClick={() => setFile(null)}><Trash2 size={15} /> Remove</button>
          </>}
        </div>
      </div>
    </div>
  </>;
}

function Submissions({ papers }) {
  const [query, setQuery] = useState("");
  const filtered = papers.filter(p =>
    `${p.name} ${p.roll} ${p.exam}`.toLowerCase().includes(query.toLowerCase())
  );

  return <>
    <PageTitle
      eyebrow="TEACHER · SUBMISSIONS"
      title="Student submissions"
      desc="Track uploaded answer sheets and their evaluation status."
      action={<Link className="btn btnPrimary" to="/teacher/upload"><UploadCloud size={17} /> Upload Paper</Link>}
    />
    <div className="panel">
      <div className="toolbar">
        <div className="searchBox"><Search size={16} /><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search student or roll number" /></div>
        <span className="muted">{filtered.length} submissions</span>
      </div>
      <div className="tableWrap">
        <table>
          <thead><tr><th>Student</th><th>Roll No.</th><th>Exam</th><th>PDF</th><th>Status</th><th>Score</th><th>Action</th></tr></thead>
          <tbody>
            {filtered.map(p => <tr key={p.id}>
              <td><strong>{p.name}</strong></td>
              <td>{p.roll}</td>
              <td>{p.exam}</td>
              <td><span className="filePill"><FileText size={13} />{p.file}</span></td>
              <td><span className={p.status === "Pending" ? "badge amber" : "badge green"}>{p.status}</span></td>
              <td>{p.score ? `${p.score}/100` : "—"}</td>
              <td><Link className="tableButton" to={`/teacher/results/${p.roll}`}><Eye size={14} /> {p.status === "Pending" ? "Evaluate" : "Review"}</Link></td>
            </tr>)}
          </tbody>
        </table>
      </div>
    </div>
  </>;
}

function TeacherResults({ papers }) {
  const evaluated = papers.filter(p => p.score);

  return <>
    <PageTitle eyebrow="TEACHER · RESULTS" title="Evaluation results" desc="View scores and detailed AI evaluations." />
    <div className="statsGrid">
      <Stat icon={<BarChart3 />} label="Average score" value="88%" sub="Across evaluated papers" />
      <Stat icon={<BrainCircuit />} label="AI confidence" value="93%" sub="Average confidence" />
      <Stat icon={<AlertTriangle />} label="Manual reviews" value="1" sub="Needs attention" />
      <Stat icon={<Users />} label="Students" value={papers.length} sub="In this exam" />
    </div>
    <div className="panel">
      <div className="panelHeader"><div><h2>Published results</h2><p>Open a result to review question-wise evaluation.</p></div></div>
      <div className="tableWrap">
        <table>
          <thead><tr><th>Student</th><th>Roll No.</th><th>Score</th><th>Confidence</th><th>Status</th><th></th></tr></thead>
          <tbody>{evaluated.map(p => <tr key={p.id}>
            <td><strong>{p.name}</strong></td><td>{p.roll}</td><td><strong>{p.score}/100</strong></td>
            <td>{p.confidence}%</td><td><span className="badge green">Published</span></td>
            <td><Link className="tableButton" to={`/teacher/results/${p.roll}`}><Eye size={14} /> Details</Link></td>
          </tr>)}</tbody>
        </table>
      </div>
    </div>
  </>;
}

function TeacherEvaluation() {
  const { roll } = useParams();
  const data = demoResults[roll] || demoResults["2024CSE1021"];
  const [published, setPublished] = useState(false);

  return <>
    <PageTitle eyebrow="TEACHER · EVALUATION" title={`${data.name}'s evaluation`} desc={`${data.exam} · Roll No. ${roll}`} />

    <div className="resultHero">
      <div>
        <span>FINAL SCORE</span>
        <strong>{data.score}<small>/100</small></strong>
        <p><CheckCircle2 size={15} /> AI confidence {data.confidence}%</p>
      </div>
      <div className="resultHeroStats">
        <div><small>Questions evaluated</small><strong>{data.questions.length}</strong></div>
        <div><small>Manual review</small><strong>1</strong></div>
      </div>
    </div>

    <div className="panel">
      <div className="panelHeader">
        <div><h2>Question-wise evaluation</h2><p>Review AI-generated scores and feedback before publishing.</p></div>
        {published && <span className="badge green"><CheckCircle2 size={14} /> Published</span>}
      </div>

      {data.questions.map((q, index) => (
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

          {index === data.questions.length - 1 && (
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
        <button className="btn btnPrimary" onClick={() => setPublished(true)}>
          <CheckCircle2 size={16} /> Save & Publish Result
        </button>
      </div>
    </div>
  </>;
}

function Exams() {
  return <>
    <PageTitle eyebrow="TEACHER · EXAMS" title="Examinations" desc="Manage examinations for answer-sheet uploads." action={<button className="btn btnPrimary">+ Create Examination</button>} />
    <div className="examGrid">
      <Exam title="Data Structures Mid-Term" subject="Data Structures" papers="3" marks="100" />
      <Exam title="DBMS Internal Assessment" subject="Database Management" papers="0" marks="50" />
      <Exam title="Computer Networks Unit Test" subject="Computer Networks" papers="0" marks="40" />
    </div>
  </>;
}

function Exam({ title, subject, papers, marks }) {
  return <div className="panel examCard">
    <div className="examIcon"><BookOpen /></div>
    <span className="badge blue">{subject}</span>
    <h2>{title}</h2>
    <p>{papers} papers uploaded · {marks} marks</p>
    <button className="btn btnSoft full">Open Examination <ChevronRight size={15} /></button>
  </div>;
}

function TeacherSettings() {
  return <>
    <PageTitle eyebrow="TEACHER · SETTINGS" title="Portal settings" desc="Configure teacher account preferences." />
    <div className="panel settingsPanel">
      <label>Teacher Name<input defaultValue="Dr. Sharma" /></label>
      <label>Teacher ID<input defaultValue={sessionStorage.getItem("teacherId") || "TCH001"} /></label>
      <label>Department<input defaultValue="Computer Science & Engineering" /></label>
      <label>Evaluation Mode<select defaultValue="AI + Manual Review"><option>AI + Manual Review</option><option>AI Evaluation Only</option><option>Manual Evaluation</option></select></label>
      <button className="btn btnPrimary">Save Settings</button>
    </div>
  </>;
}

function StudentPortal() {
  return <AppShell role="student">
    <Routes>
      <Route path="dashboard" element={<StudentDashboard />} />
      <Route path="results" element={<StudentResults />} />
      <Route path="results/:roll" element={<StudentResultDetail />} />
      <Route path="profile" element={<StudentProfile />} />
      <Route path="*" element={<Navigate to="dashboard" replace />} />
    </Routes>
  </AppShell>;
}

function StudentDashboard() {
  const data = demoResults["2024CSE1021"];
  return <>
    <PageTitle eyebrow="STUDENT · DASHBOARD" title={`Hello, ${data.name} 👋`} desc="Here is your latest published examination evaluation." />
    <div className="studentScore">
      <div><span>LATEST RESULT</span><h2>{data.exam}</h2><p>Roll No. 2024CSE1021</p></div>
      <strong>{data.score}<small>/100</small></strong>
      <Link className="btn btnPrimary" to="/student/results/2024CSE1021">View Detailed Result <ChevronRight size={16} /></Link>
    </div>

    <div className="twoColumn">
      <div className="panel">
        <div className="panelHeader"><div><h2>Performance</h2><p>Question-wise score distribution</p></div></div>
        {data.questions.map(q => <div className="scoreLine" key={q.no}>
          <span>{q.no}</span>
          <div><strong>{q.title}</strong><div className="progress"><i style={{ width: `${q.marks / q.total * 100}%` }} /></div></div>
          <b>{q.marks}/{q.total}</b>
        </div>)}
      </div>
      <div className="panel">
        <div className="panelHeader"><div><h2>AI Feedback</h2><p>Highlights from your evaluation</p></div></div>
        <div className="feedbackList">
          <div className="positive"><CheckCircle2 /> Good conceptual understanding</div>
          <div className="positive"><CheckCircle2 /> Correct technical terminology</div>
          <div className="improve"><AlertTriangle /> Add more detail to algorithm explanations</div>
          <div className="improve"><AlertTriangle /> Include complexity where applicable</div>
        </div>
      </div>
    </div>
  </>;
}

function StudentResults() {
  return <>
    <PageTitle eyebrow="STUDENT · RESULTS" title="My Results" desc="Your published examination evaluations." />
    <div className="panel studentResultCard">
      <div className="resultIcon"><FileCheck2 /></div>
      <div className="grow"><span className="badge green">Published</span><h2>Data Structures Mid-Term</h2><p>Roll No. 2024CSE1021 · AI + teacher review</p></div>
      <strong className="bigScore">86<small>/100</small></strong>
      <Link className="btn btnPrimary" to="/student/results/2024CSE1021">View Result</Link>
    </div>
  </>;
}

function StudentResultDetail() {
  const data = demoResults["2024CSE1021"];
  return <>
    <PageTitle eyebrow="STUDENT · RESULT" title={data.exam} desc={`Roll No. 2024CSE1021 · ${data.name}`} />
    <div className="resultHero">
      <div><span>YOUR SCORE</span><strong>{data.score}<small>/100</small></strong><p><CheckCircle2 size={15} /> Result published</p></div>
      <div className="resultHeroStats"><div><small>Questions</small><strong>{data.questions.length}</strong></div><div><small>AI confidence</small><strong>{data.confidence}%</strong></div></div>
    </div>
    <div className="panel">
      <div className="panelHeader"><div><h2>Question-wise Feedback</h2><p>See how each answer was evaluated.</p></div></div>
      {data.questions.map(q => <div className="studentQuestion" key={q.no}>
        <div className="qLabel">{q.no}<span>{q.title}</span></div>
        <strong>{q.marks}/{q.total}</strong>
        <span className="confidence">{q.confidence}% confidence</span>
        <p>{q.feedback}</p>
      </div>)}
    </div>
  </>;
}

function StudentProfile() {
  return <>
    <PageTitle eyebrow="STUDENT · PROFILE" title="My Profile" desc="Your student information." />
    <div className="panel profileCard">
      <div className="largeAvatar">RS</div>
      <h2>Rahul Sharma</h2>
      <p>Roll No. 2024CSE1234</p>
      <div className="profileGrid">
        <div><small>Program</small><strong>B.Tech Computer Science & Engineering</strong></div>
        <div><small>Portal</small><strong>Student Result Portal</strong></div>
      </div>
    </div>
  </>;
}

function Root() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/teacher/login" element={<TeacherLogin />} />
      <Route path="/student/login" element={<StudentLogin />} />
      <Route path="/teacher/*" element={<TeacherPortal />} />
      <Route path="/student/*" element={<StudentPortal />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Root />
    </BrowserRouter>
  </React.StrictMode>
);
