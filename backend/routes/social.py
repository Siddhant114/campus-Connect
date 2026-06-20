from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models
import schemas

router = APIRouter(prefix="/social", tags=["social"])


@router.post("/clubs", response_model=schemas.SocialClubOut)
def create_club(data: schemas.SocialClubCreate, db: Session = Depends(get_db)):
    student = db.query(models.Student).filter(models.Student.id == data.student_id).first()
    if not student or student.account_type != "club":
        raise HTTPException(status_code=400, detail="Only club accounts can create clubs")
    club = models.SocialClub(**data.model_dump())
    db.add(club)
    db.commit()
    db.refresh(club)
    return club


@router.get("/clubs", response_model=list[schemas.SocialClubOut])
def list_clubs(db: Session = Depends(get_db)):
    return db.query(models.SocialClub).all()


@router.get("/clubs/{club_id}", response_model=schemas.SocialClubOut)
def get_club(club_id: int, db: Session = Depends(get_db)):
    club = db.query(models.SocialClub).filter(models.SocialClub.id == club_id).first()
    if not club:
        raise HTTPException(status_code=404, detail="Club not found")
    return club


@router.post("/posts", response_model=schemas.ClubPostOut)
def create_post(data: schemas.ClubPostCreate, db: Session = Depends(get_db)):
    post = models.ClubPost(**data.model_dump())
    db.add(post)
    db.commit()
    db.refresh(post)
    return post


@router.get("/posts", response_model=list[schemas.ClubPostOut])
def list_posts(db: Session = Depends(get_db)):
    return db.query(models.ClubPost).order_by(models.ClubPost.created_at.desc()).all()


@router.get("/posts/club/{club_id}", response_model=list[schemas.ClubPostOut])
def posts_by_club(club_id: int, db: Session = Depends(get_db)):
    return db.query(models.ClubPost).filter(models.ClubPost.club_id == club_id).all()


# ── Enrollment ─────────────────────────────────────────────────────────

@router.post("/enroll")
def enroll(student_id: int, post_id: int, db: Session = Depends(get_db)):
    existing = db.query(models.EventEnrollment).filter(
        models.EventEnrollment.student_id == student_id,
        models.EventEnrollment.post_id == post_id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Already enrolled")
    db.add(models.EventEnrollment(student_id=student_id, post_id=post_id))
    db.commit()
    return {"message": "Enrolled successfully"}


@router.delete("/enroll")
def unenroll(student_id: int, post_id: int, db: Session = Depends(get_db)):
    row = db.query(models.EventEnrollment).filter(
        models.EventEnrollment.student_id == student_id,
        models.EventEnrollment.post_id == post_id
    ).first()
    if not row:
        raise HTTPException(status_code=404, detail="Not enrolled")
    db.delete(row)
    db.commit()
    return {"message": "Unenrolled"}


@router.get("/enroll/{student_id}")
def my_enrollments(student_id: int, db: Session = Depends(get_db)):
    rows = db.query(models.EventEnrollment).filter(
        models.EventEnrollment.student_id == student_id
    ).all()
    return [r.post_id for r in rows]


@router.get("/enrolled-students/{post_id}")
def enrolled_students(post_id: int, db: Session = Depends(get_db)):
    rows = db.query(models.EventEnrollment).filter(
        models.EventEnrollment.post_id == post_id
    ).all()
    ids = [r.student_id for r in rows]
    if not ids:
        return []
    students = db.query(models.Student).filter(models.Student.id.in_(ids)).all()
    return [{"id": s.id, "name": s.name, "branch": s.branch, "year": s.year} for s in students]


# ── Friends ────────────────────────────────────────────────────────────

@router.post("/friends/request")
def send_request(from_id: int, to_id: int, db: Session = Depends(get_db)):
    if from_id == to_id:
        raise HTTPException(status_code=400, detail="Cannot friend yourself")
    existing = db.query(models.FriendRequest).filter(
        models.FriendRequest.from_id == from_id,
        models.FriendRequest.to_id == to_id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Request already sent")
    req = models.FriendRequest(from_id=from_id, to_id=to_id)
    db.add(req)
    db.commit()
    return {"message": "Friend request sent"}


@router.put("/friends/respond/{request_id}")
def respond_request(request_id: int, action: str, db: Session = Depends(get_db)):
    req = db.query(models.FriendRequest).filter(models.FriendRequest.id == request_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Request not found")
    if action not in ("accepted", "rejected"):
        raise HTTPException(status_code=400, detail="action must be accepted or rejected")
    req.status = action
    db.commit()
    return {"message": f"Request {action}"}


@router.get("/friends/{student_id}", response_model=list[schemas.StudentPublic])
def get_friends(student_id: int, db: Session = Depends(get_db)):
    accepted = db.query(models.FriendRequest).filter(
        ((models.FriendRequest.from_id == student_id) | (models.FriendRequest.to_id == student_id)),
        models.FriendRequest.status == "accepted"
    ).all()
    friend_ids = [r.to_id if r.from_id == student_id else r.from_id for r in accepted]
    if not friend_ids:
        return []
    return db.query(models.Student).filter(models.Student.id.in_(friend_ids)).all()


@router.get("/friends/requests/{student_id}")
def pending_requests(student_id: int, db: Session = Depends(get_db)):
    reqs = db.query(models.FriendRequest).filter(
        models.FriendRequest.to_id == student_id,
        models.FriendRequest.status == "pending"
    ).all()
    result = []
    for r in reqs:
        sender = db.query(models.Student).filter(models.Student.id == r.from_id).first()
        result.append({
            "id": r.id,
            "from_id": r.from_id,
            "from_name": sender.name if sender else f"Student #{r.from_id}",
            "from_branch": sender.branch if sender else "",
            "to_id": r.to_id,
            "status": r.status,
        })
    return result