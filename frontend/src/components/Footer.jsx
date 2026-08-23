import React from "react";
import { Sparkles } from "lucide-react";
import Logo from "./Logo";

const team = ["Rishi Ramani", "Arnav Jain", "Shubh Tyagi", "Aniket", "Rachit Talwar", "Vanshika"];

export default function Footer() {
  // Split team into rows of 2
  const teamRows = [];
  for (let i = 0; i < team.length; i += 2) {
    teamRows.push(team.slice(i, i + 2));
  }

  return (
    <footer className="siteFooter" id="about">
      <div className="footerTop">
        <div className="footerBrand">
          <div style={{display: "flex", justifyContent:"center"}}>

          <Logo />
          </div>
          <p>
            AI-powered evaluation for handwritten answer sheets — OCR
            extraction, automated scoring, and transparent feedback for
            teachers and students.
          </p>
        </div>

        <div className="footerCol">
          <h4>Team</h4>
          {teamRows.map((row, index) => (
            <div key={index} style={{ display: "flex", gap: "20px", marginBottom: "4px",
              justifyContent: "center"
             }}>
              {row.map(name => (
                <span key={name}>{name}</span>
              ))}
            </div>
          ))}
        </div>

        
      </div>

      <div className="footerBottom">
        <div className="stack">
          <Sparkles size={12} style={{ verticalAlign: "-2px", marginRight: 5
           }} />
          Built with React · Node.js · Express · MongoDB · PaddleOCR · Qwen · TrOCR · Python
        </div>
       
      </div>
    </footer>
  );
}