import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Search, Plus, Trash2, AlertTriangle, UserPlus } from "lucide-react";
import PageTitle from "../../components/PageTitle";
import { adminGetStudents, adminDeleteStudent } from "../../services/api";

export default function AdminStudents() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    loadStudents();
  }, []);

  async function loadStudents() {
    try {
      setLoading(true);
      const data = await adminGetStudents();
      setStudents(data);
      setError("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(roll) {
    if (!confirm(`Are you sure you want to delete student ${roll}?`)) return;
    try {
      setDeleting(roll);
      await adminDeleteStudent(roll);
      await loadStudents();
    } catch (err) {
      setError(err.message);
    } finally {
      setDeleting(null);
    }
  }

  const filtered = students.filter(s =>
    `${s.roll} ${s.name} ${s.program}`
      .toLowerCase()
      .includes(query.toLowerCase())
  );

  return (
    <>
      <PageTitle
        eyebrow="ADMIN · STUDENTS"
        title="Manage Students"
        desc="Create and manage student accounts."
        action={
          <Link className="btn btnPrimary" to="/admin/create-student">
            <UserPlus size={17} /> Add Student
          </Link>
        }
      />

      {error && <div className="errorBox"><AlertTriangle size={16} />{error}</div>}

      <div className="panel">
        <div className="toolbar">
          <div className="searchBox">
            <Search size={16} />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search students..."
            />
          </div>
          <span className="muted">{filtered.length} students</span>
        </div>

        <div className="tableWrap">
          <table>
            <thead>
              <tr>
                <th>Roll</th>
                <th>Name</th>
                <th>Program</th>
                <th>Year</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" style={{ textAlign: "center" }}>Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan="6" style={{ textAlign: "center" }} className="muted">No students found</td></tr>
              ) : (
                filtered.map(s => (
                  <tr key={s.roll}>
                    <td><strong>{s.roll}</strong></td>
                    <td>{s.name}</td>
                    <td>{s.program || "—"}</td>
                    <td>{s.year || "—"}</td>
                    <td>{new Date(s.createdAt).toLocaleDateString()}</td>
                    <td>
                      <button
                        className="btn btnSoft"
                        style={{ padding: "4px 8px", fontSize: "9px" }}
                        onClick={() => handleDelete(s.roll)}
                        disabled={deleting === s.roll}
                      >
                        <Trash2 size={14} />
                        {deleting === s.roll ? "Deleting..." : "Delete"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}