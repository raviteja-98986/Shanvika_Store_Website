$ErrorActionPreference = "Stop"
$projectRoot = Split-Path -Parent $PSScriptRoot
$corsFile = Join-Path $projectRoot "cors.json"

if (-not (Test-Path $corsFile)) {
  Write-Error "Missing cors.json at $corsFile"
}

$buckets = @(
  "gs://shanvika-rice-store.firebasestorage.app",
  "gs://shanvika-rice-store.appspot.com"
)

if (-not (Get-Command gcloud -ErrorAction SilentlyContinue)) {
  Write-Host ""
  Write-Host "Google Cloud SDK (gcloud) is not installed on this machine."
  Write-Host "Apply CORS from Google Cloud Shell (https://console.cloud.google.com):"
  Write-Host ""
  foreach ($bucket in $buckets) {
    Write-Host "  gcloud storage buckets update $bucket --cors-file=cors.json"
  }
  Write-Host ""
  Write-Host "Upload cors.json to Cloud Shell first, or paste its contents into a cors.json file there."
  exit 1
}

foreach ($bucket in $buckets) {
  Write-Host "Applying CORS to $bucket ..."
  gcloud storage buckets update $bucket --cors-file=$corsFile
}

Write-Host "Done. Also run: firebase login && npm run deploy:rules"
