import React from "react";
import { Link } from "react-router-dom";
import {
  ShieldCheck, UploadCloud, BrainCircuit, FileCheck2,
  GraduationCap, ChevronRight, CheckCircle2
} from "lucide-react";
import Logo from "../components/Logo";
import Feature from "../components/Feature";
import Step from "../components/Step";
import Footer from "../components/Footer";



function HeroSheet() {
  return (
    <div className="heroSheet" aria-hidden="true">
      <svg viewBox="0 0 380 460" xmlns="http://www.w3.org/2000/svg">
        <rect x="14" y="10" width="352" height="440" rx="16" fill="#ffffff" stroke="#e8eaf0" />
        <rect x="14" y="10" width="352" height="440" rx="16" fill="none" stroke="#e8eaf0" transform="translate(10,10)" opacity="0" />
        {/* header block */}
        <rect x="40" y="38" width="140" height="10" rx="5" fill="#dfe1ea" />
        <rect x="40" y="56" width="90" height="8" rx="4" fill="#eceef3" />
        <rect x="300" y="40" width="46" height="20" rx="10" fill="#efefff" />
        <text x="323" y="54" fontFamily="JetBrains Mono, monospace" fontSize="9" fill="#5d50d4" textAnchor="middle">Q1</text>

        {/* answer lines */}
        <rect x="40" y="92" width="306" height="6" rx="3" fill="#eceef3" />
        <rect x="40" y="106" width="286" height="6" rx="3" fill="#eceef3" />
        <rect x="40" y="120" width="300" height="6" rx="3" fill="#eceef3" />
        <rect x="40" y="134" width="210" height="6" rx="3" fill="#eceef3" />

        {/* AI mark + tick */}
        <circle cx="330" cy="123" r="17" fill="#e7f8f0" />
        <path d="M323 123.5 328 129 338 116" stroke="#208662" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />

        {/* second answer block */}
        <rect x="40" y="176" width="140" height="10" rx="5" fill="#dfe1ea" />
        <rect x="300" y="178" width="46" height="20" rx="10" fill="#efefff" />
        <text x="323" y="192" fontFamily="JetBrains Mono, monospace" fontSize="9" fill="#5d50d4" textAnchor="middle">Q2</text>

        <rect x="40" y="212" width="306" height="6" rx="3" fill="#eceef3" />
        <rect x="40" y="226" width="260" height="6" rx="3" fill="#eceef3" />
        <rect x="40" y="240" width="292" height="6" rx="3" fill="#eceef3" />

        {/* flagged for review */}
        <circle cx="330" cy="229" r="17" fill="#fff2d9" />
        <text x="330" y="234" fontFamily="JetBrains Mono, monospace" fontSize="14" fill="#a96c00" textAnchor="middle">?</text>

        {/* margin annotation, hand-marked feel */}
        <path d="M40 276 Q 90 264 150 276 T 250 276" stroke="#6758e8" strokeWidth="2.4" strokeLinecap="round" fill="none" opacity="0.55" />
        <text x="40" y="300" fontFamily="Fraunces, serif" fontSize="13" fill="#5d50d4" fontStyle="italic">good reasoning</text>

        {/* footer score strip */}
        <rect x="40" y="392" width="306" height="1" fill="#eceef3" />
        <text x="40" y="424" fontFamily="Inter, sans-serif" fontSize="11" fontWeight="700" fill="#8b93a1">TOTAL SCORE</text>
        <text x="346" y="424" fontFamily="JetBrains Mono, monospace" fontSize="16" fontWeight="700" fill="#191c2e" textAnchor="end">18/20</text>
      </svg>
    </div>
  );
}

export default function Landing() {
  return (
    <div className="landing">
      <header className="landingNav">
        <Logo />
        <nav className="landingLinks">
          <a href="#features">Features</a>
          <a href="#workflow">Workflow</a>
          <Link to="/admin/login">Admin</Link>
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
          <div className="eyebrow"><ShieldCheck size={15} /> AI-ASSISTED WRITTEN EXAM EVALUATION</div>
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
            <span><CheckCircle2 size={15} /> Every AI score is teacher-reviewable</span>
          </div>
        </div>

        <div className="heroEmpty">
          <HeroSheet />
        </div>
      </section>

      <section className="features" id="features">
        <div className="sectionTitle">
          <span>CORE FEATURES</span>
          <h2>Everything the grading day needs</h2>
        </div>
        <div className="featureGrid">
          <Feature icon={<UploadCloud />} title="PDF Upload" text="Teachers upload a student's written answer sheet as a PDF, capped at 15 MB per file." />
          <Feature icon={<BrainCircuit />} title="AI-Assisted Scoring" text="Each question gets a score, a confidence level, and a short written justification." />
          <Feature icon={<FileCheck2 />} title="Teacher Review" text="Any answer the model is unsure about is flagged for you to check before it counts." />
          <Feature icon={<GraduationCap />} title="Student Results" text="Students sign in with their roll number to see published marks and feedback." />
        </div>
      </section>

      <section className="workflow" id="workflow" style={{ marginBottom: "20px" }}>
        <div className="sectionTitle">
          <span>WORKFLOW</span>
          <h2>From answer sheet to result</h2>
        </div>
        <div className="steps">
          <Step n="01" title="Teacher Login" text="Sign in with your Teacher ID to open the evaluation dashboard." />
          <Step n="02" title="Upload PDF" text="Enter the student's roll number and upload their scanned answer sheet." />
          <Step n="03" title="Evaluate" text="The system scores each answer and flags low-confidence ones for you." />
          <Step n="04" title="Publish" text="Confirm the marks and publish the result to the student's account." />
        </div>
      </section>

      <Footer />
    </div>
  );
}