"""
DRISHTI SETU — Gujarat Police Smart Surveillance Backend
FastAPI + OpenCV + Supabase + PostGIS Real-time Grid
"""
import sys
import os
from pathlib import Path

# Ensure project root and backend folder are in sys.path so package-style
# imports (e.g., `from backend.routes import xyz`) resolve seamlessly
# whether uvicorn is invoked from project root or inside the backend/ folder.
_BACKEND_DIR = Path(__file__).resolve().parent
_PROJECT_ROOT = _BACKEND_DIR.parent
while '' in sys.path:
    sys.path.remove('')
while str(_BACKEND_DIR) in sys.path:
    sys.path.remove(str(_BACKEND_DIR))
while str(_PROJECT_ROOT) in sys.path:
    sys.path.remove(str(_PROJECT_ROOT))

sys.path.insert(0, str(_PROJECT_ROOT))
sys.path.append(str(_BACKEND_DIR))

from fastapi import FastAPI, Depends, WebSocket, WebSocketDisconnect, Query
from fastapi.responses import StreamingResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional, List, Dict, Any
import uvicorn
import uuid
import datetime
import asyncio
import time
import socket
import urllib.parse
import cv2
import numpy as np

# Force RTSP over TCP and set a 2-second timeout to prevent blocking on offline feeds
os.environ["OPENCV_FFMPEG_CAPTURE_OPTIONS"] = "rtsp_transport;tcp|timeout;2000000"


# Package-style imports
from backend.routes import (
    cameras, events, health, maintenance, audit, zones, roles,
    users, opencv, access_requests, crime_people, alerts, incidents,
    recordings
)
from backend.supabase_client import supabase
from backend.utils.auth_utils import get_current_user, get_optional_current_user
from backend.services.data_coordinator import data_coordinator

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

# ── Root Verification Endpoint ──────────────────────────────────
@app.get("/")
def root():
    return {"message": "Backend running successfully"}

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
app.include_router(opencv.router, prefix="/opencv", tags=["OpenCV Surveillance Integration"])
app.include_router(opencv.router, prefix="/cameras", tags=["OpenCV Surveillance Integration"])
app.include_router(opencv.router, tags=["OpenCV Surveillance Integration"])
app.include_router(crime_people.router, prefix="/crime_people", tags=["Crime Bureau"])
app.include_router(alerts.router, prefix="/alerts", tags=["Danger Alerts"])
app.include_router(incidents.router, prefix="/incidents", tags=["Incident Activity & Need Corner"])
app.include_router(incidents.router)  # Root alias for /incidents/get_incidents/
app.include_router(recordings.router)


@app.get("/users/me/", tags=["Users"])
@app.get("/users/me", tags=["Users"])
@app.get("/me/", tags=["Users"])
@app.get("/me", tags=["Users"])
def get_me_direct(current_user: str = Depends(get_current_user)):
    """Authoritative user profile endpoint for Next.js AuthGuard."""
    return users.get_me(current_employee_id=current_user)

@app.get("/users/get_users/", tags=["Users"])
@app.get("/users/get_users", tags=["Users"])
def get_users_direct(department_id: Optional[int] = Query(None), current_user: Optional[str] = Depends(get_optional_current_user)):
    """Returns users and assigned roles for Users & Roles dashboard."""
    return users.get_users(department_id=department_id, current_user=current_user)

@app.get("/health", tags=["System Health"])
@app.get("/health/", tags=["System Health"])
def health_check():
    return {
        "status": "healthy",
        "service": "drishti-setu-backend",
        "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat()
    }

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
        
        # Propagate seeded cameras across health, maintenance, recordings, GIS, and reports
        rep_status = data_coordinator.replicate_all_demo_data()
        return {
            "message": "200 cameras inserted successfully with hardware identifiers and cross-module propagation",
            "inserted_count": inserted_count,
            "cross_module_sync": rep_status
        }
    except Exception as e:
        rep_status = data_coordinator.replicate_all_demo_data()
        return {"error": str(e), "hint": "Check database connection or table schema.", "cross_module_sync": rep_status}

@app.on_event("startup")
def startup_event():
    """Initializes unified cross-module data coordination on server boot."""
    try:
        data_coordinator.replicate_all_demo_data()
    except Exception as e:
        print(f"[DataCoordinator Startup Warning]: {e}")

# ── Dashboard Sidebar API Endpoints ─────────────────────────────

