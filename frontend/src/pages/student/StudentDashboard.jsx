import React from "react";
import { Link } from "react-router-dom";
import { ChevronRight, CheckCircle2, AlertTriangle } from "lucide-react";
import PageTitle from "../../components/PageTitle";
import { demoResults } from "../../data/demoData";

export default function StudentDashboard() {
  const data = demoResults["2024CSE1021"];
  return (
    <>
      <PageTitle eyebrow="STUDENT · DASHBOARD" title={`Hello, ${data.name} 👋`} desc="Here is your latest published examination evaluation." />
      <div className="studentScore">
        <div><span>LATEST RESULT</span><h2>{data.exam}</h2><p>Roll No. 2024CSE1021</p></div>
        <strong>{data.score}<small>/100</small></strong>
        <Link className="btn btnPrimary" to="/student/results/2024CSE1021">View Detailed Result <ChevronRight size={16} /></Link>
      </div>

      <div className="twoColumn">
        <div className="panel">
          <div className="panelHeader"><div><h2>Performance</h2><p>Question-wise score distribution</p></div></div>
          {data.questions.map(q => (
            <div className="scoreLine" key={q.no}>
              <span>{q.no}</span>
              <div><strong>{q.title}</strong><div className="progress"><i style={{ width: `${q.marks / q.total * 100}%` }} /></div></div>
              <b>{q.marks}/{q.total}</b>
            </div>
          ))}
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
    </>
  );
}