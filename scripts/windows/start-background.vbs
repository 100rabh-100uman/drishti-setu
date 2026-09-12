' ============================================================
' DRISHTI SETU — Completely Silent Background Runner (Windows)
' Runs start-services.bat with zero command prompt windows visible
' ============================================================

Set oShell = CreateObject("WScript.Shell")
Set oFSO = CreateObject("Scripting.FileSystemObject")

strScriptDir = oFSO.GetParentFolderName(WScript.ScriptFullName)
strBatPath = oFSO.BuildPath(strScriptDir, "start-services.bat")

' 0 = Hide window, False = Return immediately without blocking
oShell.Run Chr(34) & strBatPath & Chr(34), 0, False
