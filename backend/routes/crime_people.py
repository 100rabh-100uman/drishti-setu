import datetime
import uuid
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel, Field
try:
    from backend.supabase_client import supabase
    from backend.utils.auth_utils import get_optional_current_user
    from backend.utils.audit_logger import log_audit
except ImportError:
    from supabase_client import supabase
    from utils.auth_utils import get_optional_current_user
    from utils.audit_logger import log_audit

router = APIRouter(tags=["Crime Bureau"])

class CrimePerson(BaseModel):
    person_id: Optional[str] = None
    name: str
    photo: str
    crime_type: str
    department_id: int
    status: str = Field("WANTED", description="WANTED, HIGH_ALERT, UNDER_SURVEILLANCE, APPREHENDED")

class CrimePersonUpdate(BaseModel):
    name: Optional[str] = None
    photo: Optional[str] = None
    crime_type: Optional[str] = None
    department_id: Optional[int] = None
    status: Optional[str] = None

# Initial In-Memory Fallback Dataset (Gujarat Police Bureau Registry)
DEFAULT_CRIME_PEOPLE: List[Dict[str, Any]] = [
    {
        "person_id": "CRM-8412",
        "name": "Vikramaditya Solanki",
        "photo": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face",
        "crime_type": "Armed Extortion & Gang Violence",
        "department_id": 1,
        "status": "WANTED",
        "created_at": "2026-08-20T10:30:00Z"
    },
    {
        "person_id": "CRM-9021",
        "name": "Rohan Jayesh Mehta",
        "photo": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop&crop=face",
        "crime_type": "Financial Syndicate Fraud",
        "department_id": 1,
        "status": "HIGH_ALERT",
        "created_at": "2026-08-24T14:15:00Z"
    },
    {
        "person_id": "CRM-7104",
        "name": "Dharmesh Rajput (Chhota)",
        "photo": "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=300&h=300&fit=crop&crop=face",
        "crime_type": "Inter-State Vehicle Theft Ring",
        "department_id": 2,
        "status": "WANTED",
        "created_at": "2026-08-28T09:00:00Z"
    },
    {
        "person_id": "CRM-5542",
        "name": "Munna Bhai Kankaria",
        "photo": "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&h=300&fit=crop&crop=face",
        "crime_type": "Narcotics Distribution & Contraband",
        "department_id": 1,
        "status": "UNDER_SURVEILLANCE",
        "created_at": "2026-09-01T16:45:00Z"
    },
    {
        "person_id": "CRM-3918",
        "name": "Kailash Govind Vaghela",
        "photo": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face",
        "crime_type": "Aggravated Robbery & Assault",
        "department_id": 1,
        "status": "WANTED",
        "created_at": "2026-09-02T11:20:00Z"
    }
]

# Mutable in-memory store
in_memory_crime_people: List[Dict[str, Any]] = [dict(p) for p in DEFAULT_CRIME_PEOPLE]

@router.post("/add/")
@router.post("/add")
def add_crime_person(
    person: CrimePerson,
    current_user: Optional[str] = Depends(get_optional_current_user)
):
    """
    Adds a new criminal record to the Bureau watchlist.
    Tries Supabase first; seamlessly falls back to in-memory store if table not migrated yet.
    """
    now = datetime.datetime.now(datetime.timezone.utc).isoformat()
    person_id = person.person_id or f"CRM-{uuid.uuid4().hex[:4].upper()}"
    
    record = {
        "person_id": person_id,
        "name": person.name,
        "photo": person.photo,
        "crime_type": person.crime_type,
        "department_id": person.department_id,
        "status": person.status,
        "created_at": now,
        "updated_at": now
    }

    officer = current_user or "Bureau Admin (System)"

    # Try Supabase insertion
    try:
        res = supabase.table("crime_people").insert(record).execute()
        if res.data:
            # Also sync into local cache
            in_memory_crime_people.insert(0, record)
            log_audit("CRIME_PERSON_ADDED", officer, {"person_id": person_id, "name": person.name})
            return {"message": "Person added to bureau", "data": res.data, "source": "supabase"}
    except Exception as e:
        # Fallback to in-memory
        pass

    # In-memory persistence
    # Remove if existing duplicate person_id
    existing_idx = next((i for i, p in enumerate(in_memory_crime_people) if p["person_id"] == person_id), -1)
    if existing_idx >= 0:
        in_memory_crime_people[existing_idx] = record
    else:
        in_memory_crime_people.insert(0, record)

    log_audit("CRIME_PERSON_ADDED", officer, {"person_id": person_id, "name": person.name, "fallback": True})
    return {
        "message": "Person added to bureau (In-Memory Fallback until Supabase SQL run)",
        "data": [record],
        "source": "fallback"
    }

