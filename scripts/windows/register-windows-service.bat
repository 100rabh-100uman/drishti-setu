@echo off
rem ============================================================
rem DRISHTI SETU — Windows NT Service Registration Guide (NSSM)
rem Run as Administrator if using NSSM (Non-Sucking Service Manager)
rem ============================================================

echo ============================================================
echo   DRISHTI SETU — True Windows Service Configuration
echo ============================================================
echo.
echo For running DRISHTI SETU as true Windows Services (system-level):
echo 1. Download NSSM from: https://nssm.cc/download
echo 2. Place nssm.exe in your PATH or in this folder.
echo 3. Run the following commands as Administrator:
echo.
echo    rem Install Backend Service:
echo    nssm install DrishtiBackend "%~dp0..\..\backend\venv\Scripts\python.exe" "-m uvicorn main:app --host 0.0.0.0 --port 8000"
echo    nssm set DrishtiBackend AppDirectory "%~dp0..\..\backend"
echo    nssm set DrishtiBackend Start SERVICE_AUTO_START
echo    nssm start DrishtiBackend
echo.
echo    rem Install Frontend Service:
echo    nssm install DrishtiFrontend "C:\Program Files\nodejs\npm.cmd" "run start:prod"
echo    nssm set DrishtiFrontend AppDirectory "%~dp0..\..\Frontend\drishti-setu"
echo    nssm set DrishtiFrontend Start SERVICE_AUTO_START
echo    nssm start DrishtiFrontend
echo.
echo ============================================================
pause
