"""Tests for file filtering."""
import os
from core.filters import apply_filters


def test_filter_min_size(tmp_path):
    (tmp_path / "small.txt").write_text("x")
    (tmp_path / "big.txt").write_text("x" * 1024 * 1024 * 2)
    files = [str(tmp_path / "small.txt"), str(tmp_path / "big.txt")]
    result = apply_filters(files, min_size_mb=1)
    basenames = [os.path.basename(f) for f in result]
    assert "big.txt" in basenames
    assert "small.txt" not in basenames


def test_filter_max_size(tmp_path):
    (tmp_path / "small.txt").write_text("x")
    (tmp_path / "big.txt").write_text("x" * 1024 * 1024 * 5)
    files = [str(tmp_path / "small.txt"), str(tmp_path / "big.txt")]
    result = apply_filters(files, max_size_mb=1)
    basenames = [os.path.basename(f) for f in result]
    assert "small.txt" in basenames
    assert "big.txt" not in basenames


def test_filter_whitelist(tmp_path):
    (tmp_path / "a.pdf").write_text("p")
    (tmp_path / "b.jpg").write_text("j")
    files = [str(tmp_path / "a.pdf"), str(tmp_path / "b.jpg")]
    result = apply_filters(files, ext_whitelist=[".pdf"])
    assert len(result) == 1
    assert "a.pdf" in result[0]


def test_filter_blacklist(tmp_path):
    (tmp_path / "a.pdf").write_text("p")
    (tmp_path / "b.tmp").write_text("t")
    files = [str(tmp_path / "a.pdf"), str(tmp_path / "b.tmp")]
    result = apply_filters(files, ext_blacklist=[".tmp"])
    assert len(result) == 1
    assert "a.pdf" in result[0]


def test_empty_filters(tmp_path):
    (tmp_path / "a.pdf").write_text("p")
    (tmp_path / "b.jpg").write_text("j")
    files = [str(tmp_path / "a.pdf"), str(tmp_path / "b.jpg")]
    result = apply_filters(files)
    assert len(result) == 2
