"""Shared fixtures for backend tests — no GUI dependencies."""

import json
import os
import sys

import pytest

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


@pytest.fixture()
def sample_files(tmp_path):
    src = tmp_path / "source"
    src.mkdir()
    extensions = ['.pdf', '.txt', '.jpg', '.png', '.mp3', '.mp4', '.exe', '.zip', '.psd', '.xyz']
    created = []
    for ext in extensions:
        f = src / f"sample{ext}"
        f.write_text(f"content for {ext}")
        created.append(f)
    return src, created


@pytest.fixture()
def nested_files(tmp_path):
    src = tmp_path / "nested_source"
    src.mkdir()
    (src / "file_a.txt").write_text("a")
    sub = src / "subdir"
    sub.mkdir()
    (sub / "file_b.pdf").write_text("b")
    (sub / "file_c.jpg").write_text("c")
    return src


@pytest.fixture()
def default_config():
    from core.config import get_default_config
    return get_default_config()


@pytest.fixture()
def default_categories(default_config):
    from core.config import get_categories
    return get_categories(default_config)
