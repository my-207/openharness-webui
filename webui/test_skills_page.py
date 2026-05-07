#!/usr/bin/env python3
"""
Test: Skills page - install, list, toggle, delete, detail.
"""
import json
import os
import sys
import urllib.request
import urllib.error

BASE_URL = os.environ.get("API_BASE", "http://127.0.0.1:8000")
SKILLS_API = f"{BASE_URL}/api/skills"

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


def api_post(url, data={}):
    body = json.dumps(data).encode("utf-8")
    req = urllib.request.Request(url, data=body, headers={"Content-Type": "application/json"}, method="POST")
    with urllib.request.urlopen(req, timeout=10) as resp:
        return json.loads(resp.read().decode("utf-8"))


def api_delete(url):
    req = urllib.request.Request(url, method="DELETE")
    with urllib.request.urlopen(req, timeout=10) as resp:
        return json.loads(resp.read().decode("utf-8"))


def reset_data():
    data_file = os.path.join(os.path.dirname(__file__), "backend", "data", "skills.json")
    os.makedirs(os.path.dirname(data_file), exist_ok=True)
    with open(data_file, "w", encoding="utf-8") as f:
        json.dump([], f)


# ============================================================
# TEST 1: List skills (empty)
# ============================================================
def test_list_empty():
    print("\n[TEST 1] GET /api/skills (empty)")
    try:
        skills = api_get(SKILLS_API)
        check("Returns list", isinstance(skills, list))
        check("Empty initially", len(skills) == 0)
    except Exception as e:
        check("List empty", False, str(e))


# ============================================================
# TEST 2: Install a skill
# ============================================================
def test_install_skill():
    print("\n[TEST 2] POST /api/skills - Install skill")
    try:
        result = api_post(SKILLS_API, {
            "name": "code-reviewer",
            "source": "builtin",
            "description": "Reviews code for issues and suggests improvements",
            "content": "# Code Reviewer\nAnalyzes code and provides feedback.",
        })
        check("Status ok", result.get("status") == "ok")
        skill = result.get("skill", {})
        check("Name correct", skill.get("name") == "code-reviewer")
        check("Source correct", skill.get("source") == "builtin")
        check("Description correct", skill.get("description") == "Reviews code for issues and suggests improvements")
        check("Enabled by default", skill.get("enabled") is True)
        check("Has created_at", bool(skill.get("created_at")))
        return skill.get("name")
    except Exception as e:
        check("Install skill", False, str(e))
        return None


# ============================================================
# TEST 3: Install multiple skills
# ============================================================
def test_install_multiple():
    print("\n[TEST 3] POST /api/skills - Install multiple skills")
    names = []
    for i, (name, src) in enumerate([
        ("python-helper", "manual"),
        ("git-helper", "manual"),
        ("database-helper", "manual"),
    ], 1):
        try:
            result = api_post(SKILLS_API, {"name": name, "source": src, "description": f"{name} description"})
            sid = result.get("skill", {}).get("name")
            if sid:
                names.append(sid)
        except Exception as e:
            check(f"Create {name}", False, str(e))
            return []
    check(f"Created {len(names)} skills", len(names) == 3)
    return names


# ============================================================
# TEST 4: List skills (non-empty) - verify all visible
# ============================================================
def test_list_nonempty(expected=4):
    print(f"\n[TEST 4] GET /api/skills (expect {expected})")
    try:
        skills = api_get(SKILLS_API)
        check("Returns list", isinstance(skills, list))
        check(f"Has {expected} skills", len(skills) == expected, f"got {len(skills)}")
        for s in skills:
            check(f"  Skill '{s['name']}' has all fields", all(k in s for k in ("name", "description", "content", "source", "enabled", "created_at")))
    except Exception as e:
        check("List nonempty", False, str(e))


# ============================================================
# TEST 5: Get single skill (detail page)
# ============================================================
def test_get_skill(name):
    print(f"\n[TEST 5] GET /api/skills/{name} (detail)")
    try:
        skill = api_get(f"{SKILLS_API}/{name}")
        check("Name matches", skill.get("name") == name)
        check("Has source", bool(skill.get("source")))
        check("Has content", bool(skill.get("content")))
        check("Has created_at", bool(skill.get("created_at")))
        check("Enabled is bool", isinstance(skill.get("enabled"), bool))
    except Exception as e:
        check("Get skill", False, str(e))


