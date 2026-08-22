import React from "react";
import PageTitle from "../../components/PageTitle";

export default function TeacherSettings() {
  return (
    <>
      <PageTitle eyebrow="TEACHER · SETTINGS" title="Portal settings" desc="Configure teacher account preferences." />
      <div className="panel settingsPanel">
        <label>Teacher Name<input defaultValue="Dr. Sharma" /></label>
        <label>Teacher ID<input defaultValue={sessionStorage.getItem("teacherId") || "TCH001"} /></label>
        <label>Department<input defaultValue="Computer Science & Engineering" /></label>
        <label>Evaluation Mode<select defaultValue="AI + Manual Review"><option>AI + Manual Review</option><option>AI Evaluation Only</option><option>Manual Evaluation</option></select></label>
        <button className="btn btnPrimary">Save Settings</button>
      </div>
    </>
  );
}