"""
Attendance routes — per-student subject attendance percentages.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
import models
import schemas

router = APIRouter(prefix="/attendance", tags=["attendance"])


@router.get("/{student_id}", response_model=List[schemas.AttendanceOut])
def get_attendance(student_id: int, db: Session = Depends(get_db)):
    """Get attendance records for a student."""
    student = db.query(models.Student).filter(models.Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    records = (
        db.query(models.Attendance)
        .filter(models.Attendance.student_id == student_id)
        .all()
    )
    return records
