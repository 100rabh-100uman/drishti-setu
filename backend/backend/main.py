from fastapi import FastAPI
import uvicorn
import uuid
import random
from routes import users, cameras, events, health, maintenance, audit, zones, opencv, access_requests
from supabase_client import supabase

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Gujarat Police Hackathon API", description="Extended Backend API")

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "*"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/departments/", tags=["Departments"])
def get_departments():
    try:
        data = supabase.table("departments").select("*").execute()
        return {"departments": data.data}
    except Exception as e:
        return {"error": str(e)}

# Mount Routers precisely as requested
app.include_router(users.app, prefix="/users", tags=["Users"])
app.include_router(cameras.app, prefix="/cameras", tags=["Cameras"])
app.include_router(access_requests.router, prefix="/access-requests", tags=["Access Requests"])

# Keep the remaining modular endpoints
app.include_router(events.router)
app.include_router(health.router)
app.include_router(maintenance.router)
app.include_router(audit.router)
app.include_router(zones.router)
app.include_router(opencv.router, prefix="/cameras")

@app.get("/")
def root():
    return {"message": "Welcome to Gujarat Police Hackathon API (Extended)"}

@app.post("/seed_200_cameras/", tags=["Seed Data"])
def seed_200_cameras():
    streets = ["MG Road", "SG Highway", "CG Road", "Ring Road", "Ashram Road", "Relief Road"]
    areas = ["Navrangpura", "Vastrapur", "Maninagar", "Bopal", "Thaltej", "Gota"]
    camera_types = ["IP-based", "Analog-based"]
    statuses = ["Active", "Offline", "Maintenance"]

    cameras_data = []
    for i in range(1, 201):
        cam_status = random.choice(statuses)
        cameras_data.append({
            "camera_id": f"CAM{i:03}",
            "department_id": random.randint(1, 26),
            "camera_type": random.choice(camera_types),
            "status": cam_status,
            "geom": f"POINT({72.57 + (random.uniform(-0.05, 0.05))} {23.02 + (random.uniform(-0.05, 0.05))})",
            "mac_address": f"00:1A:2B:{(i//256):02X}:{(i%256):02X}:{random.randint(0,255):02X}",
            "serial_number": f"SN{i:06}",
            "device_uuid": str(uuid.uuid4()),
            "ip_address": f"192.168.1.{random.randint(1, 254)}",
            "address": f"{random.randint(1, 999)}, {random.choice(streets)}, {random.choice(areas)}, Ahmedabad",
            "zone_id": f"Z{random.randint(1, 5):02}",
            "needs_review": cam_status in ["Offline", "Maintenance"]
        })
    
    try:
        inserted_count = 0
        for i in range(0, 200, 50):
            chunk = cameras_data[i:i+50]
            response = supabase.table("cameras").insert(chunk).execute()
            inserted_count += len(response.data)
            
        return {"message": "200 extended cameras inserted successfully", "inserted_count": inserted_count}
    except Exception as e:
        return {"error": str(e), "hint": "Check foreign keys (zones Z01-Z05, departments 1-26)."}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

@app.get('/departments/get_departments/', tags=['Departments'])
def get_departments_alias():
    return get_departments()

