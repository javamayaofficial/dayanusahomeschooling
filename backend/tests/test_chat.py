"""
Test Guru AI — bagian yang tak butuh Gemini/pgvector:
session CRUD, history, suggestions, RBAC, dan perilaku saat AI belum dikonfigurasi.
"""
from tests.conftest import student_header, tutor_header

API = "/api/v1/chat"


async def _new_session(client, hdr):
    r = await client.post(f"{API}/session", headers=hdr)
    assert r.status_code == 201, r.text
    return r.json()["id"]


async def test_student_creates_and_lists_session(client):
    hdr = await student_header(client)
    sid = await _new_session(client, hdr)
    lst = await client.get(f"{API}/sessions", headers=hdr)
    assert lst.status_code == 200
    assert any(s["id"] == sid for s in lst.json())


async def test_tutor_cannot_use_chat(client):
    hdr = await tutor_header(client)
    r = await client.post(f"{API}/session", headers=hdr)
    assert r.status_code == 403


async def test_history_empty_for_new_session(client):
    hdr = await student_header(client)
    sid = await _new_session(client, hdr)
    r = await client.get(f"{API}/history/{sid}", headers=hdr)
    assert r.status_code == 200
    assert r.json() == []


async def test_suggestions_returns_three(client):
    hdr = await student_header(client)
    r = await client.get(f"{API}/suggestions", headers=hdr)
    assert r.status_code == 200
    assert len(r.json()["suggestions"]) == 3


async def test_cannot_access_others_session(client):
    owner = await student_header(client, "owner@dayanusa.id")
    sid = await _new_session(client, owner)
    intruder = await student_header(client, "intruder@dayanusa.id")
    r = await client.get(f"{API}/history/{sid}", headers=intruder)
    assert r.status_code == 404


async def test_message_returns_503_without_gemini_key(client):
    """Tanpa GEMINI_API_KEY, endpoint pesan harus menolak dengan 503 yang jelas."""
    hdr = await student_header(client)
    sid = await _new_session(client, hdr)
    r = await client.post(f"{API}/message", headers=hdr, json={"session_id": sid, "message": "Halo"})
    assert r.status_code == 503


async def test_delete_session(client):
    hdr = await student_header(client)
    sid = await _new_session(client, hdr)
    d = await client.delete(f"{API}/session/{sid}", headers=hdr)
    assert d.status_code == 204
    lst = await client.get(f"{API}/sessions", headers=hdr)
    assert all(s["id"] != sid for s in lst.json())
