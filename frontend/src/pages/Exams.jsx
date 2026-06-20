/**
 * Exams page.
 */

import { useEffect, useState } from "react";
import api from "../api";
import { ExamCard } from "../components/Cards";

export default function Exams({ student }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/exams/", {
        params: { branch: student.branch, year: student.year },
      })
      .then((res) => setItems(res.data))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [student]);

  return (
    <div className="container">
      <div className="page-header">
        <h2>📝 Upcoming Exams</h2>
        <p>
          Exam schedule for {student.branch}, Year {student.year}
        </p>
      </div>

      {loading && <p style={{ color: "var(--muted)" }}>Loading exams...</p>}

      {!loading && items.length === 0 && (
        <div className="card empty-state">
          <div className="empty-icon">✅</div>
          <p>No upcoming exams. Enjoy the break!</p>
        </div>
      )}

      {items.map((item) => (
        <ExamCard key={item.id} item={item} />
      ))}
    </div>
  );
}
