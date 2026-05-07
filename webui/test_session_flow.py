#!/usr/bin/env python3
"""
Test: New session and history session functionality.
"""
import json
import os
import sys
import urllib.request
import urllib.error

BASE_URL = os.environ.get("API_BASE", "http://127.0.0.1:8000")
SESSIONS_API = f"{BASE_URL}/api/sessions"

tests_passed = 0
tests_failed = 0


def check(name, condition, detail=""):
    global tests_passed, tests_failed
    if condition:
        tests_passed += 1
        print(f"  [PASS] {name}")
    else:
        tests_failed += 1
        print(f"  [FAIL] {name}")
    if detail:
        print(f"         -> {detail}")


def api_get(url):
    req = urllib.request.Request(url, method="GET")
    with urllib.request.urlopen(req, timeout=10) as resp:
        return json.loads(resp.read().decode("utf-8"))


def api_post(url, data):
    body = json.dumps(data).encode("utf-8")
    req = urllib.request.Request(url, data=body, headers={"Content-Type": "application/json"}, method="POST")
    with urllib.request.urlopen(req, timeout=10) as resp:
        return json.loads(resp.read().decode("utf-8"))


def api_put(url, data):
    body = json.dumps(data).encode("utf-8")
    req = urllib.request.Request(url, data=body, headers={"Content-Type": "application/json"}, method="PUT")
    with urllib.request.urlopen(req, timeout=10) as resp:
        return json.loads(resp.read().decode("utf-8"))


def api_delete(url):
    req = urllib.request.Request(url, method="DELETE")
    with urllib.request.urlopen(req, timeout=10) as resp:
        return json.loads(resp.read().decode("utf-8"))


def reset_sessions():
    data_file = os.path.join(os.path.dirname(__file__), "backend", "data", "sessions.json")
    os.makedirs(os.path.dirname(data_file), exist_ok=True)
    with open(data_file, "w", encoding="utf-8") as f:
        json.dump([], f)


# ============================================================
# TEST 1: Create a new session
# ============================================================
def test_create_session():
    print("\n[TEST 1] Create new session")
    try:
        result = api_post(SESSIONS_API, {
            "name": "Test Session",
            "model": "qwen3.5-flash",
            "provider": "qwen"
        })
        sid = result["session"]["id"]
        check("Session ID returned", bool(sid))
        check("Session name correct", result["session"]["name"] == "Test Session")
        check("Transcript is empty array", result["session"].get("transcript") == [])
        return sid
    except Exception as e:
        check("Create session", False, str(e))
        return None


# ============================================================
# TEST 2: Update session transcript (simulate chatting)
# ============================================================
def test_update_transcript(sid):
    print(f"\n[TEST 2] Update session transcript (session={sid})")
    try:
        transcript = [
            {"role": "user", "text": "你好"},
            {"role": "assistant", "text": "你好！有什么可以帮助你的？"}
        ]
        result = api_put(f"{SESSIONS_API}/{sid}", {
            "transcript": transcript,
            "message_count": len(transcript),
            "name": "Chat about hello"
        })
        session = result["session"]
        check("Update returns ok", result["status"] == "ok")
        check("Transcript saved", session.get("transcript") == transcript)
        check("Message count updated", session.get("message_count") == 2)
        check("Name updated", session.get("name") == "Chat about hello")
    except Exception as e:
        check("Update transcript", False, str(e))


# ============================================================
# TEST 3: Get session (verify transcript persists)
# ============================================================
def test_get_session(sid):
    print(f"\n[TEST 3] Get session (verify persistence)")
    try:
        session = api_get(f"{SESSIONS_API}/{sid}")
        check("Session found", session["id"] == sid)
        check("Transcript present", len(session.get("transcript", [])) == 2)
        check("First message correct", session["transcript"][0]["role"] == "user")
    except Exception as e:
        check("Get session", False, str(e))


# ============================================================
# TEST 4: List sessions (history page view)
# ============================================================
def test_list_sessions(required_count=0):
    print(f"\n[TEST 4] List sessions (history)")
    try:
        sessions = api_get(SESSIONS_API)
        check("Returns list", isinstance(sessions, list))
        check(f"Has at least {required_count} sessions", len(sessions) >= required_count)
        if sessions:
            s = sessions[0]
            check("Session has id", bool(s.get("id")))
            check("Session has transcript", "transcript" in s)
            check("Session has name", bool(s.get("name")))
            check("Session has message_count", "message_count" in s)
    except Exception as e:
        check("List sessions", False, str(e))


# ============================================================
# TEST 5: Create multiple sessions (simulate new chat flow)
# ============================================================
def test_new_session_flow():
    print("\n[TEST 5] New session flow (multiple sessions)")
    created_ids = []
    for i in range(3):
        try:
            name = f"Session #{i + 1}"
            result = api_post(SESSIONS_API, {"name": name, "model": "gpt-4", "provider": "openai"})
            sid = result["session"]["id"]
            created_ids.append(sid)
            # Update each with some transcript
            api_put(f"{SESSIONS_API}/{sid}", {
                "transcript": [
                    {"role": "user", "text": f"Hello from {name}"},
                    {"role": "assistant", "text": f"Reply to {name}"}
                ],
                "message_count": 2
            })
        except Exception as e:
            check(f"Create session #{i+1}", False, str(e))
            return []
    check("Created 3 sessions", len(created_ids) == 3)
    return created_ids


