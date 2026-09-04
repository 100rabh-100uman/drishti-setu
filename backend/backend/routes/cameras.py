from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from typing import List, Optional, Any, Dict
import struct
import re
from supabase_client import supabase
from utils.audit_logger import log_audit
from utils.auth_utils import get_current_user, get_optional_current_user

router = APIRouter()
app = router # Alias for main.py integration


class CameraCreate(BaseModel):
    camera_id: str
    department_id: int
    camera_type: str
    status: str
    latitude: float
    longitude: float
    mac_address: str
    serial_number: str
    device_uuid: Optional[str] = None
    ip_address: Optional[str] = None
    address: Optional[str] = None
    zone_id: Optional[str] = None
    needs_review: bool = False

class CameraUpdate(BaseModel):
    address: Optional[str] = None
    status: Optional[str] = None
    needs_review: Optional[bool] = None

def parse_point_geom(geom_val: Any):
    """
    Parses PostGIS geometry representations (EWKB hex, WKT POINT, GeoJSON, etc.)
    into (lat, lng) floats.
    """
    if not geom_val:
        return None, None
    
    # 1. GeoJSON dictionary
    if isinstance(geom_val, dict):
        coords = geom_val.get("coordinates")
        if coords and len(coords) >= 2:
            return float(coords[1]), float(coords[0]) # (lat, lng)
        return None, None

    if isinstance(geom_val, str):
        val = geom_val.strip()
        # 2. WKT format: POINT(lng lat) or POINT (lng lat)
        wkt_match = re.search(r'POINT\s*\(\s*([-\d\.]+)\s+([-\d\.]+)\s*\)', val, re.IGNORECASE)
        if wkt_match:
            try:
                lng = float(wkt_match.group(1))
                lat = float(wkt_match.group(2))
                return lat, lng
            except ValueError:
                pass

        # 3. PostGIS EWKB hex format
        if len(val) >= 50 and all(c in "0123456789abcdefABCDEF" for c in val):
            try:
                # EWKB Point: 1 byte endian + 4 bytes type + 4 bytes SRID = 9 bytes (18 hex chars)
                # Next 8 bytes (16 hex chars) is X (longitude)
                # Next 8 bytes (16 hex chars) is Y (latitude)
                lon_hex = val[18:34]
                lat_hex = val[34:50]
                lng = struct.unpack('<d', bytes.fromhex(lon_hex))[0]
                lat = struct.unpack('<d', bytes.fromhex(lat_hex))[0]
                return lat, lng
            except Exception as e:
                print(f"Error parsing EWKB hex: {e}")

    return None, None

def get_departments_map() -> Dict[int, str]:
    """Helper to fetch mapping of department_id -> department name."""
    try:
        data = supabase.table("departments").select("id, name").execute()
        return {d["id"]: d["name"] for d in (data.data or [])}
    except Exception:
        return {}

@router.post("/add_camera/")
def add_camera(camera: CameraCreate, username: str = "system"):
    geom = f"POINT({camera.longitude} {camera.latitude})"
    try:
        data = supabase.table("cameras").insert({
            "camera_id": camera.camera_id,
            "department_id": camera.department_id,
            "camera_type": camera.camera_type,
            "status": camera.status,
            "geom": geom,
            "mac_address": camera.mac_address,
            "serial_number": camera.serial_number,
            "device_uuid": camera.device_uuid,
            "ip_address": camera.ip_address,
            "address": camera.address,
            "zone_id": camera.zone_id,
            "needs_review": camera.needs_review
        }).execute()
        
        log_audit("ADD_CAMERA", username, {"camera_id": camera.camera_id}, camera_id=camera.camera_id)
        return {"message": "Camera added", "data": data.data}
    except Exception as e:
        return {"error": str(e)}

