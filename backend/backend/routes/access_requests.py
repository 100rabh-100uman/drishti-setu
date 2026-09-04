from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field, validator
from typing import Optional, List
from datetime import datetime, timedelta, timezone
import secrets
import re
import os

from supabase_client import supabase
from utils.auth_utils import get_password_hash, get_current_admin_user
from utils.audit_logger import log_audit

router = APIRouter()

ALLOWED_ROLES = ("Admin", "Inspector", "Viewer")

def is_demo_mode() -> bool:
    """
    Returns True when DEMO_MODE environment variable is enabled.
    In DEMO MODE, approved access requests are directly activated with is_active=True
    and a generated bcrypt-hashed password returned ONCE to the authorized Admin.
    In PRODUCTION (DEMO_MODE=false), accounts remain inactive (is_active=False)
    until the user sets their password via the activation link.
    """
    return os.getenv("DEMO_MODE", "false").lower() in ("true", "1", "yes")

# Regex for standard RFC 5322 compatible email validation
EMAIL_REGEX = r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"

# --- Pydantic Models ---
class AccessRequestCreate(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=150, description="Full Name of official")
    employee_id: str = Field(..., min_length=3, max_length=50, description="Government Employee ID")
    official_email: str = Field(..., description="Official Government Email")
    mobile_number: str = Field(..., min_length=10, max_length=20, description="Contact Phone Number")
    department_id: int = Field(..., gt=0, description="Department ID from departments table")
    designation: str = Field(..., min_length=2, max_length=100, description="Designation / Rank")
    office_unit: str = Field(..., min_length=2, max_length=150, description="Police Station / Office Unit")
    district: str = Field(..., min_length=2, max_length=100, description="Administrative District")
    requested_role: str = Field(..., description="Requested Platform Role (Admin, Inspector, Viewer)")
    reason: str = Field(..., min_length=10, max_length=1000, description="Official justification for platform access")

    @validator("full_name", "employee_id", "designation", "office_unit", "district", "reason")
    def strip_text(cls, v: str) -> str:
        stripped = v.strip()
        if not stripped:
            raise ValueError("Field cannot be empty or only whitespace")
        return stripped

    @validator("employee_id")
    def validate_employee_id(cls, v: str) -> str:
        cleaned = v.strip().upper()
        if not re.match(r"^[A-Z0-9\-_]{3,50}$", cleaned):
            raise ValueError("Employee ID must contain only alphanumeric characters, hyphens, or underscores")
        return cleaned

    @validator("official_email")
    def validate_email(cls, v: str) -> str:
        cleaned = v.strip().lower()
        if not re.match(EMAIL_REGEX, cleaned):
            raise ValueError("Must be a valid email address (e.g. officer@police.gujarat.gov.in)")
        return cleaned

    @validator("requested_role")
    def validate_role(cls, v: str) -> str:
        if v not in ALLOWED_ROLES:
            raise ValueError(f"Requested role must be one of: {', '.join(ALLOWED_ROLES)}")
        return v

    @validator("mobile_number")
    def validate_mobile(cls, v: str) -> str:
        cleaned = re.sub(r"[\s\-\(\)]", "", v)
        if not re.match(r"^(\+91)?[6-9]\d{9}$", cleaned):
            raise ValueError("Mobile number must be a valid 10-digit Indian phone number (optionally with +91)")
        return cleaned

class AccessRequestReject(BaseModel):
    rejection_reason: str = Field(..., min_length=5, max_length=500, description="Official reason for rejection")

    @validator("rejection_reason")
    def strip_reason(cls, v: str) -> str:
        stripped = v.strip()
        if len(stripped) < 5:
            raise ValueError("Rejection reason must be at least 5 characters long")
        return stripped

class AccessRequestApprove(BaseModel):
    role: Optional[str] = Field(None, description="Optional override for the approved role")

    @validator("role")
    def validate_role_override(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and v not in ALLOWED_ROLES:
            raise ValueError(f"Approved role must be one of: {', '.join(ALLOWED_ROLES)}")
        return v

class ActivateAccountPayload(BaseModel):
    token: str = Field(..., min_length=16, description="One-time activation token")
    password: str = Field(..., min_length=8, max_length=128, description="Officer chosen secure password")

    @validator("password")
    def validate_password_strength(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters long")
        return v


def _handle_supabase_error(e: Exception):
    err_str = str(e)
    # Check if table does not exist in Supabase PostgREST / PostgreSQL
    if (
        "PGRST205" in err_str
        or "42P01" in err_str
        or "schema cache" in err_str
        or ("access_requests" in err_str and ("does not exist" in err_str or "relation" in err_str or "Could not find" in err_str))
    ):
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="The 'access_requests' table has not been created yet in the database. Please execute migration '001_create_access_requests.sql' in the Supabase SQL editor."
        )
    raise HTTPException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail=f"Database operation failed: {err_str}"
    )


