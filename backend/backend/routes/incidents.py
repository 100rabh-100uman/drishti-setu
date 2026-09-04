import datetime
import uuid
from typing import Optional, List, Dict, Any, Callable
from fastapi import APIRouter, HTTPException, Depends, Query, status
from pydantic import BaseModel, Field
from supabase_client import supabase
from utils.auth_utils import get_current_user, get_optional_current_user
from utils.audit_logger import log_audit
from routes.crime_people import in_memory_crime_people

router = APIRouter(tags=["Incident Corner"])

# WebSocket notification dispatch callback (registered by main.py)
ws_broadcast_callback: Optional[Callable[[Dict[str, Any]], None]] = None

def register_ws_broadcaster(callback: Callable[[Dict[str, Any]], None]):
    global ws_broadcast_callback
    ws_broadcast_callback = callback


class IncidentCreate(BaseModel):
    id: Optional[str] = None
    incident_number: Optional[str] = None
    title: str
    crime_type: str
    severity: str = Field("HIGH", description="CRITICAL, HIGH, MEDIUM, LOW")
    status: str = Field("ACTIVE", description="ACTIVE, DISPATCHED, INVESTIGATING, RESOLVED, CLOSED")
    camera_id: str
    person_id: Optional[str] = None
    department_id: int = 1
    zone_id: Optional[str] = "Z01"
    location_name: Optional[str] = None
    timestamp: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None


class IncidentStatusUpdate(BaseModel):
    status: str = Field(..., description="ACTIVE, DISPATCHED, INVESTIGATING, RESOLVED, CLOSED")
    notes: Optional[str] = None


