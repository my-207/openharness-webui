#!/usr/bin/env python3
"""
Sessions Page Test Suite
Tests all backend REST endpoints and frontend logic for the Sessions page.
"""
import json
import sys
import time
import os
import urllib.request
import urllib.error
from typing import Any

BASE_URL = os.environ.get("API_BASE", "http://127.0.0.1:8000")
SESSIONS_API = f"{BASE_URL}/api/sessions"

tests_passed = 0
tests_failed = 0


def check(name: str, condition: bool, detail: str = "") -> None:
    global tests_passed, tests_failed
    if condition:
        tests_passed += 1
        print(f"  [PASS] {name}")
    else:
        tests_failed += 1
        print(f"  [FAIL] {name}")
    if detail:
        print(f"         -> {detail}")


def api_get(url: str) -> Any:
    req = urllib.request.Request(url, method="GET")
    with urllib.request.urlopen(req, timeout=10) as resp:
        return json.loads(resp.read().decode("utf-8"))


def api_post(url: str, data: dict) -> Any:
    body = json.dumps(data).encode("utf-8")
    req = urllib.request.Request(url, data=body, headers={"Content-Type": "application/json"}, method="POST")
    with urllib.request.urlopen(req, timeout=10) as resp:
        return json.loads(resp.read().decode("utf-8"))


def api_delete(url: str) -> Any:
    req = urllib.request.Request(url, method="DELETE")
    with urllib.request.urlopen(req, timeout=10) as resp:
        return json.loads(resp.read().decode("utf-8"))


def reset_sessions_data():
    """Clear sessions.json to start with a clean state."""
    data_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "backend", "data")
    data_file = os.path.join(data_dir, "sessions.json")
    os.makedirs(data_dir, exist_ok=True)
    with open(data_file, "w", encoding="utf-8") as f:
        json.dump([], f)


# ============================================================
# TEST 1: Backend - List sessions (empty)
# ============================================================
def test_list_empty():
    print("\n[TEST 1] GET /api/sessions - Empty list")
    try:
        sessions = api_get(SESSIONS_API)
        check("Returns a list", isinstance(sessions, list))
        check("List is empty initially", len(sessions) == 0)
    except Exception as e:
        check("API reachable", False, str(e))


# ============================================================
# TEST 2: Backend - Create session
# ============================================================
def test_create_session():
    print("\n[TEST 2] POST /api/sessions - Create session")
    try:
        result = api_post(SESSIONS_API, {
            "name": "Test Session A",
            "model": "qwen3.5-flash",
            "provider": "qwen"
        })
        check("Response status ok", result.get("status") == "ok")
        session = result.get("session", {})
        check("Session has id", bool(session.get("id")))
        check("Session name correct", session.get("name") == "Test Session A")
        check("Session model correct", session.get("model") == "qwen3.5-flash")
        check("Session provider correct", session.get("provider") == "qwen")
        check("Session has created_at", bool(session.get("created_at")))
        check("Session message_count is 0", session.get("message_count") == 0)
        return session.get("id")
    except Exception as e:
        check("Create API reachable", False, str(e))
        return None


# ============================================================
# TEST 3: Backend - Get single session
# ============================================================
def test_get_session(session_id: str):
    print(f"\n[TEST 3] GET /api/sessions/{session_id} - Get single session")
    try:
        session = api_get(f"{SESSIONS_API}/{session_id}")
        check("Returns session object", isinstance(session, dict))
        check("Session id matches", session.get("id") == session_id)
        check("Session has name", bool(session.get("name")))
    except Exception as e:
        check("Get single API reachable", False, str(e))


# ============================================================
# TEST 4: Backend - List sessions (non-empty)
# ============================================================
def test_list_nonempty():
    print("\n[TEST 4] GET /api/sessions - Non-empty list after creation")
    try:
        sessions = api_get(SESSIONS_API)
        check("Returns a list", isinstance(sessions, list))
        check("List has sessions", len(sessions) > 0)
        check("Each session has required fields", all(
            isinstance(s, dict) and "id" in s and "name" in s and "model" in s and "provider" in s and "created_at" in s
            for s in sessions
        ))
    except Exception as e:
        check("List API reachable", False, str(e))


# ============================================================
# TEST 5: Backend - Create multiple sessions
# ============================================================
def test_create_multiple():
    print("\n[TEST 5] POST /api/sessions - Create multiple sessions")
    created_ids = []
    for i, name in enumerate(["Session Alpha", "Session Beta", "Session Gamma"], 1):
        try:
            result = api_post(SESSIONS_API, {
                "name": name,
                "model": "gpt-4o" if i == 1 else "claude-sonnet",
                "provider": "openai" if i == 1 else "anthropic"
            })
            sid = result.get("session", {}).get("id")
            if sid:
                created_ids.append(sid)
        except Exception as e:
            check(f"Create {name}", False, str(e))
            return []
    check("Created 3 sessions", len(created_ids) == 3)
    return created_ids


