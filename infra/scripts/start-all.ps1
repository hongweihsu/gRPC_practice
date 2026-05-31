$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot = Split-Path -Parent (Split-Path -Parent $scriptDir)
$runtimeDir = Join-Path $repoRoot "infra/.runtime"
$toolsDir = Join-Path $repoRoot "infra/tools"
$pidsPath = Join-Path $runtimeDir "pids.json"

function Test-PortListening {
  param([int]$Port)

  $result = netstat -ano | Select-String ":$Port"
  return $null -ne $result
}

New-Item -ItemType Directory -Force -Path $runtimeDir | Out-Null

$grpcwebproxyExe = Get-ChildItem -Path $toolsDir -Recurse -Filter "grpcwebproxy*.exe" -ErrorAction SilentlyContinue | Select-Object -First 1
if (-not $grpcwebproxyExe) {
  throw "grpcwebproxy executable not found. Run infra/scripts/download-grpcwebproxy.ps1 first."
}

$backendDir = Join-Path $repoRoot "backend"
$frontendDir = Join-Path $repoRoot "frontend/grpc-web-demo"

if (-not (Test-Path $backendDir)) {
  throw "Backend folder not found: $backendDir"
}

if (-not (Test-Path $frontendDir)) {
  throw "Frontend folder not found: $frontendDir"
}

Write-Host "Starting backend (50051)..."
$backendPid = $null
if (Test-PortListening -Port 50051) {
  Write-Host "- port 50051 is already in use, skipping backend start."
} else {
  $backendProc = Start-Process -FilePath "npm" -ArgumentList "start" -WorkingDirectory $backendDir -WindowStyle Minimized -PassThru
  $backendPid = $backendProc.Id
}

Write-Host "Starting grpcwebproxy (8080)..."
$proxyPid = $null
if (Test-PortListening -Port 8080) {
  Write-Host "- port 8080 is already in use, skipping grpcwebproxy start."
} else {
  $proxyArgs = @(
    "--backend_addr=localhost:50051",
    "--backend_tls=false",
    "--run_tls_server=false",
    "--server_http_debug_port=8080",
    "--allow_all_origins"
  )
  $proxyProc = Start-Process -FilePath $grpcwebproxyExe.FullName -ArgumentList $proxyArgs -WorkingDirectory $repoRoot -WindowStyle Minimized -PassThru
  $proxyPid = $proxyProc.Id
}

Write-Host "Starting frontend (4200)..."
$frontendPid = $null
if (Test-PortListening -Port 4200) {
  Write-Host "- port 4200 is already in use, skipping frontend start."
} else {
  $frontendProc = Start-Process -FilePath "npm" -ArgumentList "start" -WorkingDirectory $frontendDir -WindowStyle Minimized -PassThru
  $frontendPid = $frontendProc.Id
}

$pids = [ordered]@{
  startedAt = (Get-Date).ToString("o")
  backendPid = $backendPid
  grpcwebproxyPid = $proxyPid
  frontendPid = $frontendPid
}

$pids | ConvertTo-Json | Set-Content -Path $pidsPath -Encoding UTF8

Write-Host "All services started."
Write-Host "- backend PID: $backendPid"
Write-Host "- grpcwebproxy PID: $proxyPid"
Write-Host "- frontend PID: $frontendPid"
Write-Host "Use infra/scripts/stop-all.ps1 to stop everything."
