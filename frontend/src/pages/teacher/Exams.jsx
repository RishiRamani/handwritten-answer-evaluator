import React from "react";
import { BookOpen, ChevronRight } from "lucide-react";
import PageTitle from "../../components/PageTitle";

function ExamCard({ title, subject, papers, marks }) {
  return (
    <div className="panel examCard">
      <div className="examIcon"><BookOpen /></div>
      <span className="badge blue">{subject}</span>
      <h2>{title}</h2>
      <p>{papers} papers uploaded · {marks} marks</p>
      <button className="btn btnSoft full">Open Examination <ChevronRight size={15} /></button>
    </div>
  );
}

export default function Exams() {
  return (
    <>
      <PageTitle eyebrow="TEACHER · EXAMS" title="Examinations" desc="Manage examinations for answer-sheet uploads." action={<button className="btn btnPrimary">+ Create Examination</button>} />
      <div className="examGrid">
        <ExamCard title="Data Structures Mid-Term" subject="Data Structures" papers="3" marks="100" />
        <ExamCard title="DBMS Internal Assessment" subject="Database Management" papers="0" marks="50" />
        <ExamCard title="Computer Networks Unit Test" subject="Computer Networks" papers="0" marks="40" />
      </div>
    </>
  );
}