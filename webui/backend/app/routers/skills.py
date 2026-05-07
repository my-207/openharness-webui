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
    content: str | None = None
    source: str | None = None


@router.get("")
async def api_list_skills():
    return list_skills()


@router.post("")
async def api_create_skill(data: SkillCreate):
    try:
        result = create_skill(data.model_dump(exclude_none=True))
        return {"status": "ok", "skill": result}
    except ValueError as e:
        raise HTTPException(400, str(e))
    except Exception as e:
        raise HTTPException(500, str(e))


@router.get("/{name}")
async def api_get_skill(name: str):
    try:
        result = get_skill(name)
        if result is None:
            raise HTTPException(404, f"Skill '{name}' not found")
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, str(e))


@router.delete("/{name}")
async def api_delete_skill(name: str):
    try:
        deleted = delete_skill(name)
        if not deleted:
            raise HTTPException(404, f"Skill '{name}' not found")
        return {"status": "ok"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, str(e))


@router.post("/{name}/toggle")
async def api_toggle_skill(name: str):
    try:
        toggled = toggle_skill(name)
        if not toggled:
            raise HTTPException(404, f"Skill '{name}' not found")
        return {"status": "ok", "name": name}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, str(e))
