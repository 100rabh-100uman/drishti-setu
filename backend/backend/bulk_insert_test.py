from supabase import create_client
import os
import uuid
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("Warning: SUPABASE_URL or SUPABASE_KEY not found in environment. Please check your .env file.")

supabase = create_client(SUPABASE_URL or "https://placeholder.supabase.co", SUPABASE_KEY or "placeholder")

# Generate 200 camera records
# Uses PostGIS 'geom' formatted as WKT (Well-Known Text) with hardware identifiers
cameras = [
    {
        "camera_id": f"CAM{i:03}",
        "department": "Traffic",
        "department_id": 2,
        "camera_type": "IP",
        "status": "Active",
        "geom": f"POINT({72.57 + (i * 0.001)} {23.02 + (i * 0.001)})",
        "mac_address": f"00:1A:2B:{(i//256):02X}:{(i%256):02X}:{i%256:02X}",
        "serial_number": f"SN{i:06}",
        "device_uuid": str(uuid.uuid4()),
        "ip_address": f"192.168.1.{(i % 254) + 1}",
        "zone_id": f"Z{((i % 5) + 1):02}",
        "needs_review": False
    }
    for i in range(1, 201)
]

# Bulk insert into Supabase in chunks of 50 to avoid payload limit errors
if __name__ == "__main__":
    try:
        total_inserted = 0
        for i in range(0, len(cameras), 50):
            chunk = cameras[i:i+50]
            response = supabase.table("cameras").insert(chunk).execute()
            if response.data:
                total_inserted += len(response.data)
        print(f"Successfully inserted {total_inserted} cameras into Supabase.")
    except Exception as e:
        print(f"Error inserting cameras: {e}")
