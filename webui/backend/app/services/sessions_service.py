"""Session management service."""

from __future__ import annotations

import json
import os
import time

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "data")
DATA_FILE = os.path.join(DATA_DIR, "sessions.json")


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


def list_sessions() -> list[dict]:
    return _load_data()


def get_session(session_id: str) -> dict | None:
    sessions = _load_data()
    for s in sessions:
        if s["id"] == session_id:
            return s
    return None


def create_session(data: dict) -> dict:
    sessions = _load_data()
    session = {
        "id": data.get("id", f"session_{int(time.time() * 1000)}"),
        "name": data.get("name", "New Session"),
        "model": data.get("model", ""),
        "provider": data.get("provider", ""),
        "created_at": data.get("created_at", time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())),
        "message_count": data.get("message_count", 0),
        "summary": data.get("summary", ""),
        "tags": data.get("tags", []),
    }
    sessions.append(session)
    _save_data(sessions)
    return session


def delete_session(session_id: str) -> bool:
    sessions = _load_data()
    new_sessions = [s for s in sessions if s["id"] != session_id]
    if len(new_sessions) == len(sessions):
        return False
    _save_data(new_sessions)
    return True
