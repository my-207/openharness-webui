"""Memory management service."""

from __future__ import annotations

import json
import os
import time

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "data")
DATA_FILE = os.path.join(DATA_DIR, "memory.json")


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


def list_memories() -> list[dict]:
    return _load_data()


def get_memory(memory_id: str) -> dict | None:
    memories = _load_data()
    for m in memories:
        if m["id"] == memory_id:
            return m
    return None


def create_memory(data: dict) -> dict:
    memories = _load_data()
    now = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    memory = {
        "id": data.get("id", f"mem_{int(time.time() * 1000)}"),
        "content": data.get("content", ""),
        "tags": data.get("tags", []),
        "created_at": data.get("created_at", now),
        "updated_at": data.get("updated_at", now),
    }
    memories.append(memory)
    _save_data(memories)
    return memory


def update_memory(memory_id: str, updates: dict) -> dict | None:
    memories = _load_data()
    for m in memories:
        if m["id"] == memory_id:
            m.update(updates)
            m["updated_at"] = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
            _save_data(memories)
            return m
    return None


def delete_memory(memory_id: str) -> bool:
    memories = _load_data()
    new_memories = [m for m in memories if m["id"] != memory_id]
    if len(new_memories) == len(memories):
        return False
    _save_data(new_memories)
    return True


def search_memories(query: str) -> list[dict]:
    memories = _load_data()
    q = query.lower()
    results = []
    for m in memories:
        if q in m.get("content", "").lower():
            results.append(m)
            continue
        for tag in m.get("tags", []):
            if q in tag.lower():
                results.append(m)
                break
    return results


# Alias for router compatibility
list_memory = list_memories
search_memory = search_memories
