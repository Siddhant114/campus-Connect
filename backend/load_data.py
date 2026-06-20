"""
Loads sample data from the CSV files in data/ into the PostgreSQL database.

CHANGE HERE IF:
 - You want to load different/more sample data — edit the CSV files
   in backend/data/ directly (no need to touch this script for
   adding more rows; only edit this file if you add a NEW TABLE).

Run this AFTER the tables have been created (i.e. after running the
backend at least once, since main.py creates tables on startup), or
run it manually:

    python load_data.py

Re-running this script will ADD duplicate rows if run multiple times.
To start fresh, clear the tables first (or drop and recreate the database).
"""

import csv
from database import SessionLocal, engine, Base
import models

Base.metadata.create_all(bind=engine)

db = SessionLocal()


def load_students():
    with open("data/students.csv", newline="") as f:
        for row in csv.DictReader(f):
            db.add(models.Student(**row))


def load_timetable():
    with open("data/timetable.csv", newline="") as f:
        for row in csv.DictReader(f):
            db.add(models.Timetable(**row))


def load_exams():
    with open("data/exams.csv", newline="") as f:
        for row in csv.DictReader(f):
            db.add(models.Exam(**row))


def load_events():
    with open("data/events.csv", newline="") as f:
        for row in csv.DictReader(f):
            db.add(models.Event(**row))


def load_notices():
    with open("data/notices.csv", newline="") as f:
        for row in csv.DictReader(f):
            db.add(models.Notice(**row))


def load_attendance():
    with open("data/attendance.csv", newline="") as f:
        for row in csv.DictReader(f):
            db.add(models.Attendance(
                student_id=int(row["student_id"]),
                subject=row["subject"],
                percentage=int(row["percentage"]),
            ))


if __name__ == "__main__":
    load_students()
    load_timetable()
    load_exams()
    load_events()
    load_notices()
    load_attendance()
    db.commit()
    db.close()
    print("Sample data loaded successfully.")
