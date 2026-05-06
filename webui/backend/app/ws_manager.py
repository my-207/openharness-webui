"""WebSocket connection manager for the WebUI."""

from __future__ import annotations

import asyncio
import json
import logging
from typing import Any

from fastapi import WebSocket

log = logging.getLogger(__name__)


class ConnectionManager:
    """Manage WebSocket connections and queue management."""

    def __init__(self) -> None:
        self._connections: dict[str, WebSocket] = {}
        self._locks: dict[str, asyncio.Lock] = {}

    async def connect(self, session_id: str, websocket: WebSocket) -> None:
        await websocket.accept()
        self._connections[session_id] = websocket
        self._locks[session_id] = asyncio.Lock()
        log.info("WebSocket connected: %s", session_id)

    def disconnect(self, session_id: str) -> None:
        self._connections.pop(session_id, None)
        self._locks.pop(session_id, None)
        log.info("WebSocket disconnected: %s", session_id)

    async def send_json(self, session_id: str, data: dict[str, Any]) -> None:
        ws = self._connections.get(session_id)
        if ws is None:
            return
        lock = self._locks.get(session_id)
        if lock is None:
            return
        async with lock:
            try:
                await ws.send_json(data)
            except Exception:
                self.disconnect(session_id)

    async def receive_json(self, session_id: str) -> dict[str, Any] | None:
        ws = self._connections.get(session_id)
        if ws is None:
            return None
        try:
            data = await ws.receive_json()
            return data
        except Exception:
            self.disconnect(session_id)
            return None

    def is_connected(self, session_id: str) -> bool:
        return session_id in self._connections
