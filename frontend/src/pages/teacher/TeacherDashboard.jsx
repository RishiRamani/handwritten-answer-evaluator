import React from "react";
import { Link } from "react-router-dom";
import { UploadCloud, FileText, FileCheck2, Clock3, BarChart3, ClipboardList, ChevronRight } from "lucide-react";
import PageTitle from "../../components/PageTitle";
import Stat from "../../components/Stat";
import Table from "../../components/Table";
import QuickAction from "../../components/QuickAction";

export default function TeacherDashboard({ papers }) {
  const evaluated = papers.filter(p => p.status === "Evaluated").length;

  return (
    <>
      <PageTitle
        eyebrow="TEACHER · OVERVIEW"
        title="Good evening, Dr. Sharma 👋"
        desc="Manage answer sheets, evaluations and student results."
        action={<Link className="btn btnPrimary" to="/teacher/upload"><UploadCloud size={17} /> Upload Paper</Link>}
      />

      <div className="statsGrid">
        <Stat icon={<FileText />} label="Papers uploaded" value={papers.length} sub="+12 this week" />
        <Stat icon={<FileCheck2 />} label="Evaluated papers" value={evaluated} sub="Ready for results" />
        <Stat icon={<Clock3 />} label="Pending evaluation" value={papers.length - evaluated} sub="Needs attention" />
        <Stat icon={<BarChart3 />} label="Average score" value="88%" sub="Current exam" />
      </div>

      <div className="twoColumn">
        <div className="panel">
          <div className="panelHeader">
            <div><h2>Recent submissions</h2><p>Latest student answer sheets</p></div>
            <Link to="/teacher/submissions">View all <ChevronRight size={15} /></Link>
          </div>
          <Table papers={papers} />
        </div>

        <div className="panel">
          <div className="panelHeader">
            <div><h2>Quick actions</h2><p>Common teacher tasks</p></div>
          </div>
          <QuickAction to="/teacher/upload" icon={<UploadCloud />} title="Upload student paper" sub="PDF up to 15 MB" />
          <QuickAction to="/teacher/submissions" icon={<ClipboardList />} title="Review submissions" sub="Check pending papers" />
          <QuickAction to="/teacher/results" icon={<BarChart3 />} title="View results" sub="Scores and analytics" />
        </div>
      </div>
    </>
  );
}