from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
import models
import schemas

router = APIRouter(prefix="/students", tags=["students"])


# -----------------------------
# REGISTER STUDENT
# -----------------------------
@router.post("/register", response_model=schemas.StudentOut)
def register(student: schemas.StudentCreate, db: Session = Depends(get_db)):

    existing = db.query(models.Student).filter(
        (models.Student.prn == student.prn) | (models.Student.email == student.email)
    ).first()

    if existing:
        raise HTTPException(status_code=400, detail="PRN or email already registered")

    new_student = models.Student(**student.model_dump())

    db.add(new_student)
    db.commit()
    db.refresh(new_student)

    return new_student


# -----------------------------
# LOGIN (PRN ONLY - NO PASSWORD)
# -----------------------------
@router.post("/login", response_model=schemas.StudentOut)
def login(prn: str, db: Session = Depends(get_db)):

    student = db.query(models.Student).filter(models.Student.prn == prn).first()

    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    return student


# -----------------------------
# SEARCH STUDENTS
# -----------------------------
@router.get("/search", response_model=list[schemas.StudentPublic])
def search_students(q: str, db: Session = Depends(get_db)):

    results = db.query(models.Student).filter(
        models.Student.name.ilike(f"%{q}%") |
        models.Student.prn.ilike(f"%{q}%") |
        models.Student.branch.ilike(f"%{q}%")
    ).limit(20).all()

    return results


# -----------------------------
# GET STUDENT BY ID
# -----------------------------
@router.get("/{student_id}", response_model=schemas.StudentOut)
def get_student(student_id: int, db: Session = Depends(get_db)):

    student = db.query(models.Student).filter(models.Student.id == student_id).first()

    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    return student


# -----------------------------
# UPDATE INTERESTS
# -----------------------------
@router.put("/{student_id}/interests", response_model=schemas.StudentOut)
def update_interests(student_id: int, interests: str, db: Session = Depends(get_db)):

    student = db.query(models.Student).filter(models.Student.id == student_id).first()

    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    student.interests = interests
    db.commit()
    db.refresh(student)

    return student


# -----------------------------
# UPDATE PROFILE
# -----------------------------
@router.put("/{student_id}/profile", response_model=schemas.StudentOut)
def update_profile(
    student_id: int,
    bio: str = "",
    profile_pic: str = "",
    db: Session = Depends(get_db)
):

    student = db.query(models.Student).filter(models.Student.id == student_id).first()

    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    student.bio = bio

    if profile_pic:
        student.profile_pic = profile_pic

    db.commit()
    db.refresh(student)

    return student