@echo off
rem ============================================================
rem DRISHTI SETU — Stop Background Services (Windows)
rem Finds and terminates background processes on ports 8000 & 3000
rem ============================================================

setlocal enabledelayedexpansion

echo ============================================================
echo Shutting down DRISHTI SETU background services...
echo ============================================================

rem Stop Backend on port 8000
for /f "tokens=5" %%a in ('netstat -aon ^| findstr /r ":8000 .*LISTENING"') do (
    echo Stopping Backend PID %%a on port 8000...
    taskkill /F /PID %%a >nul 2>&1
)

rem Stop Frontend on port 3000
for /f "tokens=5" %%a in ('netstat -aon ^| findstr /r ":3000 .*LISTENING"') do (
    echo Stopping Frontend PID %%a on port 3000...
    taskkill /F /PID %%a >nul 2>&1
)

echo.
echo [DONE] Both backend (8000) and frontend (3000) have been stopped.
