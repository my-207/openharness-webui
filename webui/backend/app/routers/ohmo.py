"""OhMo REST API router."""

from __future__ import annotations

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.services.ohmo_service import (
    get_workspace,
    get_gateway_status,
    start_gateway,
    stop_gateway,
    restart_gateway,
    get_channels,
    update_channels,
)

router = APIRouter(prefix="/api/ohmo", tags=["ohmo"])


class ChannelsUpdate(BaseModel):
    channels: list[str]


@router.get("/workspace")
async def api_get_workspace():
    return get_workspace()


@router.get("/gateway")
async def api_get_gateway_status():
    return get_gateway_status()


@router.post("/gateway/start")
async def api_start_gateway():
    try:
        result = start_gateway()
        return {"status": "ok", "result": result}
    except Exception as e:
        raise HTTPException(500, str(e))


@router.post("/gateway/stop")
async def api_stop_gateway():
    try:
        result = stop_gateway()
        return {"status": "ok", "result": result}
    except Exception as e:
        raise HTTPException(500, str(e))


@router.post("/gateway/restart")
async def api_restart_gateway():
    try:
        result = restart_gateway()
        return {"status": "ok", "result": result}
    except Exception as e:
        raise HTTPException(500, str(e))


@router.get("/channels")
async def api_get_channels():
    return get_channels()


@router.patch("/channels")
async def api_update_channels(data: ChannelsUpdate):
    try:
        update_channels(data.channels)
        return {"status": "ok"}
    except ValueError as e:
        raise HTTPException(400, str(e))
    except Exception as e:
        raise HTTPException(500, str(e))