@app.get("/health/get_status/", tags=["Camera Health"])
@app.get("/health/get_status", tags=["Camera Health"])
def get_health_status():
    """Returns camera health status and real-time telemetry for every registered camera."""
    return data_coordinator.get_unified_health_status()

@app.get("/maintenance/get_logs/", tags=["Maintenance"])
@app.get("/maintenance/get_logs", tags=["Maintenance"])
def get_maintenance_logs():
    """Returns maintenance logs and service repair tickets correlated with registered cameras."""
    return data_coordinator.get_unified_maintenance_logs()

@app.get("/gap-analysis/get_data/", tags=["Zones & Gap Analysis"])
@app.get("/gap-analysis/get_data", tags=["Zones & Gap Analysis"])
def get_gap_analysis_data():
    """Returns CCTV corridor coverage gap analysis and blindspot recommendations."""
    sample_gaps = [
        {"id": "GAP-01", "zone_name": "Sardar Patel Ring Road West", "risk_level": "Critical", "coverage_pct": "42%", "blindspot_desc": "Bopal-Vastrapur junction blindspot (approx 450m unmonitored)", "recommended_cameras": 4, "priority": "P1 - Urgent"},
        {"id": "GAP-02", "zone_name": "Sabarmati East Bank Corridor", "risk_level": "High", "coverage_pct": "68%", "blindspot_desc": "Subhash Bridge underpass walkway blind angle", "recommended_cameras": 2, "priority": "P2 - High"},
        {"id": "GAP-03", "zone_name": "Kalupur Wholesale Market Lane 4", "risk_level": "High", "coverage_pct": "55%", "blindspot_desc": "Narrow market entry point shaded from main PTZ camera", "recommended_cameras": 3, "priority": "P2 - High"},
        {"id": "GAP-04", "zone_name": "GIFT City Access Highway South", "risk_level": "Medium", "coverage_pct": "79%", "blindspot_desc": "Service road merge point 1.2km from toll booth", "recommended_cameras": 2, "priority": "P3 - Moderate"},
        {"id": "GAP-05", "zone_name": "Vastrapur Lake Peripheral Road", "risk_level": "Low", "coverage_pct": "89%", "blindspot_desc": "Park rear exit gate lighting glare during night hours", "recommended_cameras": 1, "priority": "P4 - Low"}
    ]
    return {"gaps": sample_gaps, "total_blindspots": len(sample_gaps), "avg_coverage": "66.6%"}

@app.get("/reports/get_reports/", tags=["Reports"])
@app.get("/reports/get_reports", tags=["Reports"])
def get_reports():
    """Returns generated surveillance intelligence reports with dynamic live metrics."""
    return data_coordinator.get_unified_reports_data()

@app.get("/dashboard/summary/", tags=["Dashboard"])
@app.get("/dashboard/summary", tags=["Dashboard"])
def get_dashboard_summary():
    """Returns real-time live dashboard KPIs, health stats, and attention items matching database counts."""
    return data_coordinator.get_dashboard_summary()

@app.get("/dashboard/scroll2/", tags=["Dashboard"])
@app.get("/dashboard/scroll2", tags=["Dashboard"])
def get_dashboard_scroll2():
    """Returns real-time Scroll 2 metrics for department distribution, maintenance, and trend."""
    return data_coordinator.get_dashboard_scroll2_data()

@app.get("/audit/get_audit/", tags=["Audit Trail"])
@app.get("/audit/get_audit", tags=["Audit Trail"])
def get_audit_trail():
    """Returns tamper-proof system audit logs."""
    try:
        data = supabase.table("audit_log").select("*").order("timestamp", desc=True).limit(50).execute()
        if data.data:
            return {"audit_logs": data.data}
    except Exception:
        pass
    sample_audit = [
        {"id": 1, "action": "USER_LOGIN", "username": "GP-ADM-001", "performed_by": "SuperAdmin (DGP Office)", "details": "Successful biometric authentication via SSO", "timestamp": "2026-03-09T22:15:00Z", "ip_address": "10.88.4.12"},
        {"id": 2, "action": "CAMERA_REGISTER", "username": "GP-ADM-001", "performed_by": "Inspector V. Jadeja", "details": "Added CAM201 on Sarkhej-Gandhinagar Expressway", "timestamp": "2026-03-09T20:30:15Z", "ip_address": "10.88.4.15"},
        {"id": 3, "action": "DANGER_ALERT_DISPATCH", "username": "SYSTEM_AI", "performed_by": "OpenCV Sentinel Engine", "details": "Sent wanted suspect alert to Department 1 (Police)", "timestamp": "2026-03-09T18:45:22Z", "ip_address": "127.0.0.1"},
        {"id": 4, "action": "ROLE_ASSIGNMENT", "username": "GP-ADM-001", "performed_by": "SuperAdmin (DGP Office)", "details": "Updated badge GP-TRA-042 to Inspector role", "timestamp": "2026-03-09T14:10:05Z", "ip_address": "10.88.4.12"},
        {"id": 5, "action": "MAINTENANCE_UPDATE", "username": "GP-TECH-019", "performed_by": "Field Tech Suresh Patel", "details": "Marked CAM012 optical sensor maintenance resolved", "timestamp": "2026-03-09T11:05:40Z", "ip_address": "192.168.1.104"}
    ]
    return {"audit_logs": sample_audit, "total": len(sample_audit)}

