from supabase_client import supabase
from typing import Optional

def log_audit(action: str, username: str, details: dict, camera_id: Optional[str] = None):
    """Utility to centrally log actions to the audit_log table."""
    try:
        supabase.table("audit_log").insert({
            "action": action,
            "username": username,
            "details": details,
            "camera_id": camera_id
        }).execute()
    except Exception as e:
        print(f"Audit log failed: {e}")
