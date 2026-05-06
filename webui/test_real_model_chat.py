#!/usr/bin/env python3
"""
Test: Chat page returns real model inference via WebSocket.
"""
import asyncio
import json
import sys

WS_URL = "ws://127.0.0.1:8000/ws/chat"

MOCK_SIG = "I received your message:"


def safe(txt):
    return txt.encode("ascii", "replace").decode("ascii")


async def run_test():
    print("=" * 60)
    print("  Chat Real Model Inference Test (WebSocket)")
    print("  URL: " + WS_URL)
    print("=" * 60)

    try:
        import websockets
    except ImportError:
        print("[SKIP] websockets not installed")
        return 1

    passed = 0
    failed = 0

    try:
        async with websockets.connect(WS_URL) as ws:
            # 1. ready
            raw = await asyncio.wait_for(ws.recv(), timeout=10)
            event = json.loads(raw)
            if event.get("type") == "ready":
                print("[PASS] ready received")
                passed += 1
            else:
                print("[FAIL] expected ready, got " + str(event.get("type")))
                failed += 1

            # 2. welcome
            raw = await asyncio.wait_for(ws.recv(), timeout=10)
            event = json.loads(raw)
            print("[INFO] welcome type=" + str(event.get("type")))

            # 3. submit
            await ws.send(json.dumps({"type": "submit_line", "line": "你好"}))
            print("[INFO] sent: '你好'")

            all_text = ""
            assistant_text = ""
            got_user_echo = False
            got_complete = False
            got_line_complete = False

            for i in range(200):
                raw = await asyncio.wait_for(ws.recv(), timeout=60)
                event = json.loads(raw)
                etype = event.get("type")

                if etype == "transcript_item":
                    item = event.get("item", {})
                    if item.get("role") == "user":
                        got_user_echo = True
                        print("[PASS] user echo")
                        passed += 1

                elif etype == "assistant_delta":
                    all_text += event.get("message", "")

                elif etype == "assistant_complete":
                    assistant_text = event.get("message", "")
                    if not assistant_text:
                        assistant_text = all_text
                    print("[PASS] assistant_complete (len=" + str(len(assistant_text)) + ")")
                    got_complete = True
                    passed += 1

                elif etype == "line_complete":
                    got_line_complete = True
                    print("[PASS] line_complete")
                    passed += 1
                    break

            combined = assistant_text or all_text
            print("")
            print("[INFO] assistant text length: " + str(len(combined)))
            print("[INFO] preview: " + safe(combined[:120]))

            if MOCK_SIG in combined:
                print("[FAIL] still MOCK")
                failed += 1
            else:
                print("[PASS] REAL model inference")
                passed += 1

            if len(combined.strip()) < 5:
                print("[FAIL] too short")
                failed += 1
            else:
                print("[PASS] meaningful length")
                passed += 1

    except Exception as e:
        print("[FAIL] " + str(e))
        failed += 1

    total = passed + failed
    print("")
    print("=" * 60)
    print("  RESULTS: " + str(passed) + " passed, " + str(failed) + " failed / " + str(total))
    print("=" * 60)
    return 0 if failed == 0 else 1


if __name__ == "__main__":
    sys.exit(asyncio.run(run_test()))
