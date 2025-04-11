<?php
/**
 * Simple Test Script
 * 
 * This script is a simple test to verify that the testing setup works.
 */

// Set error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Test functions
function runTests() {
    echo "Starting Simple Test\n";
    echo "-------------------\n\n";
    
    // Test a simple assertion
    testSimpleAssertion();
    
    echo "\nAll tests completed!\n";
}

function testSimpleAssertion() {
    echo "Test: Simple Assertion\n";
    
    // A simple assertion that should pass
    $result = 2 + 2;
    
    if ($result === 4) {
        echo "✓ Assertion passed: 2 + 2 = 4\n";
    } else {
        echo "✗ Assertion failed: 2 + 2 = $result\n";
        exit(1);
    }
}

// Run the tests
runTests();

// Return success
return true;