@router.get("/get_all/")
@router.get("/get_all")
def get_all_crime_people(
    department_id: Optional[int] = None,
    status_filter: Optional[str] = None,
    current_user: Optional[str] = Depends(get_optional_current_user)
):
    """
    Fetches all criminal records for surveillance watchlist.
    Tries Supabase first; if table not found, returns realistic Gujarat Police fallback records.
    """
    try:
        query = supabase.table("crime_people").select("*").order("created_at", desc=True)
        if department_id:
            query = query.eq("department_id", department_id)
        if status_filter:
            query = query.eq("status", status_filter)
        res = query.execute()
        if res.data and len(res.data) > 0:
            return {"crime_people": res.data, "source": "supabase"}
    except Exception:
        pass

    # Filter in-memory fallback
    results = in_memory_crime_people
    if department_id:
        results = [p for p in results if p.get("department_id") == department_id]
    if status_filter:
        results = [p for p in results if p.get("status", "").upper() == status_filter.upper()]

    return {"crime_people": results, "source": "fallback"}

@router.put("/update/{person_id}")
@router.put("/update/{person_id}/")
def update_crime_person(
    person_id: str,
    update: CrimePersonUpdate,
    current_user: Optional[str] = Depends(get_optional_current_user)
):
    """Updates suspect record metadata or status."""
    now = datetime.datetime.now(datetime.timezone.utc).isoformat()
    update_data = {k: v for k, v in update.dict().items() if v is not None}
    update_data["updated_at"] = now
    officer = current_user or "Bureau Admin (System)"

    # Try Supabase
    try:
        res = supabase.table("crime_people").update(update_data).eq("person_id", person_id).execute()
        if res.data:
            # Sync local
            for p in in_memory_crime_people:
                if p["person_id"] == person_id:
                    p.update(update_data)
            log_audit("CRIME_PERSON_UPDATED", officer, {"person_id": person_id})
            return {"message": "Person record updated", "data": res.data, "source": "supabase"}
    except Exception:
        pass

    # Fallback in-memory update
    found = False
    for p in in_memory_crime_people:
        if p["person_id"] == person_id:
            p.update(update_data)
            found = True
            break

    if not found:
        raise HTTPException(status_code=404, detail=f"Criminal record {person_id} not found")

    log_audit("CRIME_PERSON_UPDATED", officer, {"person_id": person_id, "fallback": True})
    return {"message": "Person record updated", "data": [p for p in in_memory_crime_people if p["person_id"] == person_id], "source": "fallback"}

@router.delete("/delete/{person_id}")
@router.delete("/delete/{person_id}/")
def delete_crime_person(
    person_id: str,
    current_user: Optional[str] = Depends(get_optional_current_user)
):
    """Deletes or archives suspect from watchlist."""
    officer = current_user or "Bureau Admin (System)"
    
    try:
        supabase.table("crime_people").delete().eq("person_id", person_id).execute()
    except Exception:
        pass

    global in_memory_crime_people
    in_memory_crime_people = [p for p in in_memory_crime_people if p["person_id"] != person_id]

    log_audit("CRIME_PERSON_DELETED", officer, {"person_id": person_id})
    return {"message": f"Person record {person_id} removed from watchlist", "status": "Success"}
