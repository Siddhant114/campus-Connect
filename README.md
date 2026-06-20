# Campus Portal

A student campus portal: timetable, exams, events with personalized
recommendations, notices, and an AI assistant (powered by Gemini).

Stack: **FastAPI + PostgreSQL** (backend) and **React + Vite** (frontend).

---

## 1. Project Structure

```
campus-portal/
│
├── backend/
│   ├── main.py              <- App entry point, registers all routes, CORS config
│   ├── database.py          <- Database connection URL/settings
│   ├── models.py             <- Database table definitions (columns)
│   ├── schemas.py            <- API request/response shapes
│   ├── load_data.py          <- Loads sample CSV data into the database
│   ├── requirements.txt      <- Python dependencies
│   ├── data/                  <- Sample CSV data
│   │   ├── students.csv
│   │   ├── timetable.csv
│   │   ├── exams.csv
│   │   ├── events.csv
│   │   └── notices.csv
│   └── routes/
│       ├── students.py        <- Login, registration, interests
│       ├── timetable.py        <- Timetable endpoints
│       ├── exams.py             <- Exam endpoints
│       ├── events.py             <- Events + recommendation logic
│       ├── notices.py             <- Notice endpoints
│       └── ai.py                   <- AI assistant (Gemini)
│
└── frontend/
    ├── index.html
    ├── package.json
    ├── vite.config.js
    └── src/
        ├── main.jsx           <- React entry point
        ├── App.jsx             <- Routing, page navigation
        ├── api.js               <- Backend URL configuration
        ├── index.css             <- All styling/colors
        ├── components/
        │   ├── Navbar.jsx          <- Top navigation bar
        │   └── Cards.jsx            <- Card components (Timetable/Exam/Event/Notice)
        └── pages/
            ├── Login.jsx
            ├── Home.jsx              <- AI assistant box
            ├── Timetable.jsx
            ├── Exams.jsx
            ├── Events.jsx             <- Recommendations
            ├── Notices.jsx
            └── Profile.jsx              <- Edit interests
```

Every file above has a comment block at the top starting with
**"CHANGE HERE IF:"** explaining exactly what that file controls.

---

## 2. What to Change for Common Tasks

| I want to... | Edit this file | Effect visible in |
|---|---|---|
| Change colors, fonts, overall look | `frontend/src/index.css` | Every page (browser) |
| Add/remove a navigation link | `frontend/src/components/Navbar.jsx` | Top navbar (browser) |
| Add a new page | `frontend/src/pages/NewPage.jsx` + register in `frontend/src/App.jsx` | New URL route (browser) |
| Change database connection (host/user/password) | `backend/database.py` | Backend startup (terminal) |
| Add/remove a column in a table (e.g. add "phone" to Student) | `backend/models.py` AND `backend/schemas.py` | Database + API responses (requires recreating tables, see below) |
| Change login logic | `backend/routes/students.py` | `/students/login` API + `frontend/src/pages/Login.jsx` |
| Change timetable filtering | `backend/routes/timetable.py` | Timetable page |
| Change exam filtering | `backend/routes/exams.py` | Exams page |
| Change recommendation % formula | `backend/routes/events.py` (`calculate_match` function) | Events page, "Events You Might Like" |
| Add/remove interest categories (AI, Robotics, etc.) | `frontend/src/pages/Profile.jsx` (`AVAILABLE_INTERESTS`) | Profile page checkboxes |
| Change AI prompt / what context AI sees | `backend/routes/ai.py` (`build_prompt` function) | Home page AI assistant answers |
| Change backend API URL the frontend talks to | `frontend/src/api.js` (`BASE_URL`) | All frontend API calls |
| Add/change sample data (timetable, exams, events, notices, students) | `backend/data/*.csv`, then re-run `python load_data.py` | Database content |

---

## 3. Where Will I See the Effect?

- **Backend changes** (anything in `backend/`): restart the server
  (`uvicorn main:app --reload` auto-reloads on save). Test changes at
  `http://localhost:8000/docs` (interactive API documentation) or
  through the frontend.
- **Frontend changes** (anything in `frontend/src/`): if `npm run dev`
  is running, the browser auto-refreshes. View at
  `http://localhost:5173`.
- **Database column changes** (`models.py`): you must recreate the
  tables for the change to apply (see step below).

---

## 4. Setup Instructions

### Prerequisites
- Python 3.10+
- Node.js 18+
- PostgreSQL installed and running

### Step 1 — Create the database

```bash
# Open psql or any PostgreSQL client and run:
CREATE DATABASE campus_portal;
```

If your PostgreSQL username/password/host differ from the default
(`postgres`/`postgres`/`localhost`), edit `backend/database.py` or
set the `DATABASE_URL` environment variable:

```bash
export DATABASE_URL="postgresql://<user>:<password>@<host>:5432/campus_portal"
```

### Step 2 — Backend setup

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt

# (Optional) enable AI assistant - get a free key from https://aistudio.google.com/app/apikey
export GEMINI_API_KEY="your-key-here"

# Start the server (this also creates all database tables)
uvicorn main:app --reload
```

Backend runs at `http://localhost:8000`. Visit `http://localhost:8000/docs`
to explore the API.

### Step 3 — Load sample data

In a new terminal (with the venv activated):

```bash
cd backend
python load_data.py
```

This populates the database with sample students, timetable, exams,
events, and notices from the CSV files in `backend/data/`.

### Step 4 — Frontend setup

In a new terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`.

### Step 5 — Log in

Use one of the sample PRNs from `backend/data/students.csv`:
- `PRN001` (Siddhant Patil)
- `PRN002` (Riya Sharma)

---

## 5. Recreating Database Tables (after changing models.py)

If you add/remove columns in `backend/models.py`, the existing tables
won't automatically update. To apply the change during development:

```bash
cd backend
python -c "
from database import engine, Base
import models
Base.metadata.drop_all(engine)
Base.metadata.create_all(engine)
"
python load_data.py
```

⚠️ This deletes all existing data in the database.

---

## 6. Pushing to GitHub

```bash
cd campus-portal
git init
git add .
git commit -m "Initial commit: Campus Portal"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo-name>.git
git push -u origin main
```

The included `.gitignore` excludes:
- Python virtual environments and caches
- `node_modules/`
- `.env` files (never commit your `GEMINI_API_KEY` or database passwords!)

### Setting secrets for collaborators / deployment

Don't hardcode `GEMINI_API_KEY` or `DATABASE_URL` in code. Anyone
cloning the repo should set these as environment variables (see Step 2
above), or create their own local `.env` file (already gitignored).

---

## 7. API Reference (quick view)

Once the backend is running, visit `http://localhost:8000/docs` for a
full interactive list of all endpoints, their parameters, and example
responses.

Main endpoints:
- `POST /students/login?prn=...` — log in
- `GET /timetable/?branch=...&year=...&division=...`
- `GET /exams/?branch=...&year=...`
- `GET /events/` — all events
- `GET /events/recommendations/{student_id}` — personalized recommendations
- `GET /notices/`
- `PUT /students/{student_id}/interests?interests=AI,Music`
- `POST /ai/ask` — `{"student_id": 1, "question": "When is my next exam?"}`

---

## 8. Roadmap (from the original plan)

- [x] Phase 1-9: Database, backend, frontend, profiles, timetable,
      exams, interests, event recommendations
- [x] Phase 10: AI assistant (Gemini)
- [ ] Add authentication (passwords/JWT) — currently login is just by PRN
- [ ] Deploy backend + frontend + database online
