"""Tools and MCP server management service."""

from __future__ import annotations

import json
import os
import time

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "data")
DATA_FILE = os.path.join(DATA_DIR, "mcp_servers.json")

_MOCK_TOOLS = [
    {
        "name": "read_file",
        "description": "Read the contents of a file from the filesystem",
        "category": "filesystem",
        "required_args": ["file_path"],
        "optional_args": ["offset", "limit"],
    },
    {
        "name": "write_to_file",
        "description": "Write content to a file on the filesystem",
        "category": "filesystem",
        "required_args": ["file_path", "content"],
        "optional_args": [],
    },
    {
        "name": "search_content",
        "description": "Search for text patterns across files using regex",
        "category": "search",
        "required_args": ["pattern"],
        "optional_args": ["path", "glob", "case_sensitive"],
    },
    {
        "name": "execute_command",
        "description": "Execute a shell command on the system",
        "category": "shell",
        "required_args": ["command"],
        "optional_args": ["working_dir", "timeout"],
    },
    {
        "name": "web_search",
        "description": "Search the web for real-time information",
        "category": "web",
        "required_args": ["query"],
        "optional_args": ["max_results", "language"],
    },
    {
        "name": "image_gen",
        "description": "Generate images from text descriptions",
        "category": "media",
        "required_args": ["prompt"],
        "optional_args": ["size", "style", "quality"],
    },
    {
        "name": "list_dir",
        "description": "List files and directories in a given path",
        "category": "filesystem",
        "required_args": ["target_directory"],
        "optional_args": [],
    },
]


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


def list_tools() -> list[dict]:
    return _MOCK_TOOLS


def list_mcp_servers() -> list[dict]:
    return _load_data()


def add_mcp_server(data: dict) -> dict:
    servers = _load_data()
    server = {
        "name": data.get("name", ""),
        "transport": data.get("transport", "stdio"),
        "command": data.get("command", ""),
        "url": data.get("url", ""),
        "args": data.get("args", []),
        "status": data.get("status", "disconnected"),
        "tools_count": data.get("tools_count", 0),
        "resources_count": data.get("resources_count", 0),
    }
    servers.append(server)
    _save_data(servers)
    return server


def remove_mcp_server(name: str) -> bool:
    servers = _load_data()
    new_servers = [s for s in servers if s["name"] != name]
    if len(new_servers) == len(servers):
        return False
    _save_data(new_servers)
    return True
