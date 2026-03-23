"""Integration tests for FastAPI endpoints."""
import json
import os
import sys

import pytest
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import main as app_module


@pytest.fixture(autouse=True)
def reset_state(tmp_path):
    """Reset app state and point config to temp dir for each test."""
    app_module._config_path = str(tmp_path / "config.json")
    app_module._recent_path = str(tmp_path / "recent.json")
    from core.config import get_default_config
    app_module._app_config = get_default_config()
    app_module._last_moves = []
    app_module._last_log = None
    app_module._recent_folders = []
    yield


@pytest.fixture()
def client():
    return TestClient(app_module.app)


def test_health(client):
    r = client.get("/api/health")
    assert r.status_code == 200
    assert r.json()["status"] == "ok"


def test_get_config(client):
    r = client.get("/api/config")
    assert r.status_code == 200
    assert "categories" in r.json()
    assert "documents" in r.json()["categories"]


def test_scan_invalid_folder(client):
    r = client.post("/api/scan", json={"folder": "/nonexistent/999"})
    assert r.status_code == 400


def test_scan_valid_folder(client, tmp_path):
    src = tmp_path / "src"
    src.mkdir()
    (src / "a.pdf").write_text("data")
    (src / "b.jpg").write_text("img")
    r = client.post("/api/scan", json={"folder": str(src)})
    assert r.status_code == 200
    assert ".pdf" in r.json()["extensions"]
    assert r.json()["stats"]["total_files"] == 2


def test_preview(client, tmp_path):
    src = tmp_path / "src"
    src.mkdir()
    (src / "test.pdf").write_text("pdf")
    r = client.post("/api/preview", json={"folder": str(src)})
    assert r.status_code == 200
    assert r.json()["total"] >= 1


def test_organize_and_undo(client, tmp_path):
    src = tmp_path / "src"
    src.mkdir()
    (src / "doc.pdf").write_text("pdf")
    r = client.post("/api/organize", json={"folder": str(src)})
    assert r.status_code == 200
    assert r.json()["total_moved"] >= 1
    # Undo
    r2 = client.post("/api/undo")
    assert r2.status_code == 200
    assert r2.json()["success"] >= 1


def test_organize_dry_run(client, tmp_path):
    src = tmp_path / "src"
    src.mkdir()
    pdf = src / "doc.pdf"
    pdf.write_text("pdf")
    r = client.post("/api/organize", json={"folder": str(src), "dry_run": True})
    assert r.status_code == 200
    assert r.json()["dry_run"] is True
    assert pdf.exists()


def test_add_category(client):
    r = client.post("/api/categories", json={"name": "Fonts", "extensions": [".ttf", ".otf"]})
    assert r.status_code == 200
    assert "fonts" in r.json()["categories"]


def test_delete_category(client):
    client.post("/api/categories", json={"name": "Temp", "extensions": [".tmp"]})
    r = client.delete("/api/categories/temp")
    assert r.status_code == 200
    assert "temp" not in r.json()["categories"]


def test_duplicates(client, tmp_path):
    src = tmp_path / "src"
    src.mkdir()
    (src / "a.txt").write_text("same")
    (src / "b.txt").write_text("same")
    r = client.post("/api/duplicates", json={"folder": str(src)})
    assert r.status_code == 200
    assert r.json()["summary"]["content_dupe_groups"] >= 1


def test_recent_folders(client, tmp_path):
    src = tmp_path / "src"
    src.mkdir()
    (src / "x.txt").write_text("x")
    client.post("/api/scan", json={"folder": str(src)})
    r = client.get("/api/recent-folders")
    # Path may be resolved via realpath, so compare normalized
    folders = [os.path.normpath(f) for f in r.json()["folders"]]
    assert os.path.normpath(os.path.realpath(str(src))) in folders


def test_undo_nothing(client):
    r = client.post("/api/undo")
    assert r.status_code == 200
    assert "Nothing to undo" in str(r.json()["errors"])


def test_export_log(client, tmp_path):
    """Export log after organizing produces a valid CSV."""
    src = tmp_path / "src"
    src.mkdir()
    (src / "doc.pdf").write_text("pdf")
    client.post("/api/organize", json={"folder": str(src)})
    out = str(tmp_path / "log.csv")
    r = client.post("/api/export-log", json={"save_path": out})
    assert r.status_code == 200
    assert os.path.exists(out)


def test_export_log_no_data(client, tmp_path):
    out = str(tmp_path / "log.csv")
    r = client.post("/api/export-log", json={"save_path": out})
    assert r.status_code == 400


def test_export_log_bad_extension(client, tmp_path):
    out = str(tmp_path / "log.exe")
    r = client.post("/api/export-log", json={"save_path": out})
    assert r.status_code == 400


def test_scan_blocked_system_path(client):
    """System paths should be blocked."""
    if os.name == 'nt':
        r = client.post("/api/scan", json={"folder": r"C:\Windows"})
    else:
        r = client.post("/api/scan", json={"folder": "/etc"})
    assert r.status_code in (400, 403)
