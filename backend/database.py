"""
Database connection configuration.

CHANGE HERE IF: you need to point to a different PostgreSQL database
(different host, port, username, password, or database name).
"""

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

# ---------------------------------------------------------------
# DATABASE URL
# Format: postgresql://<username>:<password>@<host>:<port>/<database_name>
#
# By default this reads from an environment variable DATABASE_URL.
# If that variable isn't set, it falls back to the local default below.
# Edit the fallback string to match your local PostgreSQL setup.
# ---------------------------------------------------------------
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://postgres:CampusPortal123@localhost:5432/campus_portal"
)

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
