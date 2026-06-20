import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api";

export default function Login() {
  const [loginType, setLoginType] = useState(""); // "" | "student" | "club"
  const [prn, setPrn] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!prn.trim() || !password.trim()) { setError("Enter PRN and password."); return; }
    setError("");
    setLoading(true);
    try {
      const res = await api.post(`/students/login?prn=${encodeURIComponent(prn)}&password=${encodeURIComponent(password)}`);
      const student = res.data;
      // Validate login type matches account type
      if (loginType === "student" && student.account_type === "club") {
        setError("This is a club account. Please use Club Login."); setLoading(false); return;
      }
      if (loginType === "club" && student.account_type !== "club") {
        setError("This is a student account. Please use Student Login."); setLoading(false); return;
      }
      localStorage.setItem("student", JSON.stringify(student));
      navigate("/");
      window.location.reload();
    } catch (err) {
      setError(err.response?.data?.detail || "Invalid PRN or password.");
    } finally {
      setLoading(false);
    }
  };

  // Step 1 — pick login type
  if (!loginType) {
    return (
      <div className="login-page">
        <div className="login-card" style={{ maxWidth: 440 }}>
          <div className="login-logo">
            <div className="logo-icon">🎓</div>
            <h1>Campus Portal</h1>
            <p>Who are you logging in as?</p>
          </div>
          <div style={{ display: "flex", gap: 16, margin: "24px 0" }}>
            <button onClick={() => setLoginType("student")} style={{
              flex: 1, padding: "20px 12px", borderRadius: 12,
              border: "2px solid var(--primary)", background: "var(--card)",
              cursor: "pointer", fontSize: "1rem",
            }}>
              <div style={{ fontSize: "2rem", marginBottom: 8 }}>👤</div>
              <strong>Student</strong>
            </button>
            <button onClick={() => setLoginType("club")} style={{
              flex: 1, padding: "20px 12px", borderRadius: 12,
              border: "2px solid var(--primary)", background: "var(--card)",
              cursor: "pointer", fontSize: "1rem",
            }}>
              <div style={{ fontSize: "2rem", marginBottom: 8 }}>🏛️</div>
              <strong>Social Club</strong>
            </button>
          </div>
          <div style={{ textAlign: "center" }}>
            <Link to="/register" style={{ color: "var(--primary)", fontSize: "0.9rem" }}>
              Don't have an account? Register
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Step 2 — enter credentials
  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">
          <div className="logo-icon">{loginType === "club" ? "🏛️" : "👤"}</div>
          <h1>{loginType === "club" ? "Club Login" : "Student Login"}</h1>
          <p>Sign in to your campus portal</p>
        </div>
        <div className="form-group">
          <label>PRN</label>
          <input type="text" value={prn} onChange={e => setPrn(e.target.value)} placeholder={loginType === "club" ? "e.g. CLUB001" : "e.g. PRN001"} autoFocus />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === "Enter" && handleLogin()} placeholder="Your password" />
        </div>
        <button onClick={handleLogin} disabled={loading} style={{ width: "100%", padding: "13px" }}>
          {loading ? "Signing in..." : "Sign In"}
        </button>
        {error && <p className="error-msg">{error}</p>}
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 16, fontSize: "0.9rem" }}>
          <button onClick={() => setLoginType("")} style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer" }}>← Back</button>
          <Link to="/register" style={{ color: "var(--primary)" }}>Register</Link>
        </div>
        {loginType === "club" && (
          <div className="login-hint" style={{ marginTop: 12 }}>
            Demo clubs: <strong>CLUB001</strong>, <strong>CLUB002</strong>, <strong>CLUB003</strong> / password: <strong>club123</strong>
          </div>
        )}
      </div>
    </div>
  );
}