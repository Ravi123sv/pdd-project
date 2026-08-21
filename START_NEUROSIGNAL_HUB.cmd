@echo off
title NeuroSignal Titanium Hub - Unified Workstation
echo ===================================================
echo   NEUROSIGNAL TITANIUM HUB - ONE-CLICK BOOT
echo ===================================================
echo.
echo [1/3] Checking Root Orchestrator...
if not exist "node_modules" (
    echo [SYSTEM] First-time setup detected. Installing orchestrator tools...
    call npm install
)

echo.
echo [2/3] Synchronizing Clinical Node Dependencies...
echo This may take a moment depending on your network bandwidth...
call npm run install:all

echo.
echo [3/3] BOOTING CLINICAL BACKEND AND WORKSTATION...
echo Hub will be available on port 5000.
echo Frontend will be available on port 3000.
echo.

:: Start the hub concurrently
start /b cmd /c "npm run launch:hub"

echo Waiting for Clinical Hub Handshake...
:loop
powershell -Command "$status = try { (Invoke-WebRequest -Uri http://localhost:5000/api/health -UseBasicParsing).StatusCode } catch { 0 }; if ($status -eq 200) { exit 0 } else { exit 1 }"
if %errorlevel% equ 0 (
    echo.
    echo ✅ CLINICAL HUB ONLINE. Ready for diagnostic signals.
    echo 🌐 Access Workstation at: http://localhost:3000
    goto :end
)
timeout /t 2 /nobreak >nul
goto :loop

:end
pause
