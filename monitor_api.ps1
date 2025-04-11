# Run the API monitoring script
Write-Host "Running API Monitoring Script" -ForegroundColor Cyan
Write-Host "=============================" -ForegroundColor Cyan
Write-Host ""

# Check if Python is installed
if (-not (Get-Command python -ErrorAction SilentlyContinue)) {
    Write-Host "Error: Python is not installed or not in PATH!" -ForegroundColor Red
    Write-Host "Please run setup_environment.ps1 to install Python" -ForegroundColor Red
    exit 1
}

# Parse command line arguments
param(
    [string]$TimeRange = "1h",
    [string]$Output = "console",
    [string]$OutputFile = $null,
    [switch]$Watch = $false,
    [int]$WatchInterval = 60,
    [double]$AlertThreshold = 0.05
)

# Build the command
$command = "python backend/scripts/monitor_api.py --time-range $TimeRange --output $Output"

if ($OutputFile) {
    $command += " --output-file `"$OutputFile`""
}

if ($Watch) {
    $command += " --watch --watch-interval $WatchInterval"
}

$command += " --alert-threshold $AlertThreshold"

# Run the command
Write-Host "Running command: $command" -ForegroundColor Yellow
Write-Host ""
Invoke-Expression $command
