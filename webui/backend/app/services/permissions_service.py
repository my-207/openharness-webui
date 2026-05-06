"""Permissions configuration service."""

from __future__ import annotations

import json
import os

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "data")
DATA_FILE = os.path.join(DATA_DIR, "permissions.json")

_DEFAULT_PERMISSIONS = {
    "mode": "default",
    "path_rules": [],
    "denied_commands": [],
    "allowed_tools": [],
    "disallowed_tools": [],
}


def _ensure_data_file() -> None:
    os.makedirs(DATA_DIR, exist_ok=True)
    if not os.path.exists(DATA_FILE):
        _save_data(_DEFAULT_PERMISSIONS.copy())


def _load_data() -> dict:
    _ensure_data_file()
    try:
        with open(DATA_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except (json.JSONDecodeError, FileNotFoundError):
        return _DEFAULT_PERMISSIONS.copy()


def _save_data(data: dict) -> None:
    os.makedirs(DATA_DIR, exist_ok=True)
    with open(DATA_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)


def get_permissions() -> dict:
    perms = _load_data()
    merged = _DEFAULT_PERMISSIONS.copy()
    merged.update(perms)
    return merged


def update_permissions(updates: dict) -> dict:
    perms = _load_data()
    perms.update(updates)
    _save_data(perms)
    merged = _DEFAULT_PERMISSIONS.copy()
    merged.update(perms)
    return merged
