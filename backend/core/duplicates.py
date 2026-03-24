"""Duplicate file detection by name and content hash."""

from __future__ import annotations

import hashlib
import logging
import os
from typing import Any

logger = logging.getLogger(__name__)


def file_hash(filepath: str, block_size: int = 65536) -> str | None:
    try:
        h = hashlib.md5()
        with open(filepath, 'rb') as f:
            while True:
                data = f.read(block_size)
                if not data:
                    break
                h.update(data)
        return h.hexdigest()
    except (OSError, PermissionError) as e:
        logger.warning(f"Cannot hash file {filepath}: {e}")
        return None


def detect_duplicates(files: list[str]) -> dict[str, Any]:
    only_files = [f for f in files if os.path.isfile(f)]

    by_name: dict[str, list[str]] = {}
    for f in only_files:
        name = os.path.basename(f)
        by_name.setdefault(name, []).append(f)
    name_dupes = {k: v for k, v in by_name.items() if len(v) > 1}

    by_hash: dict[str, list[str]] = {}
    for f in only_files:
        h = file_hash(f)
        if h:
            by_hash.setdefault(h, []).append(f)
    content_dupes = {k: v for k, v in by_hash.items() if len(v) > 1}

    return {
        'name_duplicates': name_dupes,
        'content_duplicates': content_dupes,
        'summary': {
            'name_dupe_files': sum(len(v) for v in name_dupes.values()),
            'name_dupe_groups': len(name_dupes),
            'content_dupe_files': sum(len(v) for v in content_dupes.values()),
            'content_dupe_groups': len(content_dupes),
        }
    }
