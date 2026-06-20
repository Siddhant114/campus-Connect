"""
Exam routes.

CHANGE HERE IF: you want to change how "upcoming" exams are determined
(currently returns all exams for the branch/year; you could add date
filtering to only show future exams).
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from database import get_db
import models
import schemas

router = APIRouter(prefix="/exams", tags=["exams"])


@router.get("/", response_model=List[schemas.ExamOut])
def get_exams(branch: str, year: str, db: Session = Depends(get_db)):
    """Get upcoming exams for a branch/year."""
    return db.query(models.Exam).filter(
        models.Exam.branch == branch,
        models.Exam.year == year,
    ).all()