# --- Public Submission Endpoint ---
@router.post("/", status_code=status.HTTP_201_CREATED, tags=["Access Requests"])
def submit_access_request(payload: AccessRequestCreate):
    """
    Public endpoint: Allows government personnel to submit a formal request for platform access.
    Validates input, ensures no active user or duplicate pending request exists, and generates a tracking ID.
    """
    try:
        # 1. Verify Department exists
        dept_res = supabase.table("departments").select("id, name").eq("id", payload.department_id).execute()
        if not dept_res.data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid department ID ({payload.department_id}). Please select a valid department."
            )
        dept_name = dept_res.data[0]["name"]

        # 2. Check if user with this employee_id already has an active account in users table
        existing_user = supabase.table("users").select("id, employee_id").eq("employee_id", payload.employee_id).execute()
        if existing_user.data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"An account with Employee ID '{payload.employee_id}' is already registered. Please login or contact your administrator."
            )

        # 3. Check for existing PENDING request for this employee_id
        try:
            pending_req = supabase.table("access_requests") \
                .select("request_id, created_at") \
                .eq("employee_id", payload.employee_id) \
                .eq("status", "PENDING") \
                .execute()
            
            if pending_req.data:
                existing_req = pending_req.data[0]
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=f"A pending access request ({existing_req['request_id']}) already exists for Employee ID '{payload.employee_id}'. Please await administrative review."
                )

            # 4. Check for existing PENDING request for this official_email
            pending_email = supabase.table("access_requests") \
                .select("request_id") \
                .eq("official_email", payload.official_email) \
                .eq("status", "PENDING") \
                .execute()
            
            if pending_email.data:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="A pending access request is already registered with this official email address."
                )
        except HTTPException:
            raise
        except Exception as e:
            _handle_supabase_error(e)

        # 5. Generate unique tracking ID: REQ-YYYYMMDD-XXXX
        today_str = datetime.utcnow().strftime("%Y%m%d")
        random_suffix = secrets.token_hex(3).upper()
        request_id = f"REQ-{today_str}-{random_suffix}"

        # 6. Insert new access request
        try:
            insert_data = {
                "request_id": request_id,
                "full_name": payload.full_name,
                "employee_id": payload.employee_id,
                "official_email": payload.official_email,
                "mobile_number": payload.mobile_number,
                "department_id": payload.department_id,
                "designation": payload.designation,
                "office_unit": payload.office_unit,
                "district": payload.district,
                "requested_role": payload.requested_role,
                "reason": payload.reason,
                "status": "PENDING"
            }
            insert_res = supabase.table("access_requests").insert(insert_data).execute()
            
            # 7. Audit log
            log_audit(
                action="REQUEST_ACCESS",
                username=payload.full_name,
                details={
                    "request_id": request_id,
                    "employee_id": payload.employee_id,
                    "department_id": payload.department_id,
                    "department_name": dept_name,
                    "requested_role": payload.requested_role
                }
            )

            return {
                "message": "Access request submitted successfully. It has been forwarded for administrative verification.",
                "request_id": request_id,
                "status": "PENDING",
                "employee_id": payload.employee_id,
                "department_name": dept_name,
                "requested_role": payload.requested_role,
                "created_at": insert_res.data[0]["created_at"] if insert_res.data else datetime.utcnow().isoformat()
            }
        except Exception as e:
            _handle_supabase_error(e)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


# --- Admin Protected Endpoints ---

@router.get("/", tags=["Access Requests"])
def list_access_requests(
    status_filter: Optional[str] = Query(None, alias="status", pattern="^(PENDING|APPROVED|REJECTED)$"),
    department_id: Optional[int] = Query(None),
    current_admin: dict = Depends(get_current_admin_user)
):
    """
    Admin only: List all submitted access requests with optional status and department filters.
    """
    try:
        query = supabase.table("access_requests") \
            .select("id, request_id, full_name, employee_id, official_email, mobile_number, department_id, designation, office_unit, district, requested_role, reason, status, reviewed_by, reviewed_at, rejection_reason, created_at, departments(name)") \
            .order("created_at", desc=True)

        if status_filter:
            query = query.eq("status", status_filter)
        if department_id:
            query = query.eq("department_id", department_id)

        res = query.execute()
        return {
            "requests": res.data or [],
            "count": len(res.data) if res.data else 0
        }
    except Exception as e:
        _handle_supabase_error(e)


