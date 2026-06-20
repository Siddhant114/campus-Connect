/**
 * Notices page.
 */

import { useEffect, useState } from "react";
import api from "../api";
import { NoticeCard } from "../components/Cards";

export default function Notices() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/notices/")
      .then((res) => setItems(res.data))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="container">
      <div className="page-header">
        <h2>📢 Notices</h2>
        <p>Latest announcements from the campus administration.</p>
      </div>

      {loading && <p style={{ color: "var(--muted)" }}>Loading notices...</p>}

      {!loading && items.length === 0 && (
        <div className="card empty-state">
          <div className="empty-icon">📭</div>
          <p>No notices at the moment.</p>
        </div>
      )}

      {items.map((item) => (
        <NoticeCard key={item.id} item={item} />
      ))}
    </div>
  );
}
