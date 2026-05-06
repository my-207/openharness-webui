"""Authentication REST API router."""

from __future__ import annotations

from fastapi import APIRouter, HTTPException

from app.services.auth_service import (
    get_auth_sources,
    get_provider_auth_status,
    logout_provider,
)

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.get("/sources")
async def api_get_auth_sources():
    return get_auth_sources()


@router.get("/providers")
async def api_get_provider_auth_status():
    return get_provider_auth_status()


@router.post("/{provider}/logout")
async def api_logout_provider(provider: str):
    try:
        logout_provider(provider)
        return {"status": "ok", "provider": provider}
    except ValueError as e:
        raise HTTPException(400, str(e))
    except Exception as e:
        raise HTTPException(500, str(e))
