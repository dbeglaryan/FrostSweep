"""Tests for file organization: matching, preview, organize, undo."""
import os
from core.organizer import match_category_and_destination, build_preview, organize_files, undo_moves
from core.scanner import iter_files
from core.config import get_default_config, get_categories


def _cfg():
    return get_default_config()

def _cats(config=None):
    return get_categories(config or _cfg())


def test_match_pdf():
    dest, tag = match_category_and_destination('.pdf', _cfg(), _cats())
    assert tag == 'documents'
    assert dest is not None


def test_match_jpg():
    dest, tag = match_category_and_destination('.jpg', _cfg(), _cats())
    assert tag == 'image'


def test_match_other_files():
    dest, tag = match_category_and_destination('.psd', _cfg(), _cats())
    assert tag == 'other_files'
    assert 'PSD' in dest


def test_match_unknown():
    dest, tag = match_category_and_destination('.xyz999', _cfg(), _cats())
    assert dest is not None  # catch-all sends unknown exts to other_files
    assert tag == 'other_files'
    assert 'XYZ999' in dest


def test_match_empty():
    dest, tag = match_category_and_destination('', _cfg(), _cats())
    assert tag == 'other_files'
    assert dest is not None  # catch-all even for empty extension


def test_build_preview(sample_files):
    src, _ = sample_files
    files = iter_files(str(src))
    preview = build_preview(files, _cfg(), _cats())
    assert len(preview) > 0
    assert all('current_path' in p for p in preview)


def test_organize_moves_files(tmp_path):
    src = tmp_path / "src"
    src.mkdir()
    (src / "report.pdf").write_text("pdf")
    dest = tmp_path / "dest"
    config = {'documents': ['.pdf'], 'documents_location': str(dest), 'other_files': [], 'other_files_location': str(tmp_path / 'other')}
    cats = get_categories(config)
    files = iter_files(str(src))
    result = organize_files(files, config, cats)
    assert result['total_moved'] == 1
    assert (dest / "report.pdf").exists()


def test_organize_dry_run(tmp_path):
    src = tmp_path / "src"
    src.mkdir()
    pdf = src / "doc.pdf"
    pdf.write_text("data")
    config = {'documents': ['.pdf'], 'documents_location': str(tmp_path / 'dest'), 'other_files': [], 'other_files_location': str(tmp_path / 'other')}
    cats = get_categories(config)
    files = iter_files(str(src))
    result = organize_files(files, config, cats, dry_run=True)
    assert pdf.exists()
    assert result['dry_run'] is True
    assert len(result['moves']) == 0


def test_organize_dedup(tmp_path):
    src = tmp_path / "src"
    src.mkdir()
    (src / "doc.txt").write_text("new")
    dest = tmp_path / "dest"
    dest.mkdir()
    (dest / "doc.txt").write_text("existing")
    config = {'documents': ['.txt'], 'documents_location': str(dest), 'other_files': [], 'other_files_location': str(tmp_path / 'other')}
    cats = get_categories(config)
    files = iter_files(str(src))
    result = organize_files(files, config, cats)
    assert (dest / "doc.txt").read_text() == "existing"
    assert (dest / "doc_1.txt").exists()


def test_organize_skip_duplicates(tmp_path):
    src = tmp_path / "src"
    src.mkdir()
    sub = src / "sub"
    sub.mkdir()
    (src / "file.txt").write_text("a")
    (sub / "file.txt").write_text("b")
    dest = tmp_path / "dest"
    config = {'documents': ['.txt'], 'documents_location': str(dest), 'other_files': [], 'other_files_location': str(tmp_path / 'other')}
    cats = get_categories(config)
    files = iter_files(str(src), recursive=True)
    result = organize_files(files, config, cats, dup_strategy="Skip duplicates")
    moved = list(dest.iterdir()) if dest.exists() else []
    assert len(moved) == 1


def test_organize_creates_dest(tmp_path):
    src = tmp_path / "src"
    src.mkdir()
    (src / "song.mp3").write_text("mp3")
    dest = tmp_path / "new" / "music"
    config = {'music': ['.mp3'], 'music_location': str(dest), 'other_files': [], 'other_files_location': str(tmp_path / 'other')}
    cats = get_categories(config)
    files = iter_files(str(src))
    organize_files(files, config, cats)
    assert dest.exists()


def test_organize_error_handling(tmp_path, monkeypatch):
    import shutil
    src = tmp_path / "src"
    src.mkdir()
    (src / "file.pdf").write_text("data")
    config = {'documents': ['.pdf'], 'documents_location': str(tmp_path / 'dest'), 'other_files': [], 'other_files_location': str(tmp_path / 'other')}
    cats = get_categories(config)
    files = iter_files(str(src))
    monkeypatch.setattr(shutil, 'move', lambda s, d: (_ for _ in ()).throw(PermissionError("denied")))
    result = organize_files(files, config, cats)
    assert len(result['errors']) > 0


def test_undo(tmp_path):
    src = tmp_path / "src"
    src.mkdir()
    (src / "a.pdf").write_text("data")
    dest = tmp_path / "dest"
    config = {'documents': ['.pdf'], 'documents_location': str(dest), 'other_files': [], 'other_files_location': str(tmp_path / 'other')}
    cats = get_categories(config)
    files = iter_files(str(src))
    result = organize_files(files, config, cats)
    assert not (src / "a.pdf").exists()
    undo_result = undo_moves(result['moves'])
    assert undo_result['success'] == 1
    assert (src / "a.pdf").exists()


def test_undo_missing_file():
    result = undo_moves([("/orig", "/gone")])
    assert result['failed'] == 1
