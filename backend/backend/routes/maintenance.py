from fastapi import APIRouter
from pydantic import BaseModel
from supabase_client import supabase
from utils.audit_logger import log_audit

router = APIRouter(tags=["Maintenance"])

class MaintenanceCreate(BaseModel):
    camera_id: str
    issue: str
    status: str = "Open"

@router.post("/add_maintenance/")
def add_maintenance(maintenance: MaintenanceCreate, user: str = "system"):
    try:
        data = supabase.table("maintenance").insert({
            "camera_id": maintenance.camera_id,
            "issue": maintenance.issue,
            "status": maintenance.status,
            "updated_at": "now()"
        }).execute()
        
        log_audit("ADD_MAINTENANCE", user, {"camera_id": maintenance.camera_id, "issue": maintenance.issue})
        return {"message": "Maintenance log added", "data": data.data}
    except Exception as e:
        return {"error": str(e)}

@router.get("/get_maintenance/")
def get_maintenance():
    try:
        data = supabase.table("maintenance").select("*").order("created_at", desc=True).execute()
        return {"maintenance": data.data}
    except Exception as e:
        return {"error": str(e)}
