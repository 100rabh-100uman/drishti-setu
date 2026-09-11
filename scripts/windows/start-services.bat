@echo off
rem ============================================================
rem DRISHTI SETU — Background Services Launcher (Windows)
rem Launches FastAPI Backend (port 8000) & Next.js Frontend (port 3000)
rem ============================================================

setlocal enabledelayedexpansion

set "ROOT_DIR=%~dp0..\.."
cd /d "%ROOT_DIR%"

if not exist "%ROOT_DIR%\logs" mkdir "%ROOT_DIR%\logs"

set "PYTHON_EXE=python"
if exist "%ROOT_DIR%\.venv\Scripts\python.exe" (
    set "PYTHON_EXE=%ROOT_DIR%\.venv\Scripts\python.exe"
)

echo [1/2] Launching DRISHTI SETU FastAPI Backend on port 8000...
cd /d "%ROOT_DIR%\backend"
start /b "" "!PYTHON_EXE!" -m uvicorn main:app --host 0.0.0.0 --port 8000 > "%ROOT_DIR%\logs\backend.log" 2>&1

echo [2/2] Launching DRISHTI SETU Next.js Frontend on port 3000...
cd /d "%ROOT_DIR%\Frontend\drishti-setu"
start /b "" npm run dev > "%ROOT_DIR%\logs\frontend.log" 2>&1

echo [SUCCESS] Both servers dispatched to background!
echo - Frontend Dashboard: http://localhost:3000
echo - Backend API Docs:   http://localhost:8000/docs
echo - Logs Directory:     %ROOT_DIR%\logs
