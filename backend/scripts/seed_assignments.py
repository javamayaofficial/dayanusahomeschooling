"""
Seed tugas awal Dayanusa yang terhubung ke lesson soft-skill.

Tujuan:
- Mengisi halaman tugas siswa dengan pekerjaan praktik yang relevan.
- Menyediakan tutor sistem agar assignment memiliki pemilik yang valid.
- Aman dijalankan berulang: update berdasarkan judul tugas.

Jalankan:
    PYTHONPATH=/app python scripts/seed_assignments.py
"""

from __future__ import annotations

import asyncio
from datetime import datetime, timedelta, timezone

from sqlalchemy import select

from app.core.database import AsyncSessionLocal
from app.core.security import hash_password
from app.models.assignment import Assignment
from app.models.enums import UserRole
from app.models.softskill import SkillLesson, SoftSkillClass
from app.models.user import User


SYSTEM_TUTOR = {
    "email": "tutor.sistem@dayanusa.or.id",
    "full_name": "Tutor Sistem Dayanusa",
    "password": "TutorDayanusa#2026",
}


ASSIGNMENTS = [
    {
        "class_title": "Fundamental Digital Marketing untuk Pemula",
        "lesson_title": "Mengenal Audiens dan Masalah yang Mereka Hadapi",
        "title": "Pemetaan Audiens untuk Produk Sederhana",
        "description": (
            "Pilih satu produk atau layanan sederhana di sekitar kamu. Buat pemetaan audiens yang menjawab: "
            "siapa targetnya, masalah apa yang mereka hadapi, dan alasan mereka perlu peduli pada produk tersebut. "
            "Tuliskan minimal 3 insight utama dan satu kesimpulan singkat."
        ),
        "due_in_days": 7,
        "max_score": 100,
    },
    {
        "class_title": "Fundamental Digital Marketing untuk Pemula",
        "lesson_title": "Menyusun Pesan Promosi yang Jelas",
        "title": "Tulis 3 Caption Promosi yang Fokus pada Manfaat",
        "description": (
            "Buat 3 versi caption promosi untuk produk pilihanmu. Masing-masing caption harus memakai struktur "
            "masalah-solusi-ajakan dan menonjolkan manfaat utama yang berbeda. Jelaskan singkat mana caption yang "
            "menurutmu paling kuat dan alasannya."
        ),
        "due_in_days": 10,
        "max_score": 100,
    },
    {
        "class_title": "Content Creator: Menulis Skrip dan Membangun Hook",
        "lesson_title": "Hook 3 Detik Pertama",
        "title": "Buat 5 Hook untuk Video Pendek",
        "description": (
            "Tentukan satu topik konten edukasi atau promosi. Buat 5 variasi hook pembuka berdurasi sangat singkat "
            "dengan gaya berbeda: pertanyaan, janji hasil, fakta mengejutkan, empati masalah, dan ajakan langsung. "
            "Pilih 1 hook terbaik lalu jelaskan kenapa itu paling berpotensi membuat penonton berhenti scroll."
        ),
        "due_in_days": 8,
        "max_score": 100,
    },
    {
        "class_title": "Content Creator: Produksi Video Pendek dengan Ponsel",
        "lesson_title": "Alur Produksi Cepat: Rekam, Pilih, Edit",
        "title": "Rancang Produksi Video 30 Detik",
        "description": (
            "Susun rencana produksi video pendek berdurasi sekitar 30 detik. Tuliskan ide konten, urutan take yang akan direkam, "
            "teks utama di layar, dan langkah edit dasar yang akan kamu lakukan. Jika sudah sempat merekam, lampirkan tautannya."
        ),
        "due_in_days": 12,
        "max_score": 100,
    },
    {
        "class_title": "Product Creator: Validasi Ide dan Nilai Produk",
        "lesson_title": "Validasi Sederhana Sebelum Produksi",
        "title": "Wawancara Validasi 3 Calon Pengguna",
        "description": (
            "Pilih satu ide produk, lalu lakukan validasi sederhana kepada 3 calon pengguna. Catat siapa mereka, masalah yang mereka alami, "
            "solusi yang biasa mereka pakai, dan harapan mereka terhadap solusi baru. Akhiri dengan kesimpulan apakah idemu layak dilanjutkan atau perlu diubah."
        ),
        "due_in_days": 14,
        "max_score": 100,
    },
    {
        "class_title": "Product Creator: Packaging Penawaran dan Launch Awal",
        "lesson_title": "Mengemas Penawaran yang Mudah Dipahami",
        "title": "Susun Penawaran Produk dalam 1 Halaman Ringkas",
        "description": (
            "Buat draft penawaran produk dalam format singkat: nama produk, target pengguna, manfaat utama, hasil yang dijanjikan, "
            "dan cara orang dapat mengakses atau membelinya. Tujuannya adalah membuat penawaran yang jelas dalam satu tampilan ringkas."
        ),
        "due_in_days": 16,
        "max_score": 100,
    },
]


async def get_or_create_system_tutor(db) -> User:
    tutor = (
        await db.execute(select(User).where(User.email == SYSTEM_TUTOR["email"]))
    ).scalar_one_or_none()
    if tutor:
        tutor.full_name = SYSTEM_TUTOR["full_name"]
        tutor.role = UserRole.TUTOR
        tutor.is_active = True
        return tutor

    tutor = User(
        email=SYSTEM_TUTOR["email"],
        password_hash=hash_password(SYSTEM_TUTOR["password"]),
        full_name=SYSTEM_TUTOR["full_name"],
        role=UserRole.TUTOR,
        is_active=True,
        is_verified=True,
    )
    db.add(tutor)
    await db.flush()
    return tutor


async def get_skill_lesson(db, class_title: str, lesson_title: str) -> SkillLesson | None:
    stmt = (
        select(SkillLesson)
        .join(SoftSkillClass, SkillLesson.class_id == SoftSkillClass.id)
        .where(SoftSkillClass.title == class_title, SkillLesson.title == lesson_title)
    )
    return (await db.execute(stmt)).scalar_one_or_none()


async def get_assignment(db, title: str) -> Assignment | None:
    stmt = select(Assignment).where(Assignment.title == title)
    return (await db.execute(stmt)).scalar_one_or_none()


async def main() -> None:
    async with AsyncSessionLocal() as db:
        tutor = await get_or_create_system_tutor(db)
        created = 0

        for item in ASSIGNMENTS:
            lesson = await get_skill_lesson(db, item["class_title"], item["lesson_title"])
            if lesson is None:
                continue

            due_date = datetime.now(timezone.utc) + timedelta(days=item["due_in_days"])
            assignment = await get_assignment(db, item["title"])
            if assignment is None:
                assignment = Assignment(
                    title=item["title"],
                    tutor_id=tutor.id,
                    lesson_id=lesson.id,
                    description=item["description"],
                    due_date=due_date,
                    max_score=item["max_score"],
                    is_published=True,
                )
                db.add(assignment)
                created += 1
            else:
                assignment.tutor_id = tutor.id
                assignment.lesson_id = lesson.id
                assignment.description = item["description"]
                assignment.due_date = due_date
                assignment.max_score = item["max_score"]
                assignment.is_published = True

        await db.commit()
        print(f"Seed assignment selesai: {created} tugas baru atau diperbarui.")


if __name__ == "__main__":
    asyncio.run(main())
