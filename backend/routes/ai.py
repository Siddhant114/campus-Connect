"""
AI Assistant route (Gemini API integration).
"""

import os
from pathlib import Path
import requests
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from dotenv import load_dotenv
from database import get_db
import models
import schemas
import json

load_dotenv(Path(__file__).resolve().parent.parent / ".env")

router = APIRouter(prefix="/ai", tags=["ai"])

GEMINI_URL =GEMINI_URL = (
    "https://generativelanguage.googleapis.com/v1beta/models/"
    "gemini-3.5-flash:generateContent"
)


def get_gemini_api_key() -> str:
    return os.getenv("GEMINI_API_KEY", "").strip()


def build_prompt(
    student: models.Student,
    exams: list,
    timetable: list | None = None,
    events: list | None = None,
) -> str:
    exam_lines = "\n".join(
        f"{e.subject} - {e.date} at {e.time}" for e in exams
    ) or "No upcoming exams."

    timetable_lines = ""
    if timetable:
        timetable_lines = "\n".join(
            f"{t.day} {t.time}: {t.subject}" for t in timetable
        )

    event_lines = ""
    if events:
        event_lines = "\n".join(
            f"{ev.title} ({ev.category}) - {ev.date}" for ev in events
        )

    return f"""You are a helpful campus assistant for college students.

Student:
{student.name}
{student.branch}, Year {student.year}, Division {student.division}
Interests: {student.interests or 'None set'}

Upcoming exams:
{exam_lines}

Weekly timetable:
{timetable_lines or 'Not available'}

Campus events:
{event_lines or 'None listed'}
"""


def call_gemini(system_context: str, user_message: str) -> str:
    api_key = get_gemini_api_key()
    print("API KEY FOUND:", bool(api_key))
    print("\n========== GEMINI DEBUG ==========")
    print("API KEY FOUND:", bool(api_key))
    print("API KEY LENGTH:", len(api_key) if api_key else 0)

    if not api_key:
        raise HTTPException(
            status_code=503,
            detail="GEMINI_API_KEY is not set."
        )

    payload = {
        "contents": [
            {
                "parts": [
                    {
                        "text": f"{system_context}\n\n{user_message}"
                    }
                ]
            }
        ]
    }

    response = requests.post(
        f"{GEMINI_URL}?key={api_key}",
        json=payload,
        timeout=45,
    )

    print("STATUS CODE:", response.status_code)
    print("RAW RESPONSE:")
    print(response.text)
    print("=================================\n")

    if response.status_code != 200:
        raise HTTPException(
            status_code=502,
            detail=f"Gemini API error: {response.text}"
        )

    data = response.json()

    try:
        return data["candidates"][0]["content"]["parts"][0]["text"]
    except (KeyError, IndexError):
        raise HTTPException(
            status_code=502,
            detail="Unexpected response from Gemini API"
        )


def _fetch_student_context(student_id: int, db: Session):
    student = db.query(models.Student).filter(
        models.Student.id == student_id
    ).first()

    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    exams = (
        db.query(models.Exam)
        .filter(
            models.Exam.branch == student.branch,
            models.Exam.year == student.year,
        )
        .all()
    )

    timetable = (
        db.query(models.Timetable)
        .filter(
            models.Timetable.branch == student.branch,
            models.Timetable.year == student.year,
            models.Timetable.division == student.division,
        )
        .all()
    )

    events = db.query(models.Event).limit(10).all()

    return student, exams, timetable, events


@router.post("/ask")
def ask_ai(payload: schemas.AIQuestion, db: Session = Depends(get_db)):
    student, exams, timetable, events = _fetch_student_context(
        payload.student_id,
        db,
    )

    prompt = build_prompt(student, exams, timetable, events)

    answer = call_gemini(
        prompt,
        f"Question:\n{payload.question}"
    )

    return {"answer": answer}


@router.post("/study-plan")
def generate_study_plan(
    payload: schemas.StudyPlanRequest,
    db: Session = Depends(get_db)
):
    student, exams, timetable, events = _fetch_student_context(
        payload.student_id,
        db,
    )

    prompt = build_prompt(student, exams, timetable, events)

    study_message = f"""
Create a detailed day-by-day study plan.

Exam date: {payload.exam_date}
Subjects: {payload.subjects}
Hours available per day: {payload.hours_available}
"""

    answer = call_gemini(prompt, study_message)

    return {"plan": answer}

@router.post("/parse-timetable")
def parse_timetable(payload: dict, db: Session = Depends(get_db)):
    text = payload.get("text", "")
    branch = payload.get("branch", "")
    year = payload.get("year", "")
    division = payload.get("division", "")

    if not text:
        raise HTTPException(status_code=400, detail="No text provided")

    prompt = f"""You are a timetable parser. Parse the following timetable text and return ONLY a JSON array.
Each item must have: day, time, subject.
Days must be: Monday, Tuesday, Wednesday, Thursday, Friday, Saturday.
Example output: [{{"day":"Monday","time":"9:00 AM","subject":"Maths"}},{{"day":"Tuesday","time":"10:00 AM","subject":"Physics"}}]
Return ONLY the JSON array, no explanation, no markdown.

Timetable text:
{text}"""

    result = call_gemini("You are a JSON-only timetable parser.", prompt)

    # Strip markdown fences if present
    clean = result.strip()
    if clean.startswith("```"):
        clean = clean.split("```")[1]
        if clean.startswith("json"):
            clean = clean[4:]
    clean = clean.strip()

    try:
        entries = json.loads(clean)
    except Exception:
        raise HTTPException(status_code=422, detail=f"Could not parse AI response: {clean}")

    return {"entries": entries, "branch": branch, "year": year, "division": division}
