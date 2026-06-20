from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class StudentBase(BaseModel):
    name: str
    email: str
    prn: str
    branch: str
    year: str
    division: str
    interests: Optional[str] = ""
    bio: Optional[str] = ""
    profile_pic: Optional[str] = ""
    account_type: Optional[str] = "personal"


class StudentCreate(StudentBase):
    password: str


class StudentOut(StudentBase):
    id: int
    class Config:
        from_attributes = True


class StudentPublic(BaseModel):
    id: int
    name: str
    branch: str
    year: str
    division: str
    bio: Optional[str] = ""
    profile_pic: Optional[str] = ""
    account_type: Optional[str] = "personal"
    interests: Optional[str] = ""
    class Config:
        from_attributes = True


# Social Club
class SocialClubCreate(BaseModel):
    student_id: int
    club_name: str
    description: Optional[str] = ""
    faculty_contact: Optional[str] = ""


class SocialClubOut(SocialClubCreate):
    id: int
    class Config:
        from_attributes = True


# Club Posts
class ClubPostCreate(BaseModel):
    club_id: int
    event_name: str
    description: Optional[str] = ""
    duration: Optional[str] = ""
    fees: Optional[str] = "0"
    faculty_contact: Optional[str] = ""
    organizing_team: Optional[str] = ""
    image_url: Optional[str] = ""


class ClubPostOut(ClubPostCreate):
    id: int
    created_at: Optional[datetime] = None
    class Config:
        from_attributes = True


# Friends
class FriendRequestOut(BaseModel):
    id: int
    from_id: int
    to_id: int
    status: str
    class Config:
        from_attributes = True


# Existing schemas
class TimetableOut(BaseModel):
    id: int
    branch: str
    year: str
    division: str
    day: str
    time: str
    subject: str
    class Config:
        from_attributes = True


class ExamOut(BaseModel):
    id: int
    subject: str
    date: str
    time: str
    branch: str
    year: str
    class Config:
        from_attributes = True


class EventOut(BaseModel):
    id: int
    title: str
    category: str
    date: str
    description: Optional[str] = ""
    class Config:
        from_attributes = True


class NoticeOut(BaseModel):
    id: int
    title: str
    content: str
    date: str
    class Config:
        from_attributes = True


class AIQuestion(BaseModel):
    student_id: int
    question: str


class AttendanceOut(BaseModel):
    id: int
    student_id: int
    subject: str
    percentage: int
    class Config:
        from_attributes = True


class StudyPlanRequest(BaseModel):
    student_id: int
    exam_date: str
    subjects: str
    hours_available: float

class EnrollmentOut(BaseModel):
    id: int
    student_id: int
    post_id: int
    class Config:
        from_attributes = True

class TaskCreate(BaseModel):
    student_id: int
    title: str
    due_date: Optional[str] = ""
    priority: Optional[str] = "medium"
    source: Optional[str] = "manual"

class TaskOut(TaskCreate):
    id: int
    done: bool
    class Config:
        from_attributes = True    