# --- Public Activation & Password Setup Endpoints ---

@router.get("/verify-token", tags=["Access Requests"])
def verify_activation_token(token: str = Query(..., min_length=16)):
    """
    Public endpoint: Verifies an activation token and returns officer confirmation profile.
    Rejects invalid, expired, or already-activated tokens.
    """
    try:
        res = supabase.table("access_requests") \
            .select("*, departments(name)") \
            .eq("activation_token", token) \
            .execute()
        
        if not res.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Invalid or unrecognized activation token. Please verify your activation link or contact administration."
            )
        
        req = res.data[0]
        if req.get("activated_at"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This account has already been activated. Please proceed to the login page."
            )
        
        expires_at_str = req.get("activation_token_expires_at")
        if expires_at_str:
            clean_str = expires_at_str.replace("Z", "+00:00")
            expires_at = datetime.fromisoformat(clean_str)
            now_tz = datetime.now(timezone.utc)
            if expires_at.tzinfo is None:
                expires_at = expires_at.replace(tzinfo=timezone.utc)
            if now_tz > expires_at:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="This activation link has expired. Please contact your system administrator to re-issue an activation link."
                )
        
        dept_name = req.get("departments", {}).get("name") if req.get("departments") else "Gujarat Police"
        return {
            "valid": True,
            "full_name": req.get("full_name"),
            "employee_id": req.get("employee_id"),
            "department_name": dept_name,
            "requested_role": req.get("requested_role")
        }
    except HTTPException:
        raise
    except Exception as e:
        _handle_supabase_error(e)


@router.post("/activate", tags=["Access Requests"])
def activate_account(payload: ActivateAccountPayload):
    """
    Public endpoint: Allows an approved officer to set their own password and activate their account.
    Bcrypt-hashes the chosen password, sets users.is_active = TRUE, records activated_at, clears activation token and expiry, and logs audit.
    """
    try:
        # 1. Look up request by token
        res = supabase.table("access_requests") \
            .select("*") \
            .eq("activation_token", payload.token) \
            .execute()
        
        if not res.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Invalid or expired activation token."
            )
        
        req = res.data[0]
        if req.get("activated_at"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This account has already been activated. Please proceed to login."
            )
        
        expires_at_str = req.get("activation_token_expires_at")
        if expires_at_str:
            clean_str = expires_at_str.replace("Z", "+00:00")
            expires_at = datetime.fromisoformat(clean_str)
            now_tz = datetime.now(timezone.utc)
            if expires_at.tzinfo is None:
                expires_at = expires_at.replace(tzinfo=timezone.utc)
            if now_tz > expires_at:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="This activation link has expired. Please contact your administrator for a new activation link."
                )

        # 2. Hash user-chosen password using bcrypt (never plaintext)
        hashed_pw = get_password_hash(payload.password)

        # 3. Update users table: set password and is_active = True
        update_user_data = {
            "password": hashed_pw,
            "is_active": True
        }
        user_id = req.get("user_id")
        if user_id:
            try:
                supabase.table("users").update(update_user_data).eq("id", user_id).execute()
            except Exception:
                # Fallback if is_active column is not in DB yet
                supabase.table("users").update({"password": hashed_pw}).eq("id", user_id).execute()
        else:
            try:
                supabase.table("users").update(update_user_data).eq("employee_id", req["employee_id"]).execute()
            except Exception:
                supabase.table("users").update({"password": hashed_pw}).eq("employee_id", req["employee_id"]).execute()

        # 4. Clear activation token and record activated_at
        now_iso = datetime.utcnow().isoformat()
        supabase.table("access_requests").update({
            "activated_at": now_iso,
            "activation_token": None,
            "activation_token_expires_at": None
        }).eq("id", req["id"]).execute()

        # 5. Central audit log
        log_audit(
            action="ACTIVATE_ACCOUNT",
            username=req["full_name"],
            details={
                "employee_id": req["employee_id"],
                "request_id": req["request_id"]
            }
        )

        return {
            "message": "Account activated successfully. You can now log in with your Employee ID and password.",
            "employee_id": req["employee_id"],
            "status": "ACTIVATED"
        }
    except HTTPException:
        raise
    except Exception as e:
        _handle_supabase_error(e)


# --- Admin Protected Detail & Action Endpoints ---

