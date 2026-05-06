"""Providers REST API router."""

from __future__ import annotations

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.services.provider_service import (
    list_profiles,
    create_profile,
    update_profile,
    delete_profile,
    switch_profile,
    test_connection,
    list_provider_models,
)
from app.models import ProviderProfileCreate, ProviderProfileUpdate

router = APIRouter(prefix="/api/providers", tags=["providers"])


@router.get("")
async def api_list_profiles():
    return list_profiles()


@router.post("")
async def api_create_profile(data: ProviderProfileCreate):
    try:
        create_profile(data.model_dump())
        return {"status": "ok", "name": data.name}
    except ValueError as e:
        raise HTTPException(400, str(e))


@router.patch("/{name}")
async def api_update_profile(name: str, data: ProviderProfileUpdate):
    update_data = {k: v for k, v in data.model_dump().items() if v is not None}
    try:
        update_profile(name, update_data)
        return {"status": "ok", "name": name}
    except ValueError as e:
        raise HTTPException(400, str(e))


@router.delete("/{name}")
async def api_delete_profile(name: str):
    delete_profile(name)
    return {"status": "ok"}


@router.post("/{name}/use")
async def api_switch_profile(name: str):
    try:
        switch_profile(name)
        return {"status": "ok", "name": name}
    except ValueError as e:
        raise HTTPException(400, str(e))


@router.post("/{name}/test")
async def api_test_connection(name: str):
    """Test connection to a provider."""
    try:
        result = await test_connection(name)
        return result
    except ValueError as e:
        raise HTTPException(400, str(e))
    except Exception as e:
        return {"success": False, "message": str(e), "latency_ms": 0, "models": []}


@router.get("/{name}/models")
async def api_list_models(name: str):
    """Fetch available models from a provider."""
    try:
        models = await list_provider_models(name)
        return {"models": models}
    except ValueError as e:
        raise HTTPException(400, str(e))
