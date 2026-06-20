"""
Global search across timetable, exams, events, and notices.
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from database import get_db
import models

router = APIRouter(prefix="/search", tags=["search"])


def _matches(text: str, query: str) -> bool:
    return query in (text or "").lower()


@router.get("/")
def global_search(
    q: str = Query(..., min_length=1),
    student_id: int = Query(...),
    db: Session = Depends(get_db),
):
    """Search all portal content relevant to the logged-in student."""
    student = db.query(models.Student).filter(models.Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    query = q.strip().lower()
    if not query:
        return {"query": q, "results": [], "total": 0}

    results = []

    timetable = (
        db.query(models.Timetable)
        .filter(
            models.Timetable.branch == student.branch,
            models.Timetable.year == student.year,
            models.Timetable.division == student.division,
        )
        .all()
    )
    for item in timetable:
        if _matches(item.subject, query) or _matches(item.day, query):
            results.append({
                "type": "timetable",
                "id": item.id,
                "title": item.subject,
                "subtitle": f"{item.day} · {item.time}",
                "path": "/timetable",
            })

    exams = (
        db.query(models.Exam)
        .filter(
            models.Exam.branch == student.branch,
            models.Exam.year == student.year,
        )
        .all()
    )
    for item in exams:
        if _matches(item.subject, query) or _matches(item.date, query):
            results.append({
                "type": "exam",
                "id": item.id,
                "title": item.subject,
                "subtitle": f"Exam on {item.date} at {item.time}",
                "path": "/exams",
            })

    events = db.query(models.Event).all()
    for item in events:
        haystack = f"{item.title} {item.category} {item.description or ''}"
        if _matches(haystack, query):
            results.append({
                "type": "event",
                "id": item.id,
                "title": item.title,
                "subtitle": f"{item.category} · {item.date}",
                "path": "/events",
            })

    notices = db.query(models.Notice).all()
    for item in notices:
        if _matches(item.title, query) or _matches(item.content, query):
            results.append({
                "type": "notice",
                "id": item.id,
                "title": item.title,
                "subtitle": item.date,
                "path": "/notices",
            })

    attendance = (
        db.query(models.Attendance)
        .filter(models.Attendance.student_id == student_id)
        .all()
    )
    for item in attendance:
        if _matches(item.subject, query):
            results.append({
                "type": "attendance",
                "id": item.id,
                "title": item.subject,
                "subtitle": f"{item.percentage}% attendance",
                "path": "/attendance",
            })

    return {"query": q, "results": results, "total": len(results)}
