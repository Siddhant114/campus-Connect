"""
Timetable routes.

CHANGE HERE IF: you want to change how timetable entries are filtered
or sorted (e.g. order by time of day, or filter by a specific day).
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List, Optional
from database import get_db
import models
import schemas

router = APIRouter(prefix="/timetable", tags=["timetable"])


@router.get("/", response_model=List[schemas.TimetableOut])
def get_timetable(
    branch: str,
    year: str,
    division: str,
    day: Optional[str] = None,
    db: Session = Depends(get_db),
):
    """
    Get timetable for a branch/year/division.
    Optionally filter by day (e.g. "Monday") to show only today's lectures.
    """
    query = db.query(models.Timetable).filter(
        models.Timetable.branch == branch,
        models.Timetable.year == year,
        models.Timetable.division == division,
    )
    if day:
        query = query.filter(models.Timetable.day == day)
    return query.all()
