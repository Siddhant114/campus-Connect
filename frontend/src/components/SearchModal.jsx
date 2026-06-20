/**
 * Global search modal — opens with Ctrl+K or the sidebar search button.
 */

import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

const TYPE_ICONS = {
  timetable: "📅",
  exam: "📝",
  event: "🎉",
  notice: "📢",
  attendance: "📊",
};

const TYPE_LABELS = {
  timetable: "Timetable",
  exam: "Exam",
  event: "Event",
  notice: "Notice",
  attendance: "Attendance",
};

export default function SearchModal({ student, open, onClose }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (open) {
      setQuery("");
      setResults([]);
      setActiveIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    if (!open || !query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(() => {
      setLoading(true);
      api
        .get("/search/", {
          params: { q: query.trim(), student_id: student.id },
        })
        .then((res) => {
          setResults(res.data.results || []);
          setActiveIndex(0);
        })
        .catch(() => setResults([]))
        .finally(() => setLoading(false));
    }, 250);

    return () => clearTimeout(timer);
  }, [query, open, student.id]);

  const goToResult = (item) => {
    onClose();
    navigate(item.path);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      onClose();
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    }
    if (e.key === "Enter" && results[activeIndex]) {
      goToResult(results[activeIndex]);
    }
  };

  if (!open) return null;

  return (
    <div className="search-overlay" onClick={onClose}>
      <div className="search-modal" onClick={(e) => e.stopPropagation()}>
        <div className="search-input-wrap">
          <span className="search-icon">🔍</span>
          <input
            ref={inputRef}
            className="search-input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search classes, exams, events, notices..."
          />
          <kbd className="search-kbd">Esc</kbd>
        </div>

        <div className="search-results">
          {!query.trim() && (
            <div className="search-hint">
              <p>Type to search across your portal</p>
              <div className="search-shortcuts">
                <span><kbd>↑</kbd><kbd>↓</kbd> navigate</span>
                <span><kbd>Enter</kbd> open</span>
                <span><kbd>Ctrl</kbd>+<kbd>K</kbd> toggle</span>
              </div>
            </div>
          )}

          {query.trim() && loading && (
            <div className="search-empty">Searching...</div>
          )}

          {query.trim() && !loading && results.length === 0 && (
            <div className="search-empty">No results for "{query}"</div>
          )}

          {!loading &&
            results.map((item, idx) => (
              <button
                key={`${item.type}-${item.id}`}
                className={`search-result${idx === activeIndex ? " active" : ""}`}
                onClick={() => goToResult(item)}
                onMouseEnter={() => setActiveIndex(idx)}
              >
                <span className="search-result-icon">
                  {TYPE_ICONS[item.type] || "📌"}
                </span>
                <div className="search-result-body">
                  <strong>{item.title}</strong>
                  <span>{item.subtitle}</span>
                </div>
                <span className="search-result-type">
                  {TYPE_LABELS[item.type]}
                </span>
              </button>
            ))}
        </div>
      </div>
    </div>
  );
}
