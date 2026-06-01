# Deploy Firestore rules only (no Firebase Storage required)
$ErrorActionPreference = "Stop"
Set-Location (Split-Path -Parent $PSScriptRoot)

Write-Host ""
Write-Host "Deploying Firestore rules to shanvika-rice-store (Storage is NOT used)..." -ForegroundColor Cyan
npx firebase-tools@latest deploy --only firestore:rules

if ($LASTEXITCODE -eq 0) {
  Write-Host ""
  Write-Host "Done. Start the site with: npm run dev" -ForegroundColor Green
  Write-Host "Then open http://localhost:5173/admin and click 'Retry cloud sync' if needed." -ForegroundColor Green
}
