"""File filtering by size, date, and extension."""

import os
from datetime import datetime


def apply_filters(files, min_size_mb=None, max_size_mb=None,
                  after_date=None, before_date=None,
                  ext_whitelist=None, ext_blacklist=None):
    whitelist = _normalize_exts(ext_whitelist) if ext_whitelist else []
    blacklist = _normalize_exts(ext_blacklist) if ext_blacklist else []

    after_ts = _parse_date(after_date)
    before_ts = _parse_date(before_date)

    filtered = []
    for f in files:
        if not os.path.isfile(f):
            continue
        try:
            size_mb = os.path.getsize(f) / (1024 * 1024)
        except OSError:
            continue

        ext = os.path.splitext(f)[1].lower()

        if min_size_mb is not None and size_mb < min_size_mb:
            continue
        if max_size_mb is not None and size_mb > max_size_mb:
            continue
        if after_ts is not None:
            try:
                if os.path.getmtime(f) < after_ts:
                    continue
            except OSError:
                continue
        if before_ts is not None:
            try:
                if os.path.getmtime(f) > before_ts:
                    continue
            except OSError:
                continue
        if whitelist and ext not in whitelist:
            continue
        if blacklist and ext in blacklist:
            continue
        filtered.append(f)
    return filtered


def _normalize_exts(exts):
    result = []
    for e in exts:
        e = e.strip().lower()
        if e:
            result.append(e if e.startswith('.') else f'.{e}')
    return result


def _parse_date(date_str):
    if not date_str:
        return None
    try:
        return datetime.strptime(date_str, '%Y-%m-%d').timestamp()
    except ValueError:
        return None
