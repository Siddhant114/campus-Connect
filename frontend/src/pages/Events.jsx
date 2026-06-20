import { useEffect, useState } from "react";
import api from "../api";
import { EventCard } from "../components/Cards";

export default function Events({ student }) {
  const [recommended, setRecommended] = useState([]);
  const [all, setAll] = useState([]);
  const [saved, setSaved] = useState([]);
  const [savedIds, setSavedIds] = useState(new Set());
  const [clubPosts, setClubPosts] = useState([]);
  const [enrolledIds, setEnrolledIds] = useState(new Set());
  const [enrolledStudents, setEnrolledStudents] = useState({});
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("campus"); // campus | club

  const loadBookmarks = () =>
    api.get(`/bookmarks/${student.id}`)
      .then(res => { setSaved(res.data); setSavedIds(new Set(res.data.map(e => e.id))); })
      .catch(() => { setSaved([]); setSavedIds(new Set()); });

  const loadEnrollments = () =>
    api.get(`/social/enroll/${student.id}`)
      .then(res => setEnrolledIds(new Set(res.data)))
      .catch(() => setEnrolledIds(new Set()));

  useEffect(() => {
    Promise.all([
      api.get(`/events/recommendations/${student.id}`).then(r => setRecommended(r.data)).catch(() => setRecommended([])),
      api.get("/events/").then(r => setAll(r.data)).catch(() => setAll([])),
      api.get("/social/posts").then(r => setClubPosts(r.data)).catch(() => setClubPosts([])),
      loadBookmarks(),
      loadEnrollments(),
    ]).finally(() => setLoading(false));
  }, [student]);

  const toggleSave = async (eventId) => {
    const isSaved = savedIds.has(eventId);
    try {
      if (isSaved) {
        await api.delete(`/bookmarks/${student.id}/${eventId}`);
        setSavedIds(prev => { const n = new Set(prev); n.delete(eventId); return n; });
        setSaved(prev => prev.filter(e => e.id !== eventId));
      } else {
        await api.post(`/bookmarks/${student.id}/${eventId}`);
        const event = all.find(e => e.id === eventId);
        if (event) { setSavedIds(prev => new Set(prev).add(eventId)); setSaved(prev => [event, ...prev]); }
      }
    } catch {}
  };

  const toggleEnroll = async (postId) => {
    const isEnrolled = enrolledIds.has(postId);
    try {
      if (isEnrolled) {
        await api.delete(`/social/enroll?student_id=${student.id}&post_id=${postId}`);
        setEnrolledIds(prev => { const n = new Set(prev); n.delete(postId); return n; });
      } else {
        await api.post(`/social/enroll?student_id=${student.id}&post_id=${postId}`);
        setEnrolledIds(prev => new Set(prev).add(postId));
      }
    } catch (e) {
      alert(e.response?.data?.detail || "Could not update enrollment");
    }
  };

  const loadEnrolledStudents = async (postId) => {
    if (enrolledStudents[postId]) return; // already loaded
    const res = await api.get(`/social/enrolled-students/${postId}`);
    setEnrolledStudents(prev => ({ ...prev, [postId]: res.data }));
  };

  const tabs = [
    { key: "campus", label: "🎓 Campus Events" },
    { key: "club", label: "🏛️ Club Events" },
  ];

  return (
    <div className="container">
      <div className="page-header">
        <h1>🎉 Events</h1>
        <p>Discover campus events and club activities.</p>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            padding: "8px 20px", borderRadius: 20, cursor: "pointer",
            border: "1.5px solid var(--primary)",
            background: tab === t.key ? "var(--primary)" : "transparent",
            color: tab === t.key ? "white" : "var(--primary)", fontWeight: 500,
          }}>{t.label}</button>
        ))}
      </div>

      {loading && <p style={{ color: "var(--muted)" }}>Loading events...</p>}

      {!loading && tab === "campus" && (
        <>
          {saved.length > 0 && (
            <>
              <h3 className="section-title">⭐ Saved Events</h3>
              {saved.map(item => <EventCard key={`saved-${item.id}`} item={item} saved onToggleSave={toggleSave} />)}
            </>
          )}
          <h3 className="section-title">Events You Might Like</h3>
          {recommended.length === 0 ? (
            <div className="card empty-state">
              <div className="empty-icon">💡</div>
              <p>Add interests in your <a href="/profile" style={{ color: "var(--primary)" }}>Profile</a> to get recommendations!</p>
            </div>
          ) : (
            recommended.map(item => <EventCard key={`rec-${item.id}`} item={item} saved={savedIds.has(item.id)} onToggleSave={toggleSave} />)
          )}
          <h3 className="section-title">All Events</h3>
          {all.map(item => <EventCard key={item.id} item={item} saved={savedIds.has(item.id)} onToggleSave={toggleSave} />)}
        </>
      )}

      {!loading && tab === "club" && (
        <>
          {clubPosts.length === 0 ? (
            <div className="empty-state"><div className="empty-icon">📭</div><p>No club events posted yet.</p></div>
          ) : (
            clubPosts.map(post => {
              const isEnrolled = enrolledIds.has(post.id);
              const studList = enrolledStudents[post.id];
              return (
                <div key={post.id} className="card" style={{ marginBottom: 16 }}>
                  {post.image_url && (
                    <img src={post.image_url} alt={post.event_name}
                      style={{ width: "100%", maxHeight: 200, objectFit: "cover", borderRadius: 8, marginBottom: 12 }} />
                  )}
                  <h3 style={{ margin: "0 0 6px" }}>{post.event_name}</h3>
                  {post.description && <p style={{ color: "var(--muted)", margin: "0 0 10px" }}>{post.description}</p>}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
                    {post.duration && <span className="tag">⏱ {post.duration}</span>}
                    <span className="tag">💰 ₹{post.fees || 0}</span>
                    {post.faculty_contact && <span className="tag">👨‍🏫 {post.faculty_contact}</span>}
                    {post.organizing_team && <span className="tag">👥 {post.organizing_team}</span>}
                  </div>
                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <button
                      onClick={() => toggleEnroll(post.id)}
                      style={{
                        padding: "8px 20px", borderRadius: 8, cursor: "pointer",
                        background: isEnrolled ? "#ef444422" : "var(--primary)",
                        color: isEnrolled ? "#ef4444" : "white",
                        border: isEnrolled ? "1.5px solid #ef4444" : "none",
                        fontWeight: 600,
                      }}
                    >
                      {isEnrolled ? "✓ Enrolled — Cancel" : "Enroll Now"}
                    </button>
                    <button
                      onClick={() => loadEnrolledStudents(post.id)}
                      style={{ padding: "8px 14px", borderRadius: 8, background: "var(--card)", border: "1.5px solid var(--border)", cursor: "pointer" }}
                    >
                      See who's enrolled
                    </button>
                  </div>
                  {studList && (
                    <div style={{ marginTop: 12 }}>
                      {studList.length === 0 ? (
                        <p style={{ color: "var(--muted)", fontSize: "0.85rem" }}>No one enrolled yet.</p>
                      ) : (
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 4 }}>
                          {studList.map(s => (
                            <span key={s.id} style={{
                              padding: "4px 10px", borderRadius: 12, fontSize: "0.8rem",
                              background: "var(--primary-light, #e0e7ff)", color: "var(--primary)",
                            }}>
                              {s.name} ({s.branch} Y{s.year})
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </>
      )}
    </div>
  );
}