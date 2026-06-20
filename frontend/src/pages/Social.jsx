import { useEffect, useState } from "react";
import api from "../api";

export default function Social({ student }) {
  const [posts, setPosts] = useState([]);
  const [searchQ, setSearchQ] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [friends, setFriends] = useState([]);
  const [pendingReqs, setPendingReqs] = useState([]);
  const [tab, setTab] = useState("feed"); // feed | search | friends
  const [sentRequests, setSentRequests] = useState(new Set());

  // Club post form
  const [myClub, setMyClub] = useState(null);
  const [postForm, setPostForm] = useState({
    event_name: "", description: "", duration: "",
    fees: "0", faculty_contact: "", organizing_team: "", image_url: "",
  });
  const [posting, setPosting] = useState(false);
  const [postMsg, setPostMsg] = useState("");

  useEffect(() => {
    api.get("/social/posts").then(r => setPosts(r.data)).catch(() => {});
    api.get(`/social/friends/${student.id}`).then(r => setFriends(r.data)).catch(() => {});
    api.get(`/social/friends/requests/${student.id}`).then(r => setPendingReqs(r.data)).catch(() => {});
    if (student.account_type === "club") {
      api.get("/social/clubs").then(r => {
        const mine = r.data.find(c => c.student_id === student.id);
        setMyClub(mine || null);
      }).catch(() => {});
    }
  }, [student]);

  const searchStudents = async () => {
    if (!searchQ.trim()) return;
    const res = await api.get(`/students/search?q=${encodeURIComponent(searchQ)}`);
    setSearchResults(res.data.filter(s => s.id !== student.id));
  };

  const sendFriendReq = async (toId) => {
    try {
      await api.post(`/social/friends/request?from_id=${student.id}&to_id=${toId}`);
      setSentRequests(s => new Set([...s, toId]));
    } catch (e) {
      alert(e.response?.data?.detail || "Could not send request");
    }
  };

  const respondReq = async (reqId, action) => {
    await api.put(`/social/friends/respond/${reqId}?action=${action}`);
    setPendingReqs(r => r.filter(x => x.id !== reqId));
    if (action === "accepted") {
      const res = await api.get(`/social/friends/${student.id}`);
      setFriends(res.data);
    }
  };

  const submitPost = async () => {
    if (!myClub || !postForm.event_name) return;
    setPosting(true);
    try {
      await api.post("/social/posts", { ...postForm, club_id: myClub.id });
      setPostMsg("Event posted successfully!");
      setPostForm({ event_name: "", description: "", duration: "", fees: "0", faculty_contact: "", organizing_team: "", image_url: "" });
      const res = await api.get("/social/posts");
      setPosts(res.data);
    } catch (e) {
      setPostMsg("Failed to post.");
    } finally {
      setPosting(false);
    }
  };

  const isFriend = (id) => friends.some(f => f.id === id);
  const hasSentReq = (id) => sentRequests.has(id);

  return (
    <div className="container">
      <div className="page-header">
        <h1>🤝 Social</h1>
        <p>Connect with students and discover club events.</p>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        {["feed", "search", "friends"].map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: "8px 20px", borderRadius: 20, cursor: "pointer",
              border: "1.5px solid var(--primary)",
              background: tab === t ? "var(--primary)" : "transparent",
              color: tab === t ? "white" : "var(--primary)",
              fontWeight: 500,
            }}
          >
            {t === "feed" ? "📰 Feed" : t === "search" ? "🔍 Find Students" : `👥 Friends (${friends.length})`}
          </button>
        ))}
        {pendingReqs.length > 0 && (
          <button
            onClick={() => setTab("requests")}
            style={{
              padding: "8px 20px", borderRadius: 20, cursor: "pointer",
              border: "1.5px solid #f59e0b",
              background: tab === "requests" ? "#f59e0b" : "transparent",
              color: tab === "requests" ? "white" : "#f59e0b",
              fontWeight: 500,
            }}
          >
            🔔 Requests ({pendingReqs.length})
          </button>
        )}
      </div>

      {/* FEED */}
      {tab === "feed" && (
        <div>
          {/* Club post form */}
          {student.account_type === "club" && myClub && (
            <div className="card" style={{ marginBottom: 24 }}>
              <h3>📢 Post a New Event — {myClub.club_name}</h3>
              <div style={{ display: "grid", gap: 12, marginTop: 12 }}>
                <div className="form-group">
                  <label>Event Name *</label>
                  <input value={postForm.event_name} onChange={e => setPostForm(f => ({ ...f, event_name: e.target.value }))} placeholder="e.g. Robotics Workshop" />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea rows={3} value={postForm.description} onChange={e => setPostForm(f => ({ ...f, description: e.target.value }))} style={{ resize: "vertical" }} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div className="form-group">
                    <label>Duration</label>
                    <input value={postForm.duration} onChange={e => setPostForm(f => ({ ...f, duration: e.target.value }))} placeholder="e.g. 2 hours" />
                  </div>
                  <div className="form-group">
                    <label>Fees (₹)</label>
                    <input value={postForm.fees} onChange={e => setPostForm(f => ({ ...f, fees: e.target.value }))} placeholder="0 for free" />
                  </div>
                  <div className="form-group">
                    <label>Faculty Contact</label>
                    <input value={postForm.faculty_contact} onChange={e => setPostForm(f => ({ ...f, faculty_contact: e.target.value }))} placeholder="Prof. Name" />
                  </div>
                  <div className="form-group">
                    <label>Organizing Team</label>
                    <input value={postForm.organizing_team} onChange={e => setPostForm(f => ({ ...f, organizing_team: e.target.value }))} placeholder="Team members" />
                  </div>
                </div>
                <div className="form-group">
                  <label>Image URL (optional)</label>
                  <input value={postForm.image_url} onChange={e => setPostForm(f => ({ ...f, image_url: e.target.value }))} placeholder="https://..." />
                </div>
                <button onClick={submitPost} disabled={posting}>
                  {posting ? "Posting..." : "Post Event"}
                </button>
                {postMsg && <p style={{ color: "var(--primary)", margin: 0 }}>{postMsg}</p>}
              </div>
            </div>
          )}

          {/* Posts list */}
          {posts.length === 0 ? (
            <div className="empty-state"><div className="empty-icon">📭</div><p>No club posts yet.</p></div>
          ) : (
            posts.map(post => (
              <div key={post.id} className="card" style={{ marginBottom: 16 }}>
                {post.image_url && (
                  <img src={post.image_url} alt={post.event_name}
                    style={{ width: "100%", maxHeight: 200, objectFit: "cover", borderRadius: 8, marginBottom: 12 }} />
                )}
                <h3 style={{ margin: "0 0 6px" }}>{post.event_name}</h3>
                {post.description && <p style={{ color: "var(--muted)", margin: "0 0 10px" }}>{post.description}</p>}
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {post.duration && <span className="tag">⏱ {post.duration}</span>}
                  <span className="tag">💰 ₹{post.fees || 0}</span>
                  {post.faculty_contact && <span className="tag">👨‍🏫 {post.faculty_contact}</span>}
                  {post.organizing_team && <span className="tag">👥 {post.organizing_team}</span>}
                </div>
                {post.created_at && (
                  <p style={{ fontSize: "0.78rem", color: "var(--muted)", margin: "10px 0 0" }}>
                    {new Date(post.created_at).toLocaleDateString()}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* SEARCH */}
      {tab === "search" && (
        <div>
          <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
            <input
              value={searchQ}
              onChange={e => setSearchQ(e.target.value)}
              onKeyDown={e => e.key === "Enter" && searchStudents()}
              placeholder="Search by name, PRN, or branch..."
              style={{ flex: 1 }}
            />
            <button onClick={searchStudents}>Search</button>
          </div>
          {searchResults.map(s => (
            <div key={s.id} className="card" style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 12 }}>
              <div style={{
                width: 48, height: 48, borderRadius: "50%", background: "var(--primary)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "white", fontWeight: 700, fontSize: "1.2rem", flexShrink: 0,
              }}>
                {s.profile_pic
                  ? <img src={s.profile_pic} style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} />
                  : s.name[0]}
              </div>
              <div style={{ flex: 1 }}>
                <strong>{s.name}</strong>
                <div style={{ fontSize: "0.85rem", color: "var(--muted)" }}>
                  {s.branch} · Year {s.year} · Div {s.division}
                  {s.account_type === "club" && " · 🏛️ Club"}
                </div>
                {s.bio && <p style={{ fontSize: "0.82rem", margin: "4px 0 0", color: "var(--text)" }}>{s.bio}</p>}
              </div>
              {isFriend(s.id) ? (
                <span style={{ color: "var(--primary)", fontSize: "0.85rem" }}>✓ Friends</span>
              ) : hasSentReq(s.id) ? (
                <span style={{ color: "var(--muted)", fontSize: "0.85rem" }}>Sent</span>
              ) : (
                <button onClick={() => sendFriendReq(s.id)} style={{ padding: "6px 14px", fontSize: "0.85rem" }}>
                  + Add
                </button>
              )}
            </div>
          ))}
          {searchResults.length === 0 && searchQ && (
            <div className="empty-state"><div className="empty-icon">🔍</div><p>No students found for "{searchQ}"</p></div>
          )}
        </div>
      )}

      {/* FRIENDS */}
      {tab === "friends" && (
        <div>
          {friends.length === 0 ? (
            <div className="empty-state"><div className="empty-icon">👥</div><p>No friends yet. Use Search to find people.</p></div>
          ) : (
            friends.map(f => (
              <div key={f.id} className="card" style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 12 }}>
                <div style={{
                  width: 48, height: 48, borderRadius: "50%", background: "var(--primary)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "white", fontWeight: 700, fontSize: "1.2rem",
                }}>
                  {f.profile_pic
                    ? <img src={f.profile_pic} style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} />
                    : f.name[0]}
                </div>
                <div>
                  <strong>{f.name}</strong>
                  <div style={{ fontSize: "0.85rem", color: "var(--muted)" }}>{f.branch} · Year {f.year}</div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* REQUESTS */}
      {tab === "requests" && (
        <div>
          <h3 style={{ marginBottom: 16 }}>Pending Friend Requests</h3>
          {pendingReqs.length === 0 ? (
            <div className="empty-state"><div className="empty-icon">✅</div><p>No pending requests.</p></div>
          ) : (
            pendingReqs.map(req => (
              <div key={req.id} className="card" style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                <div style={{ flex: 1 }}>
                  <strong>Request from {req.from_name}</strong>
                  <div style={{ fontSize: "0.82rem", color: "var(--muted)" }}>{req.from_branch}</div>
                </div>
                <button onClick={() => respondReq(req.id, "accepted")} style={{ padding: "6px 14px", background: "var(--primary)", color: "white", border: "none", borderRadius: 6 }}>
                  Accept
                </button>
                <button onClick={() => respondReq(req.id, "rejected")} style={{ padding: "6px 14px", background: "var(--card)", border: "1.5px solid var(--border)", borderRadius: 6 }}>
                  Decline
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}