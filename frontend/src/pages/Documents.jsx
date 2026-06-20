/**
 * Documents page — download hall ticket PDF.
 */

import { useState } from "react";
import { BASE_URL } from "../api";

export default function Documents({ student }) {
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState("");

  const downloadHallTicket = async () => {
    setDownloading(true);
    setError("");

    try {
      const res = await fetch(
        `${BASE_URL}/documents/hall-ticket/${student.id}`
      );

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || "Download failed");
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `hall_ticket_${student.prn}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.message || "Could not download hall ticket.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="container">
      <div className="page-header">
        <h2>📄 Documents</h2>
        <p>Download official campus documents.</p>
      </div>

      <div className="card doc-card">
        <div className="doc-icon">🎫</div>
        <div className="doc-info">
          <h3>Hall Ticket</h3>
          <p>
            Download your exam hall ticket with student details and upcoming
            exam schedule for {student.branch}, Year {student.year}.
          </p>
          <button onClick={downloadHallTicket} disabled={downloading}>
            {downloading ? "Generating PDF..." : "Download Hall Ticket"}
          </button>
          {error && <p className="error-msg">{error}</p>}
        </div>
      </div>

      <div className="card">
        <h3>Document Info</h3>
        <div className="info-grid">
          <div className="info-item">
            <div className="label">Student</div>
            <div className="value">{student.name}</div>
          </div>
          <div className="info-item">
            <div className="label">PRN</div>
            <div className="value">{student.prn}</div>
          </div>
          <div className="info-item">
            <div className="label">Branch</div>
            <div className="value">{student.branch}</div>
          </div>
          <div className="info-item">
            <div className="label">Format</div>
            <div className="value">PDF</div>
          </div>
        </div>
      </div>
    </div>
  );
}
