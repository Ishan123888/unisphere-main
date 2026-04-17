# ============================================================
# UniSphere — One-Click Setup Script (PowerShell)
# Run this ONCE before starting the project for the first time
# Usage: Right-click > Run with PowerShell
#        OR: powershell -ExecutionPolicy Bypass -File setup.ps1
# ============================================================

$MYSQL   = "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe"
$DB_USER = "root"
$DB_PASS = "osloCC@123"
$SCRIPT_DIR = Split-Path -Parent $MyInvocation.MyCommand.Path
$ROOT_DIR   = Split-Path -Parent $SCRIPT_DIR

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "   UniSphere — Project Setup" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# ── Step 1: Create Databases ─────────────────────────────────
Write-Host "[1/4] Creating databases..." -ForegroundColor Yellow

$createDB = @"
CREATE DATABASE IF NOT EXISTS unisphere_identity  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS study_lobby_db      CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS online_marketplace  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS unisphere_portfolio CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
SHOW DATABASES;
"@

$createDB | & $MYSQL -u $DB_USER -p"$DB_PASS" 2>&1 | Where-Object { $_ -notmatch "Warning" }
Write-Host "  ✓ Databases ready" -ForegroundColor Green

# ── Step 2: Set JAVA_HOME ─────────────────────────────────────
Write-Host ""
Write-Host "[2/4] Setting JAVA_HOME..." -ForegroundColor Yellow
$env:JAVA_HOME = "C:\Program Files\Java\jdk-17"
$env:Path = "$env:JAVA_HOME\bin;$env:Path"
Write-Host "  ✓ JAVA_HOME = $env:JAVA_HOME" -ForegroundColor Green

# ── Step 3: Install frontend dependencies ────────────────────
Write-Host ""
Write-Host "[3/4] Installing frontend dependencies..." -ForegroundColor Yellow

$frontendPath   = Join-Path $ROOT_DIR "unisphere-frontend"
$marketplacePath = Join-Path $ROOT_DIR "online-marketplace\client"

if (Test-Path (Join-Path $frontendPath "package.json")) {
    Write-Host "  Installing unisphere-frontend..." -ForegroundColor Gray
    Push-Location $frontendPath
    npm install --silent 2>&1 | Out-Null
    Pop-Location
    Write-Host "  ✓ unisphere-frontend ready" -ForegroundColor Green
}

if (Test-Path (Join-Path $marketplacePath "package.json")) {
    Write-Host "  Installing marketplace client..." -ForegroundColor Gray
    Push-Location $marketplacePath
    npm install --silent 2>&1 | Out-Null
    Pop-Location
    Write-Host "  ✓ marketplace client ready" -ForegroundColor Green
}

# ── Step 4: Register demo accounts via API ───────────────────
Write-Host ""
Write-Host "[4/4] Demo accounts will be created when identity-service starts." -ForegroundColor Yellow
Write-Host "  Run the seed script after services are up:" -ForegroundColor Gray
Write-Host "  > scripts\seed-demo-users.ps1" -ForegroundColor Gray

# ── Done ──────────────────────────────────────────────────────
Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  Setup complete! Now start the services:" -ForegroundColor Green
Write-Host "  See scripts\start-all.md for instructions" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
