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

router = APIRouter(tags=["Maintenance"])

class MaintenanceCreate(BaseModel):
    camera_id: str
    issue: str
    status: str = "Open"

@router.post("/add_maintenance/")
def add_maintenance(maintenance: MaintenanceCreate, user: str = "system"):
    # Normalize status to allowed Postgres check constraint: 'Open', 'In Progress', 'Resolved'
    st_raw = maintenance.status.strip().lower()
    if st_raw in ["in progress", "maintenance", "under review"]:
        norm_status = "In Progress"
    elif st_raw in ["resolved", "closed", "completed"]:
        norm_status = "Resolved"
    else:
        norm_status = "Open"

    try:
        data = supabase.table("maintenance").insert({
            "camera_id": maintenance.camera_id,
            "issue": maintenance.issue,
            "status": norm_status
        }).execute()
        
        # Cross-module sync: if open maintenance ticket, reflect on camera status
        cam_status = "Maintenance" if norm_status in ["Open", "In Progress"] else "Active"
        sync_res = data_coordinator.sync_camera_across_modules({
            "camera_id": maintenance.camera_id,
            "status": cam_status
        }, user=user)

        log_audit("ADD_MAINTENANCE", user, {"camera_id": maintenance.camera_id, "issue": maintenance.issue})
        return {"message": "Maintenance log added", "data": data.data, "sync_status": sync_res}
    except Exception as e:
        sync_res = data_coordinator.sync_camera_across_modules({
            "camera_id": maintenance.camera_id,
            "status": "Maintenance"
        }, user=user)
        return {"message": "Maintenance log added (local sync)", "sync_status": sync_res}

@router.get("/get_maintenance/")
@router.get("/maintenance/get_logs/")
@router.get("/maintenance/get_logs")
def get_maintenance():
    return data_coordinator.get_unified_maintenance_logs()
