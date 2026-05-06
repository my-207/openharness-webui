"""Skills management service."""

from __future__ import annotations

import json
import os
import time

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "data")
DATA_FILE = os.path.join(DATA_DIR, "skills.json")


def _ensure_data_file() -> None:
    os.makedirs(DATA_DIR, exist_ok=True)
    if not os.path.exists(DATA_FILE):
        _save_data([])


def _load_data() -> list[dict]:
    _ensure_data_file()
    try:
        with open(DATA_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except (json.JSONDecodeError, FileNotFoundError):
        return []


def _save_data(data: list[dict]) -> None:
    os.makedirs(DATA_DIR, exist_ok=True)
    with open(DATA_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)


def list_skills() -> list[dict]:
    return _load_data()


def get_skill(name: str) -> dict | None:
    skills = _load_data()
    for s in skills:
        if s["name"] == name:
            return s
    return None


def create_skill(data: dict) -> dict:
    skills = _load_data()
    skill = {
        "name": data.get("name", ""),
        "description": data.get("description", ""),
        "content": data.get("content", ""),
        "source": data.get("source", "manual"),
        "enabled": data.get("enabled", True),
        "created_at": data.get("created_at", time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())),
    }
    skills.append(skill)
    _save_data(skills)
    return skill


def delete_skill(name: str) -> bool:
    skills = _load_data()
    new_skills = [s for s in skills if s["name"] != name]
    if len(new_skills) == len(skills):
        return False
    _save_data(new_skills)
    return True


def enable_skill(name: str) -> bool:
    skills = _load_data()
    for s in skills:
        if s["name"] == name:
            s["enabled"] = True
            _save_data(skills)
            return True
    return False


def disable_skill(name: str) -> bool:
    skills = _load_data()
    for s in skills:
        if s["name"] == name:
            s["enabled"] = False
            _save_data(skills)
            return True
    return False


def toggle_skill(name: str) -> bool:
    skills = _load_data()
    for s in skills:
        if s["name"] == name:
            s["enabled"] = not s["enabled"]
            _save_data(skills)
            return True
    return False
