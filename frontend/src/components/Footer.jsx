import React from "react";
import { Sparkles } from "lucide-react";
import Logo from "./Logo";

const quickLinks = [
  { label: "Home", href: "/" },
  { label: "Features", href: "#features" },
  { label: "Workflow", href: "#workflow" },
  { label: "Teacher Portal", href: "/teacher/login" },
  { label: "Student Login", href: "/student/login" }
];

const team = ["Rishi Ramani", "Shubh Tyagi", "Rachit Talwar", "Arnav Jain", "Ikaris"];

export default function Footer() {
  return (
    <footer className="siteFooter" id="about">
      <div className="footerTop">
        <div className="footerBrand">
          <Logo />
          <p>
            AI-powered evaluation for handwritten answer sheets — OCR
            extraction, automated scoring, and transparent feedback for
            teachers and students.
          </p>
        </div>

        <div className="footerCol">
          <h4>Quick Links</h4>
          {quickLinks.map(link => (
            <a key={link.label} href={link.href}>{link.label}</a>
          ))}
        </div>

        <div className="footerCol">
          <h4>Team</h4>
          {team.map(name => <span key={name}>{name}</span>)}
        </div>
      </div>

      <div className="footerBottom">
        <div className="stack">
          <Sparkles size={12} style={{ verticalAlign: "-2px", marginRight: 5 }} />
          Built with React · Node.js · Express · MongoDB · PaddleOCR · Qwen
        </div>
        <div className="copyright">© 2026 EvalX. All rights reserved.</div>
      </div>
    </footer>
  );
}