import { useEffect, useState } from "react";
import api from "../api";
import { TimetableCard } from "../components/Cards";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function Timetable({ student }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("view"); // view | manual | ai
  const [aiText, setAiText] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [aiError, setAiError] = useState("");
  const [manualForm, setManualForm] = useState({ day: "Monday", time: "", subject: "" });
  const [manualMsg, setManualMsg] = useState("");

  const loadTimetable = () => {
    setLoading(true);
    api.get("/timetable/", { params: { branch: student.branch, year: student.year, division: student.division } })
      .then(res => setItems(res.data))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadTimetable(); }, [student]);

  const parseWithAI = async () => {
    if (!aiText.trim()) return;
    setAiLoading(true);
    setAiError("");
    setAiResult(null);
    try {
      const res = await api.post("/ai/parse-timetable", {
        text: aiText,
        branch: student.branch,
        year: student.year,
        division: student.division,
      });
      setAiResult(res.data.entries);
    } catch (e) {
      setAiError(e.response?.data?.detail || "AI parsing failed.");
    } finally {
      setAiLoading(false);
    }
  };

  const saveAIEntries = async () => {
    if (!aiResult) return;
    for (const entry of aiResult) {
      await api.post("/timetable/", {
        branch: student.branch,
        year: student.year,
        division: student.division,
        day: entry.day,
        time: entry.time,
        subject: entry.subject,
      }).catch(() => {});
    }
    setAiResult(null);
    setAiText("");
    setTab("view");
    loadTimetable();
  };

  const saveManual = async () => {
    if (!manualForm.time || !manualForm.subject) { setManualMsg("Fill in time and subject."); return; }
    await api.post("/timetable/", {
      branch: student.branch,
      year: student.year,
      division: student.division,
      ...manualForm,
    });
    setManualMsg("Added successfully!");
    setManualForm({ day: "Monday", time: "", subject: "" });
    loadTimetable();
  };

  return (
    <div className="container">
      <div className="page-header">
        <h1>📅 Timetable</h1>
        <p>{student.branch} · Year {student.year} · Div {student.division}</p>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        {[["view", "📋 View"], ["manual", "✏️ Add Manually"], ["ai", "🤖 AI Upload"]].map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)} style={{
            padding: "8px 18px", borderRadius: 20, cursor: "pointer",
            border: "1.5px solid var(--primary)",
            background: tab === k ? "var(--primary)" : "transparent",
            color: tab === k ? "white" : "var(--primary)", fontWeight: 500,
          }}>{l}</button>
        ))}
      </div>

      {tab === "view" && (
        <>
          {loading && <p style={{ color: "var(--muted)" }}>Loading...</p>}
          {!loading && items.length === 0 && (
            <div className="card empty-state">
              <div className="empty-icon">📭</div>
              <p>No timetable entries. Add manually or use AI Upload.</p>
            </div>
          )}
          {items.map(item => <TimetableCard key={item.id} item={item} />)}
        </>
      )}

      {tab === "manual" && (
        <div className="card">
          <h3>Add a Class</h3>
          <div style={{ display: "grid", gap: 12, marginTop: 12 }}>
            <div className="form-group">
              <label>Day</label>
              <select value={manualForm.day} onChange={e => setManualForm(f => ({ ...f, day: e.target.value }))}>
                {DAYS.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Time</label>
              <input value={manualForm.time} onChange={e => setManualForm(f => ({ ...f, time: e.target.value }))} placeholder="e.g. 9:00 AM" />
            </div>
            <div className="form-group">
              <label>Subject</label>
              <input value={manualForm.subject} onChange={e => setManualForm(f => ({ ...f, subject: e.target.value }))} placeholder="e.g. Mathematics" />
            </div>
            <button onClick={saveManual}>Add to Timetable</button>
            {manualMsg && <p style={{ color: "var(--primary)" }}>{manualMsg}</p>}
          </div>
        </div>
      )}

      {tab === "ai" && (
        <div className="card">
          <h3>🤖 AI Timetable Parser</h3>
          <p style={{ color: "var(--muted)", fontSize: "0.88rem" }}>
            Paste your timetable in any text format — AI will read it and fill the table for you.
          </p>
          <textarea
            rows={8}
            value={aiText}
            onChange={e => setAiText(e.target.value)}
            placeholder={`Example:\nMon 9am - Maths\nMon 10am - Physics\nTue 9am - Chemistry\n...`}
            style={{ width: "100%", resize: "vertical", marginTop: 12 }}
          />
          <button onClick={parseWithAI} disabled={aiLoading} style={{ marginTop: 12 }}>
            {aiLoading ? "Parsing with AI..." : "Parse Timetable"}
          </button>
          {aiError && <p style={{ color: "#ef4444", marginTop: 8 }}>{aiError}</p>}
          {aiResult && (
            <div style={{ marginTop: 16 }}>
              <h4>AI detected {aiResult.length} entries:</h4>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border)" }}>
                    <th style={{ padding: "8px", textAlign: "left" }}>Day</th>
                    <th style={{ padding: "8px", textAlign: "left" }}>Time</th>
                    <th style={{ padding: "8px", textAlign: "left" }}>Subject</th>
                  </tr>
                </thead>
                <tbody>
                  {aiResult.map((e, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid var(--border)" }}>
                      <td style={{ padding: "8px" }}>{e.day}</td>
                      <td style={{ padding: "8px" }}>{e.time}</td>
                      <td style={{ padding: "8px" }}>{e.subject}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
                <button onClick={saveAIEntries}>✓ Save to Timetable</button>
                <button onClick={() => setAiResult(null)} style={{ background: "var(--card)", border: "1.5px solid var(--border)", color: "var(--text)" }}>✗ Discard</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}