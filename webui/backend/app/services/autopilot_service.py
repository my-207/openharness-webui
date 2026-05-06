"""Autopilot management service."""

from __future__ import annotations

import json
import os
from datetime import datetime
from typing import Any

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "data")
AUTOPILOT_FILE = os.path.join(DATA_DIR, "autopilot.json")


def _default_data() -> dict[str, Any]:
    return {
        "status": {"active": False, "scanned_files": 0, "entries_count": 0, "last_scan": None},
        "entries": [],
    }


def _load_data() -> dict[str, Any]:
    if not os.path.exists(AUTOPILOT_FILE):
        os.makedirs(DATA_DIR, exist_ok=True)
        data = _default_data()
        _save_data(data)
        return data
    with open(AUTOPILOT_FILE, "r") as f:
        return json.load(f)


def _save_data(data: dict[str, Any]) -> None:
    os.makedirs(DATA_DIR, exist_ok=True)
    with open(AUTOPILOT_FILE, "w") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)


def get_status() -> dict:
    data = _load_data()
    return data.get("status", _default_data()["status"])


def list_entries() -> list[dict]:
    data = _load_data()
    return data.get("entries", [])


def add_entry(entry_data: dict) -> dict:
    data = _load_data()
    entry = {
        "path": entry_data.get("path", ""),
        "context": entry_data.get("context", ""),
        "priority": entry_data.get("priority", "medium"),
        "status": "pending",
        "created_at": datetime.now().isoformat(),
    }
    data.setdefault("entries", []).append(entry)
    data["status"]["entries_count"] = len(data["entries"])
    _save_data(data)
    return entry


def trigger_scan() -> dict:
    data = _load_data()
    data["status"]["active"] = True
    data["status"]["scanned_files"] = data["status"].get("scanned_files", 0) + 1
    data["status"]["last_scan"] = datetime.now().isoformat()
    _save_data(data)
    return data["status"]


def run_next() -> dict:
    data = _load_data()
    entries = data.get("entries", [])
    pending = [e for e in entries if e.get("status") == "pending"]
    if pending:
        pending[0]["status"] = "processing"
        _save_data(data)
        return {"message": "Processing next entry", "entry": pending[0]}
    return {"message": "No pending entries", "entry": None}


def export_dashboard() -> dict:
    data = _load_data()
    return {"status": data.get("status"), "entries_count": len(data.get("entries", []))}
