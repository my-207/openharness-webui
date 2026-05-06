"""Pydantic models for the WebUI backend protocol."""

from __future__ import annotations

from typing import Any, Literal

from pydantic import BaseModel, Field


# ─── Frontend Request ───

class FrontendRequest(BaseModel):
    type: Literal[
        "submit_line",
        "permission_response",
        "question_response",
        "list_sessions",
        "select_command",
        "apply_select_command",
        "interrupt",
        "shutdown",
    ]
    line: str | None = None
    command: str | None = None
    value: str | None = None
    request_id: str | None = None
    allowed: bool | None = None
    answer: str | None = None


# ─── Transcript Item ───

class TranscriptItem(BaseModel):
    role: Literal["system", "user", "assistant", "tool", "tool_result", "log"]
    text: str
    tool_name: str | None = None
    tool_input: dict[str, Any] | None = None
    is_error: bool | None = None


# ─── Task Snapshot ───

class TaskSnapshot(BaseModel):
    id: str
    type: str
    status: str
    description: str
    metadata: dict[str, str] = Field(default_factory=dict)


# ─── Backend Event ───

class BackendEvent(BaseModel):
    type: Literal[
        "ready",
        "state_snapshot",
        "tasks_snapshot",
        "transcript_item",
        "compact_progress",
        "assistant_delta",
        "assistant_complete",
        "line_complete",
        "tool_started",
        "tool_completed",
        "clear_transcript",
        "modal_request",
        "select_request",
        "todo_update",
        "plan_mode_change",
        "swarm_status",
        "error",
        "shutdown",
    ]
    message: str | None = None
    item: TranscriptItem | None = None
    state: dict[str, Any] | None = None
    tasks: list[TaskSnapshot] | None = None
    mcp_servers: list[dict[str, Any]] | None = None
    bridge_sessions: list[dict[str, Any]] | None = None
    commands: list[str] | None = None
    modal: dict[str, Any] | None = None
    select_options: list[dict[str, Any]] | None = None
    tool_name: str | None = None
    tool_input: dict[str, Any] | None = None
    output: str | None = None
    is_error: bool | None = None
    compact_phase: str | None = None
    compact_trigger: str | None = None
    attempt: int | None = None
    todo_markdown: str | None = None
    plan_mode: str | None = None
    swarm_teammates: list[dict[str, Any]] | None = None
    swarm_notifications: list[dict[str, Any]] | None = None


# ─── Provider Profile ───

class ProviderProfileCreate(BaseModel):
    name: str
    label: str
    provider: str
    api_format: str
    auth_source: str
    model: str
    base_url: str | None = None
    credential_slot: str | None = None
    allowed_models: list[str] | None = None
    api_key: str | None = None


class ProviderProfileUpdate(BaseModel):
    label: str | None = None
    provider: str | None = None
    api_format: str | None = None
    auth_source: str | None = None
    model: str | None = None
    base_url: str | None = None
    credential_slot: str | None = None
    allowed_models: list[str] | None = None
    api_key: str | None = None
