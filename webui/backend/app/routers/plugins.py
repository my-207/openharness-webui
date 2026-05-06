"""Plugins REST API router."""

from __future__ import annotations

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.services.plugins_service import (
    list_plugins,
    install_plugin,
    uninstall_plugin,
    toggle_plugin,
)

router = APIRouter(prefix="/api/plugins", tags=["plugins"])


class PluginInstall(BaseModel):
    name: str
    source: str


@router.get("")
async def api_list_plugins():
    return list_plugins()


@router.post("")
async def api_install_plugin(data: PluginInstall):
    try:
        install_plugin(data.model_dump())
        return {"status": "ok", "name": data.name}
    except ValueError as e:
        raise HTTPException(400, str(e))
    except Exception as e:
        raise HTTPException(500, str(e))


@router.delete("/{name}")
async def api_uninstall_plugin(name: str):
    try:
        uninstall_plugin(name)
        return {"status": "ok"}
    except ValueError as e:
        raise HTTPException(404, str(e))
    except Exception as e:
        raise HTTPException(500, str(e))


@router.patch("/{name}/toggle")
async def api_toggle_plugin(name: str):
    try:
        toggle_plugin(name)
        return {"status": "ok", "name": name}
    except ValueError as e:
        raise HTTPException(404, str(e))
    except Exception as e:
        raise HTTPException(500, str(e))
