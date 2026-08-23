import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, UserPlus } from "lucide-react";
import PageTitle from "../../components/PageTitle";
import { adminCreateStudent } from "../../services/api";

export default function CreateStudent() {
  const [roll, setRoll] = useState("");
  const [name, setName] = useState("");
  const [program, setProgram] = useState("");
  const [year, setYear] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function submit(e) {
    e.preventDefault();
    setError("");

    if (!roll.trim()) return setError("Roll number is required.");
    if (!name.trim()) return setError("Name is required.");

    try {
      setLoading(true);
      await adminCreateStudent({
        roll: roll.trim(),
        name: name.trim(),
        program: program.trim(),
        year: year.trim()
      });
      navigate("/admin/students");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <PageTitle
        eyebrow="ADMIN · CREATE STUDENT"
        title="Create Student Account"
        desc="Add a new student to the system."
      />

      <form className="panel settingsPanel" onSubmit={submit}>
        <label>
          Roll Number
          <input
            value={roll}
            onChange={e => setRoll(e.target.value)}
            placeholder="e.g. 2024CSE1021"
            disabled={loading}
          />
        </label>

        <label>
          Full Name
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. Rahul Sharma"
            disabled={loading}
          />
        </label>

        <label>
          Program
          <input
            value={program}
            onChange={e => setProgram(e.target.value)}
            placeholder="e.g. B.Tech CSE"
            disabled={loading}
          />
        </label>

        <label>
          Year
          <input
            value={year}
            onChange={e => setYear(e.target.value)}
            placeholder="e.g. 3rd Year"
            disabled={loading}
          />
        </label>

        {error && <div className="errorBox"><AlertTriangle size={16} />{error}</div>}

        <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
          <button type="button" className="btn btnSoft" onClick={() => navigate("/admin/students")} disabled={loading}>
            Cancel
          </button>
          <button type="submit" className="btn btnPrimary" disabled={loading}>
            <UserPlus size={16} />
            {loading ? "Creating..." : "Create Student"}
          </button>
        </div>
      </form>
    </>
  );
}