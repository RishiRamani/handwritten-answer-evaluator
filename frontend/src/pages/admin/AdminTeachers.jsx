import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Search, Plus, Trash2, AlertTriangle, UserPlus } from "lucide-react";
import PageTitle from "../../components/PageTitle";
import { adminGetTeachers, adminDeleteTeacher } from "../../services/api";

export default function AdminTeachers() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    loadTeachers();
  }, []);

  async function loadTeachers() {
    try {
      setLoading(true);
      const data = await adminGetTeachers();
      setTeachers(data);
      setError("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(teacherId) {
    if (!confirm(`Are you sure you want to delete teacher ${teacherId}?`)) return;
    try {
      setDeleting(teacherId);
      await adminDeleteTeacher(teacherId);
      await loadTeachers();
    } catch (err) {
      setError(err.message);
    } finally {
      setDeleting(null);
    }
  }

  const filtered = teachers.filter(t =>
    `${t.teacherId} ${t.name} ${t.department}`
      .toLowerCase()
      .includes(query.toLowerCase())
  );

  return (
    <>
      <PageTitle
        eyebrow="ADMIN · TEACHERS"
        title="Manage Teachers"
        desc="Create and manage teacher accounts."
        action={
          <Link className="btn btnPrimary" to="/admin/create-teacher">
            <UserPlus size={17} /> Add Teacher
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
              placeholder="Search teachers..."
            />
          </div>
          <span className="muted">{filtered.length} teachers</span>
        </div>

        <div className="tableWrap">
          <table>
            <thead>
              <tr>
                <th>Teacher ID</th>
                <th>Name</th>
                <th>Department</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5" style={{ textAlign: "center" }}>Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan="5" style={{ textAlign: "center" }} className="muted">No teachers found</td></tr>
              ) : (
                filtered.map(t => (
                  <tr key={t.teacherId}>
                    <td><strong>{t.teacherId}</strong></td>
                    <td>{t.name}</td>
                    <td>{t.department || "—"}</td>
                    <td>{new Date(t.createdAt).toLocaleDateString()}</td>
                    <td>
                      <button
                        className="btn btnSoft"
                        style={{ padding: "4px 8px", fontSize: "9px" }}
                        onClick={() => handleDelete(t.teacherId)}
                        disabled={deleting === t.teacherId}
                      >
                        <Trash2 size={14} />
                        {deleting === t.teacherId ? "Deleting..." : "Delete"}
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