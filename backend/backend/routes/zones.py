from fastapi import APIRouter
from supabase_client import supabase

router = APIRouter(tags=["Zones & Gap Analysis"])

@router.get("/gap_analysis/")
def gap_analysis():
    try:
        data = supabase.rpc("get_camera_coverage_stats").execute()
        return {"gap_analysis": data.data}
    except Exception as e:
        return {"error": str(e), "hint": "Ensure 'get_camera_coverage_stats' RPC function exists in Supabase."}

@router.get("/get_zones/")
def get_zones():
    try:
        data = supabase.table("zones").select("*").execute()
        return {"zones": data.data}
    except Exception as e:
        return {"error": str(e)}