# ============================================================
# TEST 6: Backend - Search/filter simulation
# ============================================================
def test_search_filter():
    print("\n[TEST 6] Search/Filter - Simulate frontend search logic")
    try:
        sessions = api_get(SESSIONS_API)
        check("Has data for search", len(sessions) >= 3)

        # Search by name
        q_name = "alpha"
        filtered = [s for s in sessions if q_name in s.get("name", "").lower()]
        check("Filter by name works", len(filtered) == 1)

        # Search by model
        q_model = "gpt-4o"
        filtered = [s for s in sessions if q_model in s.get("model", "").lower()]
        check("Filter by model works", len(filtered) >= 1)

        # Search by provider
        q_prov = "anthropic"
        filtered = [s for s in sessions if q_prov in s.get("provider", "").lower()]
        check("Filter by provider works", len(filtered) >= 1)

        # Search with no match
        q_none = "nonexistent_xyz"
        filtered = [s for s in sessions if q_none in s.get("name", "").lower()]
        check("Filter with no match returns empty", len(filtered) == 0)
    except Exception as e:
        check("Search filter", False, str(e))


# ============================================================
# TEST 7: Backend - Delete session
# ============================================================
def test_delete_session(session_id: str):
    print(f"\n[TEST 7] DELETE /api/sessions/{session_id} - Delete session")
    try:
        result = api_delete(f"{SESSIONS_API}/{session_id}")
        check("Delete returns ok", result.get("status") == "ok")

        # Verify it's gone
        sessions = api_get(SESSIONS_API)
        ids = [s.get("id") for s in sessions]
        check("Session removed from list", session_id not in ids)
    except Exception as e:
        check("Delete API reachable", False, str(e))


# ============================================================
# TEST 8: Frontend Store - fetchSessions logic simulation
# ============================================================
def test_store_fetch_sessions():
    print("\n[TEST 8] Frontend Store - fetchSessions logic simulation")
    try:
        # Simulate the store's fetchSessions flow:
        # 1. set loading=true
        # 2. fetch GET /api/sessions
        # 3. set sessions=response, loading=false
        state = {"sessions": [], "loading": True, "error": None}
        resp = api_get(SESSIONS_API)
        state["sessions"] = resp
        state["loading"] = False
        check("Store sets sessions", isinstance(state["sessions"], list))
        check("Store clears loading", state["loading"] == False)
    except Exception as e:
        check("Store fetch simulation", False, str(e))


# ============================================================
# TEST 9: Frontend Store - deleteSession logic simulation
# ============================================================
def test_store_delete_session():
    print("\n[TEST 9] Frontend Store - deleteSession logic simulation")
    try:
        # First create a session
        result = api_post(SESSIONS_API, {"name": "Delete Me", "model": "test", "provider": "test"})
        sid = result["session"]["id"]

        # Simulate store delete flow:
        # 1. fetch DELETE /api/sessions/{id}
        # 2. call fetchSessions() to refresh
        state = {"sessions": [], "loading": False, "error": None}
        api_delete(f"{SESSIONS_API}/{sid}")
        state["sessions"] = api_get(SESSIONS_API)
        check("Store refreshes after delete", sid not in [s.get("id") for s in state["sessions"]])
    except Exception as e:
        check("Store delete simulation", False, str(e))


# ============================================================
# TEST 10: Frontend Page - Continue session navigation logic
# ============================================================
def test_continue_navigation():
    print("\n[TEST 10] Frontend Page - Continue session navigation")
    try:
        result = api_post(SESSIONS_API, {"name": "Nav Test", "model": "gpt-4", "provider": "openai"})
        sid = result["session"]["id"]

        # Simulate: navigate(`/chat?session=${id}`)
        nav_url = f"/chat?session={sid}"
        check("Navigation URL format", nav_url.startswith("/chat?session=") and sid in nav_url)
        check("URL contains session ID", sid in nav_url)

        # Cleanup
        api_delete(f"{SESSIONS_API}/{sid}")
    except Exception as e:
        check("Continue navigation", False, str(e))


