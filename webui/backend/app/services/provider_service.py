"""Provider profile management REST API."""

from __future__ import annotations

import json
import os
from pathlib import Path

from pydantic import BaseModel

PROFILES_DIR = Path.home() / ".openharness" / "provider_profiles"
PROFILES_DIR.mkdir(parents=True, exist_ok=True)
SETTINGS_PATH = Path.home() / ".openharness" / "settings.json"


def _load_profiles() -> dict[str, dict]:
    profiles: dict[str, dict] = {}
    if PROFILES_DIR.exists():
        for f in PROFILES_DIR.iterdir():
            if f.suffix == ".json":
                try:
                    data = json.loads(f.read_text())
                    profiles[f.stem] = data
                except Exception:
                    continue
    return profiles


def _save_profile(name: str, data: dict) -> None:
    (PROFILES_DIR / f"{name}.json").write_text(json.dumps(data, indent=2))


def _delete_profile(name: str) -> None:
    path = PROFILES_DIR / f"{name}.json"
    if path.exists():
        path.unlink()


def _get_active_profile() -> str | None:
    try:
        if SETTINGS_PATH.exists():
            settings = json.loads(SETTINGS_PATH.read_text())
            return settings.get("active_profile")
    except Exception:
        pass
    return None


def _set_active_profile(name: str) -> None:
    settings = {}
    if SETTINGS_PATH.exists():
        try:
            settings = json.loads(SETTINGS_PATH.read_text())
        except Exception:
            pass
    settings["active_profile"] = name
    SETTINGS_PATH.write_text(json.dumps(settings, indent=2))


def list_profiles() -> list[dict]:
    active = _get_active_profile()
    profiles = _load_profiles()
    result = []
    for name, data in profiles.items():
        profile = {
            "name": name,
            "label": data.get("label", name),
            "provider": data.get("provider", ""),
            "api_format": data.get("api_format", ""),
            "auth_source": data.get("auth_source", ""),
            "model": data.get("model") or data.get("last_model") or data.get("default_model") or "",
            "base_url": data.get("base_url"),
            "configured": bool(data.get("api_key") or data.get("auth_data")),
            "active": name == active,
            "credential_slot": data.get("credential_slot"),
            "allowed_models": data.get("allowed_models"),
            "context_window_tokens": data.get("context_window_tokens"),
            "auto_compact_threshold_tokens": data.get("auto_compact_threshold_tokens"),
        }
        result.append(profile)
    return result


def create_profile(data: dict) -> None:
    name = data.pop("name", "")
    if not name:
        raise ValueError("name is required")
    # Separate api_key from profile data
    api_key = data.pop("api_key", None)
    profile_data = {**data}
    if api_key:
        profile_data["api_key"] = api_key
    _save_profile(name, profile_data)


def update_profile(name: str, data: dict) -> None:
    profiles = _load_profiles()
    existing = profiles.get(name, {})
    api_key = data.pop("api_key", None)
    existing.update(data)
    if api_key:
        existing["api_key"] = api_key
    _save_profile(name, existing)


def delete_profile(name: str) -> None:
    _delete_profile(name)


def switch_profile(name: str) -> None:
    profiles = _load_profiles()
    if name not in profiles:
        raise ValueError(f"Profile '{name}' not found")
    _set_active_profile(name)


# ─── HTTP helpers ───

import time as _time
import httpx as _httpx


def _models_url(base_url: str) -> str:
    """Build the models list URL intelligently based on the base URL."""
    url = base_url.rstrip("/")
    if url.endswith("/v1"):
        return f"{url}/models"
    return f"{url}/v1/models"


def _chat_completions_url(base_url: str) -> str:
    """Build the chat completions URL for OpenAI-compatible APIs."""
    url = base_url.rstrip("/")
    if url.endswith("/v1"):
        return f"{url}/chat/completions"
    return f"{url}/v1/chat/completions"