@router.get("/{request_id}", tags=["Access Requests"])
def get_access_request_detail(
    request_id: str,
    current_admin: dict = Depends(get_current_admin_user)
):
    """
    Admin only: View detailed information for a specific access request.
    """
    try:
        res = supabase.table("access_requests") \
            .select("*, departments(name)") \
            .eq("request_id", request_id) \
            .execute()
        
        if not res.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Access request '{request_id}' not found"
            )
        return res.data[0]
    except HTTPException:
        raise
    except Exception as e:
        _handle_supabase_error(e)


@router.post("/{request_id}/approve", tags=["Access Requests"])
def approve_access_request(
    request_id: str,
    body: Optional[AccessRequestApprove] = None,
    current_admin: dict = Depends(get_current_admin_user)
):
    """
    Admin only: Approves an access request.
    In DEMO_MODE (os.getenv("DEMO_MODE") == "true"):
      - Directly provisions active user (is_active=True) with a generated bcrypt-hashed password.
      - Returns credentials ONCE to the authorized Admin caller.
    In PRODUCTION (DEMO_MODE=false):
      - Provisions unactivated account in users (is_active=False, unmatchable password marker).
      - Issues 48h activation token for user self-service password setup.
    """
    try:
        # 1. Fetch the request
        req_res = supabase.table("access_requests").select("*").eq("request_id", request_id).execute()
        if not req_res.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Access request '{request_id}' not found"
            )
        
        access_req = req_res.data[0]
        if access_req["status"] != "PENDING":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot approve request with current status '{access_req['status']}'. Only PENDING requests can be approved."
            )

        assigned_role = body.role if (body and body.role) else access_req["requested_role"]

        # 2. Check if user already exists
        existing_user = supabase.table("users").select("id").eq("employee_id", access_req["employee_id"]).execute()
        if existing_user.data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"User with Employee ID '{access_req['employee_id']}' already exists in users table."
            )

        now_iso = datetime.utcnow().isoformat()
        admin_id = current_admin.get("id")

        if is_demo_mode():
            # DEMO MODE: Directly activate account and return generated credentials ONCE to authorized Admin
            demo_password = f"Demo@{secrets.token_hex(3).upper()}#{secrets.randbelow(90) + 10}"
            hashed_pw = get_password_hash(demo_password)

            new_user_payload = {
                "employee_id": access_req["employee_id"],
                "username": access_req["full_name"],
                "password": hashed_pw,
                "department_id": access_req["department_id"],
                "is_active": True
            }
            try:
                new_user = supabase.table("users").insert(new_user_payload).execute()
            except Exception:
                # Fallback if is_active column does not exist yet prior to migration
                new_user_payload_compat = {
                    "employee_id": access_req["employee_id"],
                    "username": access_req["full_name"],
                    "password": hashed_pw,
                    "department_id": access_req["department_id"]
                }
                new_user = supabase.table("users").insert(new_user_payload_compat).execute()

            if not new_user.data:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Failed to create user account in database."
                )

            new_user_id = new_user.data[0]["id"]

            # Assign role
            supabase.table("roles").insert({
                "user_id": new_user_id,
                "role": assigned_role
            }).execute()

            # Update access_requests status to APPROVED and mark activated_at
            update_request_data = {
                "status": "APPROVED",
                "user_id": new_user_id,
                "reviewed_by": admin_id,
                "reviewed_at": now_iso,
                "activated_at": now_iso,
                "activation_token": None,
                "activation_token_expires_at": None
            }
            try:
                supabase.table("access_requests").update(update_request_data).eq("request_id", request_id).execute()
            except Exception:
                supabase.table("access_requests").update({
                    "status": "APPROVED",
                    "reviewed_by": admin_id,
                    "reviewed_at": now_iso
                }).eq("request_id", request_id).execute()

            # Audit log (NEVER log plaintext password)
            log_audit(
                action="APPROVE_ACCESS_REQUEST_DEMO",
                username=current_admin.get("employee_id", "Admin"),
                details={
                    "request_id": request_id,
                    "approved_employee_id": access_req["employee_id"],
                    "new_user_id": new_user_id,
                    "assigned_role": assigned_role,
                    "reviewed_by_admin_id": admin_id,
                    "demo_mode": True
                }
            )

            return {
                "message": f"Access request '{request_id}' approved and demo account activated.",
                "request_id": request_id,
                "status": "APPROVED",
                "user_id": new_user_id,
                "employee_id": access_req["employee_id"],
                "role": assigned_role,
                "demo_credentials": {
                    "employee_id": access_req["employee_id"],
                    "username": access_req["full_name"],
                    "password": demo_password,
                    "role": assigned_role,
                    "note": "DEMO MODE ONLY: These credentials are shown once to the authorized Admin."
                }
            }

        else:
            # PRODUCTION MODE: Create unactivated user record (is_active=False), issue activation token with 48h TTL
            new_user_payload = {
                "employee_id": access_req["employee_id"],
                "username": access_req["full_name"],
                "password": "!UNACTIVATED_ACCOUNT!",
                "department_id": access_req["department_id"],
                "is_active": False
            }
            try:
                new_user = supabase.table("users").insert(new_user_payload).execute()
            except Exception:
                # Fallback if is_active column does not exist yet prior to migration
                new_user_payload_compat = {
                    "employee_id": access_req["employee_id"],
                    "username": access_req["full_name"],
                    "password": "!UNACTIVATED_ACCOUNT!",
                    "department_id": access_req["department_id"]
                }
                new_user = supabase.table("users").insert(new_user_payload_compat).execute()

            if not new_user.data:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Failed to create user account in database."
                )

            new_user_id = new_user.data[0]["id"]

            # Assign role
            supabase.table("roles").insert({
                "user_id": new_user_id,
                "role": assigned_role
            }).execute()

            # Generate secure one-time activation token (48 hour validity)
            activation_token = secrets.token_urlsafe(32)
            expiry_iso = (datetime.utcnow() + timedelta(hours=48)).isoformat()

            # Update access_requests status to APPROVED with activation link details
            update_request_data = {
                "status": "APPROVED",
                "user_id": new_user_id,
                "reviewed_by": admin_id,
                "reviewed_at": now_iso,
                "activation_token": activation_token,
                "activation_token_expires_at": expiry_iso
            }
            try:
                supabase.table("access_requests").update(update_request_data).eq("request_id", request_id).execute()
            except Exception:
                supabase.table("access_requests").update({
                    "status": "APPROVED",
                    "reviewed_by": admin_id,
                    "reviewed_at": now_iso
                }).eq("request_id", request_id).execute()

            # Audit log (Do NOT log the raw token for security)
            log_audit(
                action="APPROVE_ACCESS_REQUEST",
                username=current_admin.get("employee_id", "Admin"),
                details={
                    "request_id": request_id,
                    "approved_employee_id": access_req["employee_id"],
                    "new_user_id": new_user_id,
                    "assigned_role": assigned_role,
                    "reviewed_by_admin_id": admin_id,
                    "demo_mode": False
                }
            )

            return {
                "message": f"Access request '{request_id}' approved. Account created pending officer password activation.",
                "request_id": request_id,
                "status": "APPROVED",
                "user_id": new_user_id,
                "employee_id": access_req["employee_id"],
                "role": assigned_role,
                "demo_activation_url": f"/activate?token={activation_token}",
                "demo_note": "DEMO ONLY: In production, the activation URL is dispatched via official department email/SMS."
            }

    except HTTPException:
        raise
    except Exception as e:
        _handle_supabase_error(e)


