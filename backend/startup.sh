#!/bin/sh
# ============================================================
# DRISHTI SETU — Cloud & Azure App Service Startup Script
# ============================================================
set -e

PORT=${PORT:-8000}
echo "[DRISHTI SETU] Starting FastAPI ASGI engine on port $PORT..."

# Start with Gunicorn process manager + Uvicorn workers for high concurrency
if command -v gunicorn >/dev/null 2>&1; then
    exec gunicorn -w 2 -k uvicorn.workers.UvicornWorker -b 0.0.0.0:$PORT --timeout 120 main:app
else
    exec uvicorn main:app --host 0.0.0.0 --port $PORT
fi
