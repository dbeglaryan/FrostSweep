"""Tests for duplicate detection."""
from core.duplicates import file_hash, detect_duplicates


def test_hash_consistency(tmp_path):
    (tmp_path / "a.txt").write_text("hello")
    (tmp_path / "b.txt").write_text("hello")
    h1 = file_hash(str(tmp_path / "a.txt"))
    h2 = file_hash(str(tmp_path / "b.txt"))
    assert h1 == h2
    assert h1 is not None


def test_hash_different(tmp_path):
    (tmp_path / "a.txt").write_text("hello")
    (tmp_path / "b.txt").write_text("world")
    assert file_hash(str(tmp_path / "a.txt")) != file_hash(str(tmp_path / "b.txt"))


def test_hash_missing_file():
    assert file_hash("/nonexistent/file.txt") is None


def test_detect_name_dupes(tmp_path):
    sub = tmp_path / "sub"
    sub.mkdir()
    (tmp_path / "file.txt").write_text("a")
    (sub / "file.txt").write_text("b")
    files = [str(tmp_path / "file.txt"), str(sub / "file.txt")]
    result = detect_duplicates(files)
    assert result['summary']['name_dupe_groups'] == 1


def test_detect_content_dupes(tmp_path):
    (tmp_path / "a.txt").write_text("same")
    (tmp_path / "b.txt").write_text("same")
    files = [str(tmp_path / "a.txt"), str(tmp_path / "b.txt")]
    result = detect_duplicates(files)
    assert result['summary']['content_dupe_groups'] == 1


def test_no_dupes(tmp_path):
    (tmp_path / "a.txt").write_text("one")
    (tmp_path / "b.txt").write_text("two")
    files = [str(tmp_path / "a.txt"), str(tmp_path / "b.txt")]
    result = detect_duplicates(files)
    assert result['summary']['name_dupe_groups'] == 0
    assert result['summary']['content_dupe_groups'] == 0