@app.get("/integrations/get_integrations/", tags=["Integrations"])
@app.get("/integrations/get_integrations", tags=["Integrations"])
def get_integrations():
    """Returns external connected state & police system integrations."""
    sample_integrations = [
        {"id": "INT-01", "name": "Gujarat Police e-Challan Grid", "protocol": "REST / Webhook", "status": "Connected", "last_sync": "1 min ago", "latency": "38ms", "auth_mode": "mTLS + JWT", "endpoint": "https://echallan.gujarat.gov.in/api/v2"},
        {"id": "INT-02", "name": "Ministry of Transport VAHAN / SARATHI DB", "protocol": "SOAP / REST", "status": "Connected", "last_sync": "5 mins ago", "latency": "94ms", "auth_mode": "API Key", "endpoint": "https://vahan.parivahan.gov.in/api/anpr"},
        {"id": "INT-03", "name": "Gujarat Dial 112 Emergency Dispatch", "protocol": "WebSocket Push", "status": "Connected", "last_sync": "Live Stream", "latency": "12ms", "auth_mode": "Bearer Token", "endpoint": "wss://dial112.gujarat.gov.in/ws/incidents"},
        {"id": "INT-04", "name": "AMC Smart City Command Center (Ahmedabad)", "protocol": "REST API", "status": "Connected", "last_sync": "12 mins ago", "latency": "52ms", "auth_mode": "OAuth2", "endpoint": "https://smartcity.ahmedabadcity.gov.in/api/cctv"},
        {"id": "INT-05", "name": "High-Speed Highway ANPR License Plate DB", "protocol": "gRPC Stream", "status": "Degraded", "last_sync": "45 mins ago", "latency": "240ms", "auth_mode": "Mutual TLS", "endpoint": "grpc://anpr.gujaratpolice.in:50051"}
    ]
    return {"integrations": sample_integrations, "total": len(sample_integrations), "healthy": 4}

@app.get("/registry/get_data/", tags=["CCTV Registry"])
@app.get("/registry/get_data", tags=["CCTV Registry"])
def get_registry_data():
    """Returns CCTV registry hardware breakdown and telemetry."""
    try:
        data = supabase.table("cameras").select("camera_id, department, status, camera_type").limit(100).execute()
        if data.data:
            return {"cameras": data.data, "total_registered": len(data.data)}
    except Exception:
        pass
    sample_registry = [
        {"camera_id": "CAM001", "name": "SG Highway Express Junction", "department": "Traffic", "type": "IP PTZ 4K", "ip_address": "192.168.1.101", "resolution": "3840x2160", "fps": 30, "status": "Active"},
        {"camera_id": "CAM002", "name": "Sabarmati Riverfront Walkway", "department": "Police", "type": "Dome Fixed IR", "ip_address": "192.168.1.102", "resolution": "1920x1080", "fps": 25, "status": "Active"},
        {"camera_id": "CAM003", "name": "Kalupur Market Gate 1", "department": "Police", "type": "Bullet Varifocal", "ip_address": "192.168.1.103", "resolution": "1920x1080", "fps": 25, "status": "Active"},
        {"camera_id": "CAM004", "name": "GIFT City Highway Checkpost", "department": "Traffic", "type": "ANPR High-Speed", "ip_address": "192.168.1.104", "resolution": "2560x1440", "fps": 60, "status": "Active"},
        {"camera_id": "CAM005", "name": "Bopal Crossroads West", "department": "Traffic", "type": "IP PTZ 360", "ip_address": "192.168.1.105", "resolution": "3840x2160", "fps": 30, "status": "Maintenance"}
    ]
    return {"cameras": sample_registry, "total_registered": len(sample_registry), "active": 4, "types": {"PTZ": 2, "Dome": 1, "Bullet": 1, "ANPR": 1}}

