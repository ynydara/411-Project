@echo off
echo ============================
echo   Stopping old processes
echo ============================

:: Kill Flask on port 5000
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5000') do taskkill /PID %%a /F

:: Kill React on port 3000
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do taskkill /PID %%a /F

echo.
echo ============================
echo   Starting Project Servers
echo ============================

echo [1/2] Starting Flask server...
cd flask-server
start cmd /k "python server.py"

echo [2/2] Starting React client...
cd ../client
start cmd /k "npm start"

cd ..

