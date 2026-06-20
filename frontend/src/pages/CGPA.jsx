/**
 * CGPA Calculator — frontend-only grade calculator.
 */

import { useState } from "react";

const GRADE_POINTS = {
  O: 10,
  "A+": 9,
  A: 8,
  "B+": 7,
  B: 6,
  C: 5,
  P: 4,
  F: 0,
};

const GRADES = Object.keys(GRADE_POINTS);

const emptySubject = () => ({ name: "", credits: "", grade: "A" });

export default function CGPA() {
  const [subjects, setSubjects] = useState([emptySubject(), emptySubject(), emptySubject()]);
  const [cgpa, setCgpa] = useState(null);

  const update = (index, field, value) => {
    setSubjects((prev) =>
      prev.map((s, i) => (i === index ? { ...s, [field]: value } : s))
    );
    setCgpa(null);
  };

  const addSubject = () => setSubjects((prev) => [...prev, emptySubject()]);

  const removeSubject = (index) => {
    if (subjects.length <= 1) return;
    setSubjects((prev) => prev.filter((_, i) => i !== index));
    setCgpa(null);
  };

  const calculate = () => {
    let totalCredits = 0;
    let weightedPoints = 0;

    for (const s of subjects) {
      const credits = parseFloat(s.credits);
      if (!s.name.trim() || isNaN(credits) || credits <= 0) continue;
      totalCredits += credits;
      weightedPoints += credits * GRADE_POINTS[s.grade];
    }

    if (totalCredits === 0) {
      setCgpa(null);
      return;
    }

    setCgpa((weightedPoints / totalCredits).toFixed(2));
  };

  return (
    <div className="container">
      <div className="page-header">
        <h2>🎓 CGPA Calculator</h2>
        <p>Calculate your cumulative grade point average from subject grades.</p>
      </div>

      <div className="card">
        <h3>Enter Subjects</h3>

        <div className="cgpa-table">
          <div className="cgpa-header">
            <span>Subject</span>
            <span>Credits</span>
            <span>Grade</span>
            <span></span>
          </div>

          {subjects.map((s, i) => (
            <div key={i} className="cgpa-row">
              <input
                placeholder="e.g. Control Systems"
                value={s.name}
                onChange={(e) => update(i, "name", e.target.value)}
              />
              <input
                type="number"
                placeholder="4"
                min="1"
                max="10"
                value={s.credits}
                onChange={(e) => update(i, "credits", e.target.value)}
              />
              <select
                value={s.grade}
                onChange={(e) => update(i, "grade", e.target.value)}
              >
                {GRADES.map((g) => (
                  <option key={g} value={g}>
                    {g} ({GRADE_POINTS[g]})
                  </option>
                ))}
              </select>
              <button
                className="btn-icon"
                onClick={() => removeSubject(i)}
                title="Remove"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        <div className="cgpa-actions">
          <button className="btn-secondary" onClick={addSubject}>
            + Add Subject
          </button>
          <button onClick={calculate}>Calculate CGPA</button>
        </div>

        {cgpa !== null && (
          <div className="cgpa-result">
            <span className="cgpa-label">Your CGPA</span>
            <span className="cgpa-value">{cgpa}</span>
            <span className="cgpa-scale">out of 10.0</span>
          </div>
        )}
      </div>

      <div className="card">
        <h3>Grade Scale</h3>
        <div className="grade-scale-grid">
          {GRADES.map((g) => (
            <div key={g} className="grade-scale-item">
              <strong>{g}</strong>
              <span>{GRADE_POINTS[g]} pts</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
