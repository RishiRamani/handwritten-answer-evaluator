import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, Check, UserPlus } from "lucide-react";
import PageTitle from "../../components/PageTitle";
import { adminCreateTeacher } from "../../services/api";

export default function CreateTeacher() {
  const [teacherId, setTeacherId] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [department, setDepartment] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function submit(e) {
    e.preventDefault();
    setError("");

    if (!teacherId.trim()) return setError("Teacher ID is required.");
    if (!name.trim()) return setError("Name is required.");
    if (!password || password.length < 4) return setError("Password must be at least 4 characters.");
    if (password !== confirmPassword) return setError("Passwords do not match.");

    try {
      setLoading(true);
      await adminCreateTeacher({
        teacherId: teacherId.trim(),
        name: name.trim(),
        password,
        department: department.trim()
      });
      navigate("/admin/teachers");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <PageTitle
        eyebrow="ADMIN · CREATE TEACHER"
        title="Create Teacher Account"
        desc="Add a new teacher to the system."
      />

      <form className="panel settingsPanel" onSubmit={submit}>
        <label>
          Teacher ID
          <input
            value={teacherId}
            onChange={e => setTeacherId(e.target.value)}
            placeholder="e.g. TCH001"
            disabled={loading}
          />
        </label>

        <label>
          Full Name
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. Dr. Sharma"
            disabled={loading}
          />
        </label>

        <label>
          Department
          <input
            value={department}
            onChange={e => setDepartment(e.target.value)}
            placeholder="e.g. Computer Science"
            disabled={loading}
          />
        </label>

        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Minimum 4 characters"
            disabled={loading}
          />
        </label>

        <label>
          Confirm Password
          <input
            type="password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            placeholder="Re-enter password"
            disabled={loading}
          />
        </label>

        {error && <div className="errorBox"><AlertTriangle size={16} />{error}</div>}

        <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
          <button type="button" className="btn btnSoft" onClick={() => navigate("/admin/teachers")} disabled={loading}>
            Cancel
          </button>
          <button type="submit" className="btn btnPrimary" disabled={loading}>
            <UserPlus size={16} />
            {loading ? "Creating..." : "Create Teacher"}
          </button>
        </div>
      </form>
    </>
  );
}