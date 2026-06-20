# Campus Connect

Campus Connect is a web application developed to help students manage their academic and campus activities from a single platform. The system provides access to timetables, exam schedules, notices, events, and personalized recommendations based on student interests. It also includes an AI-powered assistant that can answer student queries and provide relevant information.

The project was built as a full-stack application using FastAPI for the backend, React with Vite for the frontend, PostgreSQL for data storage, and Google's Gemini API for AI features.

## Features

* Student login using PRN
* View class timetables
* Track upcoming examinations
* Access campus notices and announcements
* Browse campus events
* Personalized event recommendations based on interests
* Student profile management
* AI assistant for campus-related queries

## Tech Stack

### Frontend

* React
* Vite
* JavaScript
* CSS

### Backend

* FastAPI
* SQLAlchemy
* Python

### Database

* PostgreSQL

### AI Integration

* Google Gemini API

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

## Installation

### Clone the repository

```bash
git clone https://github.com/Siddhant114/campus-Connect.git
cd campus-Connect
```

### Backend Setup

```bash
cd backend

python -m venv venv
venv\Scripts\activate

pip install -r requirements.txt

uvicorn main:app --reload
```

### Frontend Setup

```bash
cd frontend

npm install
npm run dev
```

### Environment Variables

Create a `.env` file in the backend directory:

```env
DATABASE_URL=postgresql://postgres@localhost:5432/campus_portal
GEMINI_API_KEY=your_api_key
```

## Future Improvements

* JWT-based authentication
* Role-based access control
* Attendance tracking
* Assignment management
* Mobile responsive enhancements
* Cloud deployment

## Author

**Siddhant Gawai**

Second-year Instrumentation Engineering student with an interest in full-stack web development, AI integration, and building practical software solutions for student communities.

GitHub: https://github.com/Siddhant114

