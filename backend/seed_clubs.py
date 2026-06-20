"""Run once: python seed_clubs.py — creates dummy club accounts with posts"""
from database import SessionLocal, engine, Base
import models

Base.metadata.create_all(bind=engine)
db = SessionLocal()

clubs_data = [
    {
        "student": {
            "name": "Robotics Club", "email": "robotics@campus.edu", "prn": "CLUB001",
            "branch": "Computer", "year": "1", "division": "A",
            "interests": "Robotics,AI", "password": "club123",
            "bio": "We build robots and automate things.", "account_type": "club",
        },
        "club": {"club_name": "Robotics Club", "description": "Robotics & automation", "faculty_contact": "Prof. Mehta"},
        "posts": [
            {"event_name": "Line Follower Robot Workshop", "description": "Build your own line follower robot from scratch. All materials provided.", "duration": "3 hours", "fees": "200", "faculty_contact": "Prof. Mehta", "organizing_team": "Rohan, Priya", "image_url": ""},
            {"event_name": "Drone Racing Competition", "description": "Inter-college drone racing event. Register your team of 3.", "duration": "Full day", "fees": "500", "faculty_contact": "Prof. Mehta", "organizing_team": "Ankit, Sara", "image_url": ""},
        ]
    },
    {
        "student": {
            "name": "Cultural Committee", "email": "cultural@campus.edu", "prn": "CLUB002",
            "branch": "Computer", "year": "1", "division": "A",
            "interests": "Music,Dance,Drama", "password": "club123",
            "bio": "Organising all cultural events on campus.", "account_type": "club",
        },
        "club": {"club_name": "Cultural Committee", "description": "Music, dance, drama and arts", "faculty_contact": "Prof. Desai"},
        "posts": [
            {"event_name": "Freshers Night 2026", "description": "Welcome party for first year students. Live performances, DJ, and prizes.", "duration": "4 hours", "fees": "0", "faculty_contact": "Prof. Desai", "organizing_team": "Meera, Rahul", "image_url": ""},
            {"event_name": "Solo Singing Competition", "description": "Open to all students. Hindi, English, and regional songs welcome.", "duration": "2 hours", "fees": "50", "faculty_contact": "Prof. Desai", "organizing_team": "Meera", "image_url": ""},
        ]
    },
    {
        "student": {
            "name": "Coding Club", "email": "coding@campus.edu", "prn": "CLUB003",
            "branch": "Computer", "year": "1", "division": "A",
            "interests": "Coding,AI", "password": "club123",
            "bio": "Weekly coding contests and hackathons.", "account_type": "club",
        },
        "club": {"club_name": "Coding Club", "description": "Competitive programming and hackathons", "faculty_contact": "Prof. Joshi"},
        "posts": [
            {"event_name": "24-Hour Hackathon", "description": "Build anything in 24 hours. Solo or team of 2. Cash prizes worth ₹10,000.", "duration": "24 hours", "fees": "100", "faculty_contact": "Prof. Joshi", "organizing_team": "Dev, Neha", "image_url": ""},
            {"event_name": "DSA Bootcamp", "description": "3-day intensive bootcamp on Data Structures and Algorithms for placements.", "duration": "3 days", "fees": "300", "faculty_contact": "Prof. Joshi", "organizing_team": "Dev", "image_url": ""},
        ]
    },
]

for data in clubs_data:
    existing = db.query(models.Student).filter(models.Student.prn == data["student"]["prn"]).first()
    if existing:
        print(f"Skipping {data['student']['prn']} — already exists")
        continue
    s = models.Student(**data["student"])
    db.add(s)
    db.flush()
    c = models.SocialClub(student_id=s.id, **data["club"])
    db.add(c)
    db.flush()
    for p in data["posts"]:
        db.add(models.ClubPost(club_id=c.id, **p))

db.commit()
db.close()
print("Done — 3 club accounts created with posts.")