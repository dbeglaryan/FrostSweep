"""Configuration management: load/save config, categories, recent folders."""

from __future__ import annotations

import json
import logging
import os
from typing import Any

logger = logging.getLogger(__name__)

ConfigDict = dict[str, Any]

DEFAULT_CONFIG: ConfigDict = {
    'documents': ['.pdf', '.docx', '.doc', '.txt', '.xlsx', '.pptx', '.csv'],
    'image': ['.jpeg', '.jpg', '.webp', '.svg', '.png', '.gif', '.bmp', '.tiff'],
    'music': ['.mp3', '.wav', '.flac', '.aac', '.ogg'],
    'video': ['.mp4', '.mov', '.avi', '.mkv', '.wmv'],
    'setup_files': ['.exe', '.msi', '.dmg', '.deb', '.rpm'],
    'compressed_files': ['.zip', '.rar', '.7z', '.tar', '.gz'],
    'other_files': ['.psd', '.ai', '.eps'],
    'documents_location': os.path.expanduser("~/Downloads/PDF"),
    'image_location': os.path.expanduser("~/Downloads/Image"),
    'music_location': os.path.expanduser("~/Downloads/Music"),
    'video_location': os.path.expanduser("~/Downloads/Video"),
    'setup_files_location': os.path.expanduser("~/Downloads/EXE"),
    'compressed_files_location': os.path.expanduser("~/Downloads/ZIP"),
    'other_files_location': os.path.expanduser("~/Downloads/Other"),
}


def get_default_config() -> ConfigDict:
    return dict(DEFAULT_CONFIG)


def load_config(config_path: str) -> ConfigDict:
    config = get_default_config()
    try:
        if os.path.exists(config_path):
            with open(config_path, 'r') as f:
                loaded = json.load(f)
                config.update(loaded)
    except Exception as e:
        logger.error(f"Failed to load config: {e}")
    return config


def save_config(config_path: str, config: ConfigDict) -> None:
    try:
        with open(config_path, 'w') as f:
            json.dump(config, f, indent=4)
    except Exception as e:
        logger.error(f"Failed to save config: {e}")


def get_categories(config: ConfigDict) -> list[str]:
    categories = [k for k, v in config.items() if isinstance(v, list)]
    if 'other_files' not in categories:
        categories.append('other_files')
    return categories


def add_category(
    config: ConfigDict,
    name: str,
    extensions: list[str],
    destination: str | None = None,
) -> tuple[ConfigDict, str | None]:
    raw = name.strip()
    if not raw:
        return config, "Please enter a category name."
    key = raw.lower().replace(' ', '_')
    if key == 'other_files':
        return config, "'other_files' is reserved as a catch-all."
    categories = get_categories(config)
    if key in categories:
        return config, f"Category '{key}' already exists."
    dest = destination or os.path.expanduser(f"~/Downloads/{raw.title()}")
    exts = [e.strip() for e in extensions if e.strip()]
    exts = [e if e.startswith('.') else f'.{e}' for e in exts]
    config[key] = exts
    config[f"{key}_location"] = dest
    return config, None


def delete_category(
    config: ConfigDict, name: str,
) -> tuple[ConfigDict, str | None]:
    if name == 'other_files':
        return config, "Cannot delete the catch-all category."
    config.pop(name, None)
    config.pop(f"{name}_location", None)
    return config, None


def update_config_from_categories(
    category_data: list[dict[str, Any]],
    existing_config: ConfigDict | None = None,
) -> ConfigDict:
    """Merge category data into existing config (or build fresh if none provided).
    Each dict: {name, extensions: list[str], destination: str}
    """
    new_cfg: ConfigDict = dict(existing_config) if existing_config else {}
    # Remove old category keys that aren't in the new data
    new_names = {cat['name'] for cat in category_data}
    old_categories = [k for k, v in new_cfg.items() if isinstance(v, list)]
    for old_cat in old_categories:
        if old_cat not in new_names:
            new_cfg.pop(old_cat, None)
            new_cfg.pop(f"{old_cat}_location", None)
    # Apply new category data
    for cat in category_data:
        name = cat['name']
        exts = [e.strip() for e in cat.get('extensions', []) if e.strip()]
        exts = [e if e.startswith('.') else f'.{e}' for e in exts]
        new_cfg[name] = exts
        new_cfg[f"{name}_location"] = cat.get('destination', '')
    if 'other_files' not in new_cfg:
        new_cfg['other_files'] = []
        new_cfg['other_files_location'] = os.path.expanduser('~/Downloads/Other')
    return new_cfg


def load_recent_folders(path: str) -> list[str]:
    try:
        if os.path.exists(path):
            with open(path, 'r') as f:
                data = json.load(f)
                if isinstance(data, list):
                    return data[:5]
        return []
    except (json.JSONDecodeError, OSError) as e:
        logger.warning(f"Failed to load recent folders: {e}")
        return []


def save_recent_folder(
    path: str, folder: str, current: list[str],
) -> list[str]:
    folders = list(current)
    if folder in folders:
        folders.remove(folder)
    folders.insert(0, folder)
    folders = folders[:5]
    try:
        with open(path, 'w') as f:
            json.dump(folders, f)
    except Exception as e:
        logger.warning(f"Failed to save recent folders: {e}")
    return folders
