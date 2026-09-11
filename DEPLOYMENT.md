# 🚀 DRISHTI SETU — Automated Deployment & Operations Guide

> **Gujarat Police Smart CCTV Command Platform**  
> Complete operational manual for running the platform automatically like a deployed cloud service without manual terminal commands.

---

## 📋 Table of Contents
1. [Architecture & Topology](#-architecture--topology)
2. [Option A: 1-Click Docker Compose (Recommended for Container Environments)](#-option-a-1-click-docker-compose)
3. [Option B: Windows Background Auto-Start on Laptop Boot (No CMD Prompt)](#-option-b-windows-background-auto-start)
4. [Option C: PM2 Process Manager (Universal Background Daemon)](#-option-c-pm2-process-manager)
5. [Option D: Linux systemd Services (Ubuntu/Debian)](#-option-d-linux-systemd-services)
6. [Cloud Deployment Guide](#-cloud-deployment-guide)
   - [Frontend to Vercel](#1-deploying-frontend-to-vercel)
   - [Frontend to Netlify](#2-deploying-frontend-to-netlify)
   - [Backend to Render](#3-deploying-backend-to-render)
   - [Backend to Heroku](#4-deploying-backend-to-heroku)
   - [Backend to Azure App Service](#5-deploying-backend-to-azure-app-service)
7. [Environment Variables Reference](#-environment-variables-reference)
8. [Health Checks & Verification](#-health-checks--verification)

---

## 🏛️ Architecture & Topology

```
                  +----------------------------------------------+
                  |           SUPABASE CLOUD POSTGRESQL          |
                  |  - PostGIS Spatial Indexes (POINT, POLYGON)  |
                  |  - Cameras, Events, Zones, Users, Alerts    |
                  +-----------------------^----------------------+
                                          |
                        HTTPS (REST API)  |  WebSocket (Realtime)
                                          |
+-----------------------------------------v-----------------------------------------+
|                                FASTAPI BACKEND                                    |
|   - Port: 8000                                                                    |
|   - Real-time Alert WebSockets (/ws/alerts)                                       |
|   - OpenCV Haar Cascade AI Face & Plate Recognition                               |
|   - Swagger Docs: http://localhost:8000/docs                                      |
|   - Health Probe: http://localhost:8000/health                                    |
+-----------------------------------------^-----------------------------------------+
                                          |
                        HTTP / WebSockets |  JSON Payloads
                                          |
+-----------------------------------------v-----------------------------------------+
|                               NEXT.JS 16 FRONTEND                                 |
|   - Port: 3000                                                                    |
|   - Production-optimized Standalone Bundle                                        |
|   - Leaflet GIS Live Command Center                                               |
|   - Dashboard URL: http://localhost:3000                                          |
+-----------------------------------------------------------------------------------+
```

---

## 🐳 Option A: 1-Click Docker Compose

Docker Compose builds both services and manages their lifecycle, restarts, and internal networking automatically.

### Start Everything in Background:
```bash
docker-compose up --build -d
```

### View Live Logs:
```bash
# Both services
docker-compose logs -f

# Backend only
docker-compose logs -f backend

# Frontend only
docker-compose logs -f frontend
```

### Check Container Status:
```bash
docker-compose ps
```

### Stop All Containers:
```bash
docker-compose down
```

---

## 🪟 Option B: Windows Background Auto-Start (No CMD Prompt)

If you are on Windows and want both services to start automatically in the background without needing to keep command prompt windows open, use the built-in Windows helper scripts located in `scripts/windows/`.

### 1. Launch Immediately in Background (No CMD Window):
Double-click:
```
scripts\windows\start-background.vbs
```
*Runs via Windows Script Host with window style hidden (`0`). No black window opens.*

### 2. Auto-Run Automatically When Laptop Starts:
Run once:
```
scripts\windows\install-startup.bat
```
*Creates a shortcut in `%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup` pointing to `start-background.vbs`. Every time you log in to Windows, DRISHTI SETU starts silently in the background.*

### 3. Check Service Status:
Run:
```
scripts\windows\status.bat
```

### 4. Stop Background Services:
Run:
```
scripts\windows\stop-services.bat
```
*Kills any background processes listening on ports 8000 and 3000.*

### 5. Remove Auto-Start on Boot:
Run:
```
scripts\windows\uninstall-startup.bat
```

---

## ⚡ Option C: PM2 Process Manager

PM2 provides production process management with automatic restarts upon crashes.

### 1. Install PM2 Globally (if not installed):
```bash
npm install -g pm2
```

### 2. Start Both Services from Repository Root:
```bash
pm2 start ecosystem.config.js
```

### 3. Monitor Status & Logs:
```bash
pm2 status
pm2 logs
pm2 logs drishti-backend
pm2 logs drishti-frontend
```

### 4. Save Processes to Boot on System Startup:
```bash
pm2 startup
pm2 save
```

### 5. Stop All Services:
```bash
pm2 stop ecosystem.config.js
```

---

## 🐧 Option D: Linux systemd Services

For Ubuntu/Debian production servers or Raspberry Pi edge devices:

```bash
# Run installer as root
sudo chmod +x scripts/systemd/install-systemd.sh
sudo ./scripts/systemd/install-systemd.sh
```

Inspect services:
```bash
sudo systemctl status drishti-backend
sudo systemctl status drishti-frontend
```

---

## ☁️ Cloud Deployment Guide

### 1. Deploying Frontend to Vercel

1. Import the repository in [Vercel](https://vercel.com/new).
2. Set the **Root Directory** to `Frontend/drishti-setu`.
3. Framework Preset: **Next.js**.
4. Configure Environment Variables:
   - `NEXT_PUBLIC_API_URL`: `https://your-backend-domain.com` (Your deployed FastAPI backend URL).
5. Click **Deploy**. Vercel will build and output your production URL.

*(Alternatively, run `vercel` CLI in `Frontend/drishti-setu`)*.

---

### 2. Deploying Frontend to Netlify

1. Connect the repository in [Netlify](https://app.netlify.com).
2. Base directory: `Frontend/drishti-setu`.
3. Build command: `npm run build`.
4. Publish directory: `.next`.
5. Environment Variables:
   - `NEXT_PUBLIC_API_URL`: `https://your-backend-domain.com`
6. Click **Deploy Site**. The `@netlify/plugin-nextjs` defined in `netlify.toml` will handle the edge SSR adapter.

---

### 3. Deploying Backend to Render

1. Open [Render Dashboard](https://dashboard.render.com).
2. Click **New +** -> **Blueprint**.
3. Point to this repository. Render automatically reads `render.yaml`.
4. Fill in the environment variables:
   - `SUPABASE_URL`: `https://dmiecxxducuumvmlxpyw.supabase.co`
   - `SUPABASE_KEY`: `<your-supabase-service-role-key>`
   - `JWT_SECRET`: `<your-jwt-secret>`
   - `DEMO_MODE`: `true`
5. Render assigns a `$PORT` and starts Uvicorn automatically.

---

### 4. Deploying Backend to Heroku

```bash
# Create Heroku app
heroku create drishti-setu-backend

# Set environment variables
heroku config:set SUPABASE_URL="https://dmiecxxducuumvmlxpyw.supabase.co"
heroku config:set SUPABASE_KEY="<your-supabase-key>"
heroku config:set JWT_SECRET="<your-jwt-secret>"
heroku config:set DEMO_MODE="true"

# Deploy repository
git push heroku main
```
*Heroku uses `backend/Procfile` and `backend/runtime.txt` automatically.*

---

### 5. Deploying Backend to Azure App Service

1. Create a Linux Web App on Azure with runtime stack **Python 3.11**.
2. Under **Configuration -> Application settings**, add:
   - `SUPABASE_URL`: `https://dmiecxxducuumvmlxpyw.supabase.co`
   - `SUPABASE_KEY`: `<your-supabase-key>`
   - `JWT_SECRET`: `<your-jwt-secret>`
   - `PORT`: `8000`
   - `DEMO_MODE`: `true`
3. Under **General settings -> Startup Command**, set:
   ```bash
   startup.sh
   # or:
   gunicorn -w 2 -k uvicorn.workers.UvicornWorker -b 0.0.0.0:8000 main:app
   ```

---

## 🔑 Environment Variables Reference

### Backend (`backend/.env`)
| Variable | Description | Default / Example |
| :--- | :--- | :--- |
| `PORT` | Port for Uvicorn ASGI server | `8000` |
| `HOST` | Host binding interface | `0.0.0.0` |
| `SUPABASE_URL` | Supabase Cloud API URL | `https://dmiecxxducuumvmlxpyw.supabase.co` |
| `SUPABASE_KEY` | Supabase Service Role / Anon Key | `eyJhbGci...` |
| `JWT_SECRET` | Secret key for signing JWT tokens | `941b9fa...` |
| `DEMO_MODE` | Fallback mode if offline | `true` |

### Frontend (`Frontend/drishti-setu/.env.local`)
| Variable | Description | Default / Example |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_API_URL` | Target FastAPI Backend Base URL | `http://localhost:8000` |
| `PORT` | Local Next.js server port | `3000` |

---

## ✅ Health Checks & Verification

After starting the platform via Docker, Windows Auto-Start, or PM2:

1. **Frontend Dashboard**:
   - URL: [http://localhost:3000](http://localhost:3000)
   - Login Route: [http://localhost:3000/login](http://localhost:3000/login)
   - 1-Click Demo Login: Admin Officer (`EMP001` / `admin123`)

2. **Backend API Documentation**:
   - Interactive Swagger UI: [http://localhost:8000/docs](http://localhost:8000/docs)
   - ReDoc: [http://localhost:8000/redoc](http://localhost:8000/redoc)

3. **Backend Health Check Endpoint**:
   - URL: [http://localhost:8000/health](http://localhost:8000/health)
   - Expected response: `{"status": "healthy", ...}`

4. **Real-time Alert WebSockets**:
   - URL: `ws://localhost:8000/ws/alerts`
