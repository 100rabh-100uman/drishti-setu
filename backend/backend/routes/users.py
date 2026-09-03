from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from typing import Optional
from datetime import timedelta
from supabase_client import supabase
from utils.auth_utils import get_password_hash, verify_password, create_access_token, get_current_user, ACCESS_TOKEN_EXPIRE_MINUTES
from utils.audit_logger import log_audit

router = APIRouter()
app = router # Alias for main.py integration

# --- Pydantic Models ---
class UserRegister(BaseModel):
    employee_id: str
    username: str
    password: str
    department_id: int
    role: str = "Viewer"

class UserLogin(BaseModel):
    employee_id: str
    password: str

class UserUpdate(BaseModel):
    username: Optional[str] = None
    department_id: Optional[int] = None

class RoleAssign(BaseModel):
    user_id: int
    role: str

# --- Endpoints ---
@router.post("/register_user/")
def register_user(user: UserRegister):
    existing = supabase.table("users").select("id").eq("employee_id", user.employee_id).execute()
    if existing.data:
        raise HTTPException(status_code=400, detail="Employee ID already registered")

    hashed_password = get_password_hash(user.password)
    try:
        user_data = supabase.table("users").insert({
            "employee_id": user.employee_id,
            "username": user.username,
            "password": hashed_password,
            "department_id": user.department_id
        }).execute()
        
        new_user_id = user_data.data[0]["id"]

        supabase.table("roles").insert({
            "user_id": new_user_id,
            "role": user.role
        }).execute()

        log_audit("REGISTER_USER", user.username, {"employee_id": user.employee_id})
        return {"message": "User registered successfully", "user_id": new_user_id}
    except Exception as e:
        return {"error": str(e)}

@router.post("/login/")
def login(user: UserLogin):
    try:
        db_user = supabase.table("users").select("*").eq("employee_id", user.employee_id).execute()
        if not db_user.data:
            raise HTTPException(status_code=400, detail="Invalid credentials")
        
        user_record = db_user.data[0]
        if not verify_password(user.password, user_record["password"]):
            raise HTTPException(status_code=400, detail="Invalid credentials")
        
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user.employee_id, "id": user_record["id"]}, expires_delta=access_token_expires
        )
        
        log_audit("LOGIN", user_record["username"], {"employee_id": user.employee_id})
        return {"access_token": access_token, "token_type": "bearer"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/get_users/")
def get_users(department_id: Optional[int] = Query(None), current_user: str = Depends(get_current_user)):
    try:
        query = supabase.table("users").select("id, employee_id, username, created_at, department_id, departments(name), roles(role)")
        if department_id:
            query = query.eq("department_id", department_id)
        data = query.execute()
        return {"users": data.data}
    except Exception as e:
        return {"error": str(e)}

@router.post("/assign_role/")
def assign_role(role_data: RoleAssign, current_user: str = Depends(get_current_user)):
    try:
        existing = supabase.table("roles").select("*").eq("user_id", role_data.user_id).execute()
        if existing.data:
            data = supabase.table("roles").update({"role": role_data.role}).eq("user_id", role_data.user_id).execute()
        else:
            data = supabase.table("roles").insert({"user_id": role_data.user_id, "role": role_data.role}).execute()
            
        log_audit("ASSIGN_ROLE", current_user, {"assigned_to": role_data.user_id, "role": role_data.role})
        return {"message": "Role assigned successfully", "data": data.data}
    except Exception as e:
        return {"error": str(e)}

@router.post("/update_user/{user_id}")
def update_user(user_id: int, updates: UserUpdate, current_user: str = Depends(get_current_user)):
    try:
        user_updates = {k: v for k, v in updates.dict().items() if v is not None}
        if user_updates:
            supabase.table("users").update(user_updates).eq("id", user_id).execute()
        log_audit("UPDATE_USER", current_user, {"updated_user_id": user_id, "updates": user_updates})
        return {"message": "User updated successfully"}
    except Exception as e:
        return {"error": str(e)}

@router.delete("/delete_user/{user_id}")
def delete_user(user_id: int, current_user: str = Depends(get_current_user)):
    try:
        supabase.table("users").delete().eq("id", user_id).execute()
        log_audit("DELETE_USER", current_user, {"deleted_user_id": user_id})
        return {"message": "User deleted successfully"}
    except Exception as e:
        return {"error": str(e)}
