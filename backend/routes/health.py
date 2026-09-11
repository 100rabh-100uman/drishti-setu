from fastapi import APIRouter
from pydantic import BaseModel
try:
    from backend.supabase_client import supabase
    from backend.utils.audit_logger import log_audit
except ImportError:
    from supabase_client import supabase
    from utils.audit_logger import log_audit

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
            
        log_audit("UPDATE_HEALTH", user, {"camera_id": health_data.camera_id, "status": health_data.status})
        return {"message": "Camera health updated", "data": data.data}
    except Exception as e:
        return {"error": str(e)}

@router.get("/camera_health/")
def get_camera_health():
    try:
        data = supabase.table("camera_health").select("*").execute()
        return {"camera_health": data.data}
    except Exception as e:
        return {"error": str(e)}
