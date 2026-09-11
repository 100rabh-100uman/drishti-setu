@echo off
rem ============================================================
rem DRISHTI SETU — Remove Windows Auto-Start
rem Removes DrishtiSetu.lnk from Windows Startup folder
rem ============================================================

set "SHORTCUT=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup\DrishtiSetu.lnk"

if exist "%SHORTCUT%" (
    del /f /q "%SHORTCUT%"
    echo [SUCCESS] Removed DRISHTI SETU from Windows Startup.
) else (
    echo [INFO] DRISHTI SETU startup shortcut was not found.
)

pause
