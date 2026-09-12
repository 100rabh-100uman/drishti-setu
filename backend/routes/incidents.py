import datetime
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, Query, HTTPException, status
from pydantic import BaseModel, Field
from backend.supabase_client import supabase
from backend.utils.auth_utils import get_optional_current_user
from backend.utils.audit_logger import log_audit
from backend.routes.crime_people import in_memory_crime_people

router = APIRouter(tags=["Incident Activity & Need Corner"])

class IncidentCreate(BaseModel):
    crime_type: str = Field(..., description="e.g. Armed Robbery, Syndicate Extortion, Vehicle Theft")
    description: str = Field(..., description="Incident narrative and investigation context")
    location_id: str = Field(..., description="Camera ID, Zone code, or Junction address")
    person_id: Optional[str] = Field(None, description="Crime Bureau Person ID if identified")
    timestamp: Optional[str] = None
    severity: Optional[str] = "High"

# Initial Chronological Gujarat Police Incidents (Chronological newest to oldest)
DEFAULT_INCIDENTS: List[Dict[str, Any]] = [
    {
        "id": "INC-2026-901",
        "timestamp": (datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(minutes=18)).isoformat(),
        "crime_type": "Armed Extortion & Gang Violence",
        "description": "Armed confrontation detected near Iskcon cross road. Suspect sighted fleeing towards SG Highway North corridor in a dark sedan.",
        "location_id": "Z01-CAM001",
        "location_name": "SG Highway Junction (Iskcon Cross Road), Ahmedabad",
        "department_name": "Gujarat Police Department",
        "severity": "Critical",
        "person_id": "CRM-8412"
    },
    {
        "id": "INC-2026-902",
        "timestamp": (datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(hours=1, minutes=45)).isoformat(),
        "crime_type": "Inter-State Vehicle Theft",
        "description": "ANPR automated camera flagged stolen SUV license plate GJ-01-BK-5821 attempting to bypass toll checkpoint at Ashram Road.",
        "location_id": "Z01-CAM004",
        "location_name": "Ashram Road Income Tax Circle, Ahmedabad",
        "department_name": "Gujarat Traffic Branch",
        "severity": "High",
        "person_id": "CRM-7104"
    },
    {
        "id": "INC-2026-903",
        "timestamp": (datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(hours=3, minutes=10)).isoformat(),
        "crime_type": "Unlawful Assembly & Perimeter Breach",
        "description": "Crowd density threshold exceeded 40 persons at restricted transit concourse. Patrol team mobilized for perimeter clearance.",
        "location_id": "Z01-CAM002",
        "location_name": "Vastrapur Lake East Concourse, Ahmedabad",
        "department_name": "Gujarat Police Department",
        "severity": "Medium",
        "person_id": None
    },
    {
        "id": "INC-2026-904",
        "timestamp": (datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(hours=5, minutes=22)).isoformat(),
        "crime_type": "Aggravated Robbery & Assault",
        "description": "Surveillance system detected physical scuffle and attempted burglary near luggage holding area at Platform 2 concourse.",
        "location_id": "Z02-CAM007",
        "location_name": "Kalupur Railway Station West Concourse, Ahmedabad",
        "department_name": "Gujarat Police Department",
        "severity": "High",
        "person_id": "CRM-3918"
    },
    {
        "id": "INC-2026-905",
        "timestamp": (datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(hours=9, minutes=40)).isoformat(),
        "crime_type": "Financial Syndicate Fraud",
        "description": "Suspect involved in counterfeit currency circulation flagged while entering commercial banking complex on Sindhu Bhavan Road.",
        "location_id": "Z01-CAM005",
        "location_name": "Sindhu Bhavan Road Central Corridor, Ahmedabad",
        "department_name": "Gujarat Police Department",
        "severity": "High",
        "person_id": "CRM-9021"
    },
    {
        "id": "INC-2026-906",
        "timestamp": (datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(hours=14, minutes=15)).isoformat(),
        "crime_type": "Traffic Signal Tampering & Illegal Drag",
        "description": "Multiple modified high-speed motorcycles detected running red signals and obstructing emergency corridor at riverfront west.",
        "location_id": "Z01-CAM006",
        "location_name": "Ellis Bridge Riverfront West, Ahmedabad",
        "department_name": "Gujarat Traffic Branch",
        "severity": "Medium",
        "person_id": None
    },
    {
        "id": "INC-2026-907",
        "timestamp": (datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(hours=22, minutes=5)).isoformat(),
        "crime_type": "Narcotics Distribution & Contraband",
        "description": "Suspicious hand-off intercepted near Gate 3 perimeter. Undercover unit alerted for bag inspection.",
        "location_id": "Z02-CAM008",
        "location_name": "Kankaria Lake Gate 3, Maninagar, Ahmedabad",
        "department_name": "Gujarat Police Department",
        "severity": "High",
        "person_id": "CRM-5542"
    }
]