async def test_connection(name: str) -> dict:
    """Test connectivity to a provider's API."""
    profiles = _load_profiles()
    if name not in profiles:
        raise ValueError(f"Profile '{name}' not found")

    data = profiles[name]
    api_format = data.get("api_format", "")
    base_url = data.get("base_url", "")
    api_key = data.get("api_key", "")
    model = data.get("model") or data.get("last_model") or data.get("default_model") or ""

    result = {"success": False, "message": "", "latency_ms": 0, "models": []}
    start = _time.time()

    try:
        if not base_url:
            raise ValueError("base_url is not configured")

        headers = {"Content-Type": "application/json"}

        if api_format == "openai":
            headers["Authorization"] = f"Bearer {api_key}"
            async with _httpx.AsyncClient(timeout=10) as client:
                resp = await client.get(_models_url(base_url), headers=headers)
                if resp.status_code == 200:
                    result["success"] = True
                    result["message"] = "Connection successful"
                    result["models"] = [m["id"] for m in resp.json().get("data", [])]
                else:
                    result["message"] = f"HTTP {resp.status_code}: {resp.text[:200]}"

        elif api_format == "anthropic":
            headers["x-api-key"] = api_key
            headers["anthropic-version"] = "2023-06-01"
            async with _httpx.AsyncClient(timeout=10) as client:
                resp = await client.post(
                    _chat_url(base_url),
                    headers=headers,
                    json={"model": model or "claude-sonnet-4-20250514", "max_tokens": 1, "messages": [{"role": "user", "content": "hi"}]},
                )
                result["success"] = resp.status_code < 400
                result["message"] = "Connection successful" if result["success"] else f"HTTP {resp.status_code}: {resp.text[:200]}"

        else:
            # Generic OpenAI-compatible fallback
            headers["Authorization"] = f"Bearer {api_key}"
            async with _httpx.AsyncClient(timeout=10) as client:
                resp = await client.get(_models_url(base_url), headers=headers)
                result["success"] = resp.status_code < 500
                result["message"] = "Connection successful" if result["success"] else f"HTTP {resp.status_code}"

    except Exception as e:
        result["message"] = str(e)

    result["latency_ms"] = int((_time.time() - start) * 1000)
    return result


async def list_provider_models(name: str) -> list[str]:
    """Fetch available models from a provider's API."""
    profiles = _load_profiles()
    if name not in profiles:
        raise ValueError(f"Profile '{name}' not found")

    data = profiles[name]
    api_format = data.get("api_format", "")
    base_url = data.get("base_url", "")
    api_key = data.get("api_key", "")

    # First return allowed_models if configured
    allowed = data.get("allowed_models", [])
    if allowed:
        return allowed

    # Try fetching from API
    try:
        headers = {"Content-Type": "application/json"}

        if api_format in ("openai",):
            headers["Authorization"] = f"Bearer {api_key}"
            async with _httpx.AsyncClient(timeout=10) as client:
                resp = await client.get(_models_url(base_url), headers=headers)
                if resp.status_code == 200:
                    return [m["id"] for m in resp.json().get("data", [])]
    except Exception:
        pass

    return []


# ─── Chat Completion ───

async def stream_chat_with_model(
    messages: list[dict],
    profile_name: str | None = None,
):
    """Stream text chunks from the active provider's chat completions API.

    Yields (chunk_text, is_done) tuples.  When is_done is True, chunk_text
    contains the complete assistant response.
    """
    profiles = _load_profiles()
    if not profiles:
        raise ValueError("No provider profiles configured")

    if profile_name:
        if profile_name not in profiles:
            raise ValueError(f"Profile '{profile_name}' not found")
        data = profiles[profile_name]
    else:
        active = _get_active_profile()
        if active and active in profiles:
            data = profiles[active]
        else:
            data = next(iter(profiles.values()))

    api_format = data.get("api_format", "")
    base_url = data.get("base_url", "")
    api_key = data.get("api_key", "")
    model = data.get("model") or data.get("last_model") or data.get("default_model") or ""

    if not base_url:
        raise ValueError("base_url is not configured")
    if not api_key:
        raise ValueError("api_key is not configured")
    if not model:
        raise ValueError("model is not configured")

    headers = {"Content-Type": "application/json"}
    if api_format == "anthropic":
        headers["x-api-key"] = api_key
        headers["anthropic-version"] = "2023-06-01"
        url = _chat_completions_url(base_url)
        body = {
            "model": model,
            "max_tokens": 4096,
            "messages": messages,
            "stream": True,
        }
    else:
        headers["Authorization"] = f"Bearer {api_key}"
        url = _chat_completions_url(base_url)
        body = {
            "model": model,
            "messages": messages,
            "stream": True,
        }

    full_text = ""
    async with _httpx.AsyncClient(timeout=120) as client:
        async with client.stream("POST", url, headers=headers, json=body) as resp:
            if resp.status_code != 200:
                text = await resp.aread()
                raise ValueError(f"HTTP {resp.status_code}: {text.decode('utf-8', errors='replace')[:500]}")

            async for line_bytes in resp.aiter_lines():
                line = line_bytes.strip()
                if not line or not line.startswith("data: "):
                    continue
                data_str = line[6:].strip()
                if data_str == "[DONE]":
                    break
                try:
                    chunk = json.loads(data_str)
                except json.JSONDecodeError:
                    continue
                choices = chunk.get("choices", [])
                if not choices:
                    continue
                delta = choices[0].get("delta", {})
                content = delta.get("content", "")
                if content:
                    full_text += content
                    yield (content, False)

    yield (full_text, True)
