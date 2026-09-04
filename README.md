# 🛡️ DRISHTI SETU — Gujarat Police Smart CCTV Command Platform

> **Comprehensive Intelligent Surveillance & Real-Time Threat Interception System**  
> Built for the **Gujarat Police Hackathon** in alignment with official [Gujarat Sentinel](https://sentinel.gujarat.gov.in/resource) surveillance guidelines.

---

## 🏗️ Architecture Overview

* **Frontend**: Next.js 16 (Turbopack, App Router) + TailwindCSS + Leaflet GIS + React Lucide Icons.
* **Backend**: FastAPI + Python 3.10+ + OpenCV Video Analytics + WebSockets.
* **Database**: PostgreSQL with PostGIS via Supabase (plus resilient offline in-memory fallback).
* **AI / CV**: Real-time face detection, ANPR license plate parsing, crowd density estimation, and danger-listed suspect classification.

---

## 🚀 Quick Start for Teammates

Follow these steps to run the project locally on any machine:

### 1. Clone the Repository
`ash
git clone https://github.com/<your-username>/<repo-name>.git
cd <repo-name>
`

---

### 2. Backend Setup (FastAPI + OpenCV)

1. Navigate to the backend directory:
   `ash
   cd backend/backend
   `
2. Create and activate a Python virtual environment:
   * **Windows**:
     `ash
     python -m venv venv
     .\venv\Scripts\activate
     `
   * **macOS / Linux**:
     `ash
     python3 -m venv venv
     source venv/bin/activate
     `
3. Install dependencies:
   `ash
   pip install -r requirements.txt
   `
4. Set up environment variables:
   * Copy the template to .env:
     `ash
     cp .env.example .env
     `
   * *(Ask your team lead for the live Supabase keys, or run in offline DEMO mode out of the box).*
5. Launch the backend API:
   `ash
   uvicorn main:app --reload --port 8000
   `
   * API docs available at: http://localhost:8000/docs

---

### 3. Frontend Setup (Next.js 16)

1. Open a new terminal and navigate to the frontend directory:
   `ash
   cd Frontend/drishti-setu
   `
2. Install npm packages:
   `ash
   npm install
   `
3. *(Optional)* Create .env.local:
   `ash
   cp .env.example .env.local
   `
   *(Defaults to http://localhost:8000 automatically).*
4. Start the development server:
   `ash
   npm run dev
   `

---

### 4. Access the Platform

Open your browser to:
👉 **[http://localhost:3000/login](http://localhost:3000/login)**

#### 🔑 Demo Accounts (1-Click Login Supported):
* **👑 Admin Officer**:
  * **Employee ID**: EMP001
  * **Password**: dmin123
* **👮 Traffic Inspector**:
  * **Employee ID**: EMP002
  * **Password**: dmin123

---

## 🗺️ Key Application Pages

| Route | Description |
| :--- | :--- |
| /dashboard | **Interactive Command Center**: Real-time Leaflet GIS mapping, camera clusters, density heatmaps, and zone boundaries. |
| /danger-actions | **High-Priority Danger Grid**: Instant visual alerts when crime-listed persons are intercepted by CCTV feeds. |
| /cameras | **Surveillance Grid**: Active CCTV feeds, RTSP stream players, and hardware status monitors. |
| /cameras/api-onboarding | **Department Camera Registration**: 4-step wizard for integrating external CCTV networks. |
| /resources | **Gujarat Sentinel Integration Hub**: Technical requirements, RTSP transport rules, and edge specs. |

---

## 📄 License & Confidentiality
Developed for official demonstration in the Gujarat Police Hackathon 2026.
