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

## ⚡ Automated 1-Click Run (No Manual Terminal Commands)

You can run the entire platform automatically without manually keeping CMD windows open:

### 🐳 Method 1: Docker Compose (All-in-One Container Stack)
```bash
# Build and run both backend & frontend in the background:
docker-compose up --build -d

# Stop services when finished:
docker-compose down
```
* Backend starts at: [http://localhost:8000/docs](http://localhost:8000/docs)
* Frontend starts at: [http://localhost:3000](http://localhost:3000)

---

### 🪟 Method 2: Windows Background Auto-Start (No CMD Windows)
* **Run in background now without any terminal window**:  
  Double-click `scripts\windows\start-background.vbs`
* **Auto-run automatically whenever your laptop turns on**:  
  Run `scripts\windows\install-startup.bat` (Registers silent startup in Windows Startup folder)
* **Check service status**: Run `scripts\windows\status.bat`
* **Stop services**: Run `scripts\windows\stop-services.bat`

---

### 🔄 Method 3: PM2 Process Daemon
```bash
# Start both services managed by PM2:
pm2 start ecosystem.config.js

# Save to run automatically on system boot:
pm2 startup && pm2 save
```

---

## ☁️ Cloud Deployment Quick Reference

| Service | Component | Platform | Configuration File |
| :--- | :--- | :--- | :--- |
| **Frontend** | Next.js 16 | [Vercel](https://vercel.com) | [`Frontend/drishti-setu/vercel.json`](file:///Frontend/drishti-setu/vercel.json) |
| **Frontend** | Next.js 16 | [Netlify](https://netlify.com) | [`netlify.toml`](file:///netlify.toml) |
| **Backend** | FastAPI | [Render](https://render.com) | [`render.yaml`](file:///render.yaml) |
| **Backend** | FastAPI | [Heroku](https://heroku.com) | [`Procfile`](file:///Procfile) |
| **Backend** | FastAPI | [Azure App Service](https://azure.microsoft.com) | [`backend/startup.sh`](file:///backend/startup.sh) |
| **Database** | PostGIS / DB | [Supabase](https://supabase.com) | 100% Cloud-Hosted (No local container) |

👉 *For in-depth cloud deployment instructions, see [DEPLOYMENT.md](file:///DEPLOYMENT.md).*

---

## 🛠️ Manual Development Setup for Teammates

Follow these steps if you wish to run services individually in debug mode:

### 1. Clone the Repository
```bash
git clone https://github.com/<your-username>/<repo-name>.git
cd <repo-name>
```

---

### 2. Database Setup (Supabase PostgreSQL / PostGIS)

1. Open your Supabase Dashboard SQL Editor.
2. Open [`backend/backend/migrations/full_schema.sql`](file:///backend/backend/migrations/full_schema.sql).
3. Copy and execute the complete script to provision all base tables (`cameras`, `users`, `zones`, `events`), extensions (`crime_people`, `danger_actions`), spatial indexes, and seed data.

---

### 3. Backend Setup (FastAPI + OpenCV)

1. Navigate to the backend directory:
   ```bash
   cd backend
   # or: cd backend/backend
   ```
2. Create and activate a Python virtual environment:
   * **Windows**:
     ```bash
     python -m venv venv
     .\venv\Scripts\activate
     ```
   * **macOS / Linux**:
     ```bash
     python3 -m venv venv
     source venv/bin/activate
     ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Set up environment variables:
   * Copy the template to `.env`:
     ```bash
     cp backend/.env.example backend/.env
     ```
   * *(Works out-of-the-box in offline DEMO mode if Supabase keys are not provided).*
5. Launch the backend API:
   ```bash
   uvicorn main:app --reload --port 8000
   ```
   * API interactive documentation: [http://localhost:8000/docs](http://localhost:8000/docs)

---

### 4. Frontend Setup (Next.js 16)

1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd Frontend/drishti-setu
   ```
2. Install npm packages:
   ```bash
   npm install
   ```
3. *(Optional)* Create `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
   *(Defaults to `http://localhost:8000` automatically).*
4. Start the development server:
   ```bash
   npm run dev
   ```

---

### 5. Access the Platform

Open your browser to:
👉 **[http://localhost:3000/login](http://localhost:3000/login)**

#### 🔑 Demo Accounts (1-Click Quick Demo Login Available on Login Screen):
* **👑 Admin Officer**:
  * **Employee ID**: `EMP001`
  * **Password**: `admin123`
* **👮 Traffic Inspector**:
  * **Employee ID**: `EMP002`
  * **Password**: `admin123`

---

## 🗺️ Key Application Pages

| Route | Description |
| :--- | :--- |
| `/dashboard` | **Interactive Command Center**: Real-time Leaflet GIS mapping, camera clusters, density heatmaps, and zone boundaries. |
| `/danger-actions` | **High-Priority Danger Grid**: Instant visual alerts when crime-listed persons are intercepted by CCTV feeds. |
| `/cameras` | **Surveillance Grid**: Active CCTV feeds, RTSP stream players, and hardware status monitors. |
| `/cameras/api-onboarding` | **Department Camera Registration**: 4-step wizard for integrating external CCTV networks. |
| `/resources` | **Gujarat Sentinel Integration Hub**: Technical requirements, RTSP transport rules, and edge specs ([sentinel.gujarat.gov.in/resource](https://sentinel.gujarat.gov.in/resource)). |

---

## 📄 License & Confidentiality
Developed for official demonstration in the Gujarat Police Hackathon 2026.
