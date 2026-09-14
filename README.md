# 🛡️ DRISHTI SETU — Gujarat Police Smart CCTV Command Platform

<div align="center">

[![Next.js 16](https://img.shields.io/badge/Next.js-16.3-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19.2-blue?style=for-the-badge&logo=react&logoColor=white)](https://react.dev/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.141-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Python 3.12](https://img.shields.io/badge/Python-3.12-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org/)
[![PostgreSQL PostGIS](https://img.shields.io/badge/PostGIS-PostgreSQL-336791?style=for-the-badge&logo=postgresql&logoColor=white)](https://postgis.net/)
[![OpenCV](https://img.shields.io/badge/OpenCV-AI%20Vision-5C3EE8?style=for-the-badge&logo=opencv&logoColor=white)](https://opencv.org/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Vercel Deployed](https://img.shields.io/badge/Vercel-Live%20Production-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://drishti-setu.vercel.app/)

<br />

### **Building a Safer Gujarat with INTELLIGENCE • INTEGRATION • IMPACT**

*A unified, multi-department command & control platform integrating CCTV infrastructure, PostGIS geospatial intelligence, automated criminal watchlist interception, and AI-driven predictive surveillance.*

**Built for the Gujarat Police Hackathon 2026** in strict alignment with the official **[Gujarat Sentinel Guidelines](https://sentinel.gujarat.gov.in/resource)**.

---

### 🌐 [Live Production Platform](https://drishti-setu.vercel.app/) • 📂 [GitHub Repository](https://github.com/100rabh-100uman/drishti-setu) • 📖 [Deployment Manual](DEPLOYMENT.md)

</div>

---

## ⚡ Hackathon Evaluator Quick-Start (1-Click Evaluation)

The platform is live and production-deployed with pre-configured demo sessions and built-in failover:

| Resource | Link / Access |
| :--- | :--- |
| **Live Web Application** | **[https://drishti-setu.vercel.app/](https://drishti-setu.vercel.app/)** |
| **Admin Command Profile** | **Employee ID:** `EMP001` &nbsp;•&nbsp; **Password:** `admin123` *(or click **👑 Admin** card)* |
| **Inspector Ops Profile** | **Employee ID:** `EMP002` &nbsp;•&nbsp; **Password:** `admin123` *(or click **👮 Inspector** card)* |
| **Interactive Demo Helper** | On the login screen, clicking either demo card auto-populates credentials and authenticates with 1-click. |
| **Zero-Lag Failover** | Includes client-side resilience that prevents cloud cold-start latency from interrupting live evaluations. |

---

## 📌 Executive Summary & Problem Statement

Across municipal corporations, transit hubs, and law enforcement jurisdictions, modern state surveillance suffers from severe structural bottlenecks:

1. **Departmental Silos**: Gujarat Police, Traffic Branch, Ahmedabad Municipal Corporation (AMC), GSDMA, and Transport Department operate isolated CCTV networks with zero cross-visibility.
2. **Lack of Unified Spatial Context**: Cameras are documented in flat spreadsheets without GIS geospatial polygons, blind spot analytics, or real-time clustering.
3. **Manual Threat Interception**: Operators must visually scan hundreds of monitors to spot wanted criminal suspects or stolen vehicles, resulting in low detection rates.
4. **Unstandardized Onboarding & Retention**: Inconsistent camera resolutions, unverified RTSP stream codecs, and arbitrary retention periods create compliance vulnerabilities.

### 💡 The DRISHTI SETU Solution
**DRISHTI SETU** (*Drishti* = Vision, *Setu* = Bridge) acts as the operational bridge between Gujarat's municipal surveillance infrastructure and law enforcement command centers. It unifies **508+ camera feeds**, provides **PostGIS geospatial clustering**, performs **real-time AI threat interception**, and standardizes **CCTV onboarding with verified storage retention tiers** (Cloud vs. Local storage from 30 to 365 days).

---

## 🏛️ System Architecture

```
                                 +-------------------------------------------------------+
                                 |             SUPABASE CLOUD POSTGRESQL + PostGIS       |
                                 |  - Spatial Indexes: ST_MakePoint, ST_Contains, GiST   |
                                 |  - Tables: cameras, users, crime_people, alerts, etc. |
                                 |  - Row Level Security (RLS) & Multi-Tenant Partition  |
                                 +---------------------------^---------------------------+
                                                             |
                                           HTTPS (REST API)  |  WebSocket (Realtime Stream)
                                                             |
+------------------------------------------------------------v------------------------------------------------------------+
|                                                   FASTAPI PYTHON BACKEND                                                |
|   - Port: 8000                                                                                                          |
|   - Multi-Route Modular Architecture (/cameras, /incidents, /alerts, /dashboard, /health, /maintenance, /opencv)       |
|   - OpenCV Vision Engine (Real-Time Haar / YOLO Face Recognition & ANPR License Plate Extraction)                       |
|   - Live Alert Broadcast Bus (/ws/alerts) with Multi-Client Synchronization                                             |
|   - Resilient Fallback Orchestrator (In-Memory Dataset Fallback if Cloud DB Unreachable)                                |
|   - Interactive OpenAPI / Swagger Documentation: http://localhost:8000/docs                                             |
+------------------------------------------------------------^------------------------------------------------------------+
                                                             |
                                           HTTPS / JSON      |  Bi-Directional WebSockets
                                                             |
+------------------------------------------------------------v------------------------------------------------------------+
|                                                NEXT.JS 16 ENTERPRISE FRONTEND                                           |
|   - Port: 3000 (Vercel Production Deployed)                                                                             |
|   - React 19 Server & Client Components + Turbopack Bundler                                                             |
|   - Leaflet GIS & PostGIS Spatial Layer Engine (Dynamic Markers, Cluster Aggregation, Danger Zones)                    |
|   - Need Corner: Chronological Live Incident Feed & Bureau Suspect Match Dossier Cards                                  |
|   - Attention Required & Quick Actions Command Bar (Aligned 620px Flush Grid Layout)                                   |
|   - Dual-Theme System: Gujarat Gov Bright Theme & High-Contrast Cyber Command Dark Theme                                |
|   - 32 Fully Integrated Application Routes with Role-Based Access Control (RBAC)                                       |
+-------------------------------------------------------------------------------------------------------------------------+
```

---

## ✨ Core Feature Highlights

### 🗺️ 1. Real-Time GIS Spatial Command Center
- **Interactive PostGIS Mapping**: Visualizes cameras across Gujarat using PostGIS coordinates (`POINT(lng lat)`).
- **508 Camera Network**: Displays high-density markers, hardware status rings (Active, Inactive, Maintenance, Review), and camera classification (PTZ, Dome, Bullet, ANPR).
- **Cluster Aggregation**: Grouping algorithms consolidate overlapping feeds into zoom-sensitive clusters (e.g. `53 Cams`, `14 Cams`).
- **Zone Polygon Overlays**: Pre-mapped surveillance sectors covering **Ahmedabad West (Z01)**, **Ahmedabad East (Z02)**, **Gandhinagar Admin Vista (Z03)**, **Vadodara Central (Z04)**, and **Surat Diamond Corridor (Z05)**.
- **Coverage & Blind Spot Gap Analysis**: Identifies surveillance dead zones and computes density coverage heatmaps.

### ⚡ 2. Need Corner — Live Incident Activity Feed
- **Chronological Incident Timeline**: Live event stream sorted with the newest detections first.
- **Crime Type Classification**: Color-coded severity tiers (**Critical**, **High**, **Medium**, **Low**).
- **Bureau Watchlist Dossier Matching**: Automatically matches intercepted individuals with the Criminal Watchlist:
  - Suspect photograph, full legal name, alias, bureau record summary, and status (`WANTED` / `HIGH_ALERT`).
  - *Detections include suspects like Vikramaditya Solanki (Armed Extortion), Dharmesh Rajput (Vehicle Theft Ring), Kailash Vaghela, and Munna Bhai.*
- **Quick Filters & Search**: Search incidents by crime category, suspect name, or junction location.

### 🚨 3. AI / Computer Vision Threat Interception (Danger Actions)
- **OpenCV & AI Pipeline**: Real-time video frame parsing with face recognition and ANPR license plate parsing (e.g., `GJ-01-BK-5821`).
- **Live Alert Dispatcher**: Immediate broadcast to field officers via WebSockets (`/ws/alerts`).
- **Triage & Status Workflows**: Officers can mark danger alerts as **ACTIVE**, **DISPATCHED**, **RESOLVED**, or **FALSE_POSITIVE** with automated audit logging.

### 📹 4. 4-Step Camera Onboarding & Bulk Import Wizard
- **Gujarat Sentinel Compliance Checklist**: Enforces technical requirements before allowing a camera onto the grid:
  - Resolution standards (1080p / 4K), frame rate (25-30 FPS), H.264/H.265 compression, and RTSP over TCP.
- **Storage Architecture & Retention Validation**:
  - **Storage Type**: Cloud-Hosted (AWS S3/GCS) vs. Local Edge NVR/DVR.
  - **Storage Days**: Mandatory retention tier selection (30, 60, 90, 180, or 365 days).
- **Bulk CSV Ingestion**: Parses multi-camera inventories with schema validation and error reporting.

### 🏢 5. Multi-Department Federation
- Seamlessly integrates disparate government bodies under one dashboard:
  1. **Department of Home Affairs** (State Command)
  2. **Gujarat Police Department** (Law & Order)
  3. **Gujarat Traffic Branch** (ANPR & Corridor Flow)
  4. **Ahmedabad Municipal Corporation — AMC** (Civic Infrastructure)
  5. **Gujarat State Disaster Management Authority — GSDMA** (Emergency Response)
  6. **Transport & Highways Department** (Expressway Checkposts)
- Role-based departmental views allow administrators to filter cameras and incidents by authorized jurisdiction.

### 🩺 6. Hardware Health & Predictive Maintenance
- **Uptime Monitoring**: Heartbeat telemetry tracks offline cameras, signal drops, and degraded streams.
- **Mean Time Between Failures (MTBF)**: Calculates reliability index and flags cameras needing preventative servicing.
- **Maintenance Work Orders**: Field technician assignments with ticket numbers, resolution timelines, and priority levels.

### 🔒 7. Security, Auditing & Governance
- **Immutable Audit Trail**: Logs every single action (Officer logins, camera registrations, alert status updates, role assignments) with timestamp and IP address.
- **Role-Based Access Control (RBAC)**:
  - `ADMIN`: Full configuration, department switching, user management, and sensitive actions.
  - `INSPECTOR`: Operational access, camera feeds, alert dispatch, and incident reporting.
  - `VIEWER / OPERATOR`: Read-only monitoring of authorized camera sectors.
- **Dual-Theme Command System**: One-click toggle between **Gujarat Gov Command Bright Theme** and **High-Contrast Cyber Command Dark Theme**.

---

## 🗺️ Complete Application Directory (All 32 Routes)

| Category | Route | Purpose & Description |
| :--- | :--- | :--- |
| **Authentication** | [`/login`](Frontend/drishti-setu/src/app/login/page.tsx) | Evaluator demo login with animated 1-click auto-fill buttons and Demo Mode indicator. |
| | [`/request-access`](Frontend/drishti-setu/src/app/request-access/page.tsx) | Official platform credential request portal for departmental officers. |
| | [`/activate`](Frontend/drishti-setu/src/app/activate/page.tsx) | Secure cryptographic token activation for approved user profiles. |
| **Command Core** | [`/dashboard`](Frontend/drishti-setu/src/app/(authenticated)/dashboard/page.tsx) | Primary operational center: Leaflet PostGIS GIS Map, Attention Required, Quick Actions, and Need Corner. |
| | [`/gis-map`](Frontend/drishti-setu/src/app/(authenticated)/gis-map/page.tsx) | Full-screen interactive GIS mapping grid with zone boundary polygons and camera clusters. |
| | [`/gap-analysis`](Frontend/drishti-setu/src/app/(authenticated)/gap-analysis/page.tsx) | Spatial blind-spot analysis computing unmonitored municipal corridors. |
| **Threat Interception**| [`/danger-actions`](Frontend/drishti-setu/src/app/(authenticated)/danger-actions/page.tsx) | Real-time criminal watchlist interception grid with live dispatch controls. |
| | [`/camera-feed`](Frontend/drishti-setu/src/app/(authenticated)/camera-feed/page.tsx) | Live multi-camera RTSP streaming matrix with OpenCV bounding-box inference. |
| **CCTV Registry** | [`/cameras`](Frontend/drishti-setu/src/app/(authenticated)/cameras/page.tsx) | Master camera inventory table with storage type, retention days, and status filtering. |
| | [`/cameras/[id]`](Frontend/drishti-setu/src/app/(authenticated)/cameras/[id]/page.tsx) | Deep-dive camera hardware dossier, telemetry diagnostics, and live feed viewer. |
| | [`/cameras/new`](Frontend/drishti-setu/src/app/(authenticated)/cameras/new/page.tsx) | Single camera manual registration form with PostGIS coordinate picker. |
| | [`/cameras/import`](Frontend/drishti-setu/src/app/(authenticated)/cameras/import/page.tsx) | Bulk camera CSV import interface with instant column mapping and validation. |
| | [`/cameras/api-onboarding`](Frontend/drishti-setu/src/app/(authenticated)/cameras/api-onboarding/page.tsx) | 4-step wizard for external CCTV network onboarding and Sentinel compliance verification. |
| | [`/cameras/history`](Frontend/drishti-setu/src/app/(authenticated)/cameras/history/page.tsx) | Historical lifecycle log of camera hardware updates and configuration changes. |
| **Diagnostics & Ops** | [`/health-monitoring`](Frontend/drishti-setu/src/app/(authenticated)/health-monitoring/page.tsx) | Real-time camera uptime monitor, degradation alerts, and MTBF reliability graphs. |
| | [`/maintenance`](Frontend/drishti-setu/src/app/(authenticated)/maintenance/page.tsx) | Preventative and corrective maintenance ticket management and technician dispatcher. |
| | [`/recordings`](Frontend/drishti-setu/src/app/(authenticated)/recordings/page.tsx) | NVR/Cloud video archive browser with playback scrubbers and retention audit. |
| | [`/registry-api`](Frontend/drishti-setu/src/app/(authenticated)/registry-api/page.tsx) | Hardware and camera model catalog with technical specifications. |
| **Intelligence** | [`/reports`](Frontend/drishti-setu/src/app/(authenticated)/reports/page.tsx) | Automated executive PDF/CSV intelligence reporting and analytics export. |
| | [`/integrations`](Frontend/drishti-setu/src/app/(authenticated)/integrations/page.tsx) | Status grid for external APIs (e-Challan, VAHAN, Dial 112, Smart City Command). |
| | [`/audit-trail`](Frontend/drishti-setu/src/app/(authenticated)/audit-trail/page.tsx) | Tamper-proof system activity log with cryptographic action signatures. |
| **Administration** | [`/users-roles`](Frontend/drishti-setu/src/app/(authenticated)/users-roles/page.tsx) | Role-Based Access Control management, badge provisioning, and permissions editor. |
| | [`/departments`](Frontend/drishti-setu/src/app/(authenticated)/departments/page.tsx) | Federated departmental hierarchy and cross-agency resource allocation. |
| | [`/resources`](Frontend/drishti-setu/src/app/(authenticated)/resources/page.tsx) | Gujarat Sentinel surveillance reference guidelines and RTSP stream protocol specifications. |
| | [`/settings`](Frontend/drishti-setu/src/app/(authenticated)/settings/page.tsx) | System-wide thresholds, AI confidence triggers, and notification settings. |
| | [`/profile`](Frontend/drishti-setu/src/app/(authenticated)/profile/page.tsx) | Officer profile information, security credentials, and active session telemetry. |
| | [`/messages`](Frontend/drishti-setu/src/app/(authenticated)/messages/page.tsx) | Inter-departmental secure messaging and alert communications. |
| | [`/notifications`](Frontend/drishti-setu/src/app/(authenticated)/notifications/page.tsx) | Real-time notification center for threat alerts and maintenance updates. |

---

## 🛠️ Technology Stack & Dependencies

```
+----------------------------------------------------------------------------------------------------------------------+
| LAYER                 | TECHNOLOGY                       | VERSION        | ROLE & RESPONSIBILITY                    |
+-----------------------+----------------------------------+----------------+------------------------------------------+
| Frontend Framework    | Next.js (App Router, Turbopack)  | 16.3.3         | Server-side rendering, routing, layouts  |
| UI Library            | React                            | 19.2.8         | Interactive component state management   |
| Styling Engine        | TailwindCSS + Clsx               | 3.4.1          | Responsive government UI styling         |
| Geospatial Mapping    | Leaflet + Leaflet.heat           | 1.9.4 / 0.2.0  | GIS mapping, marker clusters, heatmaps   |
| Iconography           | Lucide React                     | 1.34.0         | Clean, accessible SVG iconography        |
| Data Fetching         | TanStack React Query + Axios     | 5.102 / 1.20   | Resilient API caching and client state   |
+-----------------------+----------------------------------+----------------+------------------------------------------+
| Backend Framework     | FastAPI                          | 0.141.1        | Asynchronous high-performance REST API   |
| Web Server            | Uvicorn                          | 0.52.4         | ASGI production web server               |
| Computer Vision / AI  | OpenCV Python                    | 5.0.0.93       | RTSP video frame capture, face & ANPR    |
| Database ORM          | SQLAlchemy + GeoAlchemy2         | 2.0.52 / 0.20  | PostGIS spatial query orchestration      |
| Cloud Database        | Supabase PostgreSQL + PostGIS    | 2.31.0         | Spatial indexing, RLS, Cloud DB storage  |
| Real-time WebSockets  | websockets                       | 15.0.1         | Instant bi-directional alert dispatch    |
| Authentication        | PyJWT + Passlib (Bcrypt)         | 2.13 / 1.7.4   | Stateless cryptographic session tokens   |
+----------------------------------------------------------------------------------------------------------------------+
```

---

## 💻 Local Setup & Development Guide

### Prerequisites
- **Node.js**: v18.18+ or v20+
- **Python**: v3.10+ or v3.12
- **Git**

---

### Step 1: Clone the Repository
```bash
git clone https://github.com/100rabh-100uman/drishti-setu.git
cd drishti-setu/Project
```

---

### Step 2: Backend Setup (FastAPI + OpenCV)

1. Navigate into the `backend` directory:
   ```bash
   cd backend
   ```

2. Create and activate a Python virtual environment:
   * **Windows (PowerShell)**:
     ```powershell
     python -m venv venv
     .\venv\Scripts\Activate.ps1
     ```
   * **macOS / Linux**:
     ```bash
     python3 -m venv venv
     source venv/bin/activate
     ```

3. Install required Python packages:
   ```bash
   pip install -r requirements.txt
   ```

4. Launch the backend server:
   ```bash
   python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
   ```
   * Backend API: [http://localhost:8000](http://localhost:8000)
   * Swagger Documentation: [http://localhost:8000/docs](http://localhost:8000/docs)

*(Note: The backend features an automatic in-memory fallback. If Supabase keys are not set, it operates seamlessly in offline demo mode).*

---

### Step 3: Frontend Setup (Next.js 16)

1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd Frontend/drishti-setu
   ```

2. Install npm dependencies:
   ```bash
   npm install
   ```

3. Configure environment variable:
   Create a `.env.local` file:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```

4. Start the Turbopack development server:
   ```bash
   npm run dev
   ```

5. Open your browser:
   👉 **[http://localhost:3000/login](http://localhost:3000/login)**

---

## ⚡ Alternative Execution Methods

### 🐳 Method 1: Docker Compose (All-in-One Container)
```bash
# Build and launch both frontend & backend containers:
docker-compose up --build -d

# Stop services:
docker-compose down
```

### 🪟 Method 2: Windows Background Auto-Start (Zero Terminal Windows)
For continuous evaluation without terminal windows:
- **Immediate background launch**: Double-click `scripts\windows\start-background.vbs`
- **Auto-run on Windows boot**: Run `scripts\windows\install-startup.bat`
- **Check service health**: Run `scripts\windows\status.bat`
- **Stop services**: Run `scripts\windows\stop-services.bat`

### 🔄 Method 3: PM2 Process Daemon
```bash
npm install -g pm2
pm2 start ecosystem.config.js
pm2 status
```

---

## 👥 Project Team & Contributors

This platform was designed, engineered, and demonstrated by:

<div align="center">

| Developer | Role & Contributions | Profile |
| :--- | :--- | :---: |
| **Saurabh Suman** | **Lead Architect & Full-Stack Engineer**<br />Next.js 16 App Router, Leaflet PostGIS UI, Multi-Department Federation, Evaluator UX, Responsive UI/UX Systems | [![GitHub](https://img.shields.io/badge/GitHub-100rabh--100uman-181717?style=flat&logo=github)](https://github.com/100rabh-100uman) |
| **Parth Panchal** | **AI / Computer Vision & Backend Engineer**<br />FastAPI Architecture, OpenCV Streaming Inference, ANPR & Face Recognition Watchlists, WebSockets Dispatch | [![GitHub](https://img.shields.io/badge/GitHub-Parthpanchal60-181717?style=flat&logo=github)](https://github.com/Parthpanchal60) |

</div>

---

## ⚖️ Standards Alignment & Legal

- **Gujarat Sentinel Alignment**: Built following technical guidelines stipulated at [sentinel.gujarat.gov.in/resource](https://sentinel.gujarat.gov.in/resource).
- **Confidentiality & Security**: All suspect dossiers, mock incidents, and vehicle plates used in the demonstration environment are synthetically generated for hackathon benchmarking purposes.
- **Copyright**: © 2026 DRISHTI SETU Initiative. Developed for the Gujarat Police Hackathon.