# Seed In-Memory Fallback Dataset (Gujarat Surveillance Grid Incidents)
DEFAULT_INCIDENTS: List[Dict[str, Any]] = [
    {
        "id": "INC-2026-001",
        "incident_number": "INC-GJ-2026-0905-01",
        "title": "High-Priority Wanted Suspect Sighted at SG Highway Junction",
        "crime_type": "Armed Extortion & Gang Violence",
        "severity": "CRITICAL",
        "status": "ACTIVE",
        "camera_id": "CAM001",
        "person_id": "CRM-8412",
        "department_id": 1,
        "department_name": "Gujarat Police Department",
        "zone_id": "Z01",
        "location_name": "SG Highway Junction (Iskcon Cross Road), Ahmedabad",
        "timestamp": (datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(minutes=14)).isoformat(),
        "metadata": {
            "confidence": 0.96,
            "speed_kmh": 44,
            "threat_level": "RED",
            "vehicle_color": "Silver",
            "notes": "Suspect matched via Sentinel Facial AI with 96% accuracy"
        }
    },
    {
        "id": "INC-2026-002",
        "incident_number": "INC-GJ-2026-0905-02",
        "title": "Vehicle Theft Syndicate Operator Flagged by ANPR Telemetry",
        "crime_type": "Inter-State Vehicle Theft Ring",
        "severity": "HIGH",
        "status": "DISPATCHED",
        "camera_id": "CAM004",
        "person_id": "CRM-7104",
        "department_id": 2,
        "department_name": "Gujarat Traffic Branch",
        "zone_id": "Z01",
        "location_name": "Ashram Road Income Tax Circle, Ahmedabad",
        "timestamp": (datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(hours=1, minutes=45)).isoformat(),
        "metadata": {
            "confidence": 0.92,
            "vehicle_plate": "GJ-01-BK-5821",
            "vehicle_model": "Mahindra Scorpio",
            "notes": "Quick Response Unit (PCR Unit 4) dispatched to intercept"
        }
    },
    {
        "id": "INC-2026-003",
        "incident_number": "INC-GJ-2026-0905-03",
        "title": "Financial Syndicate Fraud Kingpin Sighted near Vastrapur",
        "crime_type": "Financial Syndicate Fraud",
        "severity": "MEDIUM",
        "status": "INVESTIGATING",
        "camera_id": "CAM002",
        "person_id": "CRM-9021",
        "department_id": 1,
        "department_name": "Gujarat Police Department",
        "zone_id": "Z01",
        "location_name": "Vastrapur Lake East Gate, Ahmedabad",
        "timestamp": (datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(hours=3, minutes=10)).isoformat(),
        "metadata": {
            "confidence": 0.88,
            "notes": "Subject spotted entering commercial tower with suspected associates"
        }
    },
    {
        "id": "INC-2026-004",
        "incident_number": "INC-GJ-2026-0904-01",
        "title": "Armed Robbery Suspect Intercepted and Apprehended",
        "crime_type": "Aggravated Robbery & Assault",
        "severity": "CRITICAL",
        "status": "RESOLVED",
        "camera_id": "CAM007",
        "person_id": "CRM-3918",
        "department_id": 1,
        "department_name": "Gujarat Police Department",
        "zone_id": "Z02",
        "location_name": "Kalupur Railway Station West Concourse, Ahmedabad",
        "timestamp": (datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(hours=26)).isoformat(),
        "metadata": {
            "confidence": 0.94,
            "resolution": "Subject taken into custody by Kalupur Railway Police. Evidence seized."
        }
    },
    {
        "id": "INC-2026-005",
        "incident_number": "INC-GJ-2026-0904-02",
        "title": "Narcotics Courier Monitored along Walled City Corridor",
        "crime_type": "Narcotics Distribution & Contraband",
        "severity": "HIGH",
        "status": "RESOLVED",
        "camera_id": "CAM006",
        "person_id": "CRM-5542",
        "department_id": 1,
        "department_name": "Gujarat Police Department",
        "zone_id": "Z02",
        "location_name": "Relief Road Junction, Walled City, Ahmedabad",
        "timestamp": (datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(hours=31)).isoformat(),
        "metadata": {
            "confidence": 0.89,
            "resolution": "Undercover surveillance maintained. Contraband drop point mapped."
        }
    },
    {
        "id": "INC-2026-006",
        "incident_number": "INC-GJ-2026-0903-01",
        "title": "Infocity Perimeter Anomaly - Vehicle Loitering Warning",
        "crime_type": "Security Perimeter Breach",
        "severity": "MEDIUM",
        "status": "CLOSED",
        "camera_id": "CAM011",
        "person_id": None,
        "department_id": 5,
        "department_name": "Gandhinagar Municipal Corporation (GMC)",
        "zone_id": "Z03",
        "location_name": "Infocity Main Gate, Gandhinagar",
        "timestamp": (datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(hours=48)).isoformat(),
        "metadata": {
            "confidence": 0.85,
            "notes": "Vehicle identification completed. Operator confirmed authorized delivery."
        }
    },
    {
        "id": "INC-2026-007",
        "incident_number": "INC-GJ-2026-0902-01",
        "title": "Sanand Highway Night Perimeter Sensor Alert",
        "crime_type": "Industrial Checkpost Alert",
        "severity": "LOW",
        "status": "CLOSED",
        "camera_id": "CAM020",
        "person_id": None,
        "department_id": 1,
        "department_name": "Gujarat Police Department",
        "zone_id": "Z05",
        "location_name": "Sanand Industrial Approach Toll Plaza, Ahmedabad",
        "timestamp": (datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(hours=72)).isoformat(),
        "metadata": {
            "confidence": 0.81,
            "notes": "Routine night patrol verification cleared."
        }
    }
]

in_memory_incidents: List[Dict[str, Any]] = [dict(i) for i in DEFAULT_INCIDENTS]

def enrich_incident_details(incident: Dict[str, Any]) -> Dict[str, Any]:
    """Enriches incident with suspect photo, name, and department metadata."""
    item = dict(incident)
    person_id = item.get("person_id")
    if person_id:
        person = next((p for p in in_memory_crime_people if p.get("person_id") == person_id), None)
        if person:
            item["person_name"] = person.get("name")
            item["person_photo"] = person.get("photo")
            if not item.get("crime_type"):
                item["crime_type"] = person.get("crime_type")

    # Attach human-readable department name if missing
    if not item.get("department_name"):
        dept_id = item.get("department_id", 1)
        dept_names = {
            1: "Gujarat Police Department",
            2: "Gujarat Traffic Branch",
            3: "Disaster Management Authority (GSDMA)",
            4: "Ahmedabad Municipal Corporation (AMC)",
            5: "Gandhinagar Municipal Corporation (GMC)",
            6: "Transport & Highways Department"
        }
        item["department_name"] = dept_names.get(dept_id, f"Department {dept_id}")

    return item


