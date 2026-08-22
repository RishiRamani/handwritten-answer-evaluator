import React from "react";
import PageTitle from "../../components/PageTitle";

export default function StudentProfile() {
  return (
    <>
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
    </>
  );
}