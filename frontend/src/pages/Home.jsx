import { useEffect, useState } from "react";
import api from "../api";
import ExamCountdown from "../components/ExamCountdown";

const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export default function Home({ student }) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  const [examDate, setExamDate] = useState("");
  const [subjects, setSubjects] = useState("");
  const [hoursAvailable, setHoursAvailable] = useState("3");
  const [studyPlan, setStudyPlan] = useState("");
  const [planLoading, setPlanLoading] = useState(false);

  const [todayClasses, setTodayClasses] = useState([]);
  const [examCount, setExamCount] = useState(0);
  const [nextExam, setNextExam] = useState(null);
  const [eventCount, setEventCount] = useState(0);
  const [noticeCount, setNoticeCount] = useState(0);
  const [latestNotice, setLatestNotice] = useState(null);
  const [avgAttendance, setAvgAttendance] = useState(null);

  const today = DAYS[new Date().getDay()];

  const parseExamDate = (dateStr) => {
    const [day, month, year] = dateStr.split("-").map(Number);
    return new Date(year, month - 1, day);
  };

  const findNextExam = (exams) => {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const upcoming = exams
      .map((e) => ({ ...e, parsed: parseExamDate(e.date) }))
      .filter((e) => e.parsed && e.parsed >= todayStart)
      .sort((a, b) => a.parsed - b.parsed);
    return upcoming[0] || exams[0] || null;
  };

  useEffect(() => {
    api
      .get("/timetable/", {
        params: {
          branch: student.branch,
          year: student.year,
          division: student.division,
        },
      })
      .then((res) => {
        const todayItems = res.data.filter((t) => t.day === today);
        setTodayClasses(todayItems);
      })
      .catch(() => setTodayClasses([]));

    api
      .get("/exams/", {
        params: { branch: student.branch, year: student.year },
      })
      .then((res) => {
        setExamCount(res.data.length);
        const upcoming = findNextExam(res.data);
        setNextExam(upcoming);
        if (res.data.length > 0) {
          const names = res.data.map((e) => e.subject).join(", ");
          setSubjects(names);
          setExamDate(upcoming?.date || res.data[0].date);
        }
      })
      .catch(() => {
        setExamCount(0);
        setNextExam(null);
      });

    api
      .get("/events/")
      .then((res) => setEventCount(res.data.length))
      .catch(() => setEventCount(0));

    api
      .get("/notices/")
      .then((res) => {
        setNoticeCount(res.data.length);
        if (res.data.length > 0) setLatestNotice(res.data[0]);
      })
      .catch(() => {
        setNoticeCount(0);
        setLatestNotice(null);
      });

    api
      .get(`/attendance/${student.id}`)
      .then((res) => {
        if (res.data.length > 0) {
          const avg = Math.round(
            res.data.reduce((s, r) => s + r.percentage, 0) / res.data.length
          );
          setAvgAttendance(avg);
        }
      })
      .catch(() => setAvgAttendance(null));
  }, [student, today]);

  const askAI = async () => {
    if (!question.trim()) return;
    setLoading(true);
    try {
      const res = await api.post("/ai/ask", {
        student_id: student.id,
        question,
      });
      setAnswer(res.data.answer);
    } catch (err) {
      const msg =
        err.response?.data?.detail ||
        "AI Assistant unavailable. Add GEMINI_API_KEY to backend/.env and restart.";
      setAnswer(typeof msg === "string" ? msg : JSON.stringify(msg));
    } finally {
      setLoading(false);
    }
  };

  const generatePlan = async () => {
    if (!examDate || !subjects.trim()) return;
    setPlanLoading(true);
    try {
      const res = await api.post("/ai/study-plan", {
        student_id: student.id,
        exam_date: examDate,
        subjects,
        hours_available: parseFloat(hoursAvailable) || 3,
      });
      setStudyPlan(res.data.plan);
    } catch (err) {
      const msg =
        err.response?.data?.detail ||
        "Study planner unavailable. Add GEMINI_API_KEY to backend/.env and restart.";
      setStudyPlan(typeof msg === "string" ? msg : JSON.stringify(msg));
    } finally {
      setPlanLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      askAI();
    }
  };

  return (
    <div className="container">
      <div className="page-header">
        <h1>Welcome back, {student.name} 👋</h1>
        <p>Here's what's happening on campus today.</p>
        <span className="student-badge">
          {student.branch} · Year {student.year} · Div {student.division}
        </span>
      </div>

      {latestNotice && (
        <div className="notice-banner">
          <span className="notice-banner-icon">📢</span>
          <div className="notice-banner-body">
            <strong>{latestNotice.title}</strong>
            <span>{latestNotice.content}</span>
          </div>
          <span className="notice-banner-date">{latestNotice.date}</span>
        </div>
      )}

      {nextExam && <ExamCountdown exam={nextExam} />}

      <div className="dashboard-grid">
        <div className="stat-card">
          <div className="stat-icon">📅</div>
          <h3>Today's Classes</h3>
          <div className="stat-number">{todayClasses.length}</div>
          <div className="stat-sub">{today}</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📝</div>
          <h3>Upcoming Exams</h3>
          <div className="stat-number">{examCount}</div>
          {nextExam && (
            <div className="stat-sub">Next: {nextExam.subject}</div>
          )}
        </div>

        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <h3>Attendance</h3>
          <div className="stat-number">
            {avgAttendance !== null ? `${avgAttendance}%` : "—"}
          </div>
          <div className="stat-sub">Overall average</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🎉</div>
          <h3>Events</h3>
          <div className="stat-number">{eventCount}</div>
          <div className="stat-sub">{noticeCount} notices</div>
        </div>
      </div>

      <div className="dashboard-section">
        <h2>Today's Schedule</h2>
        <div className="card">
          {todayClasses.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🌴</div>
              <p>No classes scheduled for {today}.</p>
            </div>
          ) : (
            <ul className="schedule-list">
              {todayClasses.map((item) => (
                <li key={item.id} className="schedule-item">
                  <span className="schedule-time">{item.time}</span>
                  <span className="schedule-subject">{item.subject}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="card ai-card">
        <h3>📋 AI Study Planner</h3>
        <p style={{ margin: 0, color: "var(--muted)", fontSize: "0.88rem" }}>
          Generate a personalized day-by-day study plan before your exams.
        </p>

        <div className="study-plan-form">
          <div className="form-group">
            <label>Exam Date</label>
            <input
              type="text"
              value={examDate}
              onChange={(e) => setExamDate(e.target.value)}
              placeholder="e.g. 22-06-2026"
            />
          </div>
          <div className="form-group">
            <label>Subjects</label>
            <input
              value={subjects}
              onChange={(e) => setSubjects(e.target.value)}
              placeholder="e.g. Maths, Control Systems"
            />
          </div>
          <div className="form-group">
            <label>Hours Available / Day</label>
            <input
              type="number"
              min="1"
              max="12"
              value={hoursAvailable}
              onChange={(e) => setHoursAvailable(e.target.value)}
            />
          </div>
        </div>

        <button onClick={generatePlan} disabled={planLoading}>
          {planLoading ? "Generating Plan..." : "Generate Study Plan"}
        </button>

        {studyPlan && (
          <div className="ai-answer" style={{ marginTop: 16 }}>
            {studyPlan}
          </div>
        )}
      </div>

      <div className="card ai-card">
        <h3>🤖 AI Assistant</h3>
        <p style={{ margin: 0, color: "var(--muted)", fontSize: "0.88rem" }}>
          Ask about your timetable, exams, events, or campus notices.
        </p>

        <div className="ai-box">
          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="e.g. When is my next exam?"
          />
          <button onClick={askAI} disabled={loading}>
            {loading ? "Thinking..." : "Ask"}
          </button>
        </div>

        {answer && <div className="ai-answer">{answer}</div>}
      </div>
    </div>
  );
}