@router.get("/")
@router.get("/get_incidents/")
@router.get("/get_incidents")
def get_incidents(
    department_id: Optional[int] = None,
    zone_id: Optional[str] = None,
    crime_type: Optional[str] = None,
    person_id: Optional[str] = None,
    status: Optional[str] = None,
    severity: Optional[str] = None,
    hours: Optional[int] = None,
    limit: int = 50,
    current_user: Optional[str] = Depends(get_optional_current_user)
):
    """
    Query incidents with multi-filter parameters: zone, crime type, person, status, department.
    Uses indexed fields (timestamp, person_id, zone_id, crime_type).
    """
    # 1. Try Supabase
    try:
        query = supabase.table("incidents").select("*").order("timestamp", desc=True).limit(limit)
        if department_id:
            query = query.eq("department_id", department_id)
        if zone_id and zone_id != "ALL":
            query = query.eq("zone_id", zone_id)
        if crime_type and crime_type != "ALL":
            query = query.eq("crime_type", crime_type)
        if person_id and person_id != "ALL":
            query = query.eq("person_id", person_id)
        if status and status != "ALL":
            query = query.eq("status", status)
        if severity and severity != "ALL":
            query = query.eq("severity", severity)

        res = query.execute()
        if res.data and len(res.data) > 0:
            enriched = [enrich_incident_details(i) for i in res.data]
            return {"incidents": enriched, "total": len(enriched), "source": "supabase"}
    except Exception:
        pass

    # 2. Fallback in-memory dataset
    results = in_memory_incidents
    if department_id:
        results = [i for i in results if i.get("department_id") == department_id]
    if zone_id and zone_id != "ALL":
        results = [i for i in results if i.get("zone_id") == zone_id]
    if crime_type and crime_type != "ALL":
        results = [i for i in results if (i.get("crime_type") or "").lower() == crime_type.lower()]
    if person_id and person_id != "ALL":
        results = [i for i in results if i.get("person_id") == person_id]
    if status and status != "ALL":
        results = [i for i in results if (i.get("status") or "").upper() == status.upper()]
    if severity and severity != "ALL":
        results = [i for i in results if (i.get("severity") or "").upper() == severity.upper()]

    if hours and hours > 0:
        cutoff = datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(hours=hours)
        filtered = []
        for i in results:
            ts_str = i.get("timestamp")
            try:
                ts = datetime.datetime.fromisoformat(ts_str.replace("Z", "+00:00"))
                if ts >= cutoff:
                    filtered.append(i)
            except Exception:
                filtered.append(i)
        results = filtered

    results = results[:limit]
    enriched = [enrich_incident_details(i) for i in results]
    return {"incidents": enriched, "total": len(enriched), "source": "in_memory_fallback"}


@router.get("/timeline/")
@router.get("/timeline")
def get_incident_timeline(
    department_id: Optional[int] = None,
    zone_id: Optional[str] = None,
    crime_type: Optional[str] = None,
    person_id: Optional[str] = None,
    status: Optional[str] = None,
    limit: int = 100,
    current_user: Optional[str] = Depends(get_optional_current_user)
):
    """
    Returns incidents pre-grouped by date buckets (Today, Yesterday, Date)
    for high-performance Timeline UI rendering.
    """
    data = get_incidents(
        department_id=department_id,
        zone_id=zone_id,
        crime_type=crime_type,
        person_id=person_id,
        status=status,
        limit=limit,
        current_user=current_user
    )
    incidents_list = data.get("incidents", [])

    now = datetime.datetime.now(datetime.timezone.utc)
    today_str = now.strftime("%Y-%m-%d")
    yesterday_str = (now - datetime.timedelta(days=1)).strftime("%Y-%m-%d")

    groups: Dict[str, List[Dict[str, Any]]] = {}

    for inc in incidents_list:
        ts_str = inc.get("timestamp", "")
        group_label = "Earlier"
        try:
            ts = datetime.datetime.fromisoformat(ts_str.replace("Z", "+00:00"))
            date_key = ts.strftime("%Y-%m-%d")
            if date_key == today_str:
                group_label = "Today"
            elif date_key == yesterday_str:
                group_label = "Yesterday"
            else:
                group_label = ts.strftime("%B %d, %Y")
        except Exception:
            group_label = "Earlier"

        if group_label not in groups:
            groups[group_label] = []
        groups[group_label].append(inc)

    formatted_groups = [
        {"date_label": label, "count": len(items), "incidents": items}
        for label, items in groups.items()
    ]

    return {
        "groups": formatted_groups,
        "total_incidents": len(incidents_list),
        "source": data.get("source", "fallback")
    }


