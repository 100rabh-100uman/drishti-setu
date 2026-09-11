"""
DRISHTI SETU — CCTV Footage Recordings & 16x Fast Playback Routes
Endpoints:
- /recordings/ → List available recordings with metadata (date, duration, size, retention)
- /playback/{date} → Stream stored footage with optional 16x fast-forward speed
- /recordings/retention-status → Storage capacity and retention metrics
- /recordings/cleanup → Run automatic retention pruning
"""

from fastapi import APIRouter, Query, HTTPException
from fastapi.responses import StreamingResponse, JSONResponse
from typing import Optional, List, Dict, Any
import datetime
from backend.services.storage_manager import storage_manager, DEFAULT_RETENTION_DAYS, CAMERA_HARDWARE_PROFILES

router = APIRouter(tags=["CCTV Recordings & Stored Footage Playback"])


@router.get("/recordings/", tags=["CCTV Recordings & Stored Footage Playback"])
@router.get("/recordings", tags=["CCTV Recordings & Stored Footage Playback"])
def get_recordings(
    camera_id: Optional[str] = Query(None, description="Filter recordings by camera ID (e.g., CAM001)"),
    date: Optional[str] = Query(None, description="Filter recordings by date (YYYY-MM-DD)")
):
    """
    List available CCTV recordings with rich metadata:
    - Date, start/end timestamps, duration formatted (e.g., 15m 00s)
    - File size, supported playback speeds (1x, 16x)
    - Retention status (max allowed days, days remaining before auto-pruning)
    - Real-time detection summaries (Vehicles, Persons, Crowds, ANPR plates)
    """
    recs = storage_manager.list_recordings(camera_id=camera_id, date_str=date)
    return {
        "status": "success",
        "total_recordings": len(recs),
        "retention_policy_days": DEFAULT_RETENTION_DAYS,
        "camera_filter": camera_id,
        "date_filter": date,
        "recordings": recs
    }


@router.get("/playback/{date}", tags=["CCTV Recordings & Stored Footage Playback"])
@router.get("/playback/{date}/", tags=["CCTV Recordings & Stored Footage Playback"])
def get_playback_stream(
    date: str,
    camera_id: Optional[str] = Query("CAM001", description="Camera ID for stored footage (default: CAM001)"),
    speed: Optional[int] = Query(1, description="Playback speed: 1 (Normal Speed) or 16 (16x Fast View)")
):
    """
    Stream stored CCTV footage for the specified date with optional 16x playback speed.
    - speed=1: Normal real-time playback (25 FPS)
    - speed=16: 16x fast-forward view with high-visibility HUD indicator
    If footage for the requested date has expired past the retention limit, returns 404.
    """
    cam_id = camera_id or "CAM001"
    speed_factor = 16 if speed >= 16 else (speed if speed in (1, 2, 4, 8, 16) else 1)
    
    # Check retention validity
    retention_limit = storage_manager.get_camera_retention_limit(cam_id)
    now_date = datetime.datetime.now(datetime.timezone.utc).date()
    try:
        req_date = datetime.datetime.strptime(date, "%Y-%m-%d").date()
        days_diff = (now_date - req_date).days
        if days_diff < 0:
            return JSONResponse(
                status_code=400,
                content={"error": f"Invalid recording date '{date}': date is in the future"}
            )
        if days_diff > retention_limit:
            return JSONResponse(
                status_code=404,
                content={
                    "error": "Recording expired by retention policy",
                    "requested_date": date,
                    "camera_id": cam_id,
                    "retention_limit_days": retention_limit,
                    "days_old": days_diff
                }
            )
    except ValueError:
        # Fallback to date string if valid
        pass

    stream = storage_manager.generate_playback_stream(
        date_str=date,
        camera_id=cam_id,
        speed=speed_factor
    )

    return StreamingResponse(
        stream,
        media_type="multipart/x-mixed-replace; boundary=frame"
    )


@router.get("/recordings/retention-status", tags=["CCTV Recordings & Stored Footage Playback"])
def get_retention_status():
    """
    Returns the system-wide and per-camera retention settings, storage utilization,
    and automatic cleanup parameters.
    """
    recordings = storage_manager.list_recordings()
    total_size_mb = sum(r.get("file_size_mb", 0) for r in recordings)
    
    cameras_status = []
    for cid, prof in CAMERA_HARDWARE_PROFILES.items():
        cam_recs = [r for r in recordings if r["camera_id"] == cid]
        cam_size = sum(r.get("file_size_mb", 0) for r in cam_recs)
        cameras_status.append({
            "camera_id": cid,
            "location": prof.get("location"),
            "configured_retention_days": prof.get("max_retention_days"),
            "storage_capacity_mb": prof.get("capacity_mb"),
            "storage_used_mb": round(cam_size, 1),
            "storage_percent": round((cam_size / prof.get("capacity_mb", 5000)) * 100, 1),
            "recordings_count": len(cam_recs),
            "auto_pruning_active": True
        })

    return {
        "global_default_retention_days": DEFAULT_RETENTION_DAYS,
        "total_active_recordings": len(recordings),
        "total_storage_used_mb": round(total_size_mb, 1),
        "auto_cleanup_policy": "Scheduled daily and on storage threshold breach",
        "speed_modes_supported": [1, 16],
        "cameras": cameras_status
    }


@router.post("/recordings/cleanup", tags=["CCTV Recordings & Stored Footage Playback"])
def run_retention_cleanup():
    """
    Manually triggers the automated retention cleanup engine to purge expired recordings.
    """
    result = storage_manager.cleanup_old_recordings()
    return result
