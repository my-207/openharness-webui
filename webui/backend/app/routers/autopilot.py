"""Autopilot REST API router."""

from __future__ import annotations

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.services.autopilot_service import (
    get_status,
    list_entries,
    add_entry,
    trigger_scan,
    run_next,
    export_dashboard,
)

router = APIRouter(prefix="/api/autopilot", tags=["autopilot"])


class AutopilotEntry(BaseModel):
    title: str
    description: str | None = None
    priority: int | None = None


@router.get("")
async def api_get_status():
    return get_status()


@router.get("/entries")
async def api_list_entries():
    return list_entries()


@router.post("/entries")
async def api_add_entry(data: AutopilotEntry):
    try:
        result = add_entry(data.model_dump())
        return {"status": "ok", "entry": result}
    except ValueError as e:
        raise HTTPException(400, str(e))
    except Exception as e:
        raise HTTPException(500, str(e))


@router.post("/scan")
async def api_trigger_scan():
    try:
        result = trigger_scan()
        return {"status": "ok", "result": result}
    except Exception as e:
        raise HTTPException(500, str(e))


@router.post("/run-next")
async def api_run_next():
    try:
        result = run_next()
        return {"status": "ok", "result": result}
    except Exception as e:
        raise HTTPException(500, str(e))


@router.get("/export")
async def api_export_dashboard():
    try:
        return export_dashboard()
    except Exception as e:
        raise HTTPException(500, str(e))
