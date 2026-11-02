@echo off
echo ========================================================
echo Starting Unified Live-Syntax + Altern AI Platform
echo ========================================================
echo.

echo [1/3] Starting Altern AI Model Server (Port 8000)...
start "Altern Model Server" cmd /k "cd /d %~dp0 && python model_server/server.py"

echo [2/3] Starting Live-Syntax Node Collaboration Server (Port 5002)...
start "Live-Syntax Server" cmd /k "cd /d %~dp0server && npm start"

echo [3/3] Starting Live-Syntax React Frontend (Port 3000)...
start "Live-Syntax Client" cmd /k "cd /d %~dp0client && npm start"

echo.
echo All 3 services have been launched in separate terminals!
echo Frontend will open automatically at: http://localhost:3000
echo Altern Model Engine: http://localhost:8000
echo Node Collaboration Server: http://localhost:5002
echo ========================================================
pause
