#!/bin/bash

# Run all integration tests
echo "Running GigGatek Integration Tests"
echo "=================================="
echo ""

# Make sure the tests directory exists
if [ ! -d "tests" ]; then
    echo "Error: tests directory not found!"
    exit 1
fi

# Run the PHP test runner
php tests/run_integration_tests.php

# Check the exit code
if [ $? -eq 0 ]; then
    echo ""
    echo "All tests passed successfully!"
    exit 0
else
    echo ""
    echo "Some tests failed. Please check the output above for details."
    exit 1
fi
