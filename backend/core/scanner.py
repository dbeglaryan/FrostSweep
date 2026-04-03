"""File scanning, extension detection, and statistics."""

from __future__ import annotations

import glob
import os
from typing import Any

from .config import ConfigDict


def iter_files(folder: str, recursive: bool = False) -> list[str]:
    files: list[str] = []
    if recursive:
        for root_dir, _, filenames in os.walk(folder):
            files.extend(os.path.join(root_dir, f) for f in filenames)
    else:
        files = [p for p in glob.glob(os.path.join(folder, '*')) if os.path.isfile(p)]
    return files


def scan_extensions(files: list[str]) -> list[str]:
    extensions: set[str] = set()
    for fp in files:
        if os.path.isfile(fp):
            ext = os.path.splitext(fp)[1].lower()
            if ext:
                extensions.add(ext)
    return sorted(extensions)


def compute_scan_stats(
    files: list[str], config: ConfigDict, categories: list[str],
) -> dict[str, Any]:
    from .organizer import match_category_and_destination

    file_list = [f for f in files if os.path.isfile(f)]
    total_count = len(file_list)
    total_size = 0
    breakdown: dict[str, dict[str, Any]] = {}
    sizes: list[dict[str, Any]] = []

    for f in file_list:
        try:
            size = os.path.getsize(f)
        except OSError:
            size = 0
        total_size += size
        ext = os.path.splitext(f)[1].lower()
        _, cat = match_category_and_destination(ext, config, categories)
        if cat not in breakdown:
            breakdown[cat] = {'count': 0, 'size': 0}
        breakdown[cat]['count'] += 1
        breakdown[cat]['size'] += size
        sizes.append({'name': os.path.basename(f), 'size': size, 'path': f})

    sizes.sort(key=lambda x: x['size'], reverse=True)
    top_5 = [{'name': s['name'], 'size_mb': round(s['size'] / (1024 ** 2), 2)} for s in sizes[:5]]

    for cat in breakdown:
        breakdown[cat]['size_mb'] = round(breakdown[cat]['size'] / (1024 ** 2), 1)

    return {
        'total_files': total_count,
        'total_size_bytes': total_size,
        'total_size_mb': round(total_size / (1024 ** 2), 1),
        'breakdown': breakdown,
        'top_5_largest': top_5,
    }
