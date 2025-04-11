# API Performance Monitoring Script
# This script runs the API performance monitoring tools

param (
    [string]$action = "all",
    [string]$baseUrl = "http://localhost:8000/api/v1",
    [string]$outputDir = "./performance_reports",
    [int]$interval = 60,
    [int]$duration = 3600,
    [switch]$applyLimits = $false
)

# Create output directory if it doesn't exist
if (-not (Test-Path $outputDir)) {
    New-Item -ItemType Directory -Path $outputDir | Out-Null
    Write-Host "Created output directory: $outputDir"
}

# Function to run the performance monitor
function Run-PerformanceMonitor {
    param (
        [string]$baseUrl,
        [string]$outputFile
    )
    
    Write-Host "Running performance monitor..."
    python backend/scripts/performance_monitor.py `
        --base-url $baseUrl `
        --endpoints "/products" "/products/1" "/orders" "/rentals" `
        --requests 50 `
        --concurrency 5 `
        --output html `
        --output-file $outputFile
    
    Write-Host "Performance report saved to: $outputFile"
}

# Function to run the rate limit optimizer
function Run-RateLimitOptimizer {
    param (
        [string]$dataDir,
        [string]$outputFile
    )
    
    Write-Host "Running rate limit optimizer..."
    python backend/scripts/rate_limit_optimizer.py `
        --data-dir $dataDir `
        --days 7 `
        --output json `
        --output-file $outputFile `
        --safety-factor 1.5
    
    Write-Host "Rate limit recommendations saved to: $outputFile"
}

# Function to apply rate limits
function Apply-RateLimits {
    param (
        [string]$recommendationsFile,
        [string]$configFile
    )
    
    Write-Host "Applying rate limits..."
    python backend/scripts/apply_rate_limits.py `
        --recommendations-file $recommendationsFile `
        --config-file $configFile `
        --apply-all
    
    Write-Host "Rate limits applied"
}

# Function to start continuous monitoring
function Start-ContinuousMonitoring {
    param (
        [string]$baseUrl,
        [int]$interval,
        [int]$threshold = 500,
        [double]$errorThreshold = 0.1,
        [string]$logFile,
        [string]$dataDir
    )
    
    Write-Host "Starting continuous monitoring..."
    Write-Host "Press Ctrl+C to stop monitoring"
    
    python backend/scripts/monitor_api_performance.py `
        --base-url $baseUrl `
        --interval $interval `
        --threshold $threshold `
        --error-threshold $errorThreshold `
        --log-file $logFile `
        --data-dir $dataDir
}

# Main script logic
$timestamp = Get-Date -Format "yyyyMMddHHmmss"

switch ($action) {
    "monitor" {
        $outputFile = Join-Path $outputDir "performance_report_$timestamp.html"
        Run-PerformanceMonitor -baseUrl $baseUrl -outputFile $outputFile
    }
    "optimize" {
        $outputFile = Join-Path $outputDir "rate_limit_recommendations_$timestamp.json"
        Run-RateLimitOptimizer -dataDir "./data/analytics" -outputFile $outputFile
        
        if ($applyLimits) {
            Apply-RateLimits -recommendationsFile $outputFile -configFile "./config/rate_limits.json"
        }
    }
    "continuous" {
        $logFile = Join-Path $outputDir "api_performance_$timestamp.log"
        $dataDir = Join-Path $outputDir "performance_data_$timestamp"
        Start-ContinuousMonitoring -baseUrl $baseUrl -interval $interval -logFile $logFile -dataDir $dataDir
    }
    "all" {
        # Run performance monitor
        $performanceReport = Join-Path $outputDir "performance_report_$timestamp.html"
        Run-PerformanceMonitor -baseUrl $baseUrl -outputFile $performanceReport
        
        # Run rate limit optimizer
        $recommendationsFile = Join-Path $outputDir "rate_limit_recommendations_$timestamp.json"
        Run-RateLimitOptimizer -dataDir "./data/analytics" -outputFile $recommendationsFile
        
        if ($applyLimits) {
            Apply-RateLimits -recommendationsFile $recommendationsFile -configFile "./config/rate_limits.json"
        }
        
        # Ask if user wants to start continuous monitoring
        $startContinuous = Read-Host "Do you want to start continuous monitoring? (y/n)"
        if ($startContinuous -eq "y") {
            $logFile = Join-Path $outputDir "api_performance_$timestamp.log"
            $dataDir = Join-Path $outputDir "performance_data_$timestamp"
            Start-ContinuousMonitoring -baseUrl $baseUrl -interval $interval -logFile $logFile -dataDir $dataDir
        }
    }
    default {
        Write-Host "Invalid action: $action"
        Write-Host "Valid actions: monitor, optimize, continuous, all"
    }
}

Write-Host "Done!"
