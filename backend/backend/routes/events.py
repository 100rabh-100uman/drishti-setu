from fastapi import APIRouter
from pydantic import BaseModel
from supabase_client import supabase
from utils.audit_logger import log_audit
import datetime

router = APIRouter(tags=["Events"])

class EventCreate(BaseModel):
    camera_id: str
    event_type: str
    latitude: float
    longitude: float
    timestamp: str = None

@router.post("/add_event/")
def add_event(event: EventCreate, user: str = "system"):
    geom = f"POINT({event.longitude} {event.latitude})"
    # Use current time if none provided
    ts = event.timestamp if event.timestamp else datetime.datetime.now().isoformat()
    try:
        data = supabase.table("events").insert({
            "camera_id": event.camera_id,
            "event_type": event.event_type,
            "timestamp": ts,
            "geom": geom
        }).execute()
        
        log_audit("ADD_EVENT", user, {"camera_id": event.camera_id, "event_type": event.event_type})
        return {"message": "Event added", "data": data.data}
    except Exception as e:
        return {"error": str(e)}

@router.get("/get_events/")
def get_events():
    try:
        data = supabase.table("events").select("*").execute()
        return {"events": data.data}
    except Exception as e:
        return {"error": str(e)}
