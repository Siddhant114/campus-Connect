/**
 * Reusable card components for timetable, exams, events, and notices.
 */

export function TimetableCard({ item }) {
  return (
    <div className="card">
      <h3>{item.subject}</h3>
      <div className="card-meta">
        <span className="card-tag primary">📅 {item.day}</span>
        <span className="card-tag">🕐 {item.time}</span>
        <span className="card-tag">Div {item.division}</span>
      </div>
    </div>
  );
}

export function ExamCard({ item }) {
  return (
    <div className="card">
      <h3>{item.subject}</h3>
      <div className="card-meta">
        <span className="card-tag warning">📅 {item.date}</span>
        <span className="card-tag">🕐 {item.time}</span>
        <span className="card-tag">{item.branch} · Year {item.year}</span>
      </div>
    </div>
  );
}

export function EventCard({ item, saved, onToggleSave }) {
  return (
    <div className="card event-card">
      <div className="event-card-header">
        <h3>
          {item.title}
          {item.match_percent !== undefined && (
            <span className="badge">{item.match_percent}% Match</span>
          )}
        </h3>
        {onToggleSave && (
          <button
            className={`bookmark-btn${saved ? " saved" : ""}`}
            onClick={() => onToggleSave(item.id)}
            title={saved ? "Remove bookmark" : "Save event"}
            aria-label={saved ? "Remove bookmark" : "Save event"}
          >
            {saved ? "★" : "☆"}
          </button>
        )}
      </div>
      {item.description && <p>{item.description}</p>}
      <div className="card-meta">
        <span className="card-tag success">{item.category}</span>
        <span className="card-tag">📅 {item.date}</span>
      </div>
    </div>
  );
}

export function NoticeCard({ item }) {
  return (
    <div className="card">
      <h3>📢 {item.title}</h3>
      <p>{item.content}</p>
      <div className="card-meta">
        <span className="card-tag">📅 {item.date}</span>
      </div>
    </div>
  );
}
