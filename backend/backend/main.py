from fastapi import FastAPI, Depends, WebSocket, WebSocketDisconnect, Query
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional, List, Dict, Any
import uvicorn
import uuid
import datetime
import asyncio
from routes import cameras, events, health, maintenance, audit, zones, roles, users, opencv, access_requests, crime_people, alerts
from supabase_client import supabase
from utils.auth_utils import get_current_user, get_optional_current_user

app = FastAPI(
    title="Gujarat Police Hackathon API",
    description="Extended Backend API with PostGIS, Danger Actions, & Real-Time Alert WebSockets"
)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── WebSocket Real-Time Connection Manager ─────────────────────
class AlertConnectionManager:
    def __init__(self):
        self.active_connections: List[Dict[str, Any]] = []

    async def connect(self, websocket: WebSocket, department_id: Optional[int] = None, role: Optional[str] = None):
        await websocket.accept()
        self.active_connections.append({
            "ws": websocket,
            "department_id": department_id,
            "role": role or "Admin"
        })

    def disconnect(self, websocket: WebSocket):
        self.active_connections = [c for c in self.active_connections if c["ws"] != websocket]

    async def broadcast_json(self, data: Dict[str, Any]):
        dead_connections = []
        for conn in list(self.active_connections):
            ws = conn["ws"]
            dept = conn["department_id"]
            role = conn["role"]
            
            # Role-based filtering:
            # - Admins/Heads see ALL alerts across Gujarat
            # - Department officers see only alerts belonging to their department
            alert_dept = data.get("alert", {}).get("department_id")
            if role not in ["Admin", "Head", "SuperAdmin"] and dept and alert_dept and dept != alert_dept:
                continue

            try:
                await ws.send_json(data)
            except Exception:
                dead_connections.append(ws)

        for dead in dead_connections:
            self.disconnect(dead)

manager = AlertConnectionManager()

def sync_ws_broadcast(data: Dict[str, Any]):
    """Bridges synchronous route handlers with the async WebSocket broadcast loop."""
    try:
        loop = asyncio.get_event_loop()
        if loop.is_running():
            asyncio.create_task(manager.broadcast_json(data))
        else:
            loop.run_until_complete(manager.broadcast_json(data))
    except Exception:
        pass

# Wire alert broadcaster to alerts router
alerts.register_ws_broadcaster(sync_ws_broadcast)

DEFAULT_DEPARTMENTS = [
    {"id": 1, "name": "Gujarat Police Department", "code": "POL"},
    {"id": 2, "name": "Gujarat Traffic Branch", "code": "TRA"},
    {"id": 3, "name": "Disaster Management Authority (GSDMA)", "code": "DMA"},
    {"id": 4, "name": "Ahmedabad Municipal Corporation (AMC)", "code": "AMC"},
    {"id": 5, "name": "Gandhinagar Municipal Corporation (GMC)", "code": "GMC"},
    {"id": 6, "name": "Transport & Highways Department", "code": "TRN"},
    {"id": 7, "name": "Forest & Wildlife Surveillance", "code": "FOR"},
    {"id": 8, "name": "Public Works Department (PWD)", "code": "PWD"}
]

@app.get("/departments/", tags=["Departments"])
@app.get("/departments", tags=["Departments"])
def get_departments():
    try:
        data = supabase.table("departments").select("*").execute()
        if data.data:
            return {"departments": data.data}
    except Exception as e:
        return {"departments": DEFAULT_DEPARTMENTS, "warning": str(e)}
    return {"departments": DEFAULT_DEPARTMENTS}

@app.get('/departments/get_departments/', tags=['Departments'])
@app.get('/departments/get_departments', tags=['Departments'])
def get_departments_alias(current_user: Optional[str] = Depends(get_optional_current_user)):
    """Returns predefined departments for dropdowns."""
    return get_departments()

