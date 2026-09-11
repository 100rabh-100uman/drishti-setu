import datetime
import uuid
from typing import Optional, List, Dict, Any, Callable
from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel, Field
from backend.supabase_client import supabase
from backend.utils.auth_utils import get_optional_current_user
from backend.utils.audit_logger import log_audit
from backend.routes.crime_people import in_memory_crime_people

router = APIRouter(tags=["Danger Alerts"])

# WebSocket notification dispatch callback (registered by main.py)
ws_broadcast_callback: Optional[Callable[[Dict[str, Any]], None]] = None

def register_ws_broadcaster(callback: Callable[[Dict[str, Any]], None]):
    global ws_broadcast_callback
    ws_broadcast_callback = callback

class DangerAction(BaseModel):
    id: Optional[str] = None
    person_id: str
    camera_id: str
    event_type: str = "Dangerous Person Identified"
    department_id: int
    alert_status: str = Field("ACTIVE", description="ACTIVE, DISPATCHED, RESOLVED, FALSE_POSITIVE")
    metadata: Optional[Dict[str, Any]] = None

class AlertStatusUpdate(BaseModel):
    alert_status: str = Field(..., description="ACTIVE, DISPATCHED, RESOLVED, FALSE_POSITIVE")
    notes: Optional[str] = None

# Initial Seed Danger Action Detections (Gujarat Police Corridor Surveillance)
DEFAULT_DANGER_ACTIONS: List[Dict[str, Any]] = [
    {
        "id": "DNG-ACT-001",
        "person_id": "CRM-8412",
        "person_name": "Vikramaditya Solanki",
        "person_photo": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face",
        "crime_type": "Armed Extortion & Gang Violence",
        "camera_id": "CAM001",
        "camera_address": "SG Highway Junction (Iskcon Cross Road), Ahmedabad",
        "event_type": "Dangerous Person Identified",
        "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "department_id": 1,
        "department_name": "Gujarat Police Department",
        "alert_status": "ACTIVE",
        "metadata": {
            "confidence": 0.94,
            "zone": "Z01",
            "lat": 23.0298,
            "lng": 72.5065,
            "detected_speed_kmh": 42
        }
    },
    {
        "id": "DNG-ACT-002",
        "person_id": "CRM-7104",
        "person_name": "Dharmesh Rajput (Chhota)",
        "person_photo": "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=300&h=300&fit=crop&crop=face",
        "crime_type": "Inter-State Vehicle Theft Ring",
        "camera_id": "CAM004",
        "camera_address": "Ashram Road Income Tax Circle, Ahmedabad",
        "event_type": "Dangerous Person Identified",
        "timestamp": (datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(hours=2)).isoformat(),
        "department_id": 2,
        "department_name": "Gujarat Traffic Branch",
        "alert_status": "DISPATCHED",
        "metadata": {
            "confidence": 0.91,
            "zone": "Z01",
            "lat": 23.0421,
            "lng": 72.5711,
            "vehicle_plate": "GJ-01-BK-5821"
        }
    },
    {
        "id": "DNG-ACT-003",
        "person_id": "CRM-3918",
        "person_name": "Kailash Govind Vaghela",
        "person_photo": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face",
        "crime_type": "Aggravated Robbery & Assault",
        "camera_id": "CAM007",
        "camera_address": "Kalupur Railway Station West Concourse, Ahmedabad",
        "event_type": "Dangerous Person Identified",
        "timestamp": (datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(hours=5)).isoformat(),
        "department_id": 1,
        "department_name": "Gujarat Police Department",
        "alert_status": "RESOLVED",
        "metadata": {
            "confidence": 0.89,
            "zone": "Z02",
            "lat": 23.0210,
            "lng": 72.6010,
            "resolution_note": "Intercepted at Kalupur platform 2 by PCR unit"
        }
    }
]

# Mutable in-memory store
in_memory_danger_actions: List[Dict[str, Any]] = [dict(a) for a in DEFAULT_DANGER_ACTIONS]

def enrich_alert_with_person_details(alert: Dict[str, Any]) -> Dict[str, Any]:
    """Enriches alert record with person name, photo, and crime type if missing."""
    alert_copy = dict(alert)
    person_id = alert_copy.get("person_id")
    if person_id and (not alert_copy.get("person_name") or not alert_copy.get("person_photo")):
        person = next((p for p in in_memory_crime_people if p["person_id"] == person_id), None)
        if person:
            alert_copy["person_name"] = person.get("name")
            alert_copy["person_photo"] = person.get("photo")
            alert_copy["crime_type"] = person.get("crime_type")
    return alert_copy

