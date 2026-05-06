"""Sessions REST API router."""

from __future__ import annotations

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.services.sessions_service import (
    list_sessions,
    create_session,
    get_session,
    delete_session,
)

router = APIRouter(prefix="/api/sessions", tags=["sessions"])


class SessionCreate(BaseModel):
    name: str
    model: str
    provider: str


@router.get("")
async def api_list_sessions():
    return list_sessions()


@router.post("")
async def api_create_session(data: SessionCreate):
    try:
        result = create_session(data.model_dump())
        return {"status": "ok", "session": result}
    except ValueError as e:
        raise HTTPException(400, str(e))
    except Exception as e:
        raise HTTPException(500, str(e))


@router.get("/{id}")
async def api_get_session(id: str):
    try:
        return get_session(id)
    except ValueError as e:
        raise HTTPException(404, str(e))
    except Exception as e:
        raise HTTPException(500, str(e))


@router.delete("/{id}")
async def api_delete_session(id: str):
    try:
        delete_session(id)
        return {"status": "ok"}
    except ValueError as e:
        raise HTTPException(404, str(e))
    except Exception as e:
        raise HTTPException(500, str(e))
