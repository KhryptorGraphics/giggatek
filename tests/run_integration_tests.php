<?php
/**
 * Integration Test Runner
 * 
 * This script runs all integration tests for the GigGatek platform.
 */

// Set error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Define test directory
define('TEST_DIR', __DIR__ . '/integration');

// Main function
function runAllTests() {
    echo "GigGatek Integration Tests\n";
    echo "=========================\n\n";
    
    // Get all test files
    $testFiles = glob(TEST_DIR . '/test_*.php');
    
    if (empty($testFiles)) {
        echo "No test files found in " . TEST_DIR . "\n";
        return;
    }
    
    $totalTests = count($testFiles);
    $passedTests = 0;
    $failedTests = 0;
    
    // Run each test file
    foreach ($testFiles as $testFile) {
        $testName = basename($testFile);
        
        echo "Running test: $testName\n";
        echo str_repeat('-', strlen("Running test: $testName")) . "\n\n";
        
        // Capture output
        ob_start();
        $startTime = microtime(true);
        
        try {
            // Run the test
            $result = include $testFile;
            $output = ob_get_clean();
            
            // Check result
            if ($result === false) {
                echo "✗ Test failed: $testName\n";
                echo "Output:\n$output\n\n";
                $failedTests++;
            } else {
                echo "✓ Test passed: $testName\n";
                echo "Output:\n$output\n\n";
                $passedTests++;
            }
        } catch (Exception $e) {
            ob_end_clean();
            echo "✗ Test threw exception: $testName\n";
            echo "Exception: " . $e->getMessage() . "\n\n";
            $failedTests++;
        }
        
        $endTime = microtime(true);
        $duration = round($endTime - $startTime, 2);
        
        echo "Test completed in $duration seconds\n\n";
        echo str_repeat('=', 50) . "\n\n";
    }
    
    // Print summary
    echo "Test Summary\n";
    echo "===========\n\n";
    echo "Total tests: $totalTests\n";
    echo "Passed: $passedTests\n";
    echo "Failed: $failedTests\n";
    
    return $failedTests === 0;
}

// Run all tests
$success = runAllTests();

// Exit with appropriate code
exit($success ? 0 : 1);
