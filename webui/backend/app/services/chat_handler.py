"""WebSocket chat handler — adapts OpenHarness runtime to WebSocket."""

from __future__ import annotations

import asyncio
import json
import logging
import sys
from pathlib import Path
from uuid import uuid4

from fastapi import WebSocket

from app.models import FrontendRequest, BackendEvent, TranscriptItem
from app.ws_manager import ConnectionManager
from app.services.provider_service import stream_chat_with_model

log = logging.getLogger(__name__)

# Try to import OpenHarness runtime
try:
    sys.path.insert(0, str(Path(__file__).resolve().parents[3] / "src"))
    from openharness.ui.backend_host import ReactBackendHost, BackendHostConfig
    from openharness.ui.runtime import build_runtime, start_runtime, close_runtime, handle_line
    from openharness.engine.stream_events import (
        AssistantTextDelta,
        AssistantTurnComplete,
        CompactProgressEvent,
        ErrorEvent,
        StatusEvent,
        ToolExecutionStarted,
        ToolExecutionCompleted,
    )
    from openharness.tasks import get_task_manager
    from openharness.config.settings import load_settings

    OPENHARNESS_AVAILABLE = True
except ImportError:
    OPENHARNESS_AVAILABLE = False
    log.warning("OpenHarness runtime not available — using mock backend")


manager = ConnectionManager()


