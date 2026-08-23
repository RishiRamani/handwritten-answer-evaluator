import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Shield, AlertTriangle, ChevronRight } from "lucide-react";
import Logo from "../components/Logo";
import { adminLogin } from "../services/api";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function login(e) {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError("Enter both username and password.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      
      await adminLogin(username.trim(), password);
      navigate("/admin/dashboard", { replace: true });
    } catch (err) {
      setError(err.message);
      localStorage.removeItem("auth");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="loginPage">
      <div className="loginCard">
        <Logo />
        <div className="loginIcon"><Shield size={27} /></div>
        <h1>Admin Portal</h1>
        <p>Manage teachers and students accounts.</p>

        <form onSubmit={login}>
          <label>
            Username
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter admin username"
              disabled={loading}
            />
          </label>

          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              disabled={loading}
            />
          </label>

          {error && <div className="errorBox"><AlertTriangle size={16} />{error}</div>}

          <button className="btn btnPrimary full" type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login to Admin Portal"}
            <ChevronRight size={17} />
          </button>

          <small className="demoHint">Default: admin / admin123</small>
        </form>

        <Link className="switchLogin" to="/teacher/login">Go to Teacher Login</Link>
        <br />
        <Link className="switchLogin" to="/student/login">Go to Student Login</Link>
      </div>
    </div>
  );
}