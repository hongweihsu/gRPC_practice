$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot = Split-Path -Parent (Split-Path -Parent $scriptDir)
$pidsPath = Join-Path $repoRoot "infra/.runtime/pids.json"

if (-not (Test-Path $pidsPath)) {
  Write-Host "No PID file found at infra/.runtime/pids.json. Nothing to stop."
  exit 0
}

$pids = Get-Content -Path $pidsPath -Raw | ConvertFrom-Json
$targets = @()

if ($null -ne $pids.backendPid) {
  $targets += @{ Name = "backend"; Pid = [int]$pids.backendPid }
}

if ($null -ne $pids.grpcwebproxyPid) {
  $targets += @{ Name = "grpcwebproxy"; Pid = [int]$pids.grpcwebproxyPid }
}

if ($null -ne $pids.frontendPid) {
  $targets += @{ Name = "frontend"; Pid = [int]$pids.frontendPid }
}

foreach ($target in $targets) {
  try {
    $proc = Get-Process -Id $target.Pid -ErrorAction Stop
    Stop-Process -Id $proc.Id -Force -ErrorAction Stop
    Write-Host "Stopped $($target.Name) (PID $($target.Pid))"
  } catch {
    Write-Host "$($target.Name) (PID $($target.Pid)) is not running."
  }
}

Remove-Item -Path $pidsPath -Force
Write-Host "Done."