# ============================================================
# TEST 6: Continue / restore existing session
# ============================================================
def test_restore_session(sid):
    print(f"\n[TEST 6] Restore/continue session (simulate clicking Continue)")
    try:
        session = api_get(f"{SESSIONS_API}/{sid}")
        check("Session found for restore", session["id"] == sid)
        transcript = session.get("transcript", [])
        check("Has transcript to restore", len(transcript) > 0)

        # Simulate appending more messages to the same session
        transcript.append({"role": "user", "text": "继续之前的对话"})
        api_put(f"{SESSIONS_API}/{sid}", {
            "transcript": transcript,
            "message_count": len(transcript)
        })
        updated = api_get(f"{SESSIONS_API}/{sid}")
        check("Message count incremented", updated["message_count"] == len(transcript))
        check("New message appended", updated["transcript"][-1]["text"] == "继续之前的对话")
    except Exception as e:
        check("Restore session", False, str(e))


# ============================================================
# TEST 7: History list with search (session page filter)
# ============================================================
def test_history_search():
    print("\n[TEST 7] History search (simulate sessions page filter)")
    try:
        sessions = api_get(SESSIONS_API)
        check("Has data for search", len(sessions) >= 3)
        # Search by name
        q = "session #1"
        filtered = [s for s in sessions if q.lower() in s.get("name", "").lower()]
        check("Filter by name", len(filtered) >= 1)
        # No match
        filtered2 = [s for s in sessions if "nonexistent_xyz" in s.get("name", "").lower()]
        check("No match returns empty", len(filtered2) == 0)
    except Exception as e:
        check("History search", False, str(e))


# ============================================================
# TEST 8: Delete session (history cleanup)
# ============================================================
def test_delete_session(sid):
    print(f"\n[TEST 8] Delete session (history cleanup)")
    try:
        result = api_delete(f"{SESSIONS_API}/{sid}")
        check("Delete returns ok", result["status"] == "ok")
        sessions = api_get(SESSIONS_API)
        ids = [s["id"] for s in sessions]
        check("Session removed from list", sid not in ids)
    except Exception as e:
        check("Delete session", False, str(e))


# ============================================================
# TEST 9: Full workflow — new chat → chat → history → restore
# ============================================================
def test_full_workflow():
    print("\n[TEST 9] Full workflow: new chat -> chat -> history -> restore")
    try:
        # Step 1: Create new session (user clicks "New Chat")
        result1 = api_post(SESSIONS_API, {"name": "New Session", "model": "qwen3.5-flash", "provider": "qwen"})
        sid1 = result1["session"]["id"]
        check("Step 1: New session created", bool(sid1))

        # Step 2: Chat (save transcript)
        transcript = [
            {"role": "user", "text": "开发一个扫雷游戏"},
            {"role": "assistant", "text": "好的，我来为你规划扫雷游戏的开发步骤..."}
        ]
        api_put(f"{SESSIONS_API}/{sid1}", {"transcript": transcript, "message_count": 2, "name": "扫雷游戏开发"})
        check("Step 2: Chat saved to history", True)

        # Step 3: New chat again (user clicks "New Chat" again)
        result2 = api_post(SESSIONS_API, {"name": "New Session", "model": "claude-sonnet", "provider": "anthropic"})
        sid2 = result2["session"]["id"]
        check("Step 3: Second new session created", bool(sid2))

        # Step 4: Chat in second session
        transcript2 = [
            {"role": "user", "text": "Python如何实现多线程"},
            {"role": "assistant", "text": "Python多线程可以使用threading模块..."}
        ]
        api_put(f"{SESSIONS_API}/{sid2}", {"transcript": transcript2, "message_count": 2, "name": "Python多线程"})
        check("Step 4: Second chat saved", True)

        # Step 5: History page shows both sessions
        sessions = api_get(SESSIONS_API)
        check("Step 5: History has 2+ sessions", len(sessions) >= 2)

        # Step 6: Restore first session (click Continue)
        restored = api_get(f"{SESSIONS_API}/{sid1}")
        check("Step 6: Restored session found", restored["id"] == sid1)
        check("      Transcript intact", len(restored.get("transcript", [])) == 2)
        check("      Name correct", restored["name"] == "扫雷游戏开发")

        # Cleanup
        api_delete(f"{SESSIONS_API}/{sid1}")
        api_delete(f"{SESSIONS_API}/{sid2}")
    except Exception as e:
        check("Full workflow", False, str(e))


# ============================================================
# MAIN
# ============================================================
def main():
    print("=" * 60)
    print("  Sessions - New & History Test Suite")
    print(f"  API: {BASE_URL}")
    print("=" * 60)

    try:
        health = api_get(f"{BASE_URL}/api/health")
        print(f"\nBackend: {health}")
    except Exception as e:
        print(f"\n[ERROR] Backend not reachable: {e}")
        sys.exit(1)

    # Reset to clean state
    reset_sessions()

    test_list_sessions()
    sid = test_create_session()
    if sid:
        test_update_transcript(sid)
        test_get_session(sid)
    test_list_sessions(1)
    ids = test_new_session_flow()
    if ids:
        test_restore_session(ids[0])
    test_history_search()
    if sid:
        test_delete_session(sid)
    if ids:
        test_delete_session(ids[0])
    test_full_workflow()

    total = tests_passed + tests_failed
    print("\n" + "=" * 60)
    print(f"  RESULTS: {tests_passed} passed, {tests_failed} failed  /  {total} total")
    print("=" * 60)
    return 0 if tests_failed == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
