"""Smoke: app boot, register/login, dan salah satu endpoint fondasi tetap jalan."""
from tests.conftest import student_header
async def test_health(client):
    r = await client.get("/health"); assert r.status_code == 200
async def test_info_reports_ai_flag(client):
    r = await client.get("/api/v1/info")
    assert r.status_code == 200 and "ai_enabled" in r.json()
async def test_portfolio_public_empty(client):
    r = await client.get("/api/v1/portfolios?limit=5")
    assert r.status_code == 200 and r.json()["total"] == 0
async def test_student_can_create_portfolio(client):
    hdr = await student_header(client)
    r = await client.post("/api/v1/portfolios", headers=hdr, json={
        "title":"Karya A","media_type":"image","media_url":"https://x/a.png","category":"content_creator"})
    assert r.status_code == 201
