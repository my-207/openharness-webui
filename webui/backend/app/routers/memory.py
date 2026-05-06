"""Memory REST API router."""

from __future__ import annotations

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel

from app.services.memory_service import (
    list_memory,
    create_memory,
    get_memory,
    update_memory,
    delete_memory,
    search_memory,
)

router = APIRouter(prefix="/api/memory", tags=["memory"])


class MemoryCreate(BaseModel):
    content: str
    tags: list[str] | None = None


class MemoryUpdate(BaseModel):
    content: str | None = None
    tags: list[str] | None = None


@router.get("")
async def api_list_memory():
    return list_memory()


@router.post("")
async def api_create_memory(data: MemoryCreate):
    try:
        result = create_memory(data.model_dump())
        return {"status": "ok", "memory": result}
    except ValueError as e:
        raise HTTPException(400, str(e))
    except Exception as e:
        raise HTTPException(500, str(e))


@router.get("/{id}")
async def api_get_memory(id: str):
    try:
        return get_memory(id)
    except ValueError as e:
        raise HTTPException(404, str(e))
    except Exception as e:
        raise HTTPException(500, str(e))


@router.patch("/{id}")
async def api_update_memory(id: str, data: MemoryUpdate):
    update_data = {k: v for k, v in data.model_dump().items() if v is not None}
    try:
        update_memory(id, update_data)
        return {"status": "ok", "id": id}
    except ValueError as e:
        raise HTTPException(400, str(e))
    except Exception as e:
        raise HTTPException(500, str(e))


@router.delete("/{id}")
async def api_delete_memory(id: str):
    try:
        delete_memory(id)
        return {"status": "ok"}
    except ValueError as e:
        raise HTTPException(404, str(e))
    except Exception as e:
        raise HTTPException(500, str(e))


@router.get("/search")
async def api_search_memory(q: str = Query(..., description="Search query")):
    try:
        return search_memory(q)
    except Exception as e:
        raise HTTPException(500, str(e))