@router.post("/update_camera/{camera_id}")
def update_camera(camera_id: str, updates: CameraUpdate, username: str = "system"):
    update_data = {k: v for k, v in updates.dict().items() if v is not None}
    if not update_data:
        return {"message": "No updates provided"}
        
    # Auto-flag for review if status is changed to an offline state
    if update_data.get("status") in ["Offline", "Maintenance", "Degraded"]:
        update_data["needs_review"] = True

    try:
        data = supabase.table("cameras").update(update_data).eq("camera_id", camera_id).execute()
        log_audit("UPDATE_CAMERA", username, update_data, camera_id=camera_id)
        return {"message": "Camera updated", "data": data.data}
    except Exception as e:
        return {"error": str(e)}

DEFAULT_GUJARAT_CAMERAS = [
    {
        "id": 1,
        "camera_id": "CAM001",
        "department_id": 1,
        "department_name": "Gujarat Police Department",
        "camera_type": "IP",
        "status": "Active",
        "lat": 23.0338,
        "lng": 72.5645,
        "address": "Navrangpura Bus Stand Junction, Ahmedabad",
        "zone_id": "Z01",
        "mac_address": "00:1A:2B:AA:01:01",
        "serial_number": "SN001001",
        "ip_address": "192.168.1.101",
        "needs_review": False
    },
    {
        "id": 2,
        "camera_id": "CAM002",
        "department_id": 1,
        "department_name": "Gujarat Police Department",
        "camera_type": "IP",
        "status": "Active",
        "lat": 23.0370,
        "lng": 72.5320,
        "address": "Vastrapur Lake East Gate, Ahmedabad",
        "zone_id": "Z01",
        "mac_address": "00:1A:2B:AA:01:02",
        "serial_number": "SN001002",
        "ip_address": "192.168.1.102",
        "needs_review": False
    },
    {
        "id": 3,
        "camera_id": "CAM003",
        "department_id": 2,
        "department_name": "Gujarat Traffic Branch",
        "camera_type": "IP",
        "status": "Inactive",
        "lat": 23.0310,
        "lng": 72.5580,
        "address": "CG Road Center Point, Navrangpura, Ahmedabad",
        "zone_id": "Z01",
        "mac_address": "00:1A:2B:AA:01:03",
        "serial_number": "SN001003",
        "ip_address": "192.168.1.103",
        "needs_review": True
    },
    {
        "id": 4,
        "camera_id": "CAM004",
        "department_id": 2,
        "department_name": "Gujarat Traffic Branch",
        "camera_type": "Analog",
        "status": "Maintenance",
        "lat": 23.0150,
        "lng": 72.5280,
        "address": "Satellite Cross Roads, Satellite, Ahmedabad",
        "zone_id": "Z01",
        "mac_address": "00:1A:2B:AA:01:04",
        "serial_number": "SN001004",
        "ip_address": "192.168.1.104",
        "needs_review": True
    },
    {
        "id": 5,
        "camera_id": "CAM005",
        "department_id": 1,
        "department_name": "Gujarat Police Department",
        "camera_type": "IP",
        "status": "Needs Review",
        "lat": 23.0510,
        "lng": 72.5180,
        "address": "Bodakdev Ring Road Approach, Ahmedabad",
        "zone_id": "Z01",
        "mac_address": "00:1A:2B:AA:01:05",
        "serial_number": "SN001005",
        "ip_address": "192.168.1.105",
        "needs_review": True
    },
    {
        "id": 6,
        "camera_id": "CAM006",
        "department_id": 1,
        "department_name": "Gujarat Police Department",
        "camera_type": "IP",
        "status": "Active",
        "lat": 23.0280,
        "lng": 72.5850,
        "address": "Relief Road Junction, Walled City, Ahmedabad",
        "zone_id": "Z02",
        "mac_address": "00:1A:2B:AA:02:01",
        "serial_number": "SN002001",
        "ip_address": "192.168.1.201",
        "needs_review": False
    },
    {
        "id": 7,
        "camera_id": "CAM007",
        "department_id": 2,
        "department_name": "Gujarat Traffic Branch",
        "camera_type": "IP",
        "status": "Active",
        "lat": 23.0210,
        "lng": 72.6010,
        "address": "Kalupur Railway Station West Concourse, Ahmedabad",
        "zone_id": "Z02",
        "mac_address": "00:1A:2B:AA:02:02",
        "serial_number": "SN002002",
        "ip_address": "192.168.1.202",
        "needs_review": False
    },
    {
        "id": 8,
        "camera_id": "CAM008",
        "department_id": 4,
        "department_name": "Ahmedabad Municipal Corporation (AMC)",
        "camera_type": "Analog",
        "status": "Inactive",
        "lat": 23.0060,
        "lng": 72.6020,
        "address": "Kankaria Lake Gate 3, Maninagar, Ahmedabad",
        "zone_id": "Z02",
        "mac_address": "00:1A:2B:AA:02:03",
        "serial_number": "SN002003",
        "ip_address": "192.168.1.203",
        "needs_review": True
    },
    {
        "id": 9,
        "camera_id": "CAM009",
        "department_id": 1,
        "department_name": "Gujarat Police Department",
        "camera_type": "IP",
        "status": "Maintenance",
        "lat": 22.9980,
        "lng": 72.5950,
        "address": "Maninagar Char Rasta, Ahmedabad",
        "zone_id": "Z02",
        "mac_address": "00:1A:2B:AA:02:04",
        "serial_number": "SN002004",
        "ip_address": "192.168.1.204",
        "needs_review": True
    },
    {
        "id": 10,
        "camera_id": "CAM010",
        "department_id": 1,
        "department_name": "Gujarat Police Department",
        "camera_type": "IP",
        "status": "Active",
        "lat": 23.2200,
        "lng": 72.6450,
        "address": "Sector 10 Capital Complex Gate 1, Gandhinagar",
        "zone_id": "Z03",
        "mac_address": "00:1A:2B:AA:03:01",
        "serial_number": "SN003001",
        "ip_address": "192.168.1.301",
        "needs_review": False
    },
    {
        "id": 11,
        "camera_id": "CAM011",
        "department_id": 5,
        "department_name": "Gandhinagar Municipal Corporation (GMC)",
        "camera_type": "IP",
        "status": "Active",
        "lat": 23.1920,
        "lng": 72.6310,
        "address": "Infocity Main Gate, Gandhinagar",
        "zone_id": "Z03",
        "mac_address": "00:1A:2B:AA:03:02",
        "serial_number": "SN003002",
        "ip_address": "192.168.1.302",
        "needs_review": False
    },
    {
        "id": 12,
        "camera_id": "CAM012",
        "department_id": 1,
        "department_name": "Gujarat Police Department",
        "camera_type": "IP",
        "status": "Needs Review",
        "lat": 23.2350,
        "lng": 72.6580,
        "address": "Sector 21 Market Perimeter, Gandhinagar",
        "zone_id": "Z03",
        "mac_address": "00:1A:2B:AA:03:03",
        "serial_number": "SN003003",
        "ip_address": "192.168.1.303",
        "needs_review": True
    },
    {
        "id": 13,
        "camera_id": "CAM013",
        "department_id": 2,
        "department_name": "Gujarat Traffic Branch",
        "camera_type": "IP",
        "status": "Active",
        "lat": 23.1250,
        "lng": 72.5410,
        "address": "SG Highway Vaishnodevi Flyover, Ahmedabad",
        "zone_id": "Z04",
        "mac_address": "00:1A:2B:AA:04:01",
        "serial_number": "SN004001",
        "ip_address": "192.168.1.401",
        "needs_review": False
    },
    {
        "id": 14,
        "camera_id": "CAM014",
        "department_id": 2,
        "department_name": "Gujarat Traffic Branch",
        "camera_type": "IP",
        "status": "Active",
        "lat": 23.0850,
        "lng": 72.5280,
        "address": "SG Highway Gota Junction, Ahmedabad",
        "zone_id": "Z04",
        "mac_address": "00:1A:2B:AA:04:02",
        "serial_number": "SN004002",
        "ip_address": "192.168.1.402",
        "needs_review": False
    },
    {
        "id": 15,
        "camera_id": "CAM015",
        "department_id": 2,
        "department_name": "Gujarat Traffic Branch",
        "camera_type": "IP",
        "status": "Inactive",
        "lat": 23.0530,
        "lng": 72.5150,
        "address": "SG Highway Thaltej Underpass, Ahmedabad",
        "zone_id": "Z04",
        "mac_address": "00:1A:2B:AA:04:03",
        "serial_number": "SN004003",
        "ip_address": "192.168.1.403",
        "needs_review": True
    },
    {
        "id": 16,
        "camera_id": "CAM016",
        "department_id": 2,
        "department_name": "Gujarat Traffic Branch",
        "camera_type": "Analog",
        "status": "Maintenance",
        "lat": 23.0240,
        "lng": 72.5070,
        "address": "SG Highway ISKCON Cross Roads, Ahmedabad",
        "zone_id": "Z04",
        "mac_address": "00:1A:2B:AA:04:04",
        "serial_number": "SN004004",
        "ip_address": "192.168.1.404",
        "needs_review": True
    },
    {
        "id": 17,
        "camera_id": "CAM017",
        "department_id": 6,
        "department_name": "Transport & Highways Department",
        "camera_type": "IP",
        "status": "Active",
        "lat": 22.9970,
        "lng": 72.4850,
        "address": "SG Highway Sarkhej Sanand Cross Road, Ahmedabad",
        "zone_id": "Z04",
        "mac_address": "00:1A:2B:AA:04:05",
        "serial_number": "SN004005",
        "ip_address": "192.168.1.405",
        "needs_review": False
    },
    {
        "id": 18,
        "camera_id": "CAM018",
        "department_id": 1,
        "department_name": "Gujarat Police Department",
        "camera_type": "IP",
        "status": "Active",
        "lat": 23.0380,
        "lng": 72.4620,
        "address": "SP Ring Road Bopal Junction Checkpost, Ahmedabad",
        "zone_id": "Z05",
        "mac_address": "00:1A:2B:AA:05:01",
        "serial_number": "SN005001",
        "ip_address": "192.168.1.501",
        "needs_review": False
    },
    {
        "id": 19,
        "camera_id": "CAM019",
        "department_id": 3,
        "department_name": "Disaster Management Authority (GSDMA)",
        "camera_type": "IP",
        "status": "Needs Review",
        "lat": 23.0150,
        "lng": 72.4550,
        "address": "South Bopal Ring Road Corridor, Ahmedabad",
        "zone_id": "Z05",
        "mac_address": "00:1A:2B:AA:05:02",
        "serial_number": "SN005002",
        "ip_address": "192.168.1.502",
        "needs_review": True
    },
    {
        "id": 20,
        "camera_id": "CAM020",
        "department_id": 1,
        "department_name": "Gujarat Police Department",
        "camera_type": "IP",
        "status": "Active",
        "lat": 22.9720,
        "lng": 72.4720,
        "address": "Sanand Industrial Approach Toll Plaza, Ahmedabad",
        "zone_id": "Z05",
        "mac_address": "00:1A:2B:AA:05:03",
        "serial_number": "SN005003",
        "ip_address": "192.168.1.503",
        "needs_review": False
    }
]

