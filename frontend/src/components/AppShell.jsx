import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Home, Users, UserPlus, BookOpen, BarChart3, Settings,
  LogOut, Menu, X, Search, UserRound, Shield, UploadCloud, ClipboardList
} from "lucide-react";
import Logo from "./Logo";
import { getAuth, logout as clearAuth } from "../services/api";

export default function AppShell({ role, children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  
  const auth = getAuth();
  const user = auth?.user || {};

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

  const adminItems = [
    { to: "/admin/dashboard", label: "Dashboard", icon: <Home /> },
    { to: "/admin/teachers", label: "Teachers", icon: <Users /> },
    { to: "/admin/students", label: "Students", icon: <UserRound /> },
    { to: "/admin/create-teacher", label: "Add Teacher", icon: <UserPlus /> },
    { to: "/admin/create-student", label: "Add Student", icon: <UserPlus /> }
  ];

  const getItems = () => {
    if (role === "teacher") return teacherItems;
    if (role === "student") return studentItems;
    if (role === "admin") return adminItems;
    return [];
  };

  const items = getItems();

  const getDisplayName = () => {
    if (role === "teacher") return user?.name || user?.teacherId || "Teacher";
    if (role === "student") return user?.name || user?.roll || "Student";
    if (role === "admin") return user?.username || "Admin";
    return "User";
  };

  const getSubtext = () => {
    if (role === "teacher") {
      const dept = user?.department ? ` · ${user.department}` : "";
      return `Teacher ID: ${user?.teacherId || ""}${dept}`;
    }
    if (role === "student") return `Roll: ${user?.roll || ""}`;
    if (role === "admin") return "Administrator";
    return "";
  };

  const getAvatar = () => {
    const name = getDisplayName();
    if (role === "teacher") return name.slice(0, 2).toUpperCase();
    if (role === "student") return user?.roll?.slice(0, 2).toUpperCase() || "ST";
    if (role === "admin") return "AD";
    return "US";
  };

  const getPortalLabel = () => {
    if (role === "teacher") return "TEACHER PORTAL";
    if (role === "student") return "STUDENT PORTAL";
    if (role === "admin") return "ADMIN PORTAL";
    return "PORTAL";
  };

  function logout() {
    clearAuth();
    navigate("/", { replace: true });
    window.location.href = "/";
  }

  return (
    <div className="appShell">
      <aside className={mobileOpen ? "sidebar open" : "sidebar"}>
        <div className="sideTop">
          <Logo />
          <button className="closeMenu" onClick={() => setMobileOpen(false)}><X /></button>
        </div>

        <div className="portalLabel">{getPortalLabel()}</div>

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
            <div className="avatar">{getAvatar()}</div>
            <div>
              <strong>{getDisplayName()}</strong>
              <small>{getSubtext()}</small>
            </div>
          </div>
        </header>
        <div className="content">{children}</div>
      </main>
    </div>
  );
}