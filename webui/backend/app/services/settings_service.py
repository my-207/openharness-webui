"""Application settings service."""

from __future__ import annotations

import json
import os

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "data")
DATA_FILE = os.path.join(DATA_DIR, "settings.json")

_DEFAULT_SETTINGS = {
    "theme": "dark",
    "effort_level": "balanced",
    "output_style": "normal",
    "fast_mode": False,
    "vim_mode": False,
    "voice_mode": False,
    "debug_mode": False,
    "bare_mode": False,
    "max_turns": 50,
    "auto_compact": True,
    "system_prompt": "",
    "verbose": False,
}


def _ensure_data_file() -> None:
    os.makedirs(DATA_DIR, exist_ok=True)
    if not os.path.exists(DATA_FILE):
        _save_data(_DEFAULT_SETTINGS.copy())


def _load_data() -> dict:
    _ensure_data_file()
    try:
        with open(DATA_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except (json.JSONDecodeError, FileNotFoundError):
        return _DEFAULT_SETTINGS.copy()


def _save_data(data: dict) -> None:
    os.makedirs(DATA_DIR, exist_ok=True)
    with open(DATA_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)


def get_settings() -> dict:
    settings = _load_data()
    merged = _DEFAULT_SETTINGS.copy()
    merged.update(settings)
    return merged


def update_settings(updates: dict) -> dict:
    settings = _load_data()
    settings.update(updates)
    _save_data(settings)
    merged = _DEFAULT_SETTINGS.copy()
    merged.update(settings)
    return merged
