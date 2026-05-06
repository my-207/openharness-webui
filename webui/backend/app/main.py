"""FastAPI application entry point."""

from __future__ import annotations

import logging

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

from app.routers import (
    auth,
    autopilot,
    cron,
    memory,
    ohmo,
    permissions,
    plugins,
    providers,
    sessions,
    settings,
    skills,
    swarm,
    tasks,
    tools,
)
from app.services.chat_handler import handle_chat_websocket

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(name)s] %(levelname)s %(message)s",
)

app = FastAPI(title="OpenHarness WebUI", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(autopilot.router)
app.include_router(cron.router)
app.include_router(memory.router)
app.include_router(ohmo.router)
app.include_router(permissions.router)
app.include_router(plugins.router)
app.include_router(providers.router)
app.include_router(sessions.router)
app.include_router(settings.router)
app.include_router(skills.router)
app.include_router(swarm.router)
app.include_router(tasks.router)
app.include_router(tools.router)


@app.get("/api/health")
async def health_check():
    return {"status": "ok", "version": "0.1.0"}


@app.websocket("/ws/chat")
async def websocket_chat(websocket: WebSocket):
    try:
        await handle_chat_websocket(websocket)
    except WebSocketDisconnect:
        pass
    except Exception as e:
        logging.error("WebSocket error: %s", e)
