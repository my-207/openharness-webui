"""Background tasks management service."""

from __future__ import annotations

import json
import os
import time

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "data")
DATA_FILE = os.path.join(DATA_DIR, "tasks.json")


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


def list_tasks() -> list[dict]:
    return _load_data()


def get_task(task_id: str) -> dict | None:
    tasks = _load_data()
    for t in tasks:
        if t["id"] == task_id:
            return t
    return None


def create_task(data: dict) -> dict:
    tasks = _load_data()
    task = {
        "id": data.get("id", f"task_{int(time.time() * 1000)}"),
        "type": data.get("type", "agent"),
        "status": data.get("status", "running"),
        "description": data.get("description", ""),
        "metadata": data.get("metadata", {}),
        "output": data.get("output", ""),
        "created_at": data.get("created_at", time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())),
    }
    tasks.append(task)
    _save_data(tasks)
    return task


def stop_task(task_id: str) -> dict | None:
    tasks = _load_data()
    for t in tasks:
        if t["id"] == task_id:
            t["status"] = "stopped"
            _save_data(tasks)
            return t
    return None
