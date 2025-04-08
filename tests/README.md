# GigGatek Integration Testing Framework

This directory contains a comprehensive integration testing framework for the GigGatek platform. The tests verify the correct interaction between the various components of the system, ensuring that they work together as expected.

## Overview

The integration tests are structured to test the major components of the GigGatek platform:

1. **Authentication System**: User registration, login, token management, profile management
2. **Order Management System**: Product purchase, checkout, order tracking
3. **Rental Management System**: Rent-to-own contracts, payment scheduling, contract management
4. **Email Notification System**: Transactional and marketing email communications

## Directory Structure

```
tests/
├── setup_test_environment.sh       # Environment setup script
├── generate_test_data.py           # Test data generator
├── run_integration_tests.py        # Master test runner
├── README.md                       # This file
└── integration/
    ├── auth/                       # Authentication tests
    │   └── test_authentication.py
    ├── orders/                     # Order management tests
    │   └── test_orders.py
    ├── rentals/                    # Rental system tests
    │   └── test_rentals.py
    └── email/                      # Email notification tests
        └── test_email_notifications.py
```

## Getting Started

### Prerequisites

- Python 3.8+
- MySQL database server
- SMTP server for email testing (MailHog recommended)
- Python dependencies:
  - pytest
  - requests
  - pytest-html
  - pymysql
  - pytest-dotenv
  - faker
  - bcrypt

### Setting Up the Test Environment

Use the provided setup script to prepare your test environment:

```bash
bash tests/setup_test_environment.sh
```

This script will:
1. Create the required directory structure
2. Set up a test database
3. Create configuration files
4. Install required dependencies
5. Generate test data

### Running the Tests

The main test runner script provides several options for running the tests:

```bash
# Run all tests in the correct sequence
python tests/run_integration_tests.py

# Generate HTML reports
python tests/run_integration_tests.py --report

# Run tests for a specific component
python tests/run_integration_tests.py --component=auth
python tests/run_integration_tests.py --component=orders
python tests/run_integration_tests.py --component=rentals
python tests/run_integration_tests.py --component=email

# Only set up the environment without running tests
python tests/run_integration_tests.py --setup-only
```

## Test Components

### Authentication Tests

Authentication tests verify:
- User registration
- Login/logout
- Token validation
- Password reset
- Profile management

### Order Management Tests

Order tests verify:
- Shopping cart functionality
- Checkout process
- Order creation and status updates
- Payment processing via Stripe
- Order history and tracking

### Rental System Tests

Rental tests verify:
- Rental contract creation
- Contract signing
- Payment scheduling and processing
- Early buyout calculations
- Rental cancellation

### Email Notification Tests

Email tests verify:
- Welcome emails on registration
- Order confirmation emails
- Shipping notifications
- Rental contract emails
- Payment reminders and confirmations

## Continuous Integration

The integration tests are configured to run in CI/CD pipelines. A GitHub Actions workflow (`/.github/workflows/integration-tests.yml`) is provided to run the tests automatically:

- On pushes to the main branch
- On pull requests to the main branch
- Nightly at 2 AM UTC

The workflow:
1. Sets up the test environment
2. Runs all component tests
3. Generates HTML reports
4. Uploads test results as artifacts

## Test Data

Test data is generated using `tests/generate_test_data.py`, which creates:

- Test users with various roles
- Products with different categories and rental eligibility
- User addresses
- Test orders with various statuses
- Rental contracts in different states

## Mocking External Services

The tests use a variety of mocking strategies:

- **MailHog**: For capturing and testing email notifications
- **Stripe Test Mode**: For simulating payment processing
- **In-memory Databases**: For certain components that don't require persistent storage

## Contributing

When adding new tests or modifying existing ones:

1. Follow the existing structure and naming conventions
2. Ensure tests are isolated and don't depend on other tests
3. Use fixtures for common setup/teardown
4. Add appropriate assertions for verification
5. Update documentation when adding new tests
6. Verify the tests run successfully in the CI pipeline

## Troubleshooting

Common issues and solutions:

### Database Connection Issues

If tests fail to connect to the database:
- Verify the database server is running
- Check the credentials in .env.test
- Ensure the test database exists

### Email Testing Issues

If email tests fail:
- Verify MailHog is running on the correct ports
- Check the SMTP configuration in .env.test
- Examine MailHog's web interface at http://localhost:8025

### API Connection Issues

If tests cannot connect to the API:
- Verify the backend server is running
- Check the API URL in the test configuration
- Look for CORS issues in the backend logs

## Additional Documentation

For more detailed information, refer to:

- [Authentication Integration Testing Guide](../AUTHENTICATION_INTEGRATION_TESTING.md)
- [Order Integration Testing Guide](../ORDER_INTEGRATION_TESTING.md)
- [Rental Integration Testing Guide](../RENTAL_INTEGRATION_TESTING.md)
- [Email Notification Integration Testing Guide](../EMAIL_NOTIFICATION_INTEGRATION_TESTING.md)
- [Master Integration Testing Plan](../MASTER_INTEGRATION_TESTING_PLAN.md)
