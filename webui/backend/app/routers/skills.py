"""Skills REST API router."""

from __future__ import annotations

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.services.skills_service import (
    list_skills,
    create_skill,
    get_skill,
    delete_skill,
    toggle_skill,
)

router = APIRouter(prefix="/api/skills", tags=["skills"])


class SkillCreate(BaseModel):
    name: str
    description: str | None = None
    prompt: str
    cwds: list[str] | None = None


@router.get("")
async def api_list_skills():
    return list_skills()


@router.post("")
async def api_create_skill(data: SkillCreate):
    try:
        result = create_skill(data.model_dump())
        return {"status": "ok", "skill": result}
    except ValueError as e:
        raise HTTPException(400, str(e))
    except Exception as e:
        raise HTTPException(500, str(e))


@router.get("/{name}")
async def api_get_skill(name: str):
    try:
        return get_skill(name)
    except ValueError as e:
        raise HTTPException(404, str(e))
    except Exception as e:
        raise HTTPException(500, str(e))


@router.delete("/{name}")
async def api_delete_skill(name: str):
    try:
        delete_skill(name)
        return {"status": "ok"}
    except ValueError as e:
        raise HTTPException(404, str(e))
    except Exception as e:
        raise HTTPException(500, str(e))


@router.patch("/{name}/toggle")
async def api_toggle_skill(name: str):
    try:
        toggle_skill(name)
        return {"status": "ok", "name": name}
    except ValueError as e:
        raise HTTPException(404, str(e))
    except Exception as e:
        raise HTTPException(500, str(e))
