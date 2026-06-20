"""
Database table definitions (SQLAlchemy ORM models).

CHANGE HERE IF: you need to add/remove/rename a COLUMN in any table
(e.g. add a "phone_number" field to Student, or add a "venue" field to Event).

After changing this file, you must recreate the tables for the change
to take effect. Easiest way during development:
    1. Stop the backend server
    2. Drop the database (or just delete tables) and recreate it
    3. Run: python -c "from database import engine, Base; import models; Base.metadata.create_all(engine)"
    4. Re-run the CSV loader (load_data.py) to repopulate sample data
"""

from sqlalchemy import Column, Integer, String, Text, Boolean, ForeignKey, DateTime
from database import Base


class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    prn = Column(String, unique=True, nullable=False)
    branch = Column(String, nullable=False)
    year = Column(String, nullable=False)
    division = Column(String, nullable=False)
    interests = Column(String, default="")
    password = Column(String, default="")
    bio = Column(Text, default="")
    profile_pic = Column(String, default="")
    account_type = Column(String, default="personal")


class Timetable(Base):
    __tablename__ = "timetable"

    id = Column(Integer, primary_key=True, index=True)
    branch = Column(String, nullable=False)
    year = Column(String, nullable=False)
    division = Column(String, nullable=False)
    day = Column(String, nullable=False)
    time = Column(String, nullable=False)
    subject = Column(String, nullable=False)


class Exam(Base):
    __tablename__ = "exams"

    id = Column(Integer, primary_key=True, index=True)
    subject = Column(String, nullable=False)
    date = Column(String, nullable=False)
    time = Column(String, nullable=False)
    branch = Column(String, nullable=False)
    year = Column(String, nullable=False)


class Event(Base):
    __tablename__ = "events"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    category = Column(String, nullable=False)
    date = Column(String, nullable=False)
    description = Column(Text, default="")


class Notice(Base):
    __tablename__ = "notices"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    date = Column(String, nullable=False)


class Attendance(Base):
    __tablename__ = "attendance"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, nullable=False)
    subject = Column(String, nullable=False)
    percentage = Column(Integer, nullable=False)


class EventBookmark(Base):
    __tablename__ = "event_bookmarks"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, nullable=False, index=True)
    event_id = Column(Integer, nullable=False, index=True)

class SocialClub(Base):
    __tablename__ = "social_clubs"
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    club_name = Column(String, nullable=False)
    description = Column(Text, default="")
    faculty_contact = Column(String, default="")


class ClubPost(Base):
    __tablename__ = "club_posts"
    id = Column(Integer, primary_key=True, index=True)
    club_id = Column(Integer, nullable=False)
    event_name = Column(String, nullable=False)
    description = Column(Text, default="")
    duration = Column(String, default="")
    fees = Column(String, default="0")
    faculty_contact = Column(String, default="")
    organizing_team = Column(String, default="")
    image_url = Column(String, default="")
    created_at = Column(DateTime(timezone=True))


class FriendRequest(Base):
    __tablename__ = "friend_requests"
    id = Column(Integer, primary_key=True, index=True)
    from_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    to_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    status = Column(String, default="pending")    

class EventEnrollment(Base):
    __tablename__ = "event_enrollments"
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    post_id = Column(Integer, nullable=False)

class Task(Base):
    __tablename__ = "tasks"
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, nullable=False)
    title = Column(String, nullable=False)
    due_date = Column(String, default="")
    priority = Column(String, default="medium")  # high / medium / low
    done = Column(Boolean, default=False)
    source = Column(String, default="manual")  # manual / ai / timetable