# ============================================================
# TEST 6: Toggle skill enable/disable
# ============================================================
def test_toggle_skill(name):
    print(f"\n[TEST 6] POST /api/skills/{name}/toggle")
    try:
        # Toggle off
        result = api_post(f"{SKILLS_API}/{name}/toggle")
        check("Toggle returns ok", result.get("status") == "ok")
        skill = api_get(f"{SKILLS_API}/{name}")
        check("Skill disabled after toggle", skill.get("enabled") is False)

        # Toggle back on
        result = api_post(f"{SKILLS_API}/{name}/toggle")
        check("Toggle again returns ok", result.get("status") == "ok")
        skill = api_get(f"{SKILLS_API}/{name}")
        check("Skill enabled after second toggle", skill.get("enabled") is True)
    except Exception as e:
        check("Toggle skill", False, str(e))


# ============================================================
# TEST 7: Delete skill
# ============================================================
def test_delete_skill(name):
    print(f"\n[TEST 7] DELETE /api/skills/{name}")
    try:
        result = api_delete(f"{SKILLS_API}/{name}")
        check("Delete returns ok", result.get("status") == "ok")
        skills = api_get(SKILLS_API)
        names = [s["name"] for s in skills]
        check("Removed from list", name not in names)
    except Exception as e:
        check("Delete skill", False, str(e))


# ============================================================
# TEST 8: Skill not found
# ============================================================
def test_skill_not_found():
    print("\n[TEST 8] GET /api/skills/nonexistent")
    try:
        api_get(f"{SKILLS_API}/nonexistent_xyz")
        check("Should 404", False)
    except urllib.error.HTTPError as e:
        check("404 for nonexistent skill", e.code == 404)
    except Exception as e:
        check("Skill not found", False, str(e))


# ============================================================
# TEST 9: Full workflow
# ============================================================
def test_full_workflow():
    print("\n[TEST 9] Full workflow: install -> list -> detail -> toggle -> delete")
    try:
        # Install
        result = api_post(SKILLS_API, {"name": "full-test-skill", "source": "test", "description": "Full workflow test", "content": "# Full Test\nTesting complete workflow."})
        name = result["skill"]["name"]
        check("Step 1: Install", name == "full-test-skill")

        # List
        skills = api_get(SKILLS_API)
        check("Step 2: List contains skill", any(s["name"] == name for s in skills))

        # Detail
        skill = api_get(f"{SKILLS_API}/{name}")
        check("Step 3: Detail has correct source", skill.get("source") == "test")
        check("Step 3: Detail has content", bool(skill.get("content")))

        # Toggle
        api_post(f"{SKILLS_API}/{name}/toggle")
        skill = api_get(f"{SKILLS_API}/{name}")
        check("Step 4: Toggle works", skill.get("enabled") is False)

        # Re-toggle
        api_post(f"{SKILLS_API}/{name}/toggle")
        skill = api_get(f"{SKILLS_API}/{name}")
        check("Step 5: Re-toggle works", skill.get("enabled") is True)

        # Delete
        api_delete(f"{SKILLS_API}/{name}")
        skills = api_get(SKILLS_API)
        check("Step 6: Deleted", name not in [s["name"] for s in skills])

    except Exception as e:
        check("Full workflow", False, str(e))


# ============================================================
# MAIN
# ============================================================
def main():
    print("=" * 60)
    print("  Skills Page Test Suite")
    print(f"  API: {BASE_URL}")
    print("=" * 60)

    try:
        health = api_get(f"{BASE_URL}/api/health")
        print(f"\nBackend: {health}")
    except Exception as e:
        print(f"\n[ERROR] Backend not reachable: {e}")
        sys.exit(1)

    reset_data()

    test_list_empty()
    name1 = test_install_skill()
    names_multi = test_install_multiple()
    test_list_nonempty(4 if name1 else 3)
    if name1:
        test_get_skill(name1)
        test_toggle_skill(name1)
    if names_multi:
        test_toggle_skill(names_multi[0])
    test_skill_not_found()
    if name1:
        test_delete_skill(name1)
    test_full_workflow()

    total = tests_passed + tests_failed
    print("\n" + "=" * 60)
    print(f"  RESULTS: {tests_passed} passed, {tests_failed} failed  /  {total} total")
    print("=" * 60)
    return 0 if tests_failed == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
