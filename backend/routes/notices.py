"""
Notices routes.

CHANGE HERE IF: you want to add filtering (e.g. notices by branch)
or sorting (e.g. most recent first).
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from database import get_db
import models
import schemas

router = APIRouter(prefix="/notices", tags=["notices"])


@router.get("/", response_model=List[schemas.NoticeOut])
def get_notices(db: Session = Depends(get_db)):
    """Get all notices, most recent first."""
    return db.query(models.Notice).order_by(models.Notice.id.desc()).all()
