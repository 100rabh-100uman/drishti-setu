from sqlalchemy import Column, Integer, String, TIMESTAMP
from geoalchemy2 import Geometry
from database import Base

# WHY: Camera table stores metadata about each CCTV camera.
class Camera(Base):
    __tablename__ = "cameras"
    id = Column(Integer, primary_key=True, index=True)
    camera_id = Column(String, unique=True)
    department = Column(String)
    status = Column(String)
    geom = Column(Geometry("POINT", srid=4326))  # GPS location

# WHY: Events table stores detections (like vehicle spotted).
class Event(Base):
    __tablename__ = "events"
    id = Column(Integer, primary_key=True, index=True)
    camera_id = Column(String)
    event_type = Column(String)
    timestamp = Column(TIMESTAMP)
    geom = Column(Geometry("POINT", srid=4326))

