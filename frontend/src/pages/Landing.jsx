import React from "react";
import { Link } from "react-router-dom";
import {
  Sparkles, ShieldCheck, UploadCloud, BrainCircuit, FileCheck2,
  GraduationCap, ChevronRight, CheckCircle2
} from "lucide-react";
import Logo from "../components/Logo";
import Feature from "../components/Feature";
import Step from "../components/Step";
import Footer from "../components/Footer";

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

      <section className="workflow" id="workflow" style={{
        marginBottom: "20px"
      }}>
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

      <Footer />
    </div>
  );
}