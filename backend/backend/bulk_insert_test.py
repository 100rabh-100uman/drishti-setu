from supabase import create_client
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# Generate 200 camera records
# Note: Adjusted to use the 'geom' column formatted as WKT (Well-Known Text) 
# since the database schema uses PostGIS 'geom' instead of raw latitude/longitude columns.
cameras = [
    {
        "camera_id": f"CAM{i:03}",
        "department": "Traffic",
        "status": "Active",
        "geom": f"POINT({72.57 + (i * 0.001)} {23.02 + (i * 0.001)})"
    }
    for i in range(1, 201)
]

# Bulk insert into Supabase
try:
    response = supabase.table("cameras").insert(cameras).execute()
    print(f"Successfully inserted {len(response.data)} cameras.")
except Exception as e:
    print(f"Error inserting cameras: {e}")
