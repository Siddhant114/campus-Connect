"""
Event routes, including Smart Event Discovery recommendations.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
import models
import schemas

router = APIRouter(prefix="/events", tags=["events"])

# Related interest keywords for smarter partial matching
RELATED_KEYWORDS = {
    "AI": ["machine learning", "data", "hackathon", "tech", "coding"],
    "Robotics": ["automation", "engineering", "workshop", "tech"],
    "Music": ["concert", "audition", "band", "cultural"],
    "Photography": ["photo", "camera", "visual", "contest"],
    "Sports": ["fitness", "athletics", "competition", "game"],
}


@router.get("/", response_model=List[schemas.EventOut])
def get_all_events(db: Session = Depends(get_db)):
    """Get all events."""
    return db.query(models.Event).all()


def calculate_match(
    event_category: str,
    event_title: str,
    event_description: str,
    student_interests: List[str],
) -> int:
    """
    Smarter match scoring:
      - Exact category match        → 95%
      - Category keyword in title   → 80%
      - Related keyword overlap     → 60–75%
      - Interest in description     → 50%
    """
    if not student_interests:
        return 0

    category_lower = event_category.lower()
    title_lower = event_title.lower()
    desc_lower = (event_description or "").lower()
    best = 0

    for interest in student_interests:
        il = interest.lower()

        if il == category_lower:
            best = max(best, 95)
            continue

        if il in category_lower or category_lower in il:
            best = max(best, 85)
            continue

        if il in title_lower:
            best = max(best, 80)
            continue

        related = RELATED_KEYWORDS.get(interest, [])
        for kw in related:
            if kw in title_lower or kw in desc_lower:
                best = max(best, 70)
                break

        if il in desc_lower:
            best = max(best, 55)

    return best


@router.get("/recommendations/{student_id}")
def get_recommendations(student_id: int, db: Session = Depends(get_db)):
    """
    Smart Event Discovery: events matched to student interests,
    sorted by match percentage (highest first).
    """
    student = db.query(models.Student).filter(models.Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    interests = [i.strip() for i in (student.interests or "").split(",") if i.strip()]
    events = db.query(models.Event).all()

    recommendations = []
    for event in events:
        match = calculate_match(
            event.category,
            event.title,
            event.description or "",
            interests,
        )
        if match > 0:
            recommendations.append({
                "id": event.id,
                "title": event.title,
                "category": event.category,
                "date": event.date,
                "description": event.description,
                "match_percent": match,
            })

    recommendations.sort(key=lambda x: x["match_percent"], reverse=True)
    return recommendations