@router.post("/create_danger_action/")
@router.post("/create_danger_action")
def create_danger_action(
    action: DangerAction,
    current_user: Optional[str] = Depends(get_optional_current_user)
):
    """
    Triggered when OpenCV matches a face with a crime_people record.
    Inserts into danger_actions, logs to audit_log, and broadcasts to WebSocket clients.
    """
    now = datetime.datetime.now(datetime.timezone.utc).isoformat()
    action_id = action.id or f"DNG-{uuid.uuid4().hex[:6].upper()}"

    # Lookup suspect details
    person = next((p for p in in_memory_crime_people if p["person_id"] == action.person_id), None)
    person_name = person.get("name", "Unknown Suspect") if person else "Suspect"
    person_photo = person.get("photo", "") if person else ""
    crime_type = person.get("crime_type", "High Priority Target") if person else "Wanted Suspect"

    alert_record = {
        "id": action_id,
        "person_id": action.person_id,
        "person_name": person_name,
        "person_photo": person_photo,
        "crime_type": crime_type,
        "camera_id": action.camera_id,
        "event_type": action.event_type or "Dangerous Person Identified",
        "timestamp": now,
        "department_id": action.department_id,
        "alert_status": action.alert_status or "ACTIVE",
        "metadata": action.metadata or {}
    }

    officer = current_user or "OpenCV Sentinel Neural Engine (Automated)"

    # 1. Try Supabase Insertion
    supabase_success = False
    try:
        db_payload = {
            "id": action_id,
            "person_id": action.person_id,
            "camera_id": action.camera_id,
            "event_type": alert_record["event_type"],
            "timestamp": now,
            "department_id": action.department_id,
            "alert_status": alert_record["alert_status"],
            "metadata": alert_record["metadata"]
        }
        res = supabase.table("danger_actions").insert(db_payload).execute()
        if res.data:
            supabase_success = True
    except Exception:
        pass

    # 2. Update in-memory cache
    in_memory_danger_actions.insert(0, alert_record)

    # 3. Log to audit trail
    log_audit("DANGER_ACTION_TRIGGERED", officer, {
        "alert_id": action_id,
        "person_id": action.person_id,
        "camera_id": action.camera_id,
        "person_name": person_name
    })

    # 4. Trigger Real-time WebSocket Broadcast to connected department officers and Head
    broadcast_payload = {
        "type": "DANGER_ACTION_ALERT",
        "alert": alert_record,
        "headline": f"🚨 CRITICAL ALERT: {person_name} sighted at {action.camera_id}",
        "timestamp": now
    }
    if ws_broadcast_callback:
        try:
            ws_broadcast_callback(broadcast_payload)
        except Exception as e:
            print("WS broadcast notice:", e)

    return {
        "message": "Danger alert dispatched and broadcast successfully",
        "alert": alert_record,
        "source": "supabase" if supabase_success else "in_memory_fallback"
    }

@router.get("/get_danger_actions/")
@router.get("/get_danger_actions")
def get_danger_actions(
    department_id: Optional[int] = None,
    camera_id: Optional[str] = None,
    alert_status: Optional[str] = None,
    hours: Optional[int] = None,
    limit: int = 50,
    current_user: Optional[str] = Depends(get_optional_current_user)
):
    """
    Fetches danger alerts for dashboards and Leaflet GIS mapping.
    Supports department, camera, status, and temporal filtering.
    """
    # 1. Try Supabase
    try:
        query = supabase.table("danger_actions").select("*").order("timestamp", desc=True).limit(limit)
        if department_id:
            query = query.eq("department_id", department_id)
        if camera_id:
            query = query.eq("camera_id", camera_id)
        if alert_status and alert_status != "ALL":
            query = query.eq("alert_status", alert_status)
        res = query.execute()
        if res.data and len(res.data) > 0:
            enriched = [enrich_alert_with_person_details(a) for a in res.data]
            return {"alerts": enriched, "source": "supabase"}
    except Exception:
        pass

    # 2. Fallback to in-memory store
    results = in_memory_danger_actions
    if department_id:
        results = [a for a in results if a.get("department_id") == department_id]
    if camera_id:
        results = [a for a in results if a.get("camera_id") == camera_id]
    if alert_status and alert_status != "ALL":
        results = [a for a in results if a.get("alert_status", "").upper() == alert_status.upper()]

    if hours and hours > 0:
        cutoff = datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(hours=hours)
        filtered = []
        for a in results:
            ts_str = a.get("timestamp")
            try:
                ts = datetime.datetime.fromisoformat(ts_str.replace("Z", "+00:00"))
                if ts >= cutoff:
                    filtered.append(a)
            except Exception:
                filtered.append(a)
        results = filtered

    results = results[:limit]
    enriched = [enrich_alert_with_person_details(a) for a in results]
    return {"alerts": enriched, "source": "fallback"}

@router.put("/update_status/{alert_id}")
@router.put("/update_status/{alert_id}/")
def update_danger_action_status(
    alert_id: str,
    update: AlertStatusUpdate,
    current_user: Optional[str] = Depends(get_optional_current_user)
):
    """
    Updates the alert status (e.g. from ACTIVE -> DISPATCHED -> RESOLVED).
    """
    now = datetime.datetime.now(datetime.timezone.utc).isoformat()
    officer = current_user or "Control Room Duty Officer"

    # Try Supabase update
    try:
        supabase.table("danger_actions").update({"alert_status": update.alert_status}).eq("id", alert_id).execute()
    except Exception:
        pass

    # Update in-memory
    found = False
    for a in in_memory_danger_actions:
        if a["id"] == alert_id:
            a["alert_status"] = update.alert_status
            if update.notes:
                a.setdefault("metadata", {})["status_notes"] = update.notes
                a["metadata"]["updated_at"] = now
                a["metadata"]["updated_by"] = officer
            found = True
            break

    if not found:
        raise HTTPException(status_code=404, detail=f"Alert {alert_id} not found")

    log_audit("DANGER_ACTION_STATUS_CHANGED", officer, {
        "alert_id": alert_id,
        "new_status": update.alert_status
    })

    return {"message": f"Alert {alert_id} updated to {update.alert_status}", "alert_id": alert_id, "status": update.alert_status}
