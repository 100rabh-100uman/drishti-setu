from fastapi import APIRouter, Query
from pydantic import BaseModel
from typing import List, Optional
from supabase_client import supabase
from utils.audit_logger import log_audit

router = APIRouter()
app = router # Alias for main.py integration

class CameraCreate(BaseModel):
    camera_id: str
    department_id: int
    camera_type: str
    status: str
    latitude: float
    longitude: float
    mac_address: str
    serial_number: str
    device_uuid: Optional[str] = None
    ip_address: Optional[str] = None
    address: Optional[str] = None
    zone_id: Optional[str] = None
    needs_review: bool = False

class CameraUpdate(BaseModel):
    address: Optional[str] = None
    status: Optional[str] = None
    needs_review: Optional[bool] = None

@router.post("/add_camera/")
def add_camera(camera: CameraCreate, username: str = "system"):
    geom = f"POINT({camera.longitude} {camera.latitude})"
    try:
        data = supabase.table("cameras").insert({
            "camera_id": camera.camera_id,
            "department_id": camera.department_id,
            "camera_type": camera.camera_type,
            "status": camera.status,
            "geom": geom,
            "mac_address": camera.mac_address,
            "serial_number": camera.serial_number,
            "device_uuid": camera.device_uuid,
            "ip_address": camera.ip_address,
            "address": camera.address,
            "zone_id": camera.zone_id,
            "needs_review": camera.needs_review
        }).execute()
        
        log_audit("ADD_CAMERA", username, {"camera_id": camera.camera_id}, camera_id=camera.camera_id)
        return {"message": "Camera added", "data": data.data}
    except Exception as e:
        return {"error": str(e)}

@router.post("/update_camera/{camera_id}")
def update_camera(camera_id: str, updates: CameraUpdate, username: str = "system"):
    update_data = {k: v for k, v in updates.dict().items() if v is not None}
    if not update_data:
        return {"message": "No updates provided"}
        
    # Auto-flag for review if status is changed to an offline state
    if update_data.get("status") in ["Offline", "Maintenance", "Degraded"]:
        update_data["needs_review"] = True

    try:
        data = supabase.table("cameras").update(update_data).eq("camera_id", camera_id).execute()
        log_audit("UPDATE_CAMERA", username, update_data, camera_id=camera_id)
        return {"message": "Camera updated", "data": data.data}
    except Exception as e:
        return {"error": str(e)}

import struct

@router.get("/get_cameras/")
def get_cameras(
    department_id: Optional[int] = Query(None),
    camera_type: Optional[str] = Query(None),
    zone_id: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    needs_review: Optional[bool] = Query(None)
):
    try:
        query = supabase.table("cameras").select("*")
        
        if department_id is not None:
            query = query.eq("department_id", department_id)
        if camera_type:
            query = query.eq("camera_type", camera_type)
        if zone_id:
            query = query.eq("zone_id", zone_id)
        if status:
            query = query.eq("status", status)
        if needs_review is not None:
            query = query.eq("needs_review", needs_review)
            
        data = query.execute()
        
        # Parse PostGIS EWKB hex string into usable Lat/Lng for the frontend
        parsed_cameras = []
        for cam in data.data:
            geom_hex = cam.get("geom")
            cam["lat"] = None
            cam["lng"] = None
            if geom_hex and isinstance(geom_hex, str) and len(geom_hex) >= 50:
                try:
                    # EWKB Point: 1 byte endian + 4 bytes type + 4 bytes SRID = 9 bytes (18 hex chars)
                    # Next 8 bytes (16 hex chars) is X (longitude)
                    # Next 8 bytes (16 hex chars) is Y (latitude)
                    lon_hex = geom_hex[18:34]
                    lat_hex = geom_hex[34:50]
                    cam["lng"] = struct.unpack('<d', bytes.fromhex(lon_hex))[0]
                    cam["lat"] = struct.unpack('<d', bytes.fromhex(lat_hex))[0]
                except Exception as parse_e:
                    print(f"Error parsing geom for {cam.get('camera_id')}: {parse_e}")
            parsed_cameras.append(cam)
            
        return {"cameras": parsed_cameras}
    except Exception as e:
        return {"error": str(e)}

@router.get("/cameras/{camera_id}")
def get_camera(camera_id: str):
    try:
        data = supabase.table("cameras").select("*").eq("camera_id", camera_id).execute()
        if not data.data:
            return {"error": "Camera not found"}
        return {"camera": data.data[0]}
    except Exception as e:
        return {"error": str(e)}

@router.get('/get_camera_events/{camera_id}')
def get_camera_events(camera_id: str):
    try:
        data = supabase.table('events').select('*').eq('camera_id', camera_id).order('created_at', desc=True).limit(5).execute()
        return {'events': data.data}
    except Exception as e:
        return {'error': str(e)}