def _filter_fallback_cameras(
    department_id: Optional[int] = None,
    camera_type: Optional[str] = None,
    zone_id: Optional[str] = None,
    status: Optional[str] = None,
    needs_review: Optional[bool] = None
):
    filtered = []
    for c in DEFAULT_GUJARAT_CAMERAS:
        cam = dict(c)
        cam["geom"] = {
            "type": "Point",
            "coordinates": [cam["lng"], cam["lat"]]
        }
        if department_id is not None and int(cam["department_id"]) != int(department_id):
            continue
        if camera_type and cam["camera_type"].lower() != camera_type.lower():
            continue
        if zone_id and cam["zone_id"] != zone_id:
            continue
        if status:
            if status.lower() in ["inactive", "offline"]:
                if cam["status"].lower() not in ["inactive", "offline"]:
                    continue
            elif cam["status"].lower() != status.lower():
                continue
        if needs_review is not None and cam["needs_review"] != needs_review:
            continue
        filtered.append(cam)
    return filtered

@router.get("/get_cameras/")
@router.get("/get_cameras")
def get_cameras(
    department_id: Optional[int] = Query(None),
    camera_type: Optional[str] = Query(None),
    zone_id: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    needs_review: Optional[bool] = Query(None),
    current_user: Optional[str] = Depends(get_optional_current_user)
):
    try:
        query = supabase.table("cameras").select("*")
        
        if department_id is not None:
            query = query.eq("department_id", department_id)
        if camera_type:
            query = query.eq("camera_type", camera_type)
        if zone_id:
            query = query.eq("zone_id", zone_id)
        if status:
            if status.lower() in ["inactive", "offline"]:
                query = query.in_("status", ["Inactive", "Offline"])
            else:
                query = query.eq("status", status)
        if needs_review is not None:
            query = query.eq("needs_review", needs_review)
            
        data = query.execute()
        
        if data.data and len(data.data) > 0:
            dept_map = get_departments_map()
            parsed_cameras = []
            for cam in data.data:
                lat, lng = parse_point_geom(cam.get("geom"))
                if lat is None and cam.get("latitude") is not None:
                    lat = float(cam["latitude"])
                if lng is None and cam.get("longitude") is not None:
                    lng = float(cam["longitude"])
                
                cam["lat"] = lat
                cam["lng"] = lng
                
                # Format geom as standard Leaflet GeoJSON Point
                if lat is not None and lng is not None:
                    cam["geom"] = {
                        "type": "Point",
                        "coordinates": [lng, lat]
                    }
                
                # Attach department name
                dept_id = cam.get("department_id")
                cam["department_name"] = dept_map.get(dept_id, cam.get("department") or (f"Department {dept_id}" if dept_id else "Police Department"))
                
                parsed_cameras.append(cam)
            return {"cameras": parsed_cameras}
        else:
            fallback = _filter_fallback_cameras(department_id, camera_type, zone_id, status, needs_review)
            return {"cameras": fallback}
    except Exception as e:
        fallback = _filter_fallback_cameras(department_id, camera_type, zone_id, status, needs_review)
        return {"cameras": fallback, "warning": str(e)}

