/**
 * Live countdown to the next upcoming exam.
 */

import { useEffect, useState } from "react";

function parseExamDate(dateStr) {
  const parts = dateStr.split("-").map(Number);
  if (parts.length !== 3) return null;
  const [day, month, year] = parts;
  return new Date(year, month - 1, day);
}

function getCountdown(targetDate) {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const diff = targetDate.getTime() - now.getTime();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

  if (days < 0) return { label: "Past", days: 0, urgent: false };
  if (days === 0) return { label: "Today!", days: 0, urgent: true };
  if (days === 1) return { label: "Tomorrow", days: 1, urgent: true };
  if (days <= 7) return { label: `${days} days left`, days, urgent: true };
  return { label: `${days} days left`, days, urgent: false };
}

export default function ExamCountdown({ exam }) {
  const [countdown, setCountdown] = useState(null);

  useEffect(() => {
    if (!exam?.date) {
      setCountdown(null);
      return;
    }

    const target = parseExamDate(exam.date);
    if (!target) {
      setCountdown(null);
      return;
    }

    const update = () => setCountdown(getCountdown(target));
    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, [exam]);

  if (!exam || !countdown) return null;

  return (
    <div className={`countdown-card${countdown.urgent ? " urgent" : ""}`}>
      <div className="countdown-left">
        <span className="countdown-label">Next Exam</span>
        <h3>{exam.subject}</h3>
        <p>
          {exam.date} · {exam.time}
        </p>
      </div>
      <div className="countdown-right">
        {countdown.days === 0 && countdown.label === "Today!" ? (
          <span className="countdown-number today">Today</span>
        ) : (
          <>
            <span className="countdown-number">{countdown.days}</span>
            <span className="countdown-unit">
              {countdown.days === 1 ? "day" : "days"}
            </span>
          </>
        )}
        <span className="countdown-sub">{countdown.label}</span>
      </div>
    </div>
  );
}
