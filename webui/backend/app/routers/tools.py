"""Tools REST API router."""

from __future__ import annotations

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.services.tools_service import (
    list_tools,
    list_mcp_servers,
    add_mcp_server,
    remove_mcp_server,
)

router = APIRouter(prefix="/api/tools", tags=["tools"])


class McpServerAdd(BaseModel):
    name: str
    command: str | None = None
    args: list[str] | None = None
    url: str | None = None


@router.get("")
async def api_list_tools():
    return list_tools()


@router.get("/mcp")
async def api_list_mcp_servers():
    return list_mcp_servers()


@router.post("/mcp")
async def api_add_mcp_server(data: McpServerAdd):
    try:
        add_mcp_server(data.model_dump(exclude_none=True))
        return {"status": "ok", "name": data.name}
    except ValueError as e:
        raise HTTPException(400, str(e))
    except Exception as e:
        raise HTTPException(500, str(e))


@router.delete("/mcp/{name}")
async def api_remove_mcp_server(name: str):
    try:
        remove_mcp_server(name)
        return {"status": "ok"}
    except ValueError as e:
        raise HTTPException(404, str(e))
    except Exception as e:
        raise HTTPException(500, str(e))
