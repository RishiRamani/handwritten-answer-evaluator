import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShieldCheck, AlertTriangle, ChevronRight } from "lucide-react";
import Logo from "../components/Logo";

export default function TeacherLogin() {
  const [teacherId, setTeacherId] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  function login() {
    if (!teacherId.trim()) {
      setError("Please enter your Teacher ID.");
      return;
    }
    setError("");
    sessionStorage.setItem("teacherId", teacherId.trim());
    navigate("/teacher/dashboard");
  }

  return (
    <div className="loginPage">
      <div className="loginCard">
        <Logo />
        <div className="loginIcon"><ShieldCheck size={27} /></div>
        <h1>Teacher Portal</h1>
        <p>Enter your Teacher ID to access the evaluation dashboard.</p>

        <label>
          Teacher ID
          <input
            value={teacherId}
            onChange={(e) => setTeacherId(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && login()}
            placeholder="e.g. TCH001"
          />
        </label>

        {error && <div className="errorBox"><AlertTriangle size={16} />{error}</div>}

        <button className="btn btnPrimary full" onClick={login}>
          Login to Teacher Portal <ChevronRight size={17} />
        </button>

        <small className="demoHint">Demo Teacher ID: TCH001</small>
        <Link className="switchLogin" to="/student/login">Go to Student Login</Link>
      </div>
    </div>
  );
}