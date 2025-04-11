# Run all integration tests for GigGatek
Write-Host "Running GigGatek Integration Tests" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Make sure the tests directory exists
if (-not (Test-Path "tests")) {
    Write-Host "Error: tests directory not found!" -ForegroundColor Red
    exit 1
}

# Find all test files
$testFiles = Get-ChildItem -Path "tests/integration" -Filter "test_*.php" -Recurse

if ($testFiles.Count -eq 0) {
    Write-Host "Error: No test files found in tests/integration/" -ForegroundColor Red
    exit 1
}

Write-Host "Found $($testFiles.Count) test files"
Write-Host ""

# Run each test file
$failedTests = @()
$passedTests = @()

foreach ($testFile in $testFiles) {
    $testName = $testFile.Name
    Write-Host "Running test: $testName" -ForegroundColor Yellow
    Write-Host ("-" * ($testName.Length + 13))
    
    try {
        # Run the test
        $output = & php $testFile.FullName 2>&1
        
        # Print the output
        $output | ForEach-Object { Write-Host $_ }
        
        if ($LASTEXITCODE -eq 0) {
            $passedTests += $testName
            Write-Host "✓ Test passed: $testName" -ForegroundColor Green
        }
        else {
            $failedTests += $testName
            Write-Host "✗ Test failed: $testName" -ForegroundColor Red
        }
        
        Write-Host ""
    }
    catch {
        $failedTests += $testName
        Write-Host "✗ Test failed: $testName" -ForegroundColor Red
        Write-Host "Error: $_" -ForegroundColor Red
        Write-Host ""
    }
}

# Print summary
Write-Host "Test Summary" -ForegroundColor Cyan
Write-Host "===========" -ForegroundColor Cyan
Write-Host "Total tests: $($testFiles.Count)"
Write-Host "Passed: $($passedTests.Count)" -ForegroundColor Green
Write-Host "Failed: $($failedTests.Count)" -ForegroundColor Red

if ($failedTests.Count -gt 0) {
    Write-Host "`nFailed tests:" -ForegroundColor Red
    foreach ($test in $failedTests) {
        Write-Host "  - $test" -ForegroundColor Red
    }
    exit 1
}
else {
    Write-Host "`nAll tests passed successfully!" -ForegroundColor Green
    exit 0
}