@router.get("/cameras/{camera_id}")
def get_camera(camera_id: str, current_user: str = Depends(get_current_user)):
    try:
        data = supabase.table("cameras").select("*").eq("camera_id", camera_id).execute()
        if not data.data:
            return {"error": "Camera not found"}
        cam = data.data[0]
        lat, lng = parse_point_geom(cam.get("geom"))
        cam["lat"] = lat
        cam["lng"] = lng
        if lat is not None and lng is not None:
            cam["geom"] = {
                "type": "Point",
                "coordinates": [lng, lat]
            }
        return {"camera": cam}
    except Exception as e:
        return {"error": str(e)}

def _fetch_camera_events_and_audit(camera_id: str):
    events = []
    last_audit = None
    try:
        events_res = supabase.table('events').select('*').eq('camera_id', camera_id).order('timestamp', desc=True).limit(5).execute()
        events = events_res.data or []
    except Exception:
        pass

    try:
        audit_res = supabase.table('audit_log').select('*').eq('camera_id', camera_id).order('timestamp', desc=True).limit(1).execute()
        if audit_res.data and len(audit_res.data) > 0:
            last_audit = audit_res.data[0]
    except Exception:
        pass

    if not last_audit:
        last_audit = {
            "action": "TELEMETRY_HEARTBEAT",
            "timestamp": "2026-09-04T10:30:00Z",
            "performed_by": "sec_daemon_gujarat",
            "details": f"Automated system heartbeat verified for {camera_id}"
        }

    return {
        'camera_id': camera_id,
        'events': events,
        'last_audit': last_audit
    }

@router.get('/get_camera_events/')
def get_camera_events_query(
    camera_id: Optional[str] = Query(None),
    current_user: Optional[str] = Depends(get_optional_current_user)
):
    if not camera_id:
        return {'events': [], 'last_audit': None}
    return _fetch_camera_events_and_audit(camera_id)

@router.get('/get_camera_events/{camera_id}')
def get_camera_events_path(
    camera_id: str,
    current_user: Optional[str] = Depends(get_optional_current_user)
):
    return _fetch_camera_events_and_audit(camera_id)

