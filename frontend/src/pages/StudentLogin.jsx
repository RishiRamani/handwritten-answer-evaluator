import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GraduationCap, AlertTriangle, ChevronRight } from "lucide-react";
import Logo from "../components/Logo";
import { loginStudent } from "../services/api";

export default function StudentLogin() {
  const [roll, setRoll] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function login() {
    if (!roll.trim()) {
      setError("Please enter your Roll Number.");
      return;
    }
    try {
      setLoading(true);
      setError("");
      await loginStudent(roll.trim());
      navigate("/student/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
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
            disabled={loading}
          />
        </label>

        {error && <div className="errorBox"><AlertTriangle size={16} />{error}</div>}

        <button className="btn btnPrimary full" onClick={login} disabled={loading}>
          {loading ? "Checking..." : "View My Result"} <ChevronRight size={17} />
        </button>

        <small className="demoHint">Contact admin if you don't have an account</small>
        <Link className="switchLogin" to="/teacher/login">Go to Teacher Login</Link>
        <br />
        <Link className="switchLogin" to="/admin/login">Go to Admin Login</Link>
      </div>
    </div>
  );
}