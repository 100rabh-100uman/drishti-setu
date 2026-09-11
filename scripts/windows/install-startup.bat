@echo off
rem ============================================================
rem DRISHTI SETU — Install Windows Auto-Start on Boot (Laptop Startup)
rem Registers start-background.vbs into your Windows Startup folder
rem Requires NO administrator rights.
rem ============================================================

setlocal enabledelayedexpansion

set "SCRIPT_DIR=%~dp0"
set "VBS_PATH=%SCRIPT_DIR%start-background.vbs"

if not exist "%VBS_PATH%" (
    echo [ERROR] Could not locate start-background.vbs!
    pause
    exit /b 1
)

echo Installing DRISHTI SETU to Windows Startup...
powershell -NoProfile -ExecutionPolicy Bypass -Command "$ws = New-Object -ComObject WScript.Shell; $shortcutPath = [System.IO.Path]::Combine($env:APPDATA, 'Microsoft\Windows\Start Menu\Programs\Startup\DrishtiSetu.lnk'); $shortcut = $ws.CreateShortcut($shortcutPath); $shortcut.TargetPath = '%VBS_PATH%'; $shortcut.WorkingDirectory = '%SCRIPT_DIR%'; $shortcut.Description = 'DRISHTI SETU Automated Background Services'; $shortcut.Save(); Write-Host '[SUCCESS] Shortcut created at:' $shortcutPath"

echo.
echo [DONE] DRISHTI SETU will now start automatically whenever your laptop boots or logs in!
echo You do NOT need to open any command prompt windows.
echo Frontend will be ready at: http://localhost:3000
echo Backend will be ready at:  http://localhost:8000/docs
echo.
pause
