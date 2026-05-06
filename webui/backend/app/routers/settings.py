"""Settings REST API router."""

from __future__ import annotations

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.services.settings_service import get_settings, update_settings

router = APIRouter(prefix="/api/settings", tags=["settings"])


class SettingsUpdate(BaseModel):
    pass


@router.get("")
async def api_get_settings():
    return get_settings()


@router.patch("")
async def api_update_settings(data: dict):
    try:
        update_settings(data)
        return {"status": "ok"}
    except ValueError as e:
        raise HTTPException(400, str(e))
    except Exception as e:
        raise HTTPException(500, str(e))