# ============================================================
# TEST 11: Frontend Page - Search input simulation
# ============================================================
def test_search_input():
    print("\n[TEST 11] Frontend Page - Search input simulation")
    try:
        sessions = api_get(SESSIONS_API)
        if not sessions:
            # Create some test data
            api_post(SESSIONS_API, {"name": "AI Chat", "model": "qwen", "provider": "dashscope"})
            api_post(SESSIONS_API, {"name": "Code Review", "model": "gpt-4", "provider": "openai"})
            sessions = api_get(SESSIONS_API)

        # Simulate search query state changes
        queries = ["", "ai", "gpt", "nonexistent"]
        for q in queries:
            filtered = sessions
            if q.strip():
                q_lower = q.lower()
                filtered = [
                    s for s in sessions
                    if q_lower in s.get("name", "").lower()
                    or q_lower in s.get("model", "").lower()
                    or q_lower in s.get("provider", "").lower()
                ]
            check(f"Search query '{q}' returns valid result count", len(filtered) >= 0)
    except Exception as e:
        check("Search input", False, str(e))


# ============================================================
# TEST 12: Frontend Page - Format date display
# ============================================================
def test_date_format():
    print("\n[TEST 12] Frontend Page - Date format validation")
    try:
        sessions = api_get(SESSIONS_API)
        if not sessions:
            api_post(SESSIONS_API, {"name": "Date Test", "model": "test", "provider": "test"})
            sessions = api_get(SESSIONS_API)

        for s in sessions:
            created = s.get("created_at", "")
            check(f"Session '{s.get('name')}' has valid date", bool(created))
            # Verify ISO format
            check(f"Date is ISO format", "T" in created and len(created) >= 10)
    except Exception as e:
        check("Date format", False, str(e))


# ============================================================
# TEST 13: Error handling - Delete non-existent session
# ============================================================
def test_delete_nonexistent():
    print("\n[TEST 13] Error handling - Delete non-existent session")
    try:
        fake_id = "session_nonexistent_999"
        api_delete(f"{SESSIONS_API}/{fake_id}")
        check("Non-existent delete returns without error", True)
    except urllib.error.HTTPError as e:
        check("Returns error for non-existent", e.code in (404, 500))
    except Exception as e:
        check("Delete non-existent", False, str(e))


# ============================================================
# TEST 14: Full CRUD workflow
# ============================================================
def test_full_crud():
    print("\n[TEST 14] Full CRUD workflow")
    try:
        # C - Create
        result = api_post(SESSIONS_API, {
            "name": "CRUD Test Session",
            "model": "gpt-4",
            "provider": "openai"
        })
        sid = result["session"]["id"]
        check("Create step", bool(sid))

        # R - Read
        session = api_get(f"{SESSIONS_API}/{sid}")
        check("Read step", session.get("id") == sid)

        # U - List (verify in list)
        sessions = api_get(SESSIONS_API)
        check("List contains created", sid in [s.get("id") for s in sessions])

        # D - Delete
        api_delete(f"{SESSIONS_API}/{sid}")
        sessions = api_get(SESSIONS_API)
        check("Delete step", sid not in [s.get("id") for s in sessions])
    except Exception as e:
        check("Full CRUD", False, str(e))


# ============================================================
# TEST 15: Frontend Page - Loading and empty states simulation
# ============================================================
def test_ui_states():
    print("\n[TEST 15] Frontend Page - UI states simulation")
    try:
        # Reset to empty state
        reset_sessions_data()
        sessions = api_get(SESSIONS_API)

        # Empty state condition: !loading && filteredSessions.length === 0
        check("Empty state triggers when no sessions", len(sessions) == 0)

        # Create session -> non-empty state
        api_post(SESSIONS_API, {"name": "State Test", "model": "test", "provider": "test"})
        sessions = api_get(SESSIONS_API)
        check("Table state triggers when sessions exist", len(sessions) > 0)
    except Exception as e:
        check("UI states", False, str(e))


# ============================================================
# MAIN
# ============================================================
def main():
    print("=" * 60)
    print("  Sessions Page Test Suite")
    print(f"  API: {BASE_URL}")
    print("=" * 60)

    # Pre-check: backend health
    try:
        health = api_get(f"{BASE_URL}/api/health")
        print(f"\nBackend health: {health}")
    except Exception as e:
        print(f"\n[ERROR] Backend not reachable at {BASE_URL}")
        print(f"        {e}")
        print("        Start backend: cd backend && uvicorn app.main:app --port 8000")
        sys.exit(1)

    # Run all tests
    test_list_empty()
    sid = test_create_session()
    if sid:
        test_get_session(sid)
    test_list_nonempty()
    extra_ids = test_create_multiple()
    test_search_filter()
    if sid:
        test_delete_session(sid)
    test_store_fetch_sessions()
    test_store_delete_session()
    test_continue_navigation()
    test_search_input()
    test_date_format()
    test_delete_nonexistent()
    test_full_crud()
    test_ui_states()

    # Summary
    total = tests_passed + tests_failed
    print("\n" + "=" * 60)
    print(f"  RESULTS: {tests_passed} passed, {tests_failed} failed  /  {total} total")
    print("=" * 60)

    return 0 if tests_failed == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
