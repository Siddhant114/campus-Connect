"""
Saved event bookmarks — students can bookmark events they're interested in.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
import models
import schemas

router = APIRouter(prefix="/bookmarks", tags=["bookmarks"])


@router.get("/{student_id}", response_model=List[schemas.EventOut])
def get_bookmarks(student_id: int, db: Session = Depends(get_db)):
    """Get all events bookmarked by a student."""
    student = db.query(models.Student).filter(models.Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    bookmarks = (
        db.query(models.EventBookmark)
        .filter(models.EventBookmark.student_id == student_id)
        .all()
    )
    event_ids = [b.event_id for b in bookmarks]
    if not event_ids:
        return []

    events = db.query(models.Event).filter(models.Event.id.in_(event_ids)).all()
    order = {eid: i for i, eid in enumerate(event_ids)}
    events.sort(key=lambda e: order.get(e.id, 999))
    return events


@router.post("/{student_id}/{event_id}")
def add_bookmark(student_id: int, event_id: int, db: Session = Depends(get_db)):
    """Bookmark an event."""
    student = db.query(models.Student).filter(models.Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    event = db.query(models.Event).filter(models.Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    existing = (
        db.query(models.EventBookmark)
        .filter(
            models.EventBookmark.student_id == student_id,
            models.EventBookmark.event_id == event_id,
        )
        .first()
    )
    if existing:
        return {"message": "Already bookmarked", "event_id": event_id}

    db.add(models.EventBookmark(student_id=student_id, event_id=event_id))
    db.commit()
    return {"message": "Event saved", "event_id": event_id}


@router.delete("/{student_id}/{event_id}")
def remove_bookmark(student_id: int, event_id: int, db: Session = Depends(get_db)):
    """Remove an event bookmark."""
    bookmark = (
        db.query(models.EventBookmark)
        .filter(
            models.EventBookmark.student_id == student_id,
            models.EventBookmark.event_id == event_id,
        )
        .first()
    )
    if not bookmark:
        raise HTTPException(status_code=404, detail="Bookmark not found")

    db.delete(bookmark)
    db.commit()
    return {"message": "Bookmark removed", "event_id": event_id}