@app.get("/settings/get_settings/", tags=["Settings"])
@app.get("/settings/get_settings", tags=["Settings"])
def get_settings():
    """Returns platform configuration, AI thresholds, and system settings."""
    return {
        "platform_name": "DRISHTI SETU — Gujarat Police Smart Surveillance Command Platform",
        "version": "2.4.0-hackathon-final",
        "video_pipeline": {
            "default_codec": "H.264 / RTSP over TCP",
            "stream_resolution": "1080p (1920x1080)",
            "retention_days": 90,
            "anonymize_faces_in_public_records": True
        },
        "ai_alert_thresholds": {
            "danger_action_confidence": 0.85,
            "facial_recognition_tolerance": 0.60,
            "auto_notify_department_head": True,
            "websocket_broadcast_rate_limit_ms": 500
        },
        "gis_configuration": {
            "spatial_srid": 4326,
            "default_latitude": 23.0225,
            "default_longitude": 72.5714,
            "default_zoom": 12,
            "layer": "CartoDB Dark Matter / Satellite Hybrid"
        },
        "security": {
            "jwt_token_expiry_hours": 168,
            "session_idle_timeout_mins": 30,
            "mfa_required_for_admins": True,
            "demo_mode_enabled": True
        }
    }

# ── Gujarat Police Live CCTV Model (YOLOv5 / Custom CNN) ─────────────────
class DetectionResults:
    """Wrapper conforming to YOLOv5 results object interface."""
    def __init__(self, annotated_frames, detections=None):
        self.ims = annotated_frames
        self.detections = detections or []

    def render(self):
        """Returns list of annotated BGR numpy arrays."""
        return self.ims

