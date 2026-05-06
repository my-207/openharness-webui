"""Plugins management service."""

from __future__ import annotations

import json
import os

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "data")
DATA_FILE = os.path.join(DATA_DIR, "plugins.json")


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


def list_plugins() -> list[dict]:
    return _load_data()


def install_plugin(data: dict) -> dict:
    plugins = _load_data()
    plugin = {
        "name": data.get("name", ""),
        "version": data.get("version", "1.0.0"),
        "description": data.get("description", ""),
        "enabled": data.get("enabled", True),
        "source": data.get("source", ""),
        "commands": data.get("commands", []),
        "hooks": data.get("hooks", []),
        "agent_type": data.get("agent_type", ""),
        "mcp_config": data.get("mcp_config", {}),
    }
    plugins.append(plugin)
    _save_data(plugins)
    return plugin


def uninstall_plugin(name: str) -> bool:
    plugins = _load_data()
    new_plugins = [p for p in plugins if p["name"] != name]
    if len(new_plugins) == len(plugins):
        return False
    _save_data(new_plugins)
    return True


def enable_plugin(name: str) -> bool:
    plugins = _load_data()
    for p in plugins:
        if p["name"] == name:
            p["enabled"] = True
            _save_data(plugins)
            return True
    return False


def disable_plugin(name: str) -> bool:
    plugins = _load_data()
    for p in plugins:
        if p["name"] == name:
            p["enabled"] = False
            _save_data(plugins)
            return True
    return False


def toggle_plugin(name: str) -> bool:
    plugins = _load_data()
    for p in plugins:
        if p["name"] == name:
            p["enabled"] = not p["enabled"]
            _save_data(plugins)
            return True
    return False
