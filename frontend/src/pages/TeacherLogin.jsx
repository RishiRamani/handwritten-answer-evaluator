import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShieldCheck, AlertTriangle, ChevronRight } from "lucide-react";
import Logo from "../components/Logo";
import { loginTeacher } from "../services/api";

export default function TeacherLogin() {
  const [teacherId, setTeacherId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function login() {
    if (!teacherId.trim() || !password) {
      setError("Enter your Teacher ID and password.");
      return;
    }
    try {
      setLoading(true);
      setError("");
      await loginTeacher(teacherId.trim(), password);
      navigate("/teacher/dashboard");
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
            disabled={loading}
          />
        </label>

        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            disabled={loading}
          />
        </label>

        {error && <div className="errorBox"><AlertTriangle size={16} />{error}</div>}

        <button className="btn btnPrimary full" onClick={login} disabled={loading}>
          {loading ? "Logging in..." : "Login to Teacher Portal"} <ChevronRight size={17} />
        </button>

        <small className="demoHint">Contact admin if you don't have an account</small>
        <Link className="switchLogin" to="/student/login">Go to Student Login</Link>
        <br />
        <Link className="switchLogin" to="/admin/login">Go to Admin Login</Link>
      </div>
    </div>
  );
}