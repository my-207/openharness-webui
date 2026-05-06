"""Permissions REST API router."""

from __future__ import annotations

from fastapi import APIRouter, HTTPException

from app.services.permissions_service import get_permissions, update_permissions

router = APIRouter(prefix="/api/permissions", tags=["permissions"])


@router.get("")
async def api_get_permissions():
    return get_permissions()


@router.patch("")
async def api_update_permissions(data: dict):
    try:
        update_permissions(data)
        return {"status": "ok"}
    except ValueError as e:
        raise HTTPException(400, str(e))
    except Exception as e:
        raise HTTPException(500, str(e))
