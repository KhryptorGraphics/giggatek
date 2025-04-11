#!/usr/bin/env python3
"""
Test Runner for GigGatek Integration Tests
"""

import os
import sys
import subprocess
import glob

def main():
    """Run all integration tests"""
    print("Running GigGatek Integration Tests")
    print("==================================")
    print("")

    # Make sure the tests directory exists
    if not os.path.isdir("tests"):
        print("Error: tests directory not found!")
        return 1

    # Find all test files
    test_files = glob.glob("tests/integration/test_*.php")
    
    if not test_files:
        print("Error: No test files found in tests/integration/")
        return 1
    
    print(f"Found {len(test_files)} test files")
    print("")
    
    # Try to find PHP executable
    php_executable = find_php_executable()
    if not php_executable:
        print("Error: PHP executable not found!")
        print("Please make sure PHP is installed and in your PATH")
        return 1
    
    # Run each test file
    failed_tests = []
    passed_tests = []
    
    for test_file in test_files:
        test_name = os.path.basename(test_file)
        print(f"Running test: {test_name}")
        print("-" * (len(test_name) + 13))
        
        try:
            # Run the test
            result = subprocess.run([php_executable, test_file], 
                                   capture_output=True, 
                                   text=True)
            
            # Print the output
            print(result.stdout)
            
            if result.returncode == 0:
                passed_tests.append(test_name)
                print(f"✓ Test passed: {test_name}")
            else:
                failed_tests.append(test_name)
                print(f"✗ Test failed: {test_name}")
                print(f"Error: {result.stderr}")
            
            print("")
        except Exception as e:
            failed_tests.append(test_name)
            print(f"✗ Test failed: {test_name}")
            print(f"Error: {str(e)}")
            print("")
    
    # Print summary
    print("Test Summary")
    print("===========")
    print(f"Total tests: {len(test_files)}")
    print(f"Passed: {len(passed_tests)}")
    print(f"Failed: {len(failed_tests)}")
    
    if failed_tests:
        print("\nFailed tests:")
        for test in failed_tests:
            print(f"  - {test}")
    
    return 1 if failed_tests else 0

def find_php_executable():
    """Find the PHP executable"""
    # Try common PHP executable names
    for name in ["php", "php.exe", "php7", "php8"]:
        try:
            # Check if the executable exists
            result = subprocess.run(["where", name] if sys.platform == "win32" else ["which", name], 
                                   capture_output=True, 
                                   text=True)
            if result.returncode == 0:
                return name
        except:
            pass
    
    # Try common PHP installation paths
    common_paths = [
        "C:\\php\\php.exe",
        "C:\\xampp\\php\\php.exe",
        "C:\\laragon\\bin\\php\\php-7.4.19-Win32-vc15-x64\\php.exe",
        "/usr/bin/php",
        "/usr/local/bin/php"
    ]
    
    for path in common_paths:
        if os.path.isfile(path):
            return path
    
    return None

if __name__ == "__main__":
    sys.exit(main())
