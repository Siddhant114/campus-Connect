/**
 * Attendance tracker page with chart and subject breakdown.
 */

import { useEffect, useState } from "react";
import api from "../api";
import AttendanceChart from "../components/AttendanceChart";

function statusLabel(pct) {
  if (pct >= 85) return { label: "Excellent", class: "success" };
  if (pct >= 75) return { label: "Good", class: "primary" };
  if (pct >= 65) return { label: "Warning", class: "warning" };
  return { label: "Low", class: "danger" };
}

export default function Attendance({ student }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get(`/attendance/${student.id}`)
      .then((res) => setRecords(res.data))
      .catch(() => setRecords([]))
      .finally(() => setLoading(false));
  }, [student]);

  const avg =
    records.length > 0
      ? Math.round(
          records.reduce((s, r) => s + r.percentage, 0) / records.length
        )
      : 0;

  return (
    <div className="container">
      <div className="page-header">
        <h2>📊 Attendance Tracker</h2>
        <p>Subject-wise attendance for {student.name}</p>
      </div>

      {loading && <p style={{ color: "var(--muted)" }}>Loading attendance...</p>}

      {!loading && records.length === 0 && (
        <div className="card empty-state">
          <div className="empty-icon">📭</div>
          <p>No attendance records found.</p>
        </div>
      )}

      {!loading && records.length > 0 && (
        <>
          <div className="dashboard-grid">
            <div className="stat-card">
              <div className="stat-icon">📈</div>
              <h3>Overall Average</h3>
              <div className="stat-number">{avg}%</div>
              <div className="stat-sub">{records.length} subjects</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">✅</div>
              <h3>Above 75%</h3>
              <div className="stat-number">
                {records.filter((r) => r.percentage >= 75).length}
              </div>
              <div className="stat-sub">Subjects on track</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">⚠️</div>
              <h3>Below 75%</h3>
              <div className="stat-number">
                {records.filter((r) => r.percentage < 75).length}
              </div>
              <div className="stat-sub">Need attention</div>
            </div>
          </div>

          <div className="card">
            <h3>Attendance Chart</h3>
            <AttendanceChart data={records} />
          </div>

          <h3 className="section-title">Subject Breakdown</h3>
          {records.map((r) => {
            const status = statusLabel(r.percentage);
            return (
              <div key={r.id} className="card attendance-row">
                <div className="attendance-subject">
                  <h3 style={{ margin: 0 }}>{r.subject}</h3>
                  <span className={`card-tag ${status.class}`}>{status.label}</span>
                </div>
                <div className="progress-bar-wrap">
                  <div
                    className="progress-bar-fill"
                    style={{ width: `${r.percentage}%` }}
                  />
                </div>
                <div className="attendance-pct">{r.percentage}%</div>
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}
