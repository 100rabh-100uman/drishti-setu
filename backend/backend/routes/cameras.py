from fastapi import APIRouter, Query
from pydantic import BaseModel
from typing import List, Optional, Union, Dict, Any
from supabase_client import supabase
from utils.audit_logger import log_audit
from database import engine
from sqlalchemy import text

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

import struct

@router.get("/get_cameras/")
def get_cameras(
    department_id: Optional[int] = Query(None),
    camera_type: Optional[str] = Query(None),
    zone_id: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    needs_review: Optional[bool] = Query(None)
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
            query = query.eq("status", status)
        if needs_review is not None:
            query = query.eq("needs_review", needs_review)
            
        data = query.execute()
        
        # Parse PostGIS EWKB hex string into usable Lat/Lng for the frontend
        parsed_cameras = []
        for cam in data.data:
            geom_hex = cam.get("geom")
            cam["lat"] = None
            cam["lng"] = None
            if geom_hex and isinstance(geom_hex, str) and len(geom_hex) >= 50:
                try:
                    # EWKB Point: 1 byte endian + 4 bytes type + 4 bytes SRID = 9 bytes (18 hex chars)
                    # Next 8 bytes (16 hex chars) is X (longitude)
                    # Next 8 bytes (16 hex chars) is Y (latitude)
                    lon_hex = geom_hex[18:34]
                    lat_hex = geom_hex[34:50]
                    cam["lng"] = struct.unpack('<d', bytes.fromhex(lon_hex))[0]
                    cam["lat"] = struct.unpack('<d', bytes.fromhex(lat_hex))[0]
                except Exception as parse_e:
                    print(f"Error parsing geom for {cam.get('camera_id')}: {parse_e}")
            if cam.get("lat") is None and cam.get("latitude") is not None:
                try:
                    cam["lat"] = float(cam["latitude"])
                except (ValueError, TypeError):
                    pass
            if cam.get("lng") is None and cam.get("longitude") is not None:
                try:
                    cam["lng"] = float(cam["longitude"])
                except (ValueError, TypeError):
                    pass
            parsed_cameras.append(cam)
            
        return {"cameras": parsed_cameras}
    except Exception as e:
        return {"error": str(e)}

@router.get("/{camera_id}")
@router.get("/cameras/{camera_id}")
def get_camera(camera_id: str):
    try:
        data = supabase.table("cameras").select("*").eq("camera_id", camera_id).execute()
        if not data.data:
            return {"error": "Camera not found"}
        cam = data.data[0]
        if cam.get("lat") is None and cam.get("latitude") is not None:
            try:
                cam["lat"] = float(cam["latitude"])
            except (ValueError, TypeError):
                pass
        if cam.get("lng") is None and cam.get("longitude") is not None:
            try:
                cam["lng"] = float(cam["longitude"])
            except (ValueError, TypeError):
                pass
        return {"camera": cam}
    except Exception as e:
        return {"error": str(e)}

@router.get('/get_camera_events/{camera_id}')
def get_camera_events(camera_id: str):
    try:
        data = supabase.table('events').select('*').eq('camera_id', camera_id).order('created_at', desc=True).limit(5).execute()
        return {'events': data.data}
    except Exception as e:
        return {'error': str(e)}

@router.post("/bulk_import/")
def bulk_import_cameras(payload: Union[Dict[str, Any], List[Dict[str, Any]]], username: str = "system"):
    """
    Validate, map, and INSERT CCTV camera records in bulk into public.cameras.
    Uses PostGIS ST_SetSRID(ST_MakePoint(lng, lat), 4326) for spatial geometry.
    Performs field normalization and constraint verification.
    """
    if isinstance(payload, dict):
        raw_cameras = payload.get("cameras", [])
        user = payload.get("username", username)
    elif isinstance(payload, list):
        raw_cameras = payload
        user = username
    else:
        return {"success": False, "error": "Invalid payload format", "inserted_count": 0}

    if not raw_cameras:
        return {"success": False, "error": "No camera records provided", "inserted_count": 0}

    # Fetch valid department and zone IDs from database to ensure FK referential integrity
    valid_depts = set()
    valid_zones = set()
    try:
        with engine.begin() as conn:
            d_res = conn.execute(text("SELECT id FROM public.departments")).fetchall()
            valid_depts = {row[0] for row in d_res}
            z_res = conn.execute(text("SELECT zone_id FROM public.zones")).fetchall()
            valid_zones = {row[0] for row in z_res}
    except Exception as e:
        print(f"Warning: Could not pre-fetch FK sets: {e}")

    import psycopg2
    from psycopg2.extras import execute_values

    inserted_count = 0
    updated_count = 0
    failed_records = []

    valid_tuples = []
    for idx, cam in enumerate(raw_cameras):
        cid = str(cam.get("camera_id") or "").strip()
        if not cid:
            failed_records.append({
                "index": idx,
                "camera_id": "UNKNOWN",
                "error": "camera_id is required"
            })
            continue

        ct_raw = str(cam.get("camera_type") or "").strip().lower()
        cam_type = "Analog-based" if "analog" in ct_raw else "IP-based"

        st_raw = str(cam.get("status") or "").strip().title()
        if st_raw in ["Active", "Maintenance", "Offline", "Degraded"]:
            status = st_raw
        elif st_raw == "Inactive":
            status = "Offline"
        else:
            status = "Active"

        dept_id = None
        dept_raw = cam.get("department_id")
        if dept_raw is not None and str(dept_raw).strip() != "":
            try:
                d_int = int(dept_raw)
                if not valid_depts or d_int in valid_depts:
                    dept_id = d_int
            except (ValueError, TypeError):
                dept_id = None
        if dept_id is None and valid_depts:
            dept_id = min(valid_depts)

        zone_id = None
        zid_raw = str(cam.get("zone_id") or "").strip()
        if zid_raw in valid_zones:
            zone_id = zid_raw
        elif zid_raw:
            z_map = {
                "zone-ahm-west": "Z04",
                "zone-ahm-east": "Z03",
                "zone-gandhinagar": "Z01",
                "zone-tra-central": "Z05",
                "zone-surat": "Z02",
                "zone-vadodara": "Z03",
                "zone-rajkot": "Z04",
                "zone-mun-ward1": "Z05"
            }
            zone_id = z_map.get(zid_raw.lower())
            if zone_id not in valid_zones and valid_zones:
                zone_id = None

        lat_val = None
        lng_val = None
        try:
            if cam.get("latitude") is not None and str(cam.get("latitude")).strip() != "":
                lat_val = float(cam.get("latitude"))
            if cam.get("longitude") is not None and str(cam.get("longitude")).strip() != "":
                lng_val = float(cam.get("longitude"))
        except (ValueError, TypeError):
            lat_val = None
            lng_val = None

        wkt_geom = f"SRID=4326;POINT({lng_val} {lat_val})" if (lat_val is not None and lng_val is not None) else None

        nr_raw = cam.get("needs_review")
        needs_review = nr_raw if isinstance(nr_raw, bool) else (str(nr_raw).lower() in ["true", "1", "yes"])

        inst_date = None
        if cam.get("installation_date"):
            inst_raw = str(cam.get("installation_date")).strip()
            if len(inst_raw) >= 10:
                inst_date = inst_raw[:10]

        mac_addr = str(cam.get("mac_address") or "").strip() or None
        sn_val = str(cam.get("serial_number") or "").strip() or None
        uuid_val = str(cam.get("device_uuid") or "").strip() or None
        ip_val = str(cam.get("ip_address") or "").strip() or None
        addr_val = str(cam.get("address") or "").strip() or None
        storage_val = str(cam.get("storage_type") or "").strip() or None
        brand_val = str(cam.get("brand") or "").strip() or None
        model_val = str(cam.get("model_number") or "").strip() or None

        valid_tuples.append((
            cid, dept_id, cam_type, status,
            wkt_geom, lat_val, lng_val,
            mac_addr, sn_val, uuid_val, ip_val, addr_val, zone_id,
            needs_review, inst_date, storage_val, brand_val, model_val
        ))

    sql = """
        INSERT INTO public.cameras (
            camera_id, department_id, camera_type, status,
            geom, latitude, longitude,
            mac_address, serial_number, device_uuid, ip_address, address, zone_id,
            needs_review, installation_date, storage_type, brand, model_number
        )
        VALUES %s
        ON CONFLICT (camera_id) DO UPDATE SET
            department_id = EXCLUDED.department_id,
            camera_type = EXCLUDED.camera_type,
            status = EXCLUDED.status,
            geom = EXCLUDED.geom,
            latitude = EXCLUDED.latitude,
            longitude = EXCLUDED.longitude,
            mac_address = EXCLUDED.mac_address,
            serial_number = EXCLUDED.serial_number,
            device_uuid = EXCLUDED.device_uuid,
            ip_address = EXCLUDED.ip_address,
            address = EXCLUDED.address,
            zone_id = EXCLUDED.zone_id,
            needs_review = EXCLUDED.needs_review,
            installation_date = EXCLUDED.installation_date,
            storage_type = EXCLUDED.storage_type,
            brand = EXCLUDED.brand,
            model_number = EXCLUDED.model_number
        RETURNING (xmax = 0) AS is_insert;
    """
    template = "(%s, %s, %s, %s, ST_GeomFromEWKT(%s), %s, %s, %s, %s, %s::uuid, %s, %s, %s, %s, %s::date, %s, %s, %s)"

    raw_conn = engine.raw_connection()
    try:
        cur = raw_conn.cursor()
        chunk_size = 250
        for i in range(0, len(valid_tuples), chunk_size):
            chunk = valid_tuples[i:i + chunk_size]
            try:
                res = execute_values(cur, sql, chunk, template=template, fetch=True)
                raw_conn.commit()
                for r in res:
                    if r and r[0]:
                        inserted_count += 1
                    else:
                        updated_count += 1
            except Exception as batch_err:
                raw_conn.rollback()
                for row_tuple in chunk:
                    cid = row_tuple[0]
                    try:
                        cur.execute("SAVEPOINT row_sp;")
                        res_single = execute_values(cur, sql, [row_tuple], template=template, fetch=True)
                        cur.execute("RELEASE SAVEPOINT row_sp;")
                        if res_single and res_single[0] and res_single[0][0]:
                            inserted_count += 1
                        else:
                            updated_count += 1
                    except Exception as single_err:
                        cur.execute("ROLLBACK TO SAVEPOINT row_sp;")
                        failed_records.append({
                            "camera_id": cid,
                            "error": str(single_err)
                        })
                raw_conn.commit()
        cur.close()
    finally:
        raw_conn.close()

    log_audit("BULK_IMPORT_CAMERAS", user, {
        "inserted": inserted_count,
        "updated": updated_count,
        "failed": len(failed_records),
        "total_requested": len(raw_cameras)
    })

    total_succeeded = inserted_count + updated_count

    return {
        "success": total_succeeded > 0,
        "inserted_count": total_succeeded,
        "newly_created": inserted_count,
        "updated_existing": updated_count,
        "failed_count": len(failed_records),
        "failed_records": failed_records[:20],
        "message": f"Successfully processed {total_succeeded} cameras ({inserted_count} newly inserted, {updated_count} updated). {len(failed_records)} failed."
    }

