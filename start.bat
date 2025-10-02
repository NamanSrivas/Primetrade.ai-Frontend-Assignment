@echo off
echo Starting Frontend Developer Assignment - Task Manager
echo.

echo [1/3] Starting MongoDB (if running locally)...
rem Uncomment the line below if you have MongoDB installed locally
rem start mongod

echo [2/3] Starting Backend Server...
start cmd /k "cd backend && npm run dev"

echo Waiting for backend to initialize...
timeout /t 3

echo [3/3] Starting Frontend Application...
start cmd /k "cd frontend && npm run dev"

echo.
echo ========================================
echo   Application Starting!
echo ========================================
echo   Frontend: http://localhost:3000
echo   Backend:  http://localhost:5000
echo   API Docs: See README.md
echo ========================================
echo.
echo Press any key to open the application in your browser...
pause > nul

start http://localhost:3000