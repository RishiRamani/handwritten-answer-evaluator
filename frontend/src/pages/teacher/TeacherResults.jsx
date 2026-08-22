import React from "react";
import { Link } from "react-router-dom";
import { BarChart3, BrainCircuit, AlertTriangle, Users, Eye } from "lucide-react";
import PageTitle from "../../components/PageTitle";
import Stat from "../../components/Stat";

export default function TeacherResults({ papers }) {
  const evaluated = papers.filter(p => p.score);

  return (
    <>
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
            <tbody>
              {evaluated.map(p => (
                <tr key={p.id}>
                  <td><strong>{p.name}</strong></td><td>{p.roll}</td><td><strong>{p.score}/100</strong></td>
                  <td>{p.confidence}%</td><td><span className="badge green">Published</span></td>
                  <td><Link className="tableButton" to={`/teacher/results/${p.roll}`}><Eye size={14} /> Details</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}