# Mutable in-memory store for incidents
in_memory_incidents: List[Dict[str, Any]] = [dict(inc) for inc in DEFAULT_INCIDENTS]

def lookup_bureau_person(person_id: str) -> Optional[Dict[str, Any]]:
    """
    Looks up suspect details from:
    1. Supabase 'crime_bureau' table
    2. Supabase 'crime_people' table
    3. In-memory criminal bureau cache (offline fallback)
    Returns normalized person record with name, photo, record_summary, crime_type, and status.
    """
    if not person_id:
        return None

    # 1. Try Supabase 'crime_bureau' table
    try:
        res = supabase.table("crime_bureau").select("*").eq("id", person_id).execute()
        if res.data and len(res.data) > 0:
            p = res.data[0]
            return {
                "id": p.get("id", person_id),
                "person_id": p.get("person_id", p.get("id", person_id)),
                "name": p.get("name", "Unknown Suspect"),
                "photo": p.get("photo", "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face"),
                "crime_type": p.get("crime_type", "Known Offender"),
                "record_summary": p.get("record_summary") or f"{p.get('crime_type', 'History-sheeter')} — Active Warrant in Gujarat Jurisdiction",
                "status": p.get("status", "WANTED"),
                "department_id": p.get("department_id", 1)
            }
    except Exception:
        pass

    # 2. Try Supabase 'crime_people' table
    try:
        res = supabase.table("crime_people").select("*").eq("person_id", person_id).execute()
        if res.data and len(res.data) > 0:
            p = res.data[0]
            return {
                "id": p.get("person_id", person_id),
                "person_id": p.get("person_id", person_id),
                "name": p.get("name", "Unknown Suspect"),
                "photo": p.get("photo", "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face"),
                "crime_type": p.get("crime_type", "Known Offender"),
                "record_summary": p.get("record_summary") or f"Bureau Match: {p.get('crime_type', 'Known Offender')} (Status: {p.get('status', 'WANTED')})",
                "status": p.get("status", "WANTED"),
                "department_id": p.get("department_id", 1)
            }
    except Exception:
        pass

    # 3. Fallback: Search in-memory bureau records
    local_p = next((p for p in in_memory_crime_people if p.get("person_id") == person_id or p.get("id") == person_id), None)
    if local_p:
        return {
            "id": local_p.get("person_id", person_id),
            "person_id": local_p.get("person_id", person_id),
            "name": local_p.get("name", "Wanted Suspect"),
            "photo": local_p.get("photo", "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face"),
            "crime_type": local_p.get("crime_type", "High Priority Target"),
            "record_summary": f"Bureau Watchlist: {local_p.get('crime_type', 'Criminal Record')} — Status: {local_p.get('status', 'WANTED')}",
            "status": local_p.get("status", "WANTED"),
            "department_id": local_p.get("department_id", 1)
        }

    return None

