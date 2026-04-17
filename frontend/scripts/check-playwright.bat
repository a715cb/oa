@echo off
chcp 65001 >nul
echo ========================================
echo Check Playwright Chromium Status
echo ========================================

set CACHE_DIR=%LOCALAPPDATA%\ms-playwright
echo Checking cache directory: %CACHE_DIR%

if exist "%CACHE_DIR%" (
    dir /AD /B "%CACHE_DIR%\chromium-*" 2>nul | findstr . >nul
    if not errorlevel 1 (
        echo [OK] Chromium is installed
        dir /AD /B "%CACHE_DIR%\chromium-*" 2>nul
        echo Chromium browser is already installed, skipping installation
        exit /b 0
    )
)

echo [WARN] Chromium not found, starting installation...
echo ========================================
echo Installing Playwright Chromium...
echo ========================================

pushd "%~dp0.."
call npx playwright install chromium
set RESULT=%ERRORLEVEL%
popd

if %RESULT% EQU 0 (
    echo [OK] Installation successful
    exit /b 0
) else (
    echo [ERROR] Installation failed
    exit /b %RESULT%
)
