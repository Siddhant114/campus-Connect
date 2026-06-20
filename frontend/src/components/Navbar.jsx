/**
 * Sidebar navigation with theme toggle, notifications, and logout.
 */

import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import api from "../api";

const NAV_ITEMS = [
  { to: "/", label: "Dashboard", icon: "🏠" },
  { to: "/timetable", label: "Timetable", icon: "📅" },
  { to: "/exams", label: "Exams", icon: "📝" },
  { to: "/events", label: "Events", icon: "🎉" },
  { to: "/notices", label: "Notices", icon: "📢" },
  { to: "/attendance", label: "Attendance", icon: "📊" },
  { to: "/calendar", label: "Calendar", icon: "🗓️" },
  { to: "/cgpa", label: "CGPA", icon: "🎓" },
  { to: "/documents", label: "Documents", icon: "📄" },
  { to: "/profile", label: "Profile", icon: "👤" },
];

export default function Navbar({ student, darkMode, onToggleTheme, onOpenSearch }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notices, setNotices] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    api
      .get("/notices/")
      .then((res) => setNotices(res.data.slice(0, 5)))
      .catch(() => setNotices([]));
  }, []);

  const closeSidebar = () => setSidebarOpen(false);

  const handleLogout = () => {
    localStorage.removeItem("student");
    navigate("/");
    window.location.reload();
  };

  const sidebar = (
    <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
      <div className="sidebar-brand">
        <h1>Campus Portal</h1>
        <p>{student?.name || "Student"}</p>
      </div>

      <nav className="sidebar-nav">
        <button className="sidebar-search" onClick={onOpenSearch}>
          <span className="icon">🔍</span>
          <span>Search</span>
          <kbd>Ctrl K</kbd>
        </button>

        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className={({ isActive }) =>
              `sidebar-link${isActive ? " active" : ""}`
            }
            onClick={closeSidebar}
          >
            <span className="icon">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer" style={{ position: "relative" }}>
        {notifOpen && (
          <div className="notif-dropdown">
            <h4>Notifications</h4>
            {notices.length === 0 ? (
              <div className="notif-item">No new notifications</div>
            ) : (
              notices.map((n) => (
                <div key={n.id} className="notif-item">
                  <strong>{n.title}</strong>
                  <span>{n.date}</span>
                </div>
              ))
            )}
          </div>
        )}

        <div className="sidebar-actions">
          <button
            className="sidebar-btn"
            onClick={onToggleTheme}
            title={darkMode ? "Light mode" : "Dark mode"}
          >
            {darkMode ? "☀️" : "🌙"}
          </button>
          <button
            className="sidebar-btn"
            onClick={() => setNotifOpen((o) => !o)}
            title="Notifications"
          >
            🔔
            {notices.length > 0 && (
              <span className="notif-badge">{notices.length}</span>
            )}
          </button>
        </div>

        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </aside>
  );

  return (
    <>
      <div className="mobile-header">
        <button
          className="menu-toggle"
          onClick={() => setSidebarOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          ☰
        </button>
        <h2>Campus Portal</h2>
      </div>

      <div
        className={`sidebar-overlay ${sidebarOpen ? "open" : ""}`}
        onClick={closeSidebar}
      />

      {sidebar}
    </>
  );
}
