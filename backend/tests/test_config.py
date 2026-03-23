"""Tests for config management."""
import json
from core.config import (
    load_config, save_config, get_categories, add_category,
    delete_category, load_recent_folders, save_recent_folder,
    update_config_from_categories,
)


def test_load_config_defaults(tmp_path):
    path = str(tmp_path / "nonexistent.json")
    config = load_config(path)
    assert 'documents' in config
    assert '.pdf' in config['documents']


def test_load_config_merges(tmp_path):
    path = tmp_path / "cfg.json"
    path.write_text(json.dumps({"documents": [".md"]}))
    config = load_config(str(path))
    assert config["documents"] == [".md"]
    assert "image" in config


def test_load_config_malformed(tmp_path):
    path = tmp_path / "cfg.json"
    path.write_text("{bad json!!")
    config = load_config(str(path))
    assert 'documents' in config


def test_save_config(tmp_path):
    path = str(tmp_path / "cfg.json")
    save_config(path, {"test": [".foo"]})
    loaded = json.loads((tmp_path / "cfg.json").read_text())
    assert loaded["test"] == [".foo"]


def test_get_categories():
    config = {"docs": [".pdf"], "docs_location": "/x", "image": [".jpg"], "image_location": "/y"}
    cats = get_categories(config)
    assert "docs" in cats
    assert "image" in cats
    assert "other_files" in cats


def test_add_category():
    config = {"other_files": []}
    config, err = add_category(config, "Fonts", [".ttf", "otf"], "/tmp/fonts")
    assert err is None
    assert config["fonts"] == [".ttf", ".otf"]
    assert config["fonts_location"] == "/tmp/fonts"


def test_add_category_empty_name():
    config, err = add_category({}, "", [".foo"])
    assert err is not None


def test_add_category_reserved():
    config, err = add_category({}, "Other Files", [".foo"])
    assert err is not None
    assert "reserved" in err.lower()


def test_add_category_duplicate():
    config = {"docs": [".pdf"]}
    config, err = add_category(config, "Docs", [".md"])
    assert err is not None
    assert "exists" in err.lower()


def test_delete_category():
    config = {"docs": [".pdf"], "docs_location": "/x"}
    config, err = delete_category(config, "docs")
    assert err is None
    assert "docs" not in config


def test_delete_other_files_blocked():
    config = {"other_files": []}
    config, err = delete_category(config, "other_files")
    assert err is not None


def test_update_config_from_categories():
    data = [
        {"name": "docs", "extensions": [".pdf", "txt"], "destination": "/docs"},
        {"name": "pics", "extensions": [".jpg"], "destination": "/pics"},
    ]
    config = update_config_from_categories(data)
    assert config["docs"] == [".pdf", ".txt"]
    assert config["pics"] == [".jpg"]
    assert "other_files" in config


def test_recent_folders_save_load(tmp_path):
    path = str(tmp_path / "recent.json")
    folders = save_recent_folder(path, "/a", [])
    folders = save_recent_folder(path, "/b", folders)
    assert folders == ["/b", "/a"]
    loaded = load_recent_folders(path)
    assert loaded == ["/b", "/a"]


def test_recent_folders_cap(tmp_path):
    path = str(tmp_path / "recent.json")
    folders = []
    for i in range(10):
        folders = save_recent_folder(path, f"/{i}", folders)
    assert len(folders) == 5


def test_recent_folders_dedup(tmp_path):
    path = str(tmp_path / "recent.json")
    folders = save_recent_folder(path, "/a", [])
    folders = save_recent_folder(path, "/b", folders)
    folders = save_recent_folder(path, "/a", folders)
    assert folders == ["/a", "/b"]
