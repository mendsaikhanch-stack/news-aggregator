@echo off
setlocal EnableDelayedExpansion

echo ============================================
echo   News Aggregator - Starting Services
echo ============================================
echo.

REM --- Step 1: Kill anything already on ports 8000 and 3000 ---
echo [1/4] Cleaning up existing processes on ports 8000 and 3000...

for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":8000 " ^| findstr "LISTENING" 2^>nul') do (
    if not "%%a"=="0" (
        echo       Killing PID %%a on port 8000
        taskkill /F /PID %%a >nul 2>&1
    )
)

for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":3000 " ^| findstr "LISTENING" 2^>nul') do (
    if not "%%a"=="0" (
        echo       Killing PID %%a on port 3000
        taskkill /F /PID %%a >nul 2>&1
    )
)

REM Small delay to let ports release
timeout /t 2 /nobreak >nul

echo       Done.
echo.

REM --- Step 2: Create logs directory ---
if not exist "%~dp0logs" mkdir "%~dp0logs"

REM --- Step 3: Start Backend ---
echo [2/4] Starting backend (uvicorn on port 8000)...

pushd "%~dp0backend"
start /B cmd /c "venv\Scripts\activate.bat && python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 > "%~dp0logs\backend.log" 2>&1"
popd

REM Wait a moment for backend to initialize
timeout /t 3 /nobreak >nul

REM Verify backend started
set BACKEND_OK=0
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":8000 " ^| findstr "LISTENING" 2^>nul') do (
    set BACKEND_OK=1
)
if !BACKEND_OK!==1 (
    echo       Backend started successfully.
) else (
    echo       WARNING: Backend may not have started. Check logs\backend.log
)
echo.

REM --- Step 4: Start Frontend ---
echo [3/4] Starting frontend (Next.js on port 3000)...

pushd "%~dp0frontend"
start /B cmd /c "npm run dev > "%~dp0logs\frontend.log" 2>&1"
popd

REM Wait a moment for frontend to initialize
timeout /t 5 /nobreak >nul

REM Verify frontend started
set FRONTEND_OK=0
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":3000 " ^| findstr "LISTENING" 2^>nul') do (
    set FRONTEND_OK=1
)
if !FRONTEND_OK!==1 (
    echo       Frontend started successfully.
) else (
    echo       WARNING: Frontend may not have started. Check logs\frontend.log
)
echo.

REM --- Step 5: Show Status ---
echo [4/4] Service Status:
echo ============================================

echo.
echo   Port 8000 (Backend):
set FOUND_8000=0
for /f "tokens=1,2,3,4,5" %%a in ('netstat -aon ^| findstr ":8000 " ^| findstr "LISTENING" 2^>nul') do (
    echo       PID %%e - LISTENING on %%b
    set FOUND_8000=1
)
if !FOUND_8000!==0 echo       NOT RUNNING

echo.
echo   Port 3000 (Frontend):
set FOUND_3000=0
for /f "tokens=1,2,3,4,5" %%a in ('netstat -aon ^| findstr ":3000 " ^| findstr "LISTENING" 2^>nul') do (
    echo       PID %%e - LISTENING on %%b
    set FOUND_3000=1
)
if !FOUND_3000!==0 echo       NOT RUNNING

echo.
echo ============================================
echo   Backend:  http://localhost:8000
echo   Frontend: http://localhost:3000
echo   Logs:     %~dp0logs\
echo ============================================
echo.
echo   To stop all services, run: stop.bat
echo.

endlocal
