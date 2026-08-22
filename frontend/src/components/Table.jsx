import React from "react";

export default function Table({ papers }) {
  return (
    <div className="tableWrap">
      <table>
        <thead>
          <tr><th>Student</th><th>Roll No.</th><th>Exam</th><th>Status</th><th>Score</th></tr>
        </thead>
        <tbody>
          {papers.map(p => (
            <tr key={p.id}>
              <td><strong>{p.name}</strong></td>
              <td>{p.roll}</td>
              <td>{p.exam}</td>
              <td><span className={p.status === "Pending" ? "badge amber" : "badge green"}>{p.status}</span></td>
              <td><strong>{p.score ? `${p.score}/100` : "—"}</strong></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}