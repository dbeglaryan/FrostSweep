"""FrostSweep FastAPI backend — local HTTP API for file organization."""

from __future__ import annotations

import argparse
import csv
import io
import logging
import os
import threading
from typing import Any

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from core import config as cfg
from core import duplicates, scanner
from core.config import ConfigDict
from core.filters import apply_filters
from core.organizer import build_preview, organize_files, undo_moves

logger = logging.getLogger(__name__)

app = FastAPI(title="FrostSweep API", version="2.0.0")

# Restrict CORS to localhost origins only (Electron + Vite dev server)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:19542",
        "http://127.0.0.1:19542",
        "file://",
    ],
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- App state (guarded by lock) ---
CONFIG_DIR: str = os.path.dirname(os.path.abspath(__file__))
_config_path: str = os.path.join(CONFIG_DIR, 'frostsweep_config.json')
_recent_path: str = os.path.join(CONFIG_DIR, 'recent_folders.json')
_app_config: ConfigDict = cfg.load_config(_config_path)
_last_moves: list[tuple[str, str]] = []
_last_log: list[dict[str, Any]] | None = None
_recent_folders: list[str] = cfg.load_recent_folders(_recent_path)
_state_lock = threading.Lock()


def _categories() -> list[str]:
    return cfg.get_categories(_app_config)


# --- Path validation ---
def _validate_folder(folder: str) -> str:
    """Validate and resolve a folder path. Raises HTTPException on invalid input."""
    resolved = os.path.realpath(os.path.expanduser(folder))
    if not os.path.isdir(resolved):
        raise HTTPException(400, "Invalid folder path")
    # Block system-critical paths
    blocked: list[str] = []
    if os.name == 'nt':
        blocked = [os.environ.get('SYSTEMROOT', r'C:\Windows').lower(),
                   os.path.join(os.environ.get('SYSTEMROOT', r'C:\Windows'), 'System32').lower()]
    else:
        blocked = ['/bin', '/sbin', '/usr/bin', '/usr/sbin', '/etc', '/boot', '/proc', '/sys']
    resolved_lower = resolved.replace('\\', '/').lower().rstrip('/')
    for b in blocked:
        b_norm = b.replace('\\', '/').lower().rstrip('/')
        if resolved_lower == b_norm or resolved_lower.startswith(b_norm + '/'):
            raise HTTPException(403, f"Access to system directory '{resolved}' is blocked")
    return resolved


def _validate_save_path(save_path: str) -> str:
    """Validate an export save path. Must be in a user-writable location."""
    resolved = os.path.realpath(os.path.expanduser(save_path))
    parent = os.path.dirname(resolved)
    if not os.path.isdir(parent):
        raise HTTPException(400, f"Parent directory does not exist: {parent}")
    ext = os.path.splitext(resolved)[1].lower()
    if ext not in ('.csv', '.json', '.txt', '.log', '.xlsx'):
        raise HTTPException(400, "Export only supports .csv, .json, .txt, .log files")
    return resolved


# --- Pydantic models ---
class ScanRequest(BaseModel):
    folder: str
    recursive: bool = False

class FilterParams(BaseModel):
    min_size_mb: float | None = None
    max_size_mb: float | None = None
    after_date: str | None = None
    before_date: str | None = None
    ext_whitelist: list[str] | None = None
    ext_blacklist: list[str] | None = None

class OrganizeRequest(BaseModel):
    folder: str
    recursive: bool = False
    filters: FilterParams = Field(default_factory=FilterParams)
    dup_strategy: str = "Rename"
    dry_run: bool = False

class PreviewRequest(BaseModel):
    folder: str
    recursive: bool = False
    filters: FilterParams = Field(default_factory=FilterParams)
    dup_strategy: str = "Rename"

class DuplicatesRequest(BaseModel):
    folder: str
    recursive: bool = False

class AddCategoryRequest(BaseModel):
    name: str
    extensions: list[str] = []
    destination: str | None = None

class ExportLogRequest(BaseModel):
    save_path: str

class ConfigUpdateRequest(BaseModel):
    categories: list[dict[str, Any]] = []


# --- Endpoints ---
@app.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "ok", "version": app.version}


@app.get("/api/config")
def get_config() -> dict[str, Any]:
    with _state_lock:
        return {
            "config": _app_config,
            "categories": _categories(),
        }


@app.put("/api/config")
def update_config(req: ConfigUpdateRequest) -> dict[str, Any]:
    global _app_config
    with _state_lock:
        if req.categories:
            _app_config = cfg.update_config_from_categories(req.categories, _app_config)
        cfg.save_config(_config_path, _app_config)
        return {"config": _app_config, "categories": _categories()}


@app.get("/api/recent-folders")
def get_recent_folders() -> dict[str, list[str]]:
    with _state_lock:
        return {"folders": _recent_folders}


