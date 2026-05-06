"""Authentication status management service."""

from __future__ import annotations

import json
import os
from typing import Any

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "data")
AUTH_FILE = os.path.join(DATA_DIR, "auth.json")

_DEFAULT_SOURCES = [
    {"name": "anthropic_api_key", "type": "api_key", "status": "missing", "info": ""},
    {"name": "openai_api_key", "type": "api_key", "status": "missing", "info": ""},
    {"name": "dashscope_api_key", "type": "api_key", "status": "missing", "info": ""},
    {"name": "github_copilot", "type": "oauth", "status": "missing", "info": ""},
    {"name": "codex_token", "type": "file", "status": "missing", "info": ""},
    {"name": "claude_credentials", "type": "file", "status": "missing", "info": ""},
]

_DEFAULT_PROVIDER_STATUS = [
    {"name": "anthropic", "configured": False, "auth_source": "anthropic_api_key"},
    {"name": "openai", "configured": False, "auth_source": "openai_api_key"},
    {"name": "dashscope", "configured": False, "auth_source": "dashscope_api_key"},
    {"name": "copilot", "configured": False, "auth_source": "github_copilot"},
    {"name": "codex", "configured": False, "auth_source": "codex_token"},
    {"name": "claude", "configured": False, "auth_source": "claude_credentials"},
]


def _load_data() -> dict[str, Any]:
    if not os.path.exists(AUTH_FILE):
        os.makedirs(DATA_DIR, exist_ok=True)
        data = {"sources": _DEFAULT_SOURCES, "providers": _DEFAULT_PROVIDER_STATUS}
        _save_data(data)
        return data
    with open(AUTH_FILE, "r") as f:
        return json.load(f)


def _save_data(data: dict[str, Any]) -> None:
    os.makedirs(DATA_DIR, exist_ok=True)
    with open(AUTH_FILE, "w") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)


def get_auth_sources() -> list[dict]:
    data = _load_data()
    return data.get("sources", _DEFAULT_SOURCES)


def get_provider_auth_status() -> list[dict]:
    data = _load_data()
    return data.get("providers", _DEFAULT_PROVIDER_STATUS)


def logout_provider(provider: str) -> None:
    data = _load_data()
    for src in data.get("sources", []):
        if src["name"].startswith(provider) or provider in src["name"]:
            src["status"] = "missing"
            src["info"] = ""
    for prov in data.get("providers", []):
        if prov["name"] == provider:
            prov["configured"] = False
    _save_data(data)
