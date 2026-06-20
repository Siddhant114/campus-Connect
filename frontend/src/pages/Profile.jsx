import { useState } from "react";
import api from "../api";

const AVAILABLE_INTERESTS = [
  "AI", "Robotics", "Music", "Photography", "Sports",
  "Dance", "Coding", "Art", "Drama",
];

export default function Profile({ student, setStudent }) {
  const initial = (student.interests || "").split(",").map(s => s.trim()).filter(Boolean);
  const [selected, setSelected] = useState(initial);
  const [bio, setBio] = useState(student.bio || "");
  const [profilePic, setProfilePic] = useState(student.profile_pic || "");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const toggle = (interest) => {
    setSelected(prev =>
      prev.includes(interest) ? prev.filter(i => i !== interest) : [...prev, interest]
    );
    setSaved(false);
  };

  const save = async () => {
    setSaving(true);
    try {
      const interestsStr = selected.join(",");
      await api.put(`/students/${student.id}/interests?interests=${encodeURIComponent(interestsStr)}`);
      const res = await api.put(
        `/students/${student.id}/profile?bio=${encodeURIComponent(bio)}&profile_pic=${encodeURIComponent(profilePic)}`
      );
      const updated = res.data;
      localStorage.setItem("student", JSON.stringify(updated));
      setStudent(updated);
      setSaved(true);
    } catch {
      alert("Save failed. Try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container">
      <div className="page-header">
        <h1>👤 My Profile</h1>
        <p>Manage your account and personalize your experience.</p>
      </div>

      {/* Profile card */}
      <div className="profile-card">
        <div className="avatar" style={{ width: 80, height: 80, fontSize: "2rem" }}>
          {profilePic
            ? <img src={profilePic} alt="pic" style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} />
            : student.name.charAt(0)
          }
        </div>
        <h2>{student.name}</h2>
        <p><strong>{student.branch}</strong> · Year {student.year} · Div {student.division}</p>
        <span style={{
          padding: "3px 12px", borderRadius: 20, fontSize: "0.78rem",
          background: student.account_type === "club" ? "#7c3aed22" : "#0ea5e922",
          color: student.account_type === "club" ? "#7c3aed" : "#0ea5e9",
        }}>
          {student.account_type === "club" ? "🏛️ Club Account" : "👤 Personal Account"}
        </span>
      </div>

      {/* Info */}
      <div className="card">
        <h3>Student Information</h3>
        <div className="info-grid">
          {[
            ["Name", student.name],
            ["Email", student.email],
            ["PRN", student.prn],
            ["Branch", student.branch],
            ["Year", student.year],
            ["Division", student.division],
          ].map(([label, value]) => (
            <div className="info-item" key={label}>
              <div className="label">{label}</div>
              <div className="value">{value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Edit bio + pic */}
      <div className="card">
        <h3>Edit Profile</h3>
        <div className="form-group" style={{ marginTop: 12 }}>
          <label>Bio</label>
          <textarea
            rows={3}
            value={bio}
            onChange={e => { setBio(e.target.value); setSaved(false); }}
            placeholder="Tell others about yourself..."
            style={{ resize: "vertical", width: "100%" }}
          />
        </div>
        <div className="form-group">
          <label>Profile Picture URL (optional)</label>
          <input
            value={profilePic}
            onChange={e => { setProfilePic(e.target.value); setSaved(false); }}
            placeholder="https://example.com/photo.jpg"
          />
          {profilePic && (
            <img src={profilePic} alt="preview"
              style={{ width: 60, height: 60, borderRadius: "50%", objectFit: "cover", marginTop: 8 }} />
          )}
        </div>
      </div>

      {/* Interests */}
      <div className="card">
        <h3>My Interests</h3>
        <p style={{ color: "var(--muted)", fontSize: "0.88rem", marginTop: 0 }}>
          Select interests to get better event recommendations.
        </p>
        <div className="checkbox-group" style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {AVAILABLE_INTERESTS.map(interest => (
            <button
              key={interest}
              type="button"
              onClick={() => toggle(interest)}
              style={{
                padding: "6px 16px", borderRadius: 20, cursor: "pointer",
                border: "1.5px solid var(--primary)",
                background: selected.includes(interest) ? "var(--primary)" : "transparent",
                color: selected.includes(interest) ? "white" : "var(--primary)",
                fontSize: "0.88rem",
              }}
            >
              {interest}
            </button>
          ))}
        </div>

        <button style={{ marginTop: 20 }} onClick={save} disabled={saving}>
          {saving ? "Saving..." : "Save Profile"}
        </button>
        {saved && <p className="success-msg">Profile updated ✓</p>}
      </div>
    </div>
  );
}