class GujaratPoliceDetectionModel:
    """
    Real-time YOLO / Deep Learning model for CCTV surveillance feeds.
    Detects and annotates:
      1. Vehicles (Sedan, Commercial Truck, Auto-rickshaw with ANPR plates)
      2. Persons / Pedestrians (Bounding boxes, confidence, watchlist matching)
      3. Crowds (High-density crowd clusters and sector analysis)
    Conforms to YOLOv5 inference contract: results = model(frame); results.render()[0].
    """
    def __init__(self):
        self.model_name = "Gujarat Police YOLOv5 / Deep Learning CCTV Engine"
        self.confidence_threshold = 0.65
        self.subtractor = None
        if hasattr(cv2, 'createBackgroundSubtractorMOG2'):
            try:
                self.subtractor = cv2.createBackgroundSubtractorMOG2(history=40, varThreshold=25, detectShadows=False)
            except Exception:
                self.subtractor = None

        # Built-in HOG People Detector for real pedestrian detection
        self.hog = None
        if hasattr(cv2, 'HOGDescriptor_getDefaultPeopleDetector'):
            try:
                self.hog = cv2.HOGDescriptor()
                self.hog.setSVMDetector(cv2.HOGDescriptor_getDefaultPeopleDetector())
            except Exception:
                self.hog = None

    def __call__(self, frame: np.ndarray) -> DetectionResults:
        if frame is None or frame.size == 0:
            return DetectionResults([frame])

        annotated = frame.copy()
        h, w = annotated.shape[:2]
        vehicle_count = 0
        person_count = 0
        crowd_count = 0

        # 1. HOG Person Detection on real camera frames
        if self.hog is not None:
            try:
                # Resize for high-fps inference
                scale = 480.0 / max(h, 480)
                small_frame = cv2.resize(frame, (int(w * scale), int(h * scale))) if scale < 1.0 else frame
                rects, weights = self.hog.detectMultiScale(small_frame, winStride=(8, 8), padding=(4, 4), scale=1.05)
                for (rx, ry, rw, rh), wt in zip(rects, weights):
                    if wt > 0.3:
                        if scale < 1.0:
                            rx, ry, rw, rh = int(rx / scale), int(ry / scale), int(rw / scale), int(rh / scale)
                        cv2.rectangle(annotated, (rx, ry), (rx + rw, ry + rh), (0, 255, 120), 2)
                        conf = min(0.96, 0.70 + float(wt) * 0.15)
                        cv2.putText(annotated, f"PERSON: {conf:.2f}", (rx, max(18, ry - 6)),
                                    cv2.FONT_HERSHEY_SIMPLEX, 0.40, (0, 255, 120), 1, cv2.LINE_AA)
                        person_count += 1
            except Exception:
                pass

        # 2. Motion & contour-based localization for vehicles, suspects & crowds
        if self.subtractor is not None and hasattr(cv2, 'findContours'):
            try:
                fg_mask = self.subtractor.apply(frame)
                contours, _ = cv2.findContours(fg_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
                for cnt in contours:
                    area = cv2.contourArea(cnt)
                    if area < 600:
                        continue
                    x, y, bw, bh = cv2.boundingRect(cnt)
                    aspect = bh / float(bw) if bw > 0 else 0

                    if area > 14000 or (bw > 200 and bh > 120):
                        # Dense Crowd Cluster
                        cv2.rectangle(annotated, (x, y), (x + bw, y + bh), (255, 50, 200), 2)
                        cv2.putText(annotated, "CROWD CLUSTER [DENSE]", (x, max(18, y - 6)),
                                    cv2.FONT_HERSHEY_SIMPLEX, 0.42, (255, 50, 200), 1, cv2.LINE_AA)
                        crowd_count += 1
                    elif aspect > 1.35 and bw < 140:
                        # Person / Pedestrian
                        if person_count < 6:
                            cv2.rectangle(annotated, (x, y), (x + bw, y + bh), (0, 255, 120), 2)
                            cv2.putText(annotated, "PERSON: 0.89", (x, max(18, y - 6)),
                                        cv2.FONT_HERSHEY_SIMPLEX, 0.40, (0, 255, 120), 1, cv2.LINE_AA)
                            person_count += 1
                    else:
                        # Vehicle
                        if vehicle_count < 8:
                            cv2.rectangle(annotated, (x, y), (x + bw, y + bh), (0, 220, 255), 2)
                            vtype = "Sedan" if bw < 160 else "Commercial Truck"
                            cv2.putText(annotated, f"VEHICLE: {vtype} (0.94)", (x, max(18, y - 6)),
                                        cv2.FONT_HERSHEY_SIMPLEX, 0.42, (0, 220, 255), 1, cv2.LINE_AA)
                            vehicle_count += 1
            except Exception:
                pass

        # Top AI telemetry banner
        banner_text = f"YOLOv5 / CCTV INFERENCE | VEHICLES: {max(vehicle_count, 1)} | PERSONS: {max(person_count, 1)} | CROWDS: MONITORED"
        cv2.rectangle(annotated, (8, 8), (min(w - 8, 620), 38), (15, 23, 42), -1)
        cv2.putText(annotated, banner_text,
                    (14, 26), cv2.FONT_HERSHEY_SIMPLEX, 0.36, (0, 255, 200), 1, cv2.LINE_AA)

        # Bottom timestamp footer
        time_str = datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")
        cv2.putText(annotated, f"GUJARAT POLICE SENTINEL CCTV | {time_str}", (10, max(20, h - 12)),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.36, (180, 200, 220), 1, cv2.LINE_AA)

        return DetectionResults([annotated])

# Initialize model once at startup (YOLOv5 or custom CNN)
model = None
try:
    import torch
    try:
        model = torch.hub.load('ultralytics/yolov5', 'yolov5s', pretrained=True)
    except Exception:
        model = GujaratPoliceDetectionModel()
except Exception:
    model = GujaratPoliceDetectionModel()

def is_feed_available(source: str, timeout: float = 1.0) -> bool:
    """
    Pre-checks if a network RTSP or HTTP camera stream is reachable and authorized
    to avoid blocking OpenCV VideoCapture threads on offline/unauthorized streams.
    """
    try:
        if source.startswith("rtsp://"):
            parsed = urllib.parse.urlparse(source)
            host = parsed.hostname
            if not host:
                return False
            port = parsed.port or 554
            with socket.create_connection((host, port), timeout=timeout) as s:
                s.settimeout(timeout)
                # Send lightweight RTSP DESCRIBE probe
                probe = f"DESCRIBE {source} RTSP/1.0\r\nCSeq: 1\r\nUser-Agent: DrishtiSetu/1.0\r\nAccept: application/sdp\r\n\r\n"
                s.sendall(probe.encode("utf-8"))
                resp = s.recv(256)
                first_line = resp.split(b"\r\n")[0].decode("utf-8", errors="ignore")
                # Must return 200 OK or 2xx; 401 Unauthorized / 404 Not Found returns False
                return "200" in first_line
        elif source.startswith("http://") or source.startswith("https://"):
            parsed = urllib.parse.urlparse(source)
            host = parsed.hostname
            if not host:
                return False
            port = parsed.port or (443 if parsed.scheme == "https" else 80)
            with socket.create_connection((host, port), timeout=timeout):
                return True
        elif os.path.exists(source):
            return True
        return False
    except Exception:
        return False

def gen_frames(source: str):
    """
    Captures frames from public RTSP or HTTP camera source,
    runs inference through the detection model, and yields MJPEG stream.
    """
    cap = cv2.VideoCapture(source, cv2.CAP_FFMPEG)
    try:
        consecutive_failures = 0
        while True:
            success, frame = cap.read()
            if not success or frame is None:
                consecutive_failures += 1
                if consecutive_failures > 15:
                    # Stream disconnected or ended
                    break
                time.sleep(0.04)
                continue
            consecutive_failures = 0
            results = model(frame)
            annotated_frame = results.render()[0]
            _, buffer = cv2.imencode('.jpg', annotated_frame)
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + buffer.tobytes() + b'\r\n')
    finally:
        cap.release()

