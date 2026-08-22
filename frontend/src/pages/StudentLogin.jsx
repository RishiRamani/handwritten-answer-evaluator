import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GraduationCap, AlertTriangle, ChevronRight } from "lucide-react";
import Logo from "../components/Logo";

export default function StudentLogin() {
  const [roll, setRoll] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  function login() {
    if (!roll.trim()) {
      setError("Please enter your Roll Number.");
      return;
    }
    setError("");
    navigate("/student/results/" + roll.trim());
  }

  return (
    <div className="loginPage">
      <div className="loginCard">
        <Logo />
        <div className="loginIcon"><GraduationCap size={27} /></div>
        <h1>Student Result Portal</h1>
        <p>Enter your Roll Number to access your published results.</p>

        <label>
          Roll Number
          <input
            value={roll}
            onChange={(e) => setRoll(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && login()}
            placeholder="e.g. 2024CSE1021"
          />
        </label>

        {error && <div className="errorBox"><AlertTriangle size={16} />{error}</div>}

        <button className="btn btnPrimary full" onClick={login}>
          View My Result <ChevronRight size={17} />
        </button>

        <small className="demoHint">Demo Roll Number: 2024CSE1021</small>
        <Link className="switchLogin" to="/teacher/login">Go to Teacher Login</Link>
      </div>
    </div>
  );
}