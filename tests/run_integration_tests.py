#!/usr/bin/env python
"""
Master Test Runner for GigGatek Integration Tests

This script runs the integration tests in the correct sequence:
1. Authentication Tests
2. Order Management Tests  
3. Rental System Tests
4. Email Notification Tests

Usage:
    python run_integration_tests.py [options]

Options:
    --component=COMPONENT    Run tests for a specific component only
                             (auth, orders, rentals, email, or all)
    --report                 Generate HTML test report
    --setup-only             Only set up the test environment without running tests
    --help                   Show this help message
"""
import os
import sys
import time
import subprocess
import argparse
from datetime import datetime

# Components and their test modules
COMPONENTS = {
    'auth': ['tests/integration/auth/test_authentication.py'],
    'orders': ['tests/integration/orders/test_orders.py'],
    'rentals': ['tests/integration/rentals/test_rentals.py'],
    'email': ['tests/integration/email/test_email_notifications.py']
}

# The order in which components should be tested
COMPONENT_ORDER = ['auth', 'orders', 'rentals', 'email']

def parse_args():
    """Parse command line arguments"""
    parser = argparse.ArgumentParser(description='Run GigGatek integration tests')
    parser.add_argument('--component', choices=list(COMPONENTS.keys()) + ['all'], 
                        default='all', help='Run tests for a specific component only')
    parser.add_argument('--report', action='store_true', 
                        help='Generate HTML test report')
    parser.add_argument('--setup-only', action='store_true',
                        help='Only set up the test environment without running tests')
    return parser.parse_args()

def setup_test_environment():
    """Set up the test environment"""
    print("\n===== Setting Up Test Environment =====\n")
    
    # Check if the setup script exists
    if not os.path.exists('tests/setup_test_environment.sh'):
        print("Error: setup_test_environment.sh not found!")
        return False
    
    # Make the script executable
    try:
        os.chmod('tests/setup_test_environment.sh', 0o755)
    except Exception as e:
        print(f"Error making setup script executable: {e}")
    
    # Run the setup script
    try:
        result = subprocess.run(['bash', 'tests/setup_test_environment.sh'], 
                               check=True, text=True)
        if result.returncode != 0:
            print("Error: Test environment setup failed!")
            return False
        
        # Run the test data generator
        if os.path.exists('tests/generate_test_data.py'):
            print("\n===== Generating Test Data =====\n")
            subprocess.run(['python', 'tests/generate_test_data.py'], check=True, text=True)
        
        return True
    except subprocess.CalledProcessError as e:
        print(f"Error during test environment setup: {e}")
        return False
    except Exception as e:
        print(f"Unexpected error during test environment setup: {e}")
        return False

def run_tests(component, report=False):
    """Run the tests for a specified component or all components"""
    if component == 'all':
        components_to_run = COMPONENT_ORDER
    else:
        components_to_run = [component]
    
    start_time = time.time()
    results = {}
    
    # Create results directory if not exists
    os.makedirs('tests/results', exist_ok=True)
    
    # Run tests for each component in order
    for comp in components_to_run:
        print(f"\n===== Running {comp.title()} Integration Tests =====\n")
        
        # Build pytest command
        cmd = ['pytest', '-v']
        
        # Add HTML report if requested
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        if report:
            report_file = f"tests/results/{comp}_integration_tests_{timestamp}.html"
            cmd.extend(['--html', report_file, '--self-contained-html'])
        
        # Add test modules
        cmd.extend(COMPONENTS[comp])
        
        # Run the tests
        try:
            result = subprocess.run(cmd, text=True)
            results[comp] = result.returncode == 0
            
            if result.returncode != 0:
                print(f"\n❌ {comp.title()} tests failed!")
                
                # If a component fails, skip dependent components
                if comp == 'auth':
                    print("\n⚠️ Authentication tests failed, skipping remaining components.")
                    break
            else:
                print(f"\n✅ {comp.title()} tests completed successfully!")
                
            # Pause between component runs
            if comp != components_to_run[-1]:
                print("\nPausing before next component...")
                time.sleep(2)
                
        except Exception as e:
            print(f"Error running {comp} tests: {e}")
            results[comp] = False
    
    # Print summary
    end_time = time.time()
    duration = end_time - start_time
    
    print("\n===== Integration Test Summary =====\n")
    print(f"Total run time: {duration:.2f} seconds")
    
    all_passed = all(results.values())
    for comp, passed in results.items():
        status = "✅ PASSED" if passed else "❌ FAILED"
        print(f"{comp.title()}: {status}")
    
    if report:
        print("\nHTML reports generated in tests/results/ directory")
    
    return all_passed

def main():
    """Main function"""
    args = parse_args()
    
    # Setup test environment
    if not setup_test_environment():
        sys.exit(1)
    
    if args.setup_only:
        print("\nTest environment setup complete. Exiting without running tests.")
        sys.exit(0)
    
    # Run tests
    all_passed = run_tests(args.component, args.report)
    
    # Exit with appropriate code
    sys.exit(0 if all_passed else 1)

if __name__ == "__main__":
    main()
