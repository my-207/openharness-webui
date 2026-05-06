"""Swarm REST API router."""

from __future__ import annotations

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.services.swarm_service import (
    list_teammates,
    create_team,
    delete_team,
    list_notifications,
)

router = APIRouter(prefix="/api/swarm", tags=["swarm"])


class TeamCreate(BaseModel):
    name: str
    members: list[str]


@router.get("")
async def api_list_teammates():
    return list_teammates()


@router.post("/team")
async def api_create_team(data: TeamCreate):
    try:
        result = create_team(data.model_dump())
        return {"status": "ok", "team": result}
    except ValueError as e:
        raise HTTPException(400, str(e))
    except Exception as e:
        raise HTTPException(500, str(e))


@router.delete("/team/{name}")
async def api_delete_team(name: str):
    try:
        delete_team(name)
        return {"status": "ok"}
    except ValueError as e:
        raise HTTPException(404, str(e))
    except Exception as e:
        raise HTTPException(500, str(e))


@router.get("/notifications")
async def api_list_notifications():
    return list_notifications()
