"""Cron / scheduler REST API router."""

from __future__ import annotations

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.services.cron_service import (
    get_scheduler_status,
    toggle_scheduler,
    list_jobs,
    create_job,
    delete_job,
    toggle_job,
    get_job_history,
)

router = APIRouter(prefix="/api/cron", tags=["cron"])


class JobCreate(BaseModel):
    name: str
    schedule: str
    command: str
    params: dict | None = None


@router.get("/scheduler")
async def api_get_scheduler_status():
    return get_scheduler_status()


@router.post("/scheduler/toggle")
async def api_toggle_scheduler():
    try:
        status = get_scheduler_status()
        result = toggle_scheduler(not status.get("enabled", False))
        return {"status": "ok", "running": result}
    except Exception as e:
        raise HTTPException(500, str(e))


@router.get("/jobs")
async def api_list_jobs():
    return list_jobs()


@router.post("/jobs")
async def api_create_job(data: JobCreate):
    try:
        result = create_job(data.model_dump())
        return {"status": "ok", "job": result}
    except ValueError as e:
        raise HTTPException(400, str(e))
    except Exception as e:
        raise HTTPException(500, str(e))


@router.delete("/jobs/{name}")
async def api_delete_job(name: str):
    try:
        delete_job(name)
        return {"status": "ok"}
    except ValueError as e:
        raise HTTPException(404, str(e))
    except Exception as e:
        raise HTTPException(500, str(e))


@router.patch("/jobs/{name}/toggle")
async def api_toggle_job(name: str):
    try:
        toggle_job(name)
        return {"status": "ok", "name": name}
    except ValueError as e:
        raise HTTPException(404, str(e))
    except Exception as e:
        raise HTTPException(500, str(e))


@router.get("/jobs/{name}/history")
async def api_get_job_history(name: str):
    try:
        return get_job_history(name)
    except ValueError as e:
        raise HTTPException(404, str(e))
    except Exception as e:
        raise HTTPException(500, str(e))
