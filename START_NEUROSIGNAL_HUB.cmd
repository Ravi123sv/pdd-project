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
echo System is initializing. Hub will be available on port 5000.
echo Frontend will be available on port 3000.
echo.
call npm run launch:hub

pause
