import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api";

const BRANCHES = ["Computer", "Electronics", "Mechanical", "Civil", "AIDS"];
const YEARS = ["1", "2", "3", "4"];
const DIVISIONS = ["A", "B", "C"];
const INTERESTS = ["AI", "Robotics", "Music", "Sports", "Dance", "Coding", "Art", "Drama", "Photography"];

export default function Register() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1 = pick type, 2 = fill form
  const [accountType, setAccountType] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Personal fields
  const [form, setForm] = useState({
    name: "", email: "", prn: "", password: "", confirmPassword: "",
    branch: "Computer", year: "1", division: "A",
    bio: "", interests: [],
  });

  // Club extra fields
  const [clubForm, setClubForm] = useState({
    club_name: "", description: "", faculty_contact: "",
  });

  const set = (field, value) => setForm(f => ({ ...f, [field]: value }));

  const toggleInterest = (interest) => {
    setForm(f => ({
      ...f,
      interests: f.interests.includes(interest)
        ? f.interests.filter(i => i !== interest)
        : [...f.interests, interest],
    }));
  };

  const handleRegister = async () => {
    setError("");
    if (!form.name || !form.email || !form.prn || !form.password) {
      setError("Please fill in all required fields."); return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match."); return;
    }
    setLoading(true);
    try {
      const payload = {
        name: form.name,
        email: form.email,
        prn: form.prn,
        password: form.password,
        branch: form.branch,
        year: form.year,
        division: form.division,
        bio: form.bio,
        interests: form.interests.join(","),
        account_type: accountType,
      };
      const res = await api.post("/students/register", payload);
      const student = res.data;

      // If club, create the club record too
      if (accountType === "club" && clubForm.club_name) {
        await api.post("/social/clubs", {
          student_id: student.id,
          club_name: clubForm.club_name,
          description: clubForm.description,
          faculty_contact: clubForm.faculty_contact,
        });
      }

      localStorage.setItem("student", JSON.stringify(student));
      navigate("/");
      window.location.reload();
    } catch (err) {
      setError(err.response?.data?.detail || "Registration failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  // Step 1 — choose account type
  if (step === 1) {
    return (
      <div className="login-page">
        <div className="login-card" style={{ maxWidth: 480 }}>
          <div className="login-logo">
            <div className="logo-icon">🎓</div>
            <h1>Create Account</h1>
            <p>What kind of account do you want?</p>
          </div>
          <div style={{ display: "flex", gap: 16, margin: "24px 0" }}>
            <button
              onClick={() => { setAccountType("personal"); setStep(2); }}
              style={{
                flex: 1, padding: "20px 12px", borderRadius: 12,
                border: "2px solid var(--primary)", background: "var(--card)",
                cursor: "pointer", fontSize: "1rem",
              }}
            >
              <div style={{ fontSize: "2rem", marginBottom: 8 }}>👤</div>
              <strong>Personal</strong>
              <p style={{ fontSize: "0.8rem", color: "var(--muted)", margin: "6px 0 0" }}>
                Student profile with interests, bio, friends
              </p>
            </button>
            <button
              onClick={() => { setAccountType("club"); setStep(2); }}
              style={{
                flex: 1, padding: "20px 12px", borderRadius: 12,
                border: "2px solid var(--primary)", background: "var(--card)",
                cursor: "pointer", fontSize: "1rem",
              }}
            >
              <div style={{ fontSize: "2rem", marginBottom: 8 }}>🏛️</div>
              <strong>Social Club</strong>
              <p style={{ fontSize: "0.8rem", color: "var(--muted)", margin: "6px 0 0" }}>
                Organize events, post activities for students
              </p>
            </button>
          </div>
          <div style={{ textAlign: "center", marginTop: 8 }}>
            <Link to="/login" style={{ color: "var(--primary)", fontSize: "0.9rem" }}>
              Already have an account? Sign in
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Step 2 — fill form
  return (
    <div className="login-page" style={{ alignItems: "flex-start", paddingTop: 40, paddingBottom: 40 }}>
      <div className="login-card" style={{ maxWidth: 520 }}>
        <div className="login-logo">
          <div className="logo-icon">{accountType === "club" ? "🏛️" : "👤"}</div>
          <h1>{accountType === "club" ? "Club Registration" : "Student Registration"}</h1>
        </div>

        {/* Common fields */}
        <div style={{ display: "grid", gap: 14 }}>
          <div className="form-group">
            <label>Full Name *</label>
            <input value={form.name} onChange={e => set("name", e.target.value)} placeholder="Siddhant Patil" />
          </div>
          <div className="form-group">
            <label>Email *</label>
            <input type="email" value={form.email} onChange={e => set("email", e.target.value)} placeholder="you@college.edu" />
          </div>
          <div className="form-group">
            <label>PRN *</label>
            <input value={form.prn} onChange={e => set("prn", e.target.value)} placeholder="e.g. PRN003" />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
            <div className="form-group">
              <label>Branch</label>
              <select value={form.branch} onChange={e => set("branch", e.target.value)}>
                {BRANCHES.map(b => <option key={b}>{b}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Year</label>
              <select value={form.year} onChange={e => set("year", e.target.value)}>
                {YEARS.map(y => <option key={y}>{y}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Division</label>
              <select value={form.division} onChange={e => set("division", e.target.value)}>
                {DIVISIONS.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>Password *</label>
            <input type="password" value={form.password} onChange={e => set("password", e.target.value)} />
          </div>
          <div className="form-group">
            <label>Confirm Password *</label>
            <input type="password" value={form.confirmPassword} onChange={e => set("confirmPassword", e.target.value)} />
          </div>

          {/* Personal only */}
          {accountType === "personal" && (
            <>
              <div className="form-group">
                <label>Bio (optional)</label>
                <textarea
                  rows={3}
                  value={form.bio}
                  onChange={e => set("bio", e.target.value)}
                  placeholder="Tell others about yourself..."
                  style={{ resize: "vertical" }}
                />
              </div>
              <div className="form-group">
                <label>Interests</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 6 }}>
                  {INTERESTS.map(i => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => toggleInterest(i)}
                      style={{
                        padding: "5px 14px", borderRadius: 20, fontSize: "0.85rem",
                        border: "1.5px solid var(--primary)", cursor: "pointer",
                        background: form.interests.includes(i) ? "var(--primary)" : "transparent",
                        color: form.interests.includes(i) ? "white" : "var(--primary)",
                      }}
                    >
                      {i}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Club only */}
          {accountType === "club" && (
            <>
              <div className="form-group">
                <label>Club Name *</label>
                <input
                  value={clubForm.club_name}
                  onChange={e => setClubForm(f => ({ ...f, club_name: e.target.value }))}
                  placeholder="e.g. Robotics Club"
                />
              </div>
              <div className="form-group">
                <label>Club Description</label>
                <textarea
                  rows={3}
                  value={clubForm.description}
                  onChange={e => setClubForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="What does your club do?"
                  style={{ resize: "vertical" }}
                />
              </div>
              <div className="form-group">
                <label>Faculty Contact</label>
                <input
                  value={clubForm.faculty_contact}
                  onChange={e => setClubForm(f => ({ ...f, faculty_contact: e.target.value }))}
                  placeholder="Prof. Sharma — sharma@college.edu"
                />
              </div>
            </>
          )}
        </div>

        {error && <p className="error-msg" style={{ marginTop: 12 }}>{error}</p>}

        <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
          <button
            onClick={() => setStep(1)}
            style={{ flex: 1, padding: "12px", background: "var(--card)", border: "1.5px solid var(--border)", borderRadius: 8 }}
          >
            ← Back
          </button>
          <button onClick={handleRegister} disabled={loading} style={{ flex: 2, padding: "12px" }}>
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </div>

        <div style={{ textAlign: "center", marginTop: 12 }}>
          <Link to="/login" style={{ color: "var(--primary)", fontSize: "0.9rem" }}>
            Already have an account? Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}