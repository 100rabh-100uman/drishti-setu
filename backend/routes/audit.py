from fastapi import APIRouter
try:
    from backend.supabase_client import supabase
except ImportError:
    from supabase_client import supabase

router = APIRouter(tags=["Audit Logs"])

@router.get("/audit_logs/")
def get_audit_logs():
    try:
        data = supabase.table("audit_log").select("*").order("timestamp", desc=True).execute()
        return {"audit_logs": data.data}
    except Exception as e:
        return {"error": str(e)}

@router.get("/camera_activity/{camera_id}")
def get_camera_activity(camera_id: str):
    """Return recent changes from audit_log for a specific camera."""
    try:
        data = supabase.table("audit_log").select("*").eq("camera_id", camera_id).order("timestamp", desc=True).execute()
        return {"activity": data.data}
    except Exception as e:
        return {"error": str(e)}
