from fastapi import APIRouter
from pydantic import BaseModel
try:
    from backend.supabase_client import supabase
    from backend.utils.audit_logger import log_audit
    from backend.services.data_coordinator import data_coordinator
except ImportError:
    from supabase_client import supabase
    from utils.audit_logger import log_audit
    from services.data_coordinator import data_coordinator

router = APIRouter(tags=["Camera Health"])

class HealthUpdate(BaseModel):
    camera_id: str
    status: str

@router.post("/update_health/")
def update_health(health_data: HealthUpdate, user: str = "system"):
    try:
        # Check if record already exists for this camera
        existing = supabase.table("camera_health").select("*").eq("camera_id", health_data.camera_id).execute()
        
        if existing.data:
            data = supabase.table("camera_health").update({
                "status": health_data.status,
                "last_ping": "now()"
            }).eq("camera_id", health_data.camera_id).execute()
        else:
            data = supabase.table("camera_health").insert({
                "camera_id": health_data.camera_id,
                "status": health_data.status
            }).execute()
            
        sync_res = data_coordinator.sync_camera_across_modules({
            "camera_id": health_data.camera_id,
            "status": health_data.status
        }, user=user)

        log_audit("UPDATE_HEALTH", user, {"camera_id": health_data.camera_id, "status": health_data.status})
        return {"message": "Camera health updated", "data": data.data, "sync_status": sync_res}
    except Exception as e:
        # Fallback to in-memory sync
        sync_res = data_coordinator.sync_camera_across_modules({
            "camera_id": health_data.camera_id,
            "status": health_data.status
        }, user=user)
        return {"message": "Camera health updated (local sync)", "sync_status": sync_res}

@router.get("/camera_health/")
@router.get("/health/get_status/")
@router.get("/health/get_status")
def get_camera_health():
    return data_coordinator.get_unified_health_status()
