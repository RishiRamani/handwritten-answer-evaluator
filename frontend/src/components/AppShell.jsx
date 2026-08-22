import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Home, UploadCloud, ClipboardList, BarChart3, BookOpen, Settings,
  LogOut, Menu, X, Search, UserRound
} from "lucide-react";
import Logo from "./Logo";

export default function AppShell({ role, children }) {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const teacherItems = [
    { to: "/teacher/dashboard", label: "Dashboard", icon: <Home /> },
    { to: "/teacher/upload", label: "Upload Paper", icon: <UploadCloud /> },
    { to: "/teacher/submissions", label: "Submissions", icon: <ClipboardList /> },
    { to: "/teacher/results", label: "Results", icon: <BarChart3 /> },
    { to: "/teacher/exams", label: "Examinations", icon: <BookOpen /> },
    { to: "/teacher/settings", label: "Settings", icon: <Settings /> }
  ];

  const studentItems = [
    { to: "/student/dashboard", label: "Dashboard", icon: <Home /> },
    { to: "/student/results", label: "My Results", icon: <BarChart3 /> },
    { to: "/student/profile", label: "Profile", icon: <UserRound /> }
  ];

  const items = role === "teacher" ? teacherItems : studentItems;
  const teacherId = sessionStorage.getItem("teacherId") || "TCH001";

  function logout() {
    if (role === "teacher") sessionStorage.removeItem("teacherId");
    window.location.href = "/";
  }

  return (
    <div className="appShell">
      <aside className={mobileOpen ? "sidebar open" : "sidebar"}>
        <div className="sideTop">
          <Logo />
          <button className="closeMenu" onClick={() => setMobileOpen(false)}><X /></button>
        </div>

        <div className="portalLabel">
          {role === "teacher" ? "TEACHER PORTAL" : "STUDENT PORTAL"}
        </div>

        <nav className="sideNav">
          {items.map(item => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setMobileOpen(false)}
              className={location.pathname.startsWith(item.to) ? "sideLink active" : "sideLink"}
            >
              {item.icon}<span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <button className="sideLink logoutButton" onClick={logout}>
          <LogOut /><span>Exit portal</span>
        </button>
      </aside>

      <main className="mainArea">
        <header className="appHeader">
          <button className="menuButton" onClick={() => setMobileOpen(true)}><Menu /></button>
          <div className="headerSearch"><Search size={17} /><input placeholder="Search..." /></div>
          <div className="headerUser">
            <div className="avatar">{role === "teacher" ? "DS" : "RS"}</div>
            <div>
              <strong>{role === "teacher" ? "Dr. Sharma" : "Rahul Sharma"}</strong>
              <small>{role === "teacher" ? `Teacher ID: ${teacherId}` : "Roll: 2024CSE1234"}</small>
            </div>
          </div>
        </header>
        <div className="content">{children}</div>
      </main>
    </div>
  );
}