@router.get("/get_incidents/", tags=["Incident Activity & Need Corner"])
@router.get("/get_incidents", tags=["Incident Activity & Need Corner"])
@router.get("/", tags=["Incident Activity & Need Corner"])
def get_incidents(
    limit: int = Query(50, ge=1, le=200),
    crime_type: Optional[str] = None,
    current_user: Optional[str] = Depends(get_optional_current_user)
):
    """
    Fetches chronological feed of incidents for the Need Corner UI.
    Queries Supabase 'incidents' table, joins with Crime Bureau dataset if person_id exists,
    and returns a sorted JSON list of incidents with suspect dossiers.
    """
    incidents_list: List[Dict[str, Any]] = []

    # 1. Attempt Supabase query
    try:
        query = supabase.table("incidents").select("*").order("timestamp", desc=True).limit(limit)
        if crime_type:
            query = query.ilike("crime_type", f"%{crime_type}%")
        data = query.execute()
        
        if data.data and len(data.data) > 0:
            for row in data.data:
                person = lookup_bureau_person(row.get("person_id"))
                incidents_list.append({
                    "id": row.get("id"),
                    "timestamp": row.get("timestamp"),
                    "crime_type": row.get("crime_type"),
                    "description": row.get("description"),
                    "location_id": row.get("location_id"),
                    "location_name": row.get("location_name") or row.get("location_id"),
                    "department_name": row.get("department_name") or "Gujarat Police Department",
                    "severity": row.get("severity", "Medium"),
                    "person": person
                })
            return incidents_list
    except Exception as e:
        # Fallback to local in-memory records
        pass

    # 2. Resilient In-Memory Fallback
    filtered = in_memory_incidents
    if crime_type:
        filtered = [inc for inc in filtered if crime_type.lower() in inc.get("crime_type", "").lower()]

    # Sort newest first by timestamp
    try:
        sorted_inc = sorted(filtered, key=lambda x: x.get("timestamp", ""), reverse=True)
    except Exception:
        sorted_inc = filtered

    for row in sorted_inc[:limit]:
        person = lookup_bureau_person(row.get("person_id"))
        incidents_list.append({
            "id": row.get("id"),
            "timestamp": row.get("timestamp"),
            "crime_type": row.get("crime_type"),
            "description": row.get("description"),
            "location_id": row.get("location_id"),
            "location_name": row.get("location_name") or row.get("location_id"),
            "department_name": row.get("department_name") or "Gujarat Police Department",
            "severity": row.get("severity", "Medium"),
            "person": person
        })

    return incidents_list

@router.post("/add_incident/", tags=["Incident Activity & Need Corner"])
@router.post("/add_incident", tags=["Incident Activity & Need Corner"])
def add_incident(
    incident: IncidentCreate,
    current_user: Optional[str] = Depends(get_optional_current_user)
):
    """Adds a new incident into the operational log with audit trail."""
    now = incident.timestamp or datetime.datetime.now(datetime.timezone.utc).isoformat()
    inc_id = f"INC-{int(datetime.datetime.now().timestamp())}"
    officer = current_user or "Duty Desk Officer (System)"

    new_record = {
        "id": inc_id,
        "timestamp": now,
        "crime_type": incident.crime_type,
        "description": incident.description,
        "location_id": incident.location_id,
        "location_name": incident.location_id,
        "department_name": "Gujarat Police Department",
        "severity": incident.severity or "High",
        "person_id": incident.person_id
    }

    # Try Supabase insertion
    try:
        supabase.table("incidents").insert(new_record).execute()
    except Exception:
        pass

    in_memory_incidents.insert(0, new_record)
    log_audit("INCIDENT_LOGGED", officer, {"incident_id": inc_id, "crime_type": incident.crime_type})

    person = lookup_bureau_person(incident.person_id) if incident.person_id else None
    return {
        "message": "Incident logged successfully",
        "incident": {
            **new_record,
            "person": person
        }
    }