@router.post("/{request_id}/reject", tags=["Access Requests"])
def reject_access_request(
    request_id: str,
    body: AccessRequestReject,
    current_admin: dict = Depends(get_current_admin_user)
):
    """
    Admin only: Rejects an access request and records official rejection reason.
    """
    try:
        # 1. Fetch the request
        req_res = supabase.table("access_requests").select("*").eq("request_id", request_id).execute()
        if not req_res.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Access request '{request_id}' not found"
            )
        
        access_req = req_res.data[0]
        if access_req["status"] != "PENDING":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot reject request with current status '{access_req['status']}'. Only PENDING requests can be rejected."
            )

        now_iso = datetime.utcnow().isoformat()
        admin_id = current_admin.get("id")

        # 2. Update access_requests status to REJECTED
        supabase.table("access_requests").update({
            "status": "REJECTED",
            "rejection_reason": body.rejection_reason,
            "reviewed_by": admin_id,
            "reviewed_at": now_iso
        }).eq("request_id", request_id).execute()

        # 3. Audit log
        log_audit(
            action="REJECT_ACCESS_REQUEST",
            username=current_admin.get("employee_id", "Admin"),
            details={
                "request_id": request_id,
                "rejected_employee_id": access_req["employee_id"],
                "rejection_reason": body.rejection_reason,
                "reviewed_by_admin_id": admin_id
            }
        )

        return {
            "message": f"Access request '{request_id}' has been rejected.",
            "request_id": request_id,
            "status": "REJECTED",
            "rejection_reason": body.rejection_reason
        }

    except HTTPException:
        raise
    except Exception as e:
        _handle_supabase_error(e)


