"""Cron job scheduler management service."""

from __future__ import annotations

import json
import os
import time

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "data")
DATA_FILE = os.path.join(DATA_DIR, "cron_jobs.json")

_SCHEDULER_STATUS_FILE = os.path.join(DATA_DIR, "scheduler_status.json")


def _ensure_data_file() -> None:
    os.makedirs(DATA_DIR, exist_ok=True)
    if not os.path.exists(DATA_FILE):
        _save_data([])
    if not os.path.exists(_SCHEDULER_STATUS_FILE):
        with open(_SCHEDULER_STATUS_FILE, "w", encoding="utf-8") as f:
            json.dump({"enabled": False}, f, indent=2)


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


def _load_scheduler_status() -> dict:
    _ensure_data_file()
    try:
        with open(_SCHEDULER_STATUS_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except (json.JSONDecodeError, FileNotFoundError):
        return {"enabled": False}


def _save_scheduler_status(data: dict) -> None:
    os.makedirs(DATA_DIR, exist_ok=True)
    with open(_SCHEDULER_STATUS_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)


def get_scheduler_status() -> dict:
    return _load_scheduler_status()


def toggle_scheduler(enabled: bool) -> dict:
    status = _load_scheduler_status()
    status["enabled"] = enabled
    _save_scheduler_status(status)
    return status


def list_jobs() -> list[dict]:
    return _load_data()


def create_job(data: dict) -> dict:
    jobs = _load_data()
    now = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    job = {
        "name": data.get("name", ""),
        "schedule": data.get("schedule", ""),
        "command": data.get("command", ""),
        "status": data.get("status", "disabled"),
        "last_run": data.get("last_run", None),
        "next_run": data.get("next_run", None),
        "history": data.get("history", []),
    }
    jobs.append(job)
    _save_data(jobs)
    return job


def delete_job(name: str) -> bool:
    jobs = _load_data()
    new_jobs = [j for j in jobs if j["name"] != name]
    if len(new_jobs) == len(jobs):
        return False
    _save_data(new_jobs)
    return True


def toggle_job(name: str) -> dict | None:
    jobs = _load_data()
    for j in jobs:
        if j["name"] == name:
            j["status"] = "enabled" if j["status"] == "disabled" else "disabled"
            _save_data(jobs)
            return j
    return None


def get_job_history(name: str) -> list[dict]:
    jobs = _load_data()
    for j in jobs:
        if j["name"] == name:
            return j.get("history", [])
    return []
