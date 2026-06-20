"""
Document routes — hall ticket PDF download.
"""

import io
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from database import get_db
import models

router = APIRouter(prefix="/documents", tags=["documents"])


def _build_pdf(student, exams) -> bytes:
    """Generate a simple PDF hall ticket using reportlab."""
    from reportlab.lib.pagesizes import A4
    from reportlab.pdfgen import canvas

    buffer = io.BytesIO()
    c = canvas.Canvas(buffer, pagesize=A4)
    width, height = A4

    c.setFont("Helvetica-Bold", 20)
    c.drawString(50, height - 60, "Campus Portal — Hall Ticket")

    c.setFont("Helvetica", 12)
    y = height - 100
    lines = [
        f"Name:     {student.name}",
        f"PRN:      {student.prn}",
        f"Branch:   {student.branch}",
        f"Year:     {student.year}",
        f"Division: {student.division}",
        "",
        "Upcoming Examinations:",
    ]
    for line in lines:
        c.drawString(50, y, line)
        y -= 22

    if exams:
        for exam in exams:
            c.drawString(70, y, f"• {exam.subject} — {exam.date} at {exam.time}")
            y -= 20
    else:
        c.drawString(70, y, "No upcoming exams on record.")
        y -= 20

    y -= 20
    c.setFont("Helvetica-Oblique", 10)
    c.drawString(50, y, "This is a computer-generated document. Bring your college ID on exam day.")

    c.showPage()
    c.save()
    buffer.seek(0)
    return buffer.read()


@router.get("/hall-ticket/{student_id}")
def download_hall_ticket(student_id: int, db: Session = Depends(get_db)):
    """Download a PDF hall ticket for the student."""
    student = db.query(models.Student).filter(models.Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    exams = (
        db.query(models.Exam)
        .filter(
            models.Exam.branch == student.branch,
            models.Exam.year == student.year,
        )
        .all()
    )

    try:
        pdf_bytes = _build_pdf(student, exams)
    except ImportError:
        raise HTTPException(
            status_code=500,
            detail="reportlab is not installed. Run: pip install reportlab",
        )

    filename = f"hall_ticket_{student.prn}.pdf"
    return StreamingResponse(
        io.BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
