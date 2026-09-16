# One-click dev launcher for ThermalSentinel (Windows PowerShell)
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $MyInvocation.MyCommand.Path

# ---- backend
$be = Join-Path $root "backend"
if (-not (Test-Path "$be\.venv")) {
    Write-Host "Creating Python venv..." -ForegroundColor Cyan
    python -m venv "$be\.venv"
    & "$be\.venv\Scripts\python.exe" -m pip install -q -r "$be\requirements.txt"
}
if (-not (Test-Path "$be\.env") -and (Test-Path "$be\.env.example")) { Copy-Item "$be\.env.example" "$be\.env" }
Write-Host "Starting API on http://127.0.0.1:8000 (docs: /docs)" -ForegroundColor Green
Start-Process -FilePath "$be\.venv\Scripts\python.exe" -ArgumentList "-m uvicorn app.main:app --host 127.0.0.1 --port 8000" -WorkingDirectory $be

# ---- frontend
$fe = Join-Path $root "frontend"
if (-not (Test-Path "$fe\node_modules")) {
    Write-Host "Installing npm packages..." -ForegroundColor Cyan
    Push-Location $fe; npm install --no-audit --no-fund; Pop-Location
}
Write-Host "Starting dashboard on http://localhost:5173" -ForegroundColor Green
Start-Process -FilePath "cmd.exe" -ArgumentList "/k npm run dev" -WorkingDirectory $fe
Start-Sleep 4
Start-Process "http://localhost:5173"