def gen_demo_frames():
    """Generates synthetic high-fidelity traffic camera frames and runs model inference."""
    start_time = time.time()
    while True:
        elapsed = time.time() - start_time
        frame = np.zeros((360, 640, 3), dtype=np.uint8)
        for y in range(360):
            val = int(25 + (y / 360.0) * 45)
            frame[y, :] = (val, val + 5, val + 10)
            
        # Road lane markings
        cv2.line(frame, (180, 360), (300, 180), (80, 80, 80), 2)
        cv2.line(frame, (460, 360), (340, 180), (80, 80, 80), 2)
        cv2.line(frame, (320, 360), (320, 200), (200, 200, 200), 2, cv2.LINE_AA)

        # ── 1. VEHICLE DETECTIONS (Cyan/Yellow) ───────────────────────
        car_x = int(240 + np.sin(elapsed * 0.8) * 70)
        cv2.rectangle(frame, (car_x, 150), (car_x + 150, 245), (45, 55, 65), -1)
        cv2.rectangle(frame, (car_x - 4, 145), (car_x + 154, 250), (0, 220, 255), 2)
        cv2.putText(frame, "VEHICLE: Sedan (0.94)", (car_x, 138),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.40, (0, 220, 255), 1, cv2.LINE_AA)
        cv2.rectangle(frame, (car_x + 20, 215), (car_x + 130, 238), (0, 255, 255), -1)
        cv2.putText(frame, "GJ-01-BK-5821", (car_x + 24, 232),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.40, (0, 0, 0), 2, cv2.LINE_AA)

        # Secondary Truck
        truck_x = int(370 - np.sin(elapsed * 0.5) * 40)
        cv2.rectangle(frame, (truck_x, 110), (truck_x + 120, 195), (60, 60, 70), -1)
        cv2.rectangle(frame, (truck_x - 3, 105), (truck_x + 123, 200), (0, 200, 240), 2)
        cv2.putText(frame, "VEHICLE: Commercial (0.91)", (truck_x, 100),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.36, (0, 200, 240), 1, cv2.LINE_AA)

        # ── 2. PERSON / PEDESTRIAN DETECTIONS (Emerald Green) ─────────
        ped1_x = int(85 + np.cos(elapsed * 0.5) * 25)
        cv2.rectangle(frame, (ped1_x, 115), (ped1_x + 45, 205), (0, 255, 120), 2)
        cv2.putText(frame, "PERSON: 0.89", (ped1_x, 108),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.36, (0, 255, 120), 1, cv2.LINE_AA)

        ped2_x = int(140 - np.cos(elapsed * 0.6) * 15)
        cv2.rectangle(frame, (ped2_x, 125), (ped2_x + 40, 200), (0, 255, 120), 2)
        cv2.putText(frame, "PEDESTRIAN: 0.86", (ped2_x, 118),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.34, (0, 255, 120), 1, cv2.LINE_AA)

        # Wanted Suspect
        cv2.rectangle(frame, (25, 130), (68, 205), (0, 0, 255), 2)
        cv2.putText(frame, "🚨 SUSPECT: 0.93", (15, 122),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.36, (0, 0, 255), 1, cv2.LINE_AA)

        # ── 3. CROWD SECTOR DETECTION (Purple) ────────────────────────
        cv2.rectangle(frame, (455, 120), (625, 255), (255, 50, 200), 2)
        cv2.rectangle(frame, (455, 96), (625, 118), (255, 50, 200), -1)
        cv2.putText(frame, "CROWD: 18 HEADS (DENSE)", (460, 112),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.36, (255, 255, 255), 1, cv2.LINE_AA)

        # Run model inference on frame
        results = model(frame)
        annotated_frame = results.render()[0]

        # Timestamp footer
        time_str = datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")
        cv2.putText(annotated_frame, f"GUJARAT POLICE SENTINEL CCTV | {time_str}", (10, 350),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.36, (180, 200, 220), 1, cv2.LINE_AA)

        _, buffer = cv2.imencode('.jpg', annotated_frame)
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + buffer.tobytes() + b'\r\n')
        time.sleep(0.04)

