@echo off
rem ============================================================
rem DRISHTI SETU — Check Services Health & Port Status (Windows)
rem ============================================================

setlocal enabledelayedexpansion

echo ============================================================
echo   DRISHTI SETU — Service Health Status
echo ============================================================

set BACKEND_RUNNING=0
set FRONTEND_RUNNING=0

netstat -aon | findstr /r ":8000 .*LISTENING" >nul 2>&1
if %errorlevel% equ 0 (
    set BACKEND_RUNNING=1
    echo [OK] Backend service is LISTENING on port 8000.
    echo      Docs URL: http://localhost:8000/docs
) else (
    echo [OFFLINE] Backend service is NOT running on port 8000.
)

netstat -aon | findstr /r ":3000 .*LISTENING" >nul 2>&1
if %errorlevel% equ 0 (
    set FRONTEND_RUNNING=1
    echo [OK] Frontend service is LISTENING on port 3000.
    echo      App URL:  http://localhost:3000
) else (
    echo [OFFLINE] Frontend service is NOT running on port 3000.
)

echo.
if %BACKEND_RUNNING% equ 1 if %FRONTEND_RUNNING% equ 1 (
    echo [STATUS: HEALTHY] Platform is fully running and accessible!
) else (
    echo [STATUS: INCOMPLETE] Use start-services.bat or start-background.vbs to launch.
)
echo ============================================================
pause
