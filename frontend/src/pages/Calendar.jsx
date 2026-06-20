import { useEffect, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import api from "../api";

function parseDate(str) {
  const parts = str.split("-");
  if (parts.length === 3) {
    const [d, m, y] = parts;
    return new Date(`${y}-${m}-${d}`);
  }
  return new Date(str);
}

function sameDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

const DAY_MAP = { Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6 };
const PRIORITY_COLOR = { high: "#ef4444", medium: "#f59e0b", low: "#22c55e" };

export default function CalendarPage({ student }) {
  const [date, setDate] = useState(new Date());
  const [exams, setExams] = useState([]);
  const [events, setEvents] = useState([]);
  const [timetable, setTimetable] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [taskForm, setTaskForm] = useState({ title: "", due_date: "", priority: "medium" });
  const [taskMsg, setTaskMsg] = useState("");

  const todayStr = () => {
    const d = new Date();
    return `${String(d.getDate()).padStart(2,"0")}-${String(d.getMonth()+1).padStart(2,"0")}-${d.getFullYear()}`;
  };

  const loadTasks = () =>
    api.get(`/tasks/${student.id}`).then(r => setTasks(r.data)).catch(() => setTasks([]));

  useEffect(() => {
    Promise.all([
      api.get("/exams/", { params: { branch: student.branch, year: student.year } }).then(r => setExams(r.data)).catch(() => setExams([])),
      api.get("/events/").then(r => setEvents(r.data)).catch(() => setEvents([])),
      api.get("/timetable/", { params: { branch: student.branch, year: student.year, division: student.division } }).then(r => setTimetable(r.data)).catch(() => setTimetable([])),
      loadTasks(),
    ]).finally(() => setLoading(false));
  }, [student]);

  const examDates = exams.map(e => parseDate(e.date));
  const eventDates = events.map(e => parseDate(e.date));

  const tileClassName = ({ date: tileDate, view }) => {
    if (view !== "month") return null;
    const classes = [];
    if (examDates.some(d => sameDay(d, tileDate))) classes.push("cal-exam");
    if (eventDates.some(d => sameDay(d, tileDate))) classes.push("cal-event");
    const dow = tileDate.getDay();
    const dayName = Object.keys(DAY_MAP).find(k => DAY_MAP[k] === dow);
    if (timetable.some(t => t.day === dayName)) classes.push("cal-class");
    const hasDueTask = tasks.some(t => {
      try { return sameDay(parseDate(t.due_date), tileDate); } catch { return false; }
    });
    if (hasDueTask) classes.push("cal-task");
    return classes.length ? classes.join(" ") : null;
  };

  const dayName = Object.keys(DAY_MAP).find(k => DAY_MAP[k] === date.getDay());
  const dayExams = exams.filter(e => sameDay(parseDate(e.date), date));
  const dayEvents = events.filter(e => sameDay(parseDate(e.date), date));
  const dayClasses = timetable.filter(t => t.day === dayName);
  const dayTasks = tasks.filter(t => { try { return sameDay(parseDate(t.due_date), date); } catch { return false; } });

  // Priority order for today's agenda
  const urgentTasks = tasks
    .filter(t => !t.done)
    .sort((a, b) => {
      const pOrder = { high: 0, medium: 1, low: 2 };
      return (pOrder[a.priority] ?? 1) - (pOrder[b.priority] ?? 1);
    })
    .slice(0, 5);

  const addTask = async () => {
    if (!taskForm.title) { setTaskMsg("Enter a task title."); return; }
    await api.post("/tasks/", { student_id: student.id, ...taskForm });
    setTaskMsg("Task added!");
    setTaskForm({ title: "", due_date: "", priority: "medium" });
    loadTasks();
  };

  const toggleTask = async (id) => {
    await api.put(`/tasks/${id}/done`);
    loadTasks();
  };

  const deleteTask = async (id) => {
    await api.delete(`/tasks/${id}`);
    loadTasks();
  };

  return (
    <div className="container">
      <div className="page-header">
        <h1>📅 Calendar & Tasks</h1>
        <p>Your schedule, exams, events, and personal tasks in one place.</p>
      </div>

      {loading && <p style={{ color: "var(--muted)" }}>Loading...</p>}

      {!loading && (
        <>
          {/* Today's priority list */}
          {urgentTasks.length > 0 && (
            <div className="card" style={{ marginBottom: 20, borderLeft: "4px solid #ef4444" }}>
              <h3 style={{ margin: "0 0 10px" }}>🔥 Priority Tasks</h3>
              {urgentTasks.map(t => (
                <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                  <span style={{ width: 10, height: 10, borderRadius: "50%", background: PRIORITY_COLOR[t.priority], flexShrink: 0 }} />
                  <span style={{ flex: 1, textDecoration: t.done ? "line-through" : "none", color: t.done ? "var(--muted)" : "var(--text)" }}>{t.title}</span>
                  {t.due_date && <span style={{ fontSize: "0.78rem", color: "var(--muted)" }}>{t.due_date}</span>}
                  <button onClick={() => toggleTask(t.id)} style={{ fontSize: "0.8rem", padding: "3px 8px", borderRadius: 6, border: "1px solid var(--border)", cursor: "pointer", background: "var(--card)" }}>
                    {t.done ? "Undo" : "✓ Done"}
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="calendar-layout">
            <div className="card calendar-wrap">
              <Calendar onChange={setDate} value={date} tileClassName={tileClassName} />
              <div className="calendar-legend">
                <span className="legend-item">📝 Exam</span>
                <span className="legend-item">🎉 Event</span>
                <span className="legend-item">📚 Class</span>
                <span className="legend-item">✅ Task due</span>
              </div>
            </div>

            <div className="calendar-details">
              <h3>{date.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</h3>

              {dayExams.length > 0 && (
                <div className="card cal-detail-section">
                  <h3>📝 Exams</h3>
                  {dayExams.map(e => <p key={e.id}><strong>{e.subject}</strong> — {e.time}</p>)}
                </div>
              )}
              {dayEvents.length > 0 && (
                <div className="card cal-detail-section">
                  <h3>🎉 Events</h3>
                  {dayEvents.map(e => <p key={e.id}><strong>{e.title}</strong> ({e.category})</p>)}
                </div>
              )}
              {dayClasses.length > 0 && (
                <div className="card cal-detail-section">
                  <h3>📚 Classes ({dayName})</h3>
                  <ul className="schedule-list">
                    {dayClasses.map(t => (
                      <li key={t.id} className="schedule-item">
                        <span className="schedule-time">{t.time}</span>
                        <span className="schedule-subject">{t.subject}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {dayTasks.length > 0 && (
                <div className="card cal-detail-section">
                  <h3>✅ Tasks Due</h3>
                  {dayTasks.map(t => (
                    <div key={t.id} style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}>
                      <span style={{ width: 8, height: 8, borderRadius: "50%", background: PRIORITY_COLOR[t.priority] }} />
                      <span style={{ flex: 1, textDecoration: t.done ? "line-through" : "none" }}>{t.title}</span>
                      <button onClick={() => toggleTask(t.id)} style={{ fontSize: "0.78rem", padding: "2px 7px", borderRadius: 5, border: "1px solid var(--border)", cursor: "pointer", background: "var(--card)" }}>
                        {t.done ? "Undo" : "Done"}
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {dayExams.length === 0 && dayEvents.length === 0 && dayClasses.length === 0 && dayTasks.length === 0 && (
                <div className="card empty-state"><div className="empty-icon">🌴</div><p>Nothing scheduled.</p></div>
              )}
            </div>
          </div>

          {/* Add task */}
          <div className="card" style={{ marginTop: 24 }}>
            <h3>➕ Add Task</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr auto auto auto", gap: 10, marginTop: 12, alignItems: "end" }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label>Task</label>
                <input value={taskForm.title} onChange={e => setTaskForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Submit assignment" />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label>Due Date</label>
                <input value={taskForm.due_date} onChange={e => setTaskForm(f => ({ ...f, due_date: e.target.value }))} placeholder="DD-MM-YYYY" />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label>Priority</label>
                <select value={taskForm.priority} onChange={e => setTaskForm(f => ({ ...f, priority: e.target.value }))}>
                  <option value="high">🔴 High</option>
                  <option value="medium">🟡 Medium</option>
                  <option value="low">🟢 Low</option>
                </select>
              </div>
              <button onClick={addTask} style={{ marginBottom: 0 }}>Add</button>
            </div>
            {taskMsg && <p style={{ color: "var(--primary)", marginTop: 8 }}>{taskMsg}</p>}
          </div>

          {/* All tasks */}
          {tasks.length > 0 && (
            <div className="card" style={{ marginTop: 16 }}>
              <h3>All Tasks</h3>
              {tasks.map(t => (
                <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8, padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
                  <span style={{ width: 10, height: 10, borderRadius: "50%", background: PRIORITY_COLOR[t.priority], flexShrink: 0 }} />
                  <span style={{ flex: 1, textDecoration: t.done ? "line-through" : "none", color: t.done ? "var(--muted)" : "var(--text)" }}>{t.title}</span>
                  {t.due_date && <span style={{ fontSize: "0.78rem", color: "var(--muted)" }}>{t.due_date}</span>}
                  <button onClick={() => toggleTask(t.id)} style={{ fontSize: "0.78rem", padding: "3px 8px", borderRadius: 6, border: "1px solid var(--border)", cursor: "pointer", background: "var(--card)" }}>
                    {t.done ? "Undo" : "✓"}
                  </button>
                  <button onClick={() => deleteTask(t.id)} style={{ fontSize: "0.78rem", padding: "3px 8px", borderRadius: 6, border: "1px solid #ef4444", color: "#ef4444", cursor: "pointer", background: "transparent" }}>✗</button>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}