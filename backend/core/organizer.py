"""File organization: matching, preview, organize, undo."""

from __future__ import annotations

import logging
import os
import shutil
from datetime import datetime
from typing import Any, Callable

from .config import ConfigDict

logger = logging.getLogger(__name__)

ProgressCallback = Callable[[int, int, str], None] | None


def match_category_and_destination(
    file_extension: str, config: ConfigDict, categories: list[str],
) -> tuple[str | None, str]:
    destination: str | None = None
    category_tag = "other_files"
    matched = False
    for category in categories:
        cat_exts = config.get(category, [])
        if not isinstance(cat_exts, list):
            continue
        if file_extension in [e.lower() for e in cat_exts]:
            category_tag = category
            matched = True
            if category == "other_files":
                subfolder = file_extension.lstrip(".").upper() or "UNKNOWN"
                destination = os.path.join(
                    config.get("other_files_location", os.path.expanduser('~/Downloads/Other')),
                    subfolder
                )
            else:
                destination = config.get(f"{category}_location")
            break
    # True catch-all: unmatched extensions go to other_files
    if not matched:
        subfolder = file_extension.lstrip(".").upper() if file_extension else "UNKNOWN"
        destination = os.path.join(
            config.get("other_files_location", os.path.expanduser('~/Downloads/Other')),
            subfolder
        )
    return destination, category_tag


def _resolve_dedup_path(destination: str, base_filename: str) -> str:
    new_path = os.path.join(destination, base_filename)
    if os.path.exists(new_path):
        root_name, ext = os.path.splitext(base_filename)
        count = 1
        while os.path.exists(os.path.join(destination, f"{root_name}_{count}{ext}")):
            count += 1
        new_path = os.path.join(destination, f"{root_name}_{count}{ext}")
    return new_path


def build_preview(
    files: list[str],
    config: ConfigDict,
    categories: list[str],
    dup_strategy: str = "Rename",
) -> list[dict[str, Any]]:
    preview: list[dict[str, Any]] = []
    seen_names: dict[str, int] = {}
    for fp in files:
        if not os.path.isfile(fp):
            continue
        base = os.path.basename(fp)
        ext = os.path.splitext(fp)[1].lower()
        destination, category = match_category_and_destination(ext, config, categories)
        if not destination:
            continue

        is_dup = base in seen_names
        if is_dup and dup_strategy == "Skip duplicates":
            continue
        seen_names[base] = seen_names.get(base, 0) + 1

        new_path = _resolve_dedup_path(destination, base)
        preview.append({
            'current_path': os.path.normpath(fp),
            'destination_path': os.path.normpath(new_path),
            'category': category,
            'duplicate': is_dup,
        })
    return preview


def organize_files(
    files: list[str],
    config: ConfigDict,
    categories: list[str],
    dup_strategy: str = "Rename",
    dry_run: bool = False,
    progress_callback: ProgressCallback = None,
) -> dict[str, Any]:
    log_data: list[dict[str, Any]] = []
    moves: list[tuple[str, str]] = []
    only_files = [f for f in files if os.path.isfile(f)]
    total = len(only_files)
    errors: list[dict[str, str]] = []
    seen_names: dict[str, int] = {}

    for i, fp in enumerate(only_files):
        base = os.path.basename(fp)
        ext = os.path.splitext(fp)[1].lower()
        destination, category = match_category_and_destination(ext, config, categories)

        if progress_callback:
            progress_callback(i + 1, total, base)

        if not destination:
            continue

        is_dup = base in seen_names
        if is_dup and dup_strategy == "Skip duplicates":
            continue
        seen_names[base] = seen_names.get(base, 0) + 1

        try:
            if not dry_run:
                os.makedirs(destination, exist_ok=True)
            new_path = _resolve_dedup_path(destination, base)

            if dry_run:
                log_data.append({
                    'time': datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                    'original_path': os.path.normpath(fp),
                    'new_path': os.path.normpath(new_path),
                    'category': category,
                    'dry_run': True,
                })
            else:
                shutil.move(fp, new_path)
                norm_orig = os.path.normpath(fp)
                norm_new = os.path.normpath(new_path)
                moves.append((norm_orig, norm_new))
                log_data.append({
                    'time': datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                    'original_path': norm_orig,
                    'new_path': norm_new,
                    'category': category,
                    'dry_run': False,
                })
        except Exception as e:
            logger.error(f"Error moving {fp}: {e}")
            errors.append({'file': base, 'error': str(e)})

    total_size = 0
    for entry in log_data:
        if not entry['dry_run'] and os.path.exists(entry['new_path']):
            try:
                total_size += os.path.getsize(entry['new_path'])
            except OSError:
                pass

    return {
        'dry_run': dry_run,
        'total_processed': total,
        'total_moved': len([e for e in log_data if not e.get('dry_run')]),
        'total_size_bytes': total_size,
        'log_data': log_data,
        'moves': moves,
        'errors': errors,
    }


def undo_moves(moves: list[tuple[str, str]]) -> dict[str, Any]:
    success = 0
    failed = 0
    errors: list[str] = []
    for original_path, new_path in reversed(moves):
        try:
            if os.path.exists(new_path):
                parent = os.path.dirname(original_path)
                if not os.path.exists(parent):
                    os.makedirs(parent)
                shutil.move(new_path, original_path)
                success += 1
            else:
                errors.append(f"{os.path.basename(new_path)} no longer exists")
                failed += 1
        except Exception as e:
            errors.append(f"{os.path.basename(new_path)}: {e}")
            failed += 1
    return {'success': success, 'failed': failed, 'errors': errors}