@app.post("/api/scan")
def scan_directory(req: ScanRequest) -> dict[str, Any]:
    global _recent_folders
    folder = _validate_folder(req.folder)
    with _state_lock:
        _recent_folders = cfg.save_recent_folder(_recent_path, folder, _recent_folders)
    files = scanner.iter_files(folder, req.recursive)
    extensions = scanner.scan_extensions(files)
    with _state_lock:
        stats = scanner.compute_scan_stats(files, _app_config, _categories())
    return {"extensions": extensions, "stats": stats}


@app.post("/api/preview")
def preview(req: PreviewRequest) -> dict[str, Any]:
    folder = _validate_folder(req.folder)
    files = scanner.iter_files(folder, req.recursive)
    files = apply_filters(
        files,
        min_size_mb=req.filters.min_size_mb,
        max_size_mb=req.filters.max_size_mb,
        after_date=req.filters.after_date,
        before_date=req.filters.before_date,
        ext_whitelist=req.filters.ext_whitelist,
        ext_blacklist=req.filters.ext_blacklist,
    )
    with _state_lock:
        result = build_preview(files, _app_config, _categories(), req.dup_strategy)
    return {"preview": result, "total": len(result)}


@app.post("/api/organize")
def organize(req: OrganizeRequest) -> dict[str, Any]:
    global _last_moves, _last_log
    folder = _validate_folder(req.folder)
    files = scanner.iter_files(folder, req.recursive)
    files = apply_filters(
        files,
        min_size_mb=req.filters.min_size_mb,
        max_size_mb=req.filters.max_size_mb,
        after_date=req.filters.after_date,
        before_date=req.filters.before_date,
        ext_whitelist=req.filters.ext_whitelist,
        ext_blacklist=req.filters.ext_blacklist,
    )
    with _state_lock:
        result = organize_files(
            files, _app_config, _categories(),
            dup_strategy=req.dup_strategy,
            dry_run=req.dry_run,
        )
        if not req.dry_run:
            _last_moves = result['moves']
            _last_log = result['log_data']
    return result


@app.post("/api/undo")
def undo() -> dict[str, Any]:
    global _last_moves
    with _state_lock:
        if not _last_moves:
            return {"success": 0, "failed": 0, "errors": ["Nothing to undo"]}
        moves = list(_last_moves)
        _last_moves = []
    result = undo_moves(moves)
    return result


@app.post("/api/duplicates")
def find_duplicates(req: DuplicatesRequest) -> dict[str, Any]:
    folder = _validate_folder(req.folder)
    files = scanner.iter_files(folder, req.recursive)
    return duplicates.detect_duplicates(files)


@app.post("/api/categories")
def add_category(req: AddCategoryRequest) -> dict[str, Any]:
    global _app_config
    with _state_lock:
        _app_config, error = cfg.add_category(_app_config, req.name, req.extensions, req.destination)
        if error:
            raise HTTPException(400, error)
        cfg.save_config(_config_path, _app_config)
        return {"config": _app_config, "categories": _categories()}


@app.delete("/api/categories/{name}")
def delete_category(name: str) -> dict[str, Any]:
    global _app_config
    with _state_lock:
        _app_config, error = cfg.delete_category(_app_config, name)
        if error:
            raise HTTPException(400, error)
        cfg.save_config(_config_path, _app_config)
        return {"config": _app_config, "categories": _categories()}


@app.post("/api/export-log")
def export_log(req: ExportLogRequest) -> dict[str, str]:
    with _state_lock:
        if _last_log is None or len(_last_log) == 0:
            raise HTTPException(400, "No log data to export")
        log_data = list(_last_log)

    save_path = _validate_save_path(req.save_path)
    try:
        output = io.StringIO()
        if log_data:
            writer = csv.DictWriter(output, fieldnames=log_data[0].keys())
            writer.writeheader()
            writer.writerows(log_data)
        with open(save_path, 'w', newline='') as f:
            f.write(output.getvalue())
        return {"saved": save_path}
    except PermissionError:
        raise HTTPException(403, f"Permission denied writing to: {save_path}")
    except OSError as e:
        raise HTTPException(500, f"Failed to export: {e}")


if __name__ == "__main__":
    import uvicorn
    parser = argparse.ArgumentParser()
    parser.add_argument("--port", type=int, default=19542)
    parser.add_argument("--config-dir", type=str, default=None)
    args = parser.parse_args()
    if args.config_dir:
        CONFIG_DIR = args.config_dir
        _config_path = os.path.join(CONFIG_DIR, 'frostsweep_config.json')
        _recent_path = os.path.join(CONFIG_DIR, 'recent_folders.json')
        _app_config = cfg.load_config(_config_path)
        _recent_folders = cfg.load_recent_folders(_recent_path)
    uvicorn.run(app, host="127.0.0.1", port=args.port)
