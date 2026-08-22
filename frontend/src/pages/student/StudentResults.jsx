import React from "react";
import { Link } from "react-router-dom";
import { FileCheck2 } from "lucide-react";
import PageTitle from "../../components/PageTitle";

export default function StudentResults() {
  return (
    <>
      <PageTitle eyebrow="STUDENT · RESULTS" title="My Results" desc="Your published examination evaluations." />
      <div className="panel studentResultCard">
        <div className="resultIcon"><FileCheck2 /></div>
        <div className="grow"><span className="badge green">Published</span><h2>Data Structures Mid-Term</h2><p>Roll No. 2024CSE1021 · AI + teacher review</p></div>
        <strong className="bigScore">86<small>/100</small></strong>
        <Link className="btn btnPrimary" to="/student/results/2024CSE1021">View Result</Link>
      </div>
    </>
  );
}