async def handle_chat_websocket(websocket: WebSocket) -> None:
    session_id = uuid4().hex
    await manager.connect(session_id, websocket)

    # Emit ready event
    await manager.send_json(session_id, {
        "type": "ready",
        "state": {
            "model": "claude-sonnet-4",
            "cwd": str(Path.cwd()),
            "provider": "anthropic",
            "auth_status": "ready",
            "permission_mode": "Default",
            "theme": "default",
        },
        "tasks": [],
        "commands": [
            "/help", "/clear", "/status", "/model", "/provider", "/theme",
            "/skills", "/mcp", "/permissions", "/exit", "/cost",
        ],
        "mcp_servers": [],
        "bridge_sessions": [],
    })

    # Send an initial welcome message
    await manager.send_json(session_id, {
        "type": "transcript_item",
        "item": {
            "role": "system",
            "text": "👋 Welcome to OpenHarness WebUI! Type a message or use / for commands.",
        },
    })

    running = True
    bundle = None
    use_openharness = OPENHARNESS_AVAILABLE
    messages: list[dict] = []  # Conversation history for real model calls

    if use_openharness:
        # Use real OpenHarness backend
        try:
            bundle = await build_runtime(
                cwd=str(Path.cwd()),
            )
            await start_runtime(bundle)

            async def render_event(event):
                """Map StreamEvent to BackendEvent JSON."""
                if isinstance(event, AssistantTextDelta):
                    await manager.send_json(session_id, {"type": "assistant_delta", "message": event.text})
                elif isinstance(event, AssistantTurnComplete):
                    await manager.send_json(session_id, {
                        "type": "assistant_complete",
                        "message": event.message.text.strip(),
                        "item": {"role": "assistant", "text": event.message.text.strip()},
                    })
                elif isinstance(event, ToolExecutionStarted):
                    await manager.send_json(session_id, {
                        "type": "tool_started",
                        "tool_name": event.tool_name,
                        "tool_input": event.tool_input,
                        "item": {
                            "role": "tool",
                            "text": f"{event.tool_name} {json.dumps(event.tool_input or {})}",
                            "tool_name": event.tool_name,
                            "tool_input": event.tool_input,
                        },
                    })
                elif isinstance(event, ToolExecutionCompleted):
                    await manager.send_json(session_id, {
                        "type": "tool_completed",
                        "tool_name": event.tool_name,
                        "output": event.output,
                        "is_error": event.is_error,
                        "item": {
                            "role": "tool_result",
                            "text": event.output,
                            "tool_name": event.tool_name,
                            "is_error": event.is_error,
                        },
                    })
                elif isinstance(event, CompactProgressEvent):
                    await manager.send_json(session_id, {
                        "type": "compact_progress",
                        "compact_phase": event.phase,
                    })
                elif isinstance(event, ErrorEvent):
                    await manager.send_json(session_id, {
                        "type": "error",
                        "message": event.message,
                    })
                elif isinstance(event, StatusEvent):
                    await manager.send_json(session_id, {
                        "type": "transcript_item",
                        "item": {"role": "system", "text": event.message},
                    })

            async def print_system(msg: str):
                await manager.send_json(session_id, {
                    "type": "transcript_item",
                    "item": {"role": "system", "text": msg},
                })

            async def clear_output():
                await manager.send_json(session_id, {"type": "clear_transcript"})

        except Exception as e:
            log.error("Failed to start OpenHarness runtime: %s", e)
            use_openharness = False  # fallback to mock

    # Event loop
    while running:
        raw = None
        try:
            raw = await asyncio.wait_for(
                _receive_with_timeout(websocket),
                timeout=300,
            )
        except asyncio.TimeoutError:
            continue
        except Exception:
            break

        if raw is None:
            break

        try:
            request = FrontendRequest(**raw)
        except Exception:
            continue

        if request.type == "shutdown":
            await manager.send_json(session_id, {"type": "shutdown"})
            break

        if request.type == "interrupt":
            await manager.send_json(session_id, {"type": "line_complete"})
            continue

        if request.type == "submit_line" and request.line:
            line = request.line.strip()
            if not line:
                continue

            # Show user message
            await manager.send_json(session_id, {
                "type": "transcript_item",
                "item": {"role": "user", "text": line},
            })

            if use_openharness and bundle:
                try:
                    await handle_line(
                        bundle,
                        line,
                        print_system=print_system,
                        render_event=render_event,
                        clear_output=clear_output,
                    )
                except Exception as e:
                    log.error("Error processing line: %s", e)
                    await manager.send_json(session_id, {
                        "type": "transcript_item",
                        "item": {"role": "system", "text": f"Error: {e}"},
                    })
            else:
                # Call real model via active provider profile
                messages.append({"role": "user", "content": line})
                try:
                    full_text = ""
                    async for chunk, is_done in stream_chat_with_model(messages):
                        if not is_done:
                            await manager.send_json(session_id, {
                                "type": "assistant_delta",
                                "message": chunk,
                            })
                        else:
                            full_text = chunk
                    if full_text:
                        await manager.send_json(session_id, {
                            "type": "assistant_complete",
                            "message": full_text,
                            "item": {"role": "assistant", "text": full_text},
                        })
                        messages.append({"role": "assistant", "content": full_text})
                    else:
                        # Fallback to mock if model returned empty
                        await _send_mock_response(session_id, line)
                except Exception as e:
                    log.error("Model call failed: %s", e)
                    await manager.send_json(session_id, {
                        "type": "transcript_item",
                        "item": {"role": "system", "text": f"Model error: {e}"},
                    })

            await manager.send_json(session_id, {"type": "line_complete"})

        elif request.type == "select_command":
            await manager.send_json(session_id, {
                "type": "select_request",
                "modal": {"kind": "select", "title": "Select", "command": request.command},
                "select_options": [
                    {"value": "option1", "label": "Option 1"},
                    {"value": "option2", "label": "Option 2"},
                ],
            })

    manager.disconnect(session_id)

    if use_openharness and bundle:
        try:
            await close_runtime(bundle)
        except Exception:
            pass


async def _receive_with_timeout(ws: WebSocket):
    try:
        return await ws.receive_json()
    except Exception:
        return None


async def _send_mock_response(session_id: str, line: str) -> None:
    """Send a simulated AI response for demo/testing."""
    responses = {
        "hello": "Hello! I'm OpenHarness, your AI coding assistant. How can I help you today?",
        "help": "Available commands:\n- /help — show help\n- /model — switch model\n- /provider — switch provider\n- /clear — clear history\n- /exit — quit",
    }

    reply = responses.get(line.lower().strip(), f"I received your message: \"{line}\". In production, this would be processed by the OpenHarness runtime with tool calls and streaming responses.")

    # Simulate streaming
    for i in range(0, len(reply), 3):
        chunk = reply[i:i + 3]
        await manager.send_json(session_id, {"type": "assistant_delta", "message": chunk})
        await asyncio.sleep(0.02)

    await manager.send_json(session_id, {
        "type": "assistant_complete",
        "message": reply,
        "item": {"role": "assistant", "text": reply},
    })
