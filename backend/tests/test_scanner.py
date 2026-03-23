"""Tests for file scanning and statistics."""
from core.scanner import iter_files, scan_extensions, compute_scan_stats


def test_iter_files_flat(sample_files):
    src, _ = sample_files
    files = iter_files(str(src), recursive=False)
    assert len(files) >= 10


def test_iter_files_recursive(nested_files):
    files = iter_files(str(nested_files), recursive=True)
    basenames = {f.split('/')[-1].split('\\')[-1] for f in files}
    assert 'file_a.txt' in basenames
    assert 'file_b.pdf' in basenames


def test_iter_files_nonrecursive(nested_files):
    import os
    files = iter_files(str(nested_files), recursive=False)
    basenames = {os.path.basename(f) for f in files if os.path.isfile(f)}
    assert 'file_a.txt' in basenames
    assert 'file_b.pdf' not in basenames


def test_scan_extensions(sample_files):
    src, _ = sample_files
    files = iter_files(str(src))
    exts = scan_extensions(files)
    assert '.pdf' in exts
    assert '.jpg' in exts


def test_scan_empty_folder(tmp_path):
    empty = tmp_path / "empty"
    empty.mkdir()
    files = iter_files(str(empty))
    exts = scan_extensions(files)
    assert exts == []


def test_compute_stats(sample_files, default_config, default_categories):
    src, _ = sample_files
    files = iter_files(str(src))
    stats = compute_scan_stats(files, default_config, default_categories)
    assert stats['total_files'] >= 10
    assert stats['total_size_mb'] >= 0
    assert 'breakdown' in stats
    assert len(stats['top_5_largest']) <= 5
