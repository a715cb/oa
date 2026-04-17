param(
    [string]$TestFile,
    [string]$Grep,
    [switch]$UI,
    [switch]$Report,
    [switch]$Auth,
    [switch]$System,
    [switch]$Performance,
    [switch]$Headless,
    [switch]$SkipBrowserCheck,
    [string]$Project = 'chromium',
    [string]$BaseUrl
)

$OutputEncoding = [System.Text.Encoding]::UTF8
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
chcp 65001 >$null
$env:PYTHONIOENCODING = 'utf-8'
$env:LESSCHARSET = 'utf-8'

# Chromium browser check and install
if (-not $SkipBrowserCheck) {
    Write-Host "Checking Playwright Chromium browser..." -ForegroundColor Cyan
    
    $cacheDir = "$env:LOCALAPPDATA\ms-playwright"
    $chromiumFound = $false
    
    if (Test-Path $cacheDir) {
        $items = Get-ChildItem $cacheDir -ErrorAction SilentlyContinue | Where-Object { $_.Name -like "chromium-*" -and $_.PSIsContainer }
        if ($items) {
            $chromiumFound = $true
            Write-Host "Chromium browser found" -ForegroundColor Green
        }
    }
    
    if (-not $chromiumFound) {
        Write-Host "Chromium not found, installing..." -ForegroundColor Yellow
        Push-Location (Join-Path $PSScriptRoot "..")
        npx playwright install chromium
        $result = $LASTEXITCODE
        Pop-Location
        if ($result -ne 0) {
            Write-Host "Chromium installation failed!" -ForegroundColor Red
            exit 1
        }
        Write-Host "Chromium installed successfully" -ForegroundColor Green
    }
} else {
    Write-Host "Skipping Chromium browser check (--SkipBrowserCheck)" -ForegroundColor Gray
}

# Set environment variables
if ($Headless) {
    $env:HEADLESS = 'true'
}

if ($BaseUrl) {
    $env:BASE_URL = $BaseUrl
}

# Build command
$cmd = "npx playwright test"

# Determine test type based on parameters
if ($Auth) {
    $cmd += " e2e/tests/auth"
} elseif ($System) {
    $cmd += " e2e/tests/system"
} elseif ($Performance) {
    $cmd += " e2e/tests/performance"
} elseif ($Report) {
    $cmd += " --config=playwright-report.config.ts show-report"
} else {
    $cmd += " --project=$Project"
}

# UI mode
if ($UI) {
    $cmd += " --ui"
}

# Specific test file
if ($TestFile) {
    $cmd += " $TestFile"
}

# Grep filter
if ($Grep) {
    $cmd += " --grep `"$Grep`""
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "E2E Test Runner" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Running: $cmd" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan

# Execute command
Invoke-Expression $cmd
