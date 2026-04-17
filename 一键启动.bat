@echo off
chcp 65001 >nul
title One-Click Start Services

echo ========================================
echo   One-Click Start Services
echo ========================================
echo.

:: Check PHP
where php >nul 2>nul
if %errorlevel% neq 0 goto phperr
echo [OK] PHP found
goto checknode

:phperr
echo [ERROR] PHP not found. Please install PHP 8.0+
pause
exit /b 1

:checknode
:: Check Node.js
where node >nul 2>nul
if %errorlevel% neq 0 goto nodeerr
echo [OK] Node.js found
goto start

:nodeerr
echo [ERROR] Node.js not found. Please install Node.js
pause
exit /b 1

:start
echo.
echo Starting backend service...
start "Backend-ThinkPHP" cmd /c "cd /d %~dp0backend & echo. & echo ======================================== & echo   Backend Service Starting & echo ======================================== & echo. & php think run"

timeout /t 2 /nobreak >nul

echo Starting frontend service...
start "Frontend-Vite" cmd /c "cd /d %~dp0frontend & echo. & echo ======================================== & echo   Frontend Service Starting & echo ======================================== & echo. & npm run dev"

echo.
echo ========================================
echo   Services started
echo ========================================
echo.
echo Backend:  http://localhost:8000
echo Frontend: http://localhost:5173
echo.
echo Press any key to close this window...
pause >nul
exit /b 0
