"""
Main FastAPI application entry point.
"""

from pathlib import Path
from dotenv import load_dotenv

# Load backend/.env before any route reads os.getenv (GEMINI_API_KEY, etc.)
load_dotenv(Path(__file__).resolve().parent / ".env")

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import engine, Base
import models  # noqa: F401  (needed so Base.metadata knows about all tables)

from routes import students, timetable, exams, events, notices, ai, attendance, documents, search, bookmarks, social, tasks

# Create all tables (if they don't already exist)
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Campus Portal API", description="Backend for the student campus portal")

# ---------------------------------------------------------------
# CORS CONFIGURATION
# Allows the React frontend (running on a different port) to call
# this API. Add your deployed frontend URL here when you go live.
# ---------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"http://localhost:\d+",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register all route modules
app.include_router(students.router)
app.include_router(timetable.router)
app.include_router(exams.router)
app.include_router(events.router)
app.include_router(notices.router)
app.include_router(ai.router)
app.include_router(attendance.router)
app.include_router(documents.router)
app.include_router(search.router)
app.include_router(bookmarks.router)
app.include_router(social.router)
app.include_router(tasks.router)


@app.get("/")
def root():
    return {"message": "Campus Portal API is running. Visit /docs for API documentation."}


@app.get("/health")
def health():
    """Quick check for dependencies and config."""
    import os

    reportlab_ok = True
    try:
        import reportlab  # noqa: F401
    except ImportError:
        reportlab_ok = False

    gemini_set = bool(os.getenv("GEMINI_API_KEY", "").strip())

    return {
        "status": "ok",
        "reportlab": reportlab_ok,
        "gemini_api_key_set": gemini_set,
    }
