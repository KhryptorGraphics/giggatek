# Generate API documentation using ReDoc
Write-Host "Generating API Documentation" -ForegroundColor Cyan
Write-Host "===========================" -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "Error: Node.js is not installed or not in PATH!" -ForegroundColor Red
    Write-Host "Please run setup_environment.ps1 to install Node.js" -ForegroundColor Red
    exit 1
}

# Check if npm is installed
if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    Write-Host "Error: npm is not installed or not in PATH!" -ForegroundColor Red
    Write-Host "Please run setup_environment.ps1 to install Node.js and npm" -ForegroundColor Red
    exit 1
}

# Check if redoc-cli is installed
$redocInstalled = $false
try {
    $redocVersion = & npx redoc-cli --version 2>&1
    $redocInstalled = $true
}
catch {
    $redocInstalled = $false
}

if (-not $redocInstalled) {
    Write-Host "Installing redoc-cli..." -ForegroundColor Yellow
    & npm install -g redoc-cli
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Error: Failed to install redoc-cli!" -ForegroundColor Red
        exit 1
    }
}

# Check if the OpenAPI spec file exists
if (-not (Test-Path "docs/api/openapi.yaml")) {
    Write-Host "Error: OpenAPI spec file not found at docs/api/openapi.yaml!" -ForegroundColor Red
    exit 1
}

# Create output directory if it doesn't exist
if (-not (Test-Path "docs/api/html")) {
    New-Item -ItemType Directory -Path "docs/api/html" | Out-Null
}

# Generate HTML documentation
Write-Host "Generating HTML documentation..." -ForegroundColor Yellow
& npx redoc-cli bundle docs/api/openapi.yaml -o docs/api/html/index.html

if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Failed to generate HTML documentation!" -ForegroundColor Red
    exit 1
}

# Generate Swagger UI documentation
Write-Host "Generating Swagger UI documentation..." -ForegroundColor Yellow

# Create Swagger UI HTML file
$swaggerHtml = @"
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>GigGatek API - Swagger UI</title>
    <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@4.5.0/swagger-ui.css" />
    <style>
        body {
            margin: 0;
            padding: 0;
        }
        #swagger-ui {
            max-width: 1460px;
            margin: 0 auto;
            padding: 20px;
        }
    </style>
</head>
<body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@4.5.0/swagger-ui-bundle.js"></script>
    <script>
        window.onload = function() {
            const ui = SwaggerUIBundle({
                url: "../openapi.yaml",
                dom_id: '#swagger-ui',
                deepLinking: true,
                presets: [
                    SwaggerUIBundle.presets.apis,
                    SwaggerUIBundle.SwaggerUIStandalonePreset
                ],
                layout: "BaseLayout",
                syntaxHighlight: {
                    activated: true,
                    theme: "agate"
                }
            });
            window.ui = ui;
        };
    </script>
</body>
</html>
"@

$swaggerHtml | Out-File -FilePath "docs/api/html/swagger.html" -Encoding utf8

Write-Host "Documentation generated successfully!" -ForegroundColor Green
Write-Host "ReDoc: docs/api/html/index.html" -ForegroundColor Green
Write-Host "Swagger UI: docs/api/html/swagger.html" -ForegroundColor Green

# Open documentation in browser
$openDocs = Read-Host "Do you want to open the documentation in your browser? (y/n)"
if ($openDocs -eq "y" -or $openDocs -eq "Y") {
    Start-Process "docs/api/html/index.html"
}

exit 0
