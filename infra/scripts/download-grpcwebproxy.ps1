$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$toolsDir = Join-Path (Split-Path -Parent $scriptDir) "tools"

New-Item -ItemType Directory -Force -Path $toolsDir | Out-Null

Write-Host "Fetching latest grpc-web release metadata..."
$release = Invoke-RestMethod -Uri "https://api.github.com/repos/improbable-eng/grpc-web/releases/latest"

$asset = $release.assets |
  Where-Object {
    ($_.name -match "win64\.exe\.zip$" -or $_.name -match "windows.*\.zip$")
  } |
  Select-Object -First 1

if (-not $asset) {
  throw "Could not find a Windows x64 zip asset in the latest release."
}

$zipPath = Join-Path $toolsDir $asset.name
Write-Host "Downloading $($asset.name)..."
Invoke-WebRequest -Uri $asset.browser_download_url -OutFile $zipPath

Write-Host "Extracting archive..."
Expand-Archive -Path $zipPath -DestinationPath $toolsDir -Force

$exe = Get-ChildItem -Path $toolsDir -Recurse -Filter "grpcwebproxy*.exe" | Select-Object -First 1
if (-not $exe) {
  throw "Download completed, but no grpcwebproxy executable was found after extraction."
}

Write-Host "grpcwebproxy is ready at: $($exe.FullName)"
