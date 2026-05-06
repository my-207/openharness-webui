"""
测试用例：在 chat 窗口输入"我需要开发一个扫雷游戏，请先给出开发计划"

验证要点：
1. WebSocket 连接成功并收到 ready 事件
2. submit_line 消息发送成功
3. 收到 assistant_delta（流式回复块）
4. 收到 assistant_complete（回复完成）
5. 收到 line_complete（处理完成）
6. 回复内容不为空
"""

import asyncio
import json
import sys


async def test_chat_minesweeper():
    test_message = "我需要开发一个扫雷游戏，请先给出开发计划"
    ws_url = "ws://127.0.0.1:8000/ws/chat"

    print("=" * 60)
    print(f"测试用例：提交 \"{test_message}\"")
    print("=" * 60)

    try:
        import websockets
    except ImportError:
        print("[SKIP] 需要安装 websockets: pip install websockets")
        return False

    passed = 0
    failed = 0

    def check(name, condition, detail=""):
        nonlocal passed, failed
        if condition:
            passed += 1
            print(f"  [PASS] {name}" + (f" -- {detail}" if detail else ""))
        else:
            failed += 1
            print(f"  [FAIL] {name}" + (f" -- {detail}" if detail else ""))

    try:
        async with websockets.connect(ws_url) as ws:
            check("WebSocket 连接成功", True)

            # 接收 ready 事件
            ready_raw = await asyncio.wait_for(ws.recv(), timeout=5)
            ready = json.loads(ready_raw)
            check("收到 ready 事件", ready.get("type") == "ready",
                  f'type={ready.get("type")}')

            # 排出 welcome 消息
            try:
                await asyncio.wait_for(ws.recv(), timeout=1)
            except asyncio.TimeoutError:
                pass

            # 发送消息
            await ws.send(json.dumps({"type": "submit_line", "line": test_message}))
            check("submit_line 消息发送成功", True)

            # 收集回复
            got_user_echo = False
            got_delta = False
            got_complete = False
            got_line_complete = False
            delta_count = 0
            full_text = ""

            for i in range(80):
                raw = await asyncio.wait_for(ws.recv(), timeout=10)
                data = json.loads(raw)
                t = data.get("type")

                if t == "transcript_item":
                    item = data.get("item", {})
                    if item.get("role") == "user":
                        got_user_echo = True

                elif t == "assistant_delta":
                    got_delta = True
                    delta_count += 1
                    full_text += data.get("message", "")

                elif t == "assistant_complete":
                    got_complete = True
                    full_text = data.get("message", "") or ""
                    # 也检查 item 中的文本
                    item = data.get("item")
                    if item and item.get("text"):
                        full_text = item["text"]

                elif t == "line_complete":
                    got_line_complete = True
                    break

            check("收到用户消息回显", got_user_echo)
            check("收到 assistant_delta 流式块", got_delta, f"共 {delta_count} 个块")
            check("收到 assistant_complete", got_complete)
            check("收到 line_complete", got_line_complete)
            check("回复内容不为空", len(full_text) > 0, f"共 {len(full_text)} 字符")
            check("回复包含用户输入的关键词", "扫雷" in full_text or "开发计划" in full_text or test_message[:10] in full_text)

            print(f"\n回复内容预览 ({len(full_text)} 字符):")
            print(f'  "{full_text[:150]}..."' if len(full_text) > 150 else f'  "{full_text}"')

    except ConnectionRefusedError:
        print("[FAIL] 无法连接后端，请先启动: uvicorn app.main:app --port 8000")
        return False
    except Exception as e:
        print(f"[FAIL] 测试异常: {e}")
        import traceback
        traceback.print_exc()
        return False

    print(f"\n{'=' * 60}")
    print(f"结果: {passed} 通过, {failed} 失败")
    print(f"{'=' * 60}")
    return failed == 0


if __name__ == "__main__":
    success = asyncio.run(test_chat_minesweeper())
    sys.exit(0 if success else 1)