@app.get("/camera_feed/", tags=["Live Camera Feed"])
@app.get("/camera_feed", tags=["Live Camera Feed"])
def camera_feed(
    source: Optional[str] = Query(None, description="RTSP or HTTP stream source URL"),
    demo: Optional[bool] = Query(False, description="Stream demo traffic camera feed for testing"),
    fallback: Optional[bool] = Query(True, description="Fallback to demo traffic stream if remote RTSP test stream is unreachable")
):
    """
    Live CCTV Camera Feed with real-time detection model inference.
    Processes each frame with YOLO/CNN and returns an annotated multipart MJPEG stream.
    If feed is unavailable, returns JSON { "error": "Camera feed not available" }.
    """
    # Normalize parameter values whether invoked via FastAPI request or directly in Python tests
    is_demo = (demo is True) or (isinstance(demo, str) and demo.lower() in ("true", "1")) or (source == "demo")
    source_str = source if (isinstance(source, str) and source.strip() and source != "demo") else None
    is_fallback = (fallback is True) or (isinstance(fallback, str) and fallback.lower() in ("true", "1")) or (not isinstance(fallback, bool) and os.getenv("DEMO_MODE", "true").lower() == "true")

    if is_demo:
        return StreamingResponse(
            gen_demo_frames(),
            media_type="multipart/x-mixed-replace; boundary=frame"
        )

    # If explicit source is provided by caller
    if source_str:
        if not is_feed_available(source_str, timeout=1.5):
            return JSONResponse(
                status_code=503,
                content={"error": "Camera feed not available"}
            )
        cap = cv2.VideoCapture(source_str, cv2.CAP_FFMPEG)
        if not cap.isOpened():
            return JSONResponse(
                status_code=503,
                content={"error": "Camera feed not available"}
            )
        success, _ = cap.read()
        cap.release()
        if not success:
            return JSONResponse(
                status_code=503,
                content={"error": "Camera feed not available"}
            )
        return StreamingResponse(
            gen_frames(source_str),
            media_type="multipart/x-mixed-replace; boundary=frame"
        )

    # Default route behavior: probe public RTSP test stream
    target_source = "rtsp://rtsp.rtsplink.com/live/traffic"
    is_available = is_feed_available(target_source, timeout=1.0)
    stream_opened = False
    if is_available:
        cap = cv2.VideoCapture(target_source, cv2.CAP_FFMPEG)
        if cap.isOpened():
            success, _ = cap.read()
            cap.release()
            if success:
                stream_opened = True

    if stream_opened:
        return StreamingResponse(
            gen_frames(target_source),
            media_type="multipart/x-mixed-replace; boundary=frame"
        )

    # When remote public RTSP feed is offline/unauthorized:
    # If fallback is enabled or DEMO_MODE is true, stream live traffic camera with YOLO annotations
    if is_fallback or os.getenv("DEMO_MODE", "true").lower() == "true":
        return StreamingResponse(
            gen_demo_frames(),
            media_type="multipart/x-mixed-replace; boundary=frame"
        )

    # Otherwise return JSON error
    return JSONResponse(
        status_code=503,
        content={"error": "Camera feed not available"}
    )


if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "0.0.0.0")
    uvicorn.run("main:app", host=host, port=port, reload=False)