@app.get('/zones/get_zones/', tags=['Zones & Gap Analysis'])
@app.get('/zones/get_zones', tags=['Zones & Gap Analysis'])
@app.get('/get_zones/', tags=['Zones & Gap Analysis'])
@app.get('/get_zones', tags=['Zones & Gap Analysis'])
def get_zones_direct(current_user: Optional[str] = Depends(get_optional_current_user)):
    """Returns polygon geometries and surveillance zone details."""
    return zones.get_zones(current_user=current_user)

# ── WebSocket Endpoints ─────────────────────────────────────────
@app.websocket("/ws/alerts")
@app.websocket("/ws")
async def websocket_alerts_endpoint(
    websocket: WebSocket,
    department_id: Optional[int] = Query(None),
    role: Optional[str] = Query(None)
):
    """
    Real-time push WebSocket for danger actions.
    Pushes instant alerts when OpenCV matches a wanted suspect.
    """
    await manager.connect(websocket, department_id=department_id, role=role)
    try:
        await websocket.send_json({
            "type": "CONNECTION_ESTABLISHED",
            "message": "Connected to Gujarat Police Real-time Danger Alert Grid",
            "department_id": department_id,
            "role": role or "Admin",
            "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat()
        })
        while True:
            data = await websocket.receive_text()
            if "ping" in data.lower():
                await websocket.send_json({
                    "type": "PONG",
                    "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat()
                })
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception:
        manager.disconnect(websocket)

# Include all modular routers
app.include_router(cameras.router, prefix="/cameras", tags=["Cameras"])
app.include_router(cameras.router)  # Direct root mounts for /get_cameras/, /cameras/{id}
app.include_router(events.router)
app.include_router(health.router)
app.include_router(maintenance.router)
app.include_router(audit.router)
app.include_router(zones.router, prefix="/zones", tags=["Zones & Gap Analysis"])
app.include_router(zones.router)  # Direct root alias /get_zones/
app.include_router(roles.router, prefix="/roles", tags=["Roles & Permissions"])
app.include_router(users.app, prefix="/users", tags=["Users"])
app.include_router(users.app) # Direct root alias /login/, /me/
app.include_router(access_requests.router, prefix="/access-requests", tags=["Access Requests"])
app.include_router(opencv.router, prefix="/cameras", tags=["OpenCV Surveillance Integration"])
app.include_router(opencv.router, tags=["OpenCV Surveillance Integration"])
app.include_router(crime_people.router, prefix="/crime_people", tags=["Crime Bureau"])
app.include_router(alerts.router, prefix="/alerts", tags=["Danger Alerts"])

@app.get("/users/me/", tags=["Users"])
@app.get("/users/me", tags=["Users"])
@app.get("/me/", tags=["Users"])
@app.get("/me", tags=["Users"])
def get_me_direct(current_user: str = Depends(get_current_user)):
    """Authoritative user profile endpoint for Next.js AuthGuard."""
    return users.get_me(current_employee_id=current_user)

@app.get("/")
def root():
    return {"message": "Welcome to Gujarat Police Hackathon API (Extended)"}

# Added to generate 200 cameras directly from Swagger UI with hardware identifiers & PostGIS
@app.post("/seed_200_cameras/", tags=["Seed Data"])
@app.post("/seed_200_cameras", tags=["Seed Data"])
def seed_200_cameras():
    cameras_data = [
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
            "address": f"Traffic Surveillance Junction {i}, SG Highway corridor, Ahmedabad",
            "zone_id": f"Z{((i % 5) + 1):02}",
            "needs_review": False
        }
        for i in range(1, 201)
    ]
    
    try:
        inserted_count = 0
        for i in range(0, len(cameras_data), 50):
            chunk = cameras_data[i:i+50]
            response = supabase.table("cameras").insert(chunk).execute()
            if response.data:
                inserted_count += len(response.data)
        return {
            "message": "200 cameras inserted successfully with hardware identifiers",
            "inserted_count": inserted_count
        }
    except Exception as e:
        return {"error": str(e), "hint": "Check database connection or table schema."}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
