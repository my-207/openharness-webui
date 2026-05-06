"""Swarm teammates/agents management service."""

from __future__ import annotations

import json
import os
import time

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "data")
DATA_FILE = os.path.join(DATA_DIR, "swarm.json")

_MOCK_SWARM_DATA = [
    {
        "name": "team-lead",
        "id": "agent_001",
        "status": "idle",
        "duration_seconds": 0,
        "current_task": "",
        "notifications": [],
    },
    {
        "name": "backend-svc",
        "id": "agent_002",
        "status": "idle",
        "duration_seconds": 0,
        "current_task": "",
        "notifications": [],
    },
    {
        "name": "frontend-svc",
        "id": "agent_003",
        "status": "idle",
        "duration_seconds": 0,
        "current_task": "",
        "notifications": [],
    },
]


def _ensure_data_file() -> None:
    os.makedirs(DATA_DIR, exist_ok=True)
    if not os.path.exists(DATA_FILE):
        _save_data(_MOCK_SWARM_DATA)


def _load_data() -> list[dict]:
    _ensure_data_file()
    try:
        with open(DATA_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except (json.JSONDecodeError, FileNotFoundError):
        return _MOCK_SWARM_DATA.copy()


def _save_data(data: list[dict]) -> None:
    os.makedirs(DATA_DIR, exist_ok=True)
    with open(DATA_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)


def list_agents() -> list[dict]:
    return _load_data()


def get_agent(agent_id: str) -> dict | None:
    agents = _load_data()
    for a in agents:
        if a["id"] == agent_id:
            return a
    return None


def update_agent_status(agent_id: str, status: str, current_task: str = "") -> dict | None:
    agents = _load_data()
    for a in agents:
        if a["id"] == agent_id:
            a["status"] = status
            a["current_task"] = current_task
            _save_data(agents)
            return a
    return None


def add_notification(agent_id: str, message: str, notif_type: str = "info") -> dict | None:
    agents = _load_data()
    for a in agents:
        if a["id"] == agent_id:
            a["notifications"].append({
                "time": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
                "message": message,
                "type": notif_type,
            })
            _save_data(agents)
            return a
    return None


# ─── Router aliases ───
list_teammates = list_agents


def create_team(data: dict) -> dict:
    agents = _load_data()
    team = {
        "name": data.get("name", ""),
        "id": f"team-{int(time.time())}",
        "status": "idle",
        "duration_seconds": 0,
        "current_task": "",
        "created_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
    }
    agents.append(team)
    _save_data(agents)
    return team


def delete_team(name: str) -> bool:
    agents = _load_data()
    new_agents = [a for a in agents if a.get("name") != name]
    if len(new_agents) == len(agents):
        return False
    _save_data(new_agents)
    return True


def list_notifications() -> list[dict]:
    agents = _load_data()
    all_notifs = []
    for a in agents:
        for n in a.get("notifications", []):
            all_notifs.append(n)
    return all_notifs[-50:]
