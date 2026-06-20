/**
 * Main App component: handles routing, theme, and logged-in student state.
 */

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Timetable from "./pages/Timetable";
import Exams from "./pages/Exams";
import Events from "./pages/Events";
import Notices from "./pages/Notices";
import Profile from "./pages/Profile";
import Attendance from "./pages/Attendance";
import CGPA from "./pages/CGPA";
import CalendarPage from "./pages/Calendar";
import Documents from "./pages/Documents";
import SearchModal from "./components/SearchModal";
import Register from "./pages/Register";
import Social from "./pages/Social";

function App() {
  const [student, setStudent] = useState(() => {
    const saved = localStorage.getItem("student");
    return saved ? JSON.parse(saved) : null;
  });

  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });

  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  useEffect(() => {
    if (!student) return;

    const onKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen((open) => !open);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [student]);

  const toggleTheme = () => setDarkMode((d) => !d);

  if (!student) {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<Login />} />
        <Route path="/social" element={<Social student={student} />} />
      </Routes>
    </BrowserRouter>
  );
}

  return (
    <BrowserRouter>
      <div className="app-layout">
        <Navbar
          student={student}
          darkMode={darkMode}
          onToggleTheme={toggleTheme}
          onOpenSearch={() => setSearchOpen(true)}
        />
        <SearchModal
          student={student}
          open={searchOpen}
          onClose={() => setSearchOpen(false)}
        />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home student={student} />} />
            <Route
              path="/timetable"
              element={<Timetable student={student} />}
            />
            <Route path="/exams" element={<Exams student={student} />} />
            <Route path="/events" element={<Events student={student} />} />
            <Route path="/notices" element={<Notices />} />
            <Route
              path="/attendance"
              element={<Attendance student={student} />}
            />
            <Route path="/calendar" element={<CalendarPage student={student} />} />
            <Route path="/cgpa" element={<CGPA />} />
            <Route path="/documents" element={<Documents student={student} />} />
            <Route
              path="/profile"
              element={
                <Profile student={student} setStudent={setStudent} />
              }
            />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
