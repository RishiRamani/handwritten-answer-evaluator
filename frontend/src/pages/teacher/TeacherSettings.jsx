import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, Save, User, Building, Lock } from "lucide-react";
import PageTitle from "../../components/PageTitle";
import { getAuth, updateTeacherProfile } from "../../services/api";

export default function TeacherSettings() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    department: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const navigate = useNavigate();
  const auth = getAuth();
  const teacherId = auth?.user?.teacherId || "";

  useEffect(() => {
    if (auth?.user) {
      setFormData(prev => ({
        ...prev,
        name: auth.user.name || "",
        department: auth.user.department || ""
      }));
    }
  }, [auth]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      // Validate
      if (!formData.name.trim()) {
        setError("Name is required.");
        setLoading(false);
        return;
      }

      // Prepare update data
      const updateData = {
        teacherId,
        name: formData.name.trim(),
        department: formData.department.trim()
      };

      // If changing password
      if (formData.newPassword) {
        if (formData.newPassword.length < 4) {
          setError("New password must be at least 4 characters.");
          setLoading(false);
          return;
        }
        if (formData.newPassword !== formData.confirmPassword) {
          setError("New passwords do not match.");
          setLoading(false);
          return;
        }
        updateData.password = formData.newPassword;
      }

      const result = await updateTeacherProfile(updateData);
      setSuccess("Profile updated successfully!");
      
      // Update local state with new data
      if (result.user) {
        setFormData(prev => ({
          ...prev,
          name: result.user.name || "",
          department: result.user.department || "",
          newPassword: "",
          confirmPassword: "",
          currentPassword: ""
        }));
      }
      
      // Reload page to update header
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err) {
      setError(err.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <PageTitle
        eyebrow="TEACHER · SETTINGS"
        title="Profile Settings"
        desc="Update your teacher profile and password."
      />

      <form className="panel settingsPanel" onSubmit={handleSubmit}>
        <div style={{ marginBottom: "16px", padding: "12px", background: "#f0f4ff", borderRadius: "8px" }}>
          <strong style={{ fontSize: "11px" }}>Teacher ID: </strong>
          <span style={{ fontSize: "11px", color: "#6b7280" }}>{teacherId}</span>
        </div>

        <label>
          <User size={14} style={{ display: "inline", marginRight: "6px" }} />
          Full Name
          <input
            value={formData.name}
            onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Enter your full name"
            disabled={loading}
            required
          />
        </label>

        <label>
          <Building size={14} style={{ display: "inline", marginRight: "6px" }} />
          Department
          <input
            value={formData.department}
            onChange={e => setFormData(prev => ({ ...prev, department: e.target.value }))}
            placeholder="e.g. Computer Science & Engineering"
            disabled={loading}
          />
        </label>

        <hr style={{ border: "none", borderTop: "1px solid #e5e7eb", margin: "20px 0" }} />

        <h3 style={{ fontSize: "13px", margin: "0 0 12px" }}>
          <Lock size={14} style={{ display: "inline", marginRight: "6px" }} />
          Change Password
        </h3>
        <p style={{ fontSize: "9px", color: "#6b7280", margin: "0 0 12px" }}>
          Leave blank to keep current password.
        </p>

        <label>
          New Password
          <input
            type="password"
            value={formData.newPassword}
            onChange={e => setFormData(prev => ({ ...prev, newPassword: e.target.value }))}
            placeholder="Enter new password (min 4 characters)"
            disabled={loading}
          />
        </label>

        <label>
          Confirm New Password
          <input
            type="password"
            value={formData.confirmPassword}
            onChange={e => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
            placeholder="Re-enter new password"
            disabled={loading}
          />
        </label>

        {error && <div className="errorBox"><AlertTriangle size={16} />{error}</div>}
        {success && (
          <div style={{
            background: "#e7f8f0",
            color: "#208662",
            border: "1px solid #b8e6d4",
            borderRadius: "8px",
            padding: "9px 12px",
            fontSize: "10px",
            marginBottom: "13px"
          }}>
            ✅ {success}
          </div>
        )}

        <button type="submit" className="btn btnPrimary full" disabled={loading}>
          <Save size={16} />
          {loading ? "Saving..." : "Save Settings"}
        </button>
      </form>
    </>
  );
}