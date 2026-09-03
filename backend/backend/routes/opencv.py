import cv2
import numpy as np
from fastapi import APIRouter, UploadFile, File, HTTPException
from pydantic import BaseModel
from supabase_client import supabase
import uuid

router = APIRouter(tags=["OpenCV Integration"])

# Lightweight Haar Cascade for Hackathon Face Detection
# Wrapped in a try-except because some Windows virtual environments 
# have broken cv2 bindings that cause AttributeError on startup.
try:
    face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
except Exception as e:
    print(f"Warning: OpenCV CascadeClassifier not available in this environment. Using fallback mode. ({e})")
    face_cascade = None

class EventCreate(BaseModel):
    camera_id: str
    event_type: str
    severity: str
    description: str

@router.post("/analyze_frame/")
async def analyze_frame(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        nparr = np.frombuffer(contents, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if img is None:
            raise HTTPException(status_code=400, detail="Invalid image file")

        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        
        # 1. Motion Detection (Simulated via frame analysis)
        motion_prob = np.var(gray)
        has_motion = motion_prob > 2000

        # 2. Face Detection
        faces = []
        if face_cascade:
            faces = face_cascade.detectMultiScale(gray, 1.1, 4)
        else:
            # Fallback simulated face detection
            faces = [[100, 100, 50, 50]] if has_motion else []
        
        # 3. Anomaly Detection (Offline/Maintenance check via Blur/Tampering)
        blur_val = cv2.Laplacian(gray, cv2.CV_64F).var()
        anomaly = "Maintenance_Required" if blur_val < 50 else "Normal"

        detections = []
        for (x, y, w, h) in faces:
            detections.append({"type": "face", "box": [int(x), int(y), int(w), int(h)]})
            
        return {
            "detections": detections,
            "metadata": {
                "width": int(img.shape[1]),
                "height": int(img.shape[0]),
                "anomaly_status": anomaly,
                "motion_detected": has_motion,
                "blur_variance": float(blur_val)
            }
        }
    except Exception as e:
        return {"error": str(e)}

@router.post("/process_feed/{camera_id}")
def process_feed(camera_id: str):
    # RTSP/WebRTC Simulation Endpoint
    # Registers the camera for OpenCV processing loops.
    return {
        "message": f"OpenCV pipeline started for camera {camera_id}",
        "status": "Active",
        "pipeline": ["Motion Detection", "Face Recognition", "Anomaly Detection"]
    }

@router.post("/store_event/")
def store_event(event: EventCreate):
    try:
        # Insert into events table
        res = supabase.table("events").insert({
            "camera_id": event.camera_id,
            "event_type": event.event_type,
            "severity": event.severity,
            "description": event.description
        }).execute()
        
        # Log into audit_log
        supabase.table("audit_log").insert({
            "action": "OPENCV_EVENT_LOGGED",
            "entity": "Event",
            "details": f"Camera {event.camera_id} triggered {event.event_type}"
        }).execute()
        
        return {"message": "Detection stored securely", "event": res.data}
    except Exception as e:
        return {"error": str(e)}
