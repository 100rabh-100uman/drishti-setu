from sqlalchemy import Column, Integer, String, TIMESTAMP, Boolean, Text
from geoalchemy2 import Geometry
from database import Base

# WHY: Camera table stores metadata about each CCTV camera.
class Camera(Base):
    __tablename__ = "cameras"
    id = Column(Integer, primary_key=True, index=True)
    camera_id = Column(String, unique=True, index=True)
    department = Column(String, nullable=True)
    department_id = Column(Integer, nullable=True)
    camera_type = Column(String, default="IP")
    status = Column(String, default="Active")
    geom = Column(Geometry("POINT", srid=4326))  # GPS location PostGIS Point
    mac_address = Column(String, nullable=True)
    serial_number = Column(String, nullable=True)
    device_uuid = Column(String, nullable=True)
    ip_address = Column(String, nullable=True)
    address = Column(String, nullable=True)
    zone_id = Column(String, nullable=True)
    needs_review = Column(Boolean, default=False)

# WHY: Events table stores detections (like vehicle spotted, anomaly, motion).
class Event(Base):
    __tablename__ = "events"
    id = Column(Integer, primary_key=True, index=True)
    camera_id = Column(String, index=True)
    event_type = Column(String)
    timestamp = Column(TIMESTAMP)
    geom = Column(Geometry("POINT", srid=4326), nullable=True)
    severity = Column(String, default="Low")
    description = Column(Text, nullable=True)

# WHY: Zone table stores surveillance corridors and PostGIS polygon boundaries.
class Zone(Base):
    __tablename__ = "zones"
    id = Column(Integer, primary_key=True, index=True)
    zone_id = Column(String, unique=True, index=True)
    name = Column(String)
    code = Column(String, nullable=True)
    department_id = Column(Integer, nullable=True)
    color = Column(String, default="#3B82F6")
    geom = Column(Geometry("POLYGON", srid=4326), nullable=True)

# WHY: Departments table stores administrative jurisdictions.
class Department(Base):
    __tablename__ = "departments"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True)
    code = Column(String, nullable=True)

# WHY: Roles table stores RBAC assignments for Gujarat Police officers.
class Role(Base):
    __tablename__ = "roles"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True)
    role = Column(String, default="OPERATOR")

# WHY: Audit table stores tamper-proof action logs.
class AuditLog(Base):
    __tablename__ = "audit_log"
    id = Column(Integer, primary_key=True, index=True)
    action = Column(String)
    performed_by = Column(String)
    camera_id = Column(String, nullable=True, index=True)
    details = Column(Text, nullable=True)
    timestamp = Column(TIMESTAMP)
