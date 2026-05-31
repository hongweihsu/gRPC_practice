$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$toolsDir = Join-Path (Split-Path -Parent $scriptDir) "tools"

$exe = Get-ChildItem -Path $toolsDir -Recurse -Filter "grpcwebproxy*.exe" | Select-Object -First 1
if (-not $exe) {
  throw "grpcwebproxy executable not found. Run infra/scripts/download-grpcwebproxy.ps1 first."
}

Write-Host "Starting grpcwebproxy on http://localhost:8080 ..."
& $exe.FullName `
  --backend_addr=localhost:50051 `
  --backend_tls=false `
  --run_tls_server=false `
  --server_http_debug_port=8080 `
  --allow_all_origins
