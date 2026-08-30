import React from "react";
import { AlertTriangle } from "lucide-react";
import PageTitle from "../../components/PageTitle";
import { getAuth } from "../../services/api";

export default function StudentProfile() {
  const auth = getAuth();
  const user = auth?.user || {};
  const roll = user.roll || "Not available";
  const studentName = user.name || `Student ${roll}`;
  const program = user.program || "Not provided";
  const year = user.year || "Not provided";

  if (!auth || !user.role) {
    return <div className="errorBox"><AlertTriangle size={16} />No student profile found. Please login again.</div>;
  }

  const infoCards = [
    { label: "Full Name", value: studentName },
    { label: "Roll Number", value: roll },
    { label: "Program", value: program },
    { label: "Year", value: year },
    { label: "Role", value: user.role || "student" }
  ];

  return (
    <>
      <PageTitle eyebrow="STUDENT · PROFILE" title="My Profile" desc="Your student information" />

      <div className="panel profileCard">
        <div className="largeAvatar">
          {studentName.slice(0, 2).toUpperCase()}
        </div>
        <h2>{studentName}</h2>
        <p>{program !== "Not provided" ? program : "Student profile"}</p>

        <div className="profileGrid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
          {infoCards.map(item => (
            <div key={item.label}>
              <small>{item.label}</small>
              <strong>{item.value}</strong>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}