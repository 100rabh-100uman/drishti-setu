from fastapi import APIRouter, Depends
from typing import Optional, List, Dict, Any
import re
from supabase_client import supabase
from utils.auth_utils import get_optional_current_user

router = APIRouter(tags=["Zones & Gap Analysis"])


# Curated high-precision surveillance zone polygon boundaries for Gujarat Police CCTV Corridors
DEFAULT_GUJARAT_ZONES = [
    {
        "zone_id": "Z01",
        "name": "Ahmedabad West Surveillance Zone",
        "code": "AHM-WEST",
        "description": "Covering Navrangpura, Vastrapur, Satellite, and Bodakdev corridors",
        "department_id": 1,
        "color": "#10B981", # Emerald
        "latlngs": [
            [23.060, 72.500],
            [23.060, 72.560],
            [23.005, 72.560],
            [23.005, 72.500],
            [23.060, 72.500]
        ]
    },
    {
        "zone_id": "Z02",
        "name": "Ahmedabad East & Walled City Zone",
        "code": "AHM-EAST",
        "description": "Covering Relief Road, Kalupur, Maninagar, and Kankaria perimeter",
        "department_id": 1,
        "color": "#3B82F6", # Blue
        "latlngs": [
            [23.050, 72.570],
            [23.050, 72.640],
            [22.980, 72.640],
            [22.980, 72.570],
            [23.050, 72.570]
        ]
    },
    {
        "zone_id": "Z03",
        "name": "Gandhinagar Capital & Admin Corridor",
        "code": "GNR-ADMIN",
        "description": "High-security Capital Complex, Infocity, and Sectors 1-30",
        "department_id": 1,
        "color": "#8B5CF6", # Purple
        "latlngs": [
            [23.260, 72.600],
            [23.260, 72.680],
            [23.160, 72.680],
            [23.160, 72.600],
            [23.260, 72.600]
        ]
    },
    {
        "zone_id": "Z04",
        "name": "SG Highway Express Corridor",
        "code": "SGH-TRANSIT",
        "description": "High-density arterial transit route connecting Sarkhej to Vaishnodevi",
        "department_id": 2, # Traffic
        "color": "#F59E0B", # Amber
        "latlngs": [
            [23.140, 72.520],
            [23.140, 72.550],
            [22.990, 72.490],
            [22.990, 72.460],
            [23.140, 72.520]
        ]
    },
    {
        "zone_id": "Z05",
        "name": "SP Ring Road & Industrial Perimeter",
        "code": "RNG-LOGISTICS",
        "description": "Outer Ring Road freight corridors, Bopal junctions, and Sanand approach",
        "department_id": 1,
        "color": "#EC4899", # Pink
        "latlngs": [
            [23.050, 72.430],
            [23.050, 72.490],
            [22.950, 72.490],
            [22.950, 72.430],
            [23.050, 72.430]
        ]
    }
]

def parse_polygon_wkt(wkt_str: str):
    """Parses WKT POLYGON((lng lat, ...)) into latlngs and GeoJSON coordinates."""
    m = re.search(r'POLYGON\s*\(\s*\((.*?)\)\s*\)', wkt_str, re.IGNORECASE)
    if m:
        coord_pairs = m.group(1).split(",")
        latlngs = []
        geojson_coords = []
        for pair in coord_pairs:
            parts = pair.strip().split()
            if len(parts) >= 2:
                lng = float(parts[0])
                lat = float(parts[1])
                latlngs.append([lat, lng])
                geojson_coords.append([lng, lat])
        return latlngs, geojson_coords
    return None, None

@router.get("/gap_analysis/")
@router.get("/gap_analysis")
def gap_analysis(current_user: Optional[str] = Depends(get_optional_current_user)):
    try:
        data = supabase.rpc("get_camera_coverage_stats").execute()
        return {"gap_analysis": data.data}
    except Exception as e:
        return {"error": str(e), "hint": "Ensure 'get_camera_coverage_stats' RPC function exists in Supabase."}

@router.get("/get_zones/")
@router.get("/get_zones")
def get_zones(current_user: Optional[str] = Depends(get_optional_current_user)):


    try:
        # Check database for custom zone polygons
        db_data = supabase.table("zones").select("*").execute()
        raw_zones = db_data.data or []
        
        # Build lookup from default polygons
        defaults_by_id = {z["zone_id"]: z for z in DEFAULT_GUJARAT_ZONES}
        
        formatted_zones = []
        
        if raw_zones:
            for idx, rz in enumerate(raw_zones):
                zid = rz.get("zone_id") or rz.get("id") or f"Z{(idx+1):02}"
                zname = rz.get("name") or f"Zone {zid}"
                
                latlngs = None
                geojson_coords = None
                
                # Check for geometry in DB
                geom_val = rz.get("geom") or rz.get("polygon") or rz.get("geometry")
                if geom_val and isinstance(geom_val, str):
                    latlngs, geojson_coords = parse_polygon_wkt(geom_val)
                elif isinstance(geom_val, dict) and geom_val.get("coordinates"):
                    coords = geom_val.get("coordinates")
                    # Handle polygon coordinates [[[lng, lat], ...]]
                    if coords and len(coords) > 0 and isinstance(coords[0], list):
                        geojson_coords = coords[0]
                        latlngs = [[p[1], p[0]] for p in coords[0]]
                        
                # Fallback to predefined polygon if no valid geometry in DB
                if not latlngs:
                    fallback = defaults_by_id.get(zid, DEFAULT_GUJARAT_ZONES[idx % len(DEFAULT_GUJARAT_ZONES)])
                    latlngs = fallback["latlngs"]
                    geojson_coords = [[p[1], p[0]] for p in latlngs]
                    if not rz.get("name"):
                        zname = fallback["name"]
                        
                color = rz.get("color") or defaults_by_id.get(zid, {}).get("color") or "#3B82F6"
                
                formatted_zones.append({
                    "zone_id": zid,
                    "id": zid,
                    "name": zname,
                    "code": rz.get("code") or zid,
                    "department_id": rz.get("department_id") or 1,
                    "color": color,
                    "latlngs": latlngs,
                    "geometry": {
                        "type": "Polygon",
                        "coordinates": [geojson_coords]
                    }
                })
        else:
            # Fallback directly to the curated Gujarat surveillance zones
            for z in DEFAULT_GUJARAT_ZONES:
                geojson_coords = [[p[1], p[0]] for p in z["latlngs"]]
                formatted_zones.append({
                    "zone_id": z["zone_id"],
                    "id": z["zone_id"],
                    "name": z["name"],
                    "code": z["code"],
                    "description": z.get("description", ""),
                    "department_id": z.get("department_id", 1),
                    "color": z["color"],
                    "latlngs": z["latlngs"],
                    "geometry": {
                        "type": "Polygon",
                        "coordinates": [geojson_coords]
                    }
                })
                
        return {"zones": formatted_zones}
    except Exception as e:
        # Even on DB error, return the default zones so Leaflet overlay never fails
        fallback_zones = []
        for z in DEFAULT_GUJARAT_ZONES:
            geojson_coords = [[p[1], p[0]] for p in z["latlngs"]]
            fallback_zones.append({
                "zone_id": z["zone_id"],
                "id": z["zone_id"],
                "name": z["name"],
                "code": z["code"],
                "department_id": z.get("department_id", 1),
                "color": z["color"],
                "latlngs": z["latlngs"],
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [geojson_coords]
                }
            })
        return {"zones": fallback_zones, "warning": str(e)}
