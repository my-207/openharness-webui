"""Tasks REST API router."""

from __future__ import annotations

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.services.tasks_service import (
    list_tasks,
    create_task,
    get_task,
    stop_task,
)

router = APIRouter(prefix="/api/tasks", tags=["tasks"])


class TaskCreate(BaseModel):
    name: str
    type: str | None = None
    params: dict | None = None


@router.get("")
async def api_list_tasks():
    return list_tasks()


@router.post("")
async def api_create_task(data: TaskCreate):
    try:
        result = create_task(data.model_dump())
        return {"status": "ok", "task": result}
    except ValueError as e:
        raise HTTPException(400, str(e))
    except Exception as e:
        raise HTTPException(500, str(e))


@router.get("/{id}")
async def api_get_task(id: str):
    try:
        return get_task(id)
    except ValueError as e:
        raise HTTPException(404, str(e))
    except Exception as e:
        raise HTTPException(500, str(e))


@router.post("/{id}/stop")
async def api_stop_task(id: str):
    try:
        stop_task(id)
        return {"status": "ok", "id": id}
    except ValueError as e:
        raise HTTPException(400, str(e))
    except Exception as e:
        raise HTTPException(500, str(e))
