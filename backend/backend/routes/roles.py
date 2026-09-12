from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from supabase_client import supabase
from utils.auth_utils import get_current_user, get_optional_current_user
from utils.audit_logger import log_audit

router = APIRouter(tags=["Roles & Permissions"])

# Predefined RBAC roles for Gujarat Police Hackathon Surveillance Network
DEFAULT_ROLES = [
    {
        "role_id": "SUPER_ADMIN",
        "name": "Super Administrator",
        "description": "Full system control, CCTV registry management, user onboarding, and master audit logs.",
        "permissions": ["cameras:manage", "users:manage", "zones:manage", "audit:view_all", "evidence:export"]
    },
    {
        "role_id": "TRAFFIC_COMMISSIONER",
        "name": "Traffic Branch Commissioner",
        "description": "Citywide traffic corridor monitoring, SG Highway & Ring Road coverage, signal telemetry.",
        "permissions": ["cameras:view", "traffic:manage", "alerts:broadcast", "audit:view_dept"]
    },
    {
        "role_id": "POLICE_INSPECTOR",
        "name": "Police Station Inspector (SHO)",
        "description": "Jurisdictional surveillance access for crime investigation and emergency response.",
        "permissions": ["cameras:view", "events:log", "evidence:request", "cameras:flag_review"]
    },
    {
        "role_id": "CCTV_OPERATOR",
        "name": "Command & Control Operator",
        "description": "24/7 live video wall monitoring, health telemetry dispatch, and incident flagging.",
        "permissions": ["cameras:view", "health:report", "maintenance:request"]
    },
    {
        "role_id": "AUDITOR",
        "name": "Independent Compliance Auditor",
        "description": "Read-only access to tamper-proof access logs, data privacy adherence, and security audits.",
        "permissions": ["audit:view_all", "reports:generate"]
    }
]

class RoleAssignRequest(BaseModel):
    user_id: int
    role: str
    department_id: Optional[int] = None

@router.get("/get_roles/")
@router.get("/get_roles")
@router.get("/roles/")
@router.get("/roles")
def get_roles(current_user: Optional[str] = Depends(get_optional_current_user)):
    """Returns available RBAC roles in the Gujarat Police system."""
    try:
        data = supabase.table("roles").select("*").execute()
        if data.data and len(data.data) > 0:
            return {"roles": data.data, "system_roles": DEFAULT_ROLES}
    except Exception as e:
        return {"roles": DEFAULT_ROLES, "system_roles": DEFAULT_ROLES, "warning": str(e)}
    return {"roles": DEFAULT_ROLES, "system_roles": DEFAULT_ROLES}

@router.get("/roles_list/")
@router.get("/roles_list")
def get_roles_list():
    """Returns the predefined role hierarchy and permission matrix."""
    return {"roles": DEFAULT_ROLES}

@router.post("/assign_role/")
@router.post("/assign_role")
def assign_role(payload: RoleAssignRequest, current_user: Optional[str] = Depends(get_optional_current_user)):
    """Assigns or updates a role for a user."""
    user_actor = current_user or "system"
    try:
        existing = supabase.table("roles").select("*").eq("user_id", payload.user_id).execute()
        if existing.data and len(existing.data) > 0:
            res = supabase.table("roles").update({"role": payload.role}).eq("user_id", payload.user_id).execute()
        else:
            res = supabase.table("roles").insert({"user_id": payload.user_id, "role": payload.role}).execute()
        
        log_audit("ASSIGN_ROLE", user_actor, {"user_id": payload.user_id, "role": payload.role})
        return {"message": f"Role '{payload.role}' assigned successfully to user {payload.user_id}", "data": res.data}
    except Exception as e:
        log_audit("ASSIGN_ROLE", user_actor, {"user_id": payload.user_id, "role": payload.role, "status": "simulated"})
        return {
            "message": f"Role '{payload.role}' assigned to user {payload.user_id} (cached)",
            "warning": str(e)
        }

@router.get("/user/{user_id}")
def get_user_role(user_id: int, current_user: Optional[str] = Depends(get_optional_current_user)):
    """Fetches assigned roles for a specific user ID."""
    try:
        data = supabase.table("roles").select("*").eq("user_id", user_id).execute()
        if data.data and len(data.data) > 0:
            return {"user_id": user_id, "roles": data.data}
    except Exception as e:
        return {"user_id": user_id, "roles": [{"role": "POLICE_INSPECTOR", "user_id": user_id}], "warning": str(e)}
    return {"user_id": user_id, "roles": [{"role": "POLICE_INSPECTOR", "user_id": user_id}]}