@router.post("/")
@router.post("/create/")
@router.post("/create")
def create_incident(
    incident: IncidentCreate,
    current_user: Optional[str] = Depends(get_optional_current_user)
):
    """
    Creates a new incident record.
    Logs to audit trail and broadcasts immediately to connected WebSockets.
    """
    now = datetime.datetime.now(datetime.timezone.utc).isoformat()
    inc_id = incident.id or f"INC-{datetime.datetime.now().year}-{uuid.uuid4().hex[:4].upper()}"
    inc_number = incident.incident_number or f"INC-GJ-{datetime.datetime.now().strftime('%Y%m%d')}-{uuid.uuid4().hex[:2].upper()}"

    record = {
        "id": inc_id,
        "incident_number": inc_number,
        "title": incident.title,
        "crime_type": incident.crime_type,
        "severity": incident.severity or "HIGH",
        "status": incident.status or "ACTIVE",
        "camera_id": incident.camera_id,
        "person_id": incident.person_id,
        "department_id": incident.department_id,
        "zone_id": incident.zone_id or "Z01",
        "location_name": incident.location_name or f"Corridor Camera {incident.camera_id}",
        "timestamp": incident.timestamp or now,
        "metadata": incident.metadata or {},
        "created_at": now,
        "updated_at": now
    }

    # 1. Supabase insert
    supabase_success = False
    try:
        res = supabase.table("incidents").insert(record).execute()
        if res.data:
            supabase_success = True
    except Exception:
        pass

    # 2. Prepend to in-memory store
    enriched = enrich_incident_details(record)
    in_memory_incidents.insert(0, enriched)

    # 3. Audit logging
    officer = current_user or "Sentinel OpenCV Engine"
    log_audit("INCIDENT_CREATED", officer, {
        "incident_id": inc_id,
        "incident_number": inc_number,
        "camera_id": incident.camera_id,
        "crime_type": incident.crime_type,
        "severity": incident.severity
    })

    # 4. Real-time WebSocket Broadcast
    broadcast_data = {
        "type": "INCIDENT_ALERT",
        "incident": enriched,
        "headline": f"🚨 NEW INCIDENT: {incident.title} at {incident.camera_id}",
        "timestamp": now
    }
    if ws_broadcast_callback:
        try:
            ws_broadcast_callback(broadcast_data)
        except Exception as e:
            print("WS incident broadcast notice:", e)

    return {
        "message": "Incident created and broadcast successfully",
        "incident": enriched,
        "source": "supabase" if supabase_success else "in_memory_fallback"
    }


@router.put("/status/{incident_id}")
@router.put("/status/{incident_id}/")
@router.put("/{incident_id}/status")
@router.put("/{incident_id}/status/")
def update_incident_status(
    incident_id: str,
    update: IncidentStatusUpdate,
    current_user: Optional[str] = Depends(get_optional_current_user)
):
    """
    Updates incident status (e.g., ACTIVE -> DISPATCHED -> INVESTIGATING -> RESOLVED -> CLOSED)
    with optional officer notes.
    """
    now = datetime.datetime.now(datetime.timezone.utc).isoformat()
    officer = current_user or "Control Room Duty Officer"

    # Supabase update
    try:
        supabase.table("incidents").update({
            "status": update.status,
            "updated_at": now
        }).eq("id", incident_id).execute()
    except Exception:
        pass

    # In-memory update
    found = False
    updated_item = None
    for inc in in_memory_incidents:
        if inc["id"] == incident_id:
            inc["status"] = update.status
            inc["updated_at"] = now
            if update.notes:
                inc.setdefault("metadata", {})["status_notes"] = update.notes
                inc["metadata"]["updated_by"] = officer
                inc["metadata"]["updated_at"] = now
            found = True
            updated_item = enrich_incident_details(inc)
            break

    if not found:
        raise HTTPException(status_code=404, detail=f"Incident {incident_id} not found")

    log_audit("INCIDENT_STATUS_CHANGED", officer, {
        "incident_id": incident_id,
        "new_status": update.status,
        "notes": update.notes
    })

    # Broadcast status change to live clients
    if ws_broadcast_callback:
        try:
            ws_broadcast_callback({
                "type": "INCIDENT_STATUS_UPDATED",
                "incident_id": incident_id,
                "status": update.status,
                "updated_by": officer,
                "timestamp": now
            })
        except Exception:
            pass

    return {
        "message": f"Incident {incident_id} transitioned to {update.status}",
        "incident_id": incident_id,
        "status": update.status,
        "incident": updated_item
    }
