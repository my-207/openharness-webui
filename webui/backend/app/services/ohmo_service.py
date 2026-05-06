"""OhMo (personal agent) management service."""

from __future__ import annotations

import json
import os
from datetime import datetime
from typing import Any

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "data")
OHMO_FILE = os.path.join(DATA_DIR, "ohmo.json")

_DEFAULT_CHANNELS = [
    {"platform": "telegram", "enabled": False, "config": {}},
    {"platform": "slack", "enabled": False, "config": {}},
    {"platform": "discord", "enabled": False, "config": {}},
    {"platform": "feishu", "enabled": False, "config": {}},
]


def _default_data() -> dict[str, Any]:
    return {
        "workspace": {"path": os.getcwd(), "file_count": 0, "files": []},
        "gateway": {"status": "stopped", "pid": None, "uptime": None},
        "channels": _DEFAULT_CHANNELS,
        "memory": [],
    }


def _load_data() -> dict[str, Any]:
    if not os.path.exists(OHMO_FILE):
        os.makedirs(DATA_DIR, exist_ok=True)
        data = _default_data()
        _save_data(data)
        return data
    with open(OHMO_FILE, "r") as f:
        return json.load(f)


def _save_data(data: dict[str, Any]) -> None:
    os.makedirs(DATA_DIR, exist_ok=True)
    with open(OHMO_FILE, "w") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)


def get_workspace() -> dict:
    data = _load_data()
    ws = data.get("workspace", _default_data()["workspace"])
    # Refresh file count from actual filesystem
    ws_path = ws.get("path", os.getcwd())
    try:
        files = [f for f in os.listdir(ws_path) if not f.startswith(".")]
        ws["file_count"] = len(files)
        ws["files"] = files[:100]  # limit to 100 files
    except Exception:
        pass
    return ws


def get_gateway_status() -> dict:
    data = _load_data()
    return data.get("gateway", _default_data()["gateway"])


def start_gateway() -> dict:
    data = _load_data()
    data["gateway"]["status"] = "running"
    data["gateway"]["pid"] = 12345  # mock PID
    data["gateway"]["uptime"] = datetime.now().isoformat()
    _save_data(data)
    return data["gateway"]


def stop_gateway() -> dict:
    data = _load_data()
    data["gateway"]["status"] = "stopped"
    data["gateway"]["pid"] = None
    data["gateway"]["uptime"] = None
    _save_data(data)
    return data["gateway"]


def restart_gateway() -> dict:
    stop_gateway()
    return start_gateway()


def get_channels() -> list[dict]:
    data = _load_data()
    return data.get("channels", _DEFAULT_CHANNELS)


def update_channels(channels_data: list[dict]) -> list[dict]:
    data = _load_data()
    data["channels"] = channels_data
    _save_data(data)
    return data["channels"]
