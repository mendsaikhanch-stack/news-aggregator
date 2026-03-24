@echo off
setlocal EnableDelayedExpansion

echo ============================================
echo   News Aggregator - Stopping Services
echo ============================================
echo.

REM --- Kill processes on port 8000 (Backend) ---
echo [1/3] Stopping backend (port 8000)...
set KILLED_8000=0
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":8000 " ^| findstr "LISTENING" 2^>nul') do (
    if not "%%a"=="0" (
        echo       Killing PID %%a
        taskkill /F /PID %%a >nul 2>&1
        set KILLED_8000=1
    )
)
if !KILLED_8000!==0 (
    echo       No process found on port 8000.
) else (
    echo       Backend stopped.
)
echo.

REM --- Kill processes on port 3000 (Frontend) ---
echo [2/3] Stopping frontend (port 3000)...
set KILLED_3000=0
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":3000 " ^| findstr "LISTENING" 2^>nul') do (
    if not "%%a"=="0" (
        echo       Killing PID %%a
        taskkill /F /PID %%a >nul 2>&1
        set KILLED_3000=1
    )
)
if !KILLED_3000!==0 (
    echo       No process found on port 3000.
) else (
    echo       Frontend stopped.
)
echo.

REM --- Also kill any orphaned node/python processes from this project ---
echo [3/3] Cleaning up any orphaned processes...

REM Kill any remaining cmd.exe children that were spawned by start /B
REM by looking for uvicorn and next-server specifically
for /f "tokens=2" %%a in ('tasklist ^| findstr /i "uvicorn" 2^>nul') do (
    echo       Killing orphaned uvicorn process PID %%a
    taskkill /F /PID %%a >nul 2>&1
)

echo       Done.
echo.

REM --- Verify ---
echo   Verification:
set STILL_8000=0
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":8000 " ^| findstr "LISTENING" 2^>nul') do (
    set STILL_8000=1
)
if !STILL_8000!==1 (
    echo       WARNING: Port 8000 still in use!
) else (
    echo       Port 8000: Free
)

set STILL_3000=0
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":3000 " ^| findstr "LISTENING" 2^>nul') do (
    set STILL_3000=1
)
if !STILL_3000!==1 (
    echo       WARNING: Port 3000 still in use!
) else (
    echo       Port 3000: Free
)

echo.
echo ============================================
echo   All services stopped.
echo ============================================
echo.

endlocal
