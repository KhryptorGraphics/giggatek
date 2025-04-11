Write-Host "Setting up GigGatek Mock API Server..." -ForegroundColor Green

Set-Location -Path .\mock-api
npm install
Write-Host ""
Write-Host "Installation complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Starting Mock API Server..." -ForegroundColor Green
Write-Host ""
npm start
