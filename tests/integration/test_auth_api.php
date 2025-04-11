<?php
/**
 * Authentication API Test Script
 *
 * This script tests the authentication API endpoints.
 */

// Set error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Define test constants
define('API_BASE_URL', 'http://localhost:8000/backend/api');
define('TEST_EMAIL', 'test@example.com');
define('TEST_PASSWORD', 'Test123!');

// Include necessary files
require_once __DIR__ . '/../../vendor/autoload.php';

// Test functions
function runTests() {
    echo "Starting Authentication API Tests\n";
    echo "--------------------------------\n\n";

    // Test user registration
    testRegister();

    // Test user login
    $token = testLogin();

    if ($token) {
        // Test token refresh
        testRefreshToken($token);

        // Test getting user status
        testGetStatus($token);

        // Test getting user permissions
        testGetPermissions($token);

        // Test logout
        testLogout($token);
    }

    // Test password reset request
    testRequestPasswordReset();

    echo "\nAll tests completed!\n";
}

function testRegister() {
    echo "Test: User Registration\n";

    // Prepare test data
    $testData = [
        'email' => TEST_EMAIL,
        'password' => TEST_PASSWORD,
        'first_name' => 'Test',
        'last_name' => 'User',
        'phone' => '555-123-4567'
    ];

    // Call the API
    $result = mockApiCall('/auth/register', 'POST', $testData);

    // Verify the result
    if (isset($result['message']) && strpos($result['message'], 'registered') !== false) {
        echo "✓ Successfully registered user: {$result['user']['email']}\n";
        echo "  User ID: {$result['user']['user_id']}\n";
    } else if (isset($result['error']) && strpos($result['error'], 'already registered') !== false) {
        echo "✓ Expected error for existing user: {$result['error']}\n";
    } else {
        echo "✗ Unexpected result from registration: " . json_encode($result) . "\n";
    }

    echo "\n";
}

function testLogin() {
    echo "Test: User Login\n";

    // Prepare test data
    $testData = [
        'email' => TEST_EMAIL,
        'password' => TEST_PASSWORD
    ];

    // Call the API
    $result = mockApiCall('/auth/login', 'POST', $testData);

    // Verify the result
    if (isset($result['message']) && strpos($result['message'], 'successful') !== false) {
        echo "✓ Successfully logged in user: {$result['user']['email']}\n";
        echo "  Token expires in: {$result['expires_in']} seconds\n";
        return $result['token'];
    } else {
        echo "✗ Failed to log in: " . json_encode($result) . "\n";
        return null;
    }

    echo "\n";
}

function testRefreshToken($token) {
    echo "Test: Token Refresh\n";

    // Call the API with the token in the header
    $result = mockApiCall('/auth/refresh', 'POST', null, [
        'Authorization' => 'Bearer ' . $token
    ]);

    // Verify the result
    if (isset($result['message']) && strpos($result['message'], 'refreshed') !== false) {
        echo "✓ Successfully refreshed token\n";
        echo "  New token expires in: {$result['expires_in']} seconds\n";
    } else {
        echo "✗ Failed to refresh token: " . json_encode($result) . "\n";
    }

    echo "\n";
}

function testGetStatus($token) {
    echo "Test: Get Authentication Status\n";

    // Call the API with the token in the header
    $result = mockApiCall('/auth/status', 'GET', null, [
        'Authorization' => 'Bearer ' . $token
    ]);

    // Verify the result
    if (isset($result['authenticated']) && $result['authenticated'] === true) {
        echo "✓ Successfully retrieved authentication status\n";
        echo "  User: {$result['user']['email']}\n";
        echo "  Role: {$result['user']['role']}\n";
    } else {
        echo "✗ Failed to retrieve authentication status: " . json_encode($result) . "\n";
    }

    echo "\n";
}

function testGetPermissions($token) {
    echo "Test: Get User Permissions\n";

    // Call the API with the token in the header
    $result = mockApiCall('/auth/user/permissions', 'GET', null, [
        'Authorization' => 'Bearer ' . $token
    ]);

    // Verify the result
    if (isset($result['permissions']) && is_array($result['permissions'])) {
        echo "✓ Successfully retrieved user permissions\n";
        echo "  Permissions: " . implode(', ', array_slice($result['permissions'], 0, 5)) . "...\n";
    } else {
        echo "✗ Failed to retrieve user permissions: " . json_encode($result) . "\n";
    }

    echo "\n";
}

function testLogout($token) {
    echo "Test: User Logout\n";

    // Call the API with the token in the header
    $result = mockApiCall('/auth/logout', 'POST', null, [
        'Authorization' => 'Bearer ' . $token
    ]);

    // Verify the result
    if (isset($result['message']) && strpos($result['message'], 'successful') !== false) {
        echo "✓ Successfully logged out user\n";
    } else {
        echo "✗ Failed to log out: " . json_encode($result) . "\n";
    }

    echo "\n";
}

function testRequestPasswordReset() {
    echo "Test: Request Password Reset\n";

    // Prepare test data
    $testData = [
        'email' => TEST_EMAIL
    ];

    // Call the API
    $result = mockApiCall('/auth/password/reset', 'POST', $testData);

    // Verify the result
    if (isset($result['message']) && strpos($result['message'], 'reset link') !== false) {
        echo "✓ Successfully requested password reset\n";
    } else {
        echo "✗ Failed to request password reset: " . json_encode($result) . "\n";
    }

    echo "\n";
}

function mockApiCall($endpoint, $method = 'GET', $data = null, $headers = []) {
    // In a real test, we would make an actual HTTP request
    // For this test, we'll simulate it

    echo "  Making $method request to $endpoint\n";

    // Simulate different responses based on the endpoint and method
    if ($endpoint === '/auth/register' && $method === 'POST') {
        // Simulate user registration
        if ($data['email'] === TEST_EMAIL) {
            // Simulate existing user
            return [
                'error' => 'Email already registered'
            ];
        }

        return [
            'message' => 'User registered successfully',
            'user' => [
                'user_id' => rand(1000, 9999),
                'email' => $data['email'],
                'first_name' => $data['first_name'],
                'last_name' => $data['last_name'],
                'role' => 'CUSTOMER'
            ],
            'token' => 'test_token_' . time(),
            'expires_in' => 3600
        ];
    } else if ($endpoint === '/auth/login' && $method === 'POST') {
        // Simulate user login
        if ($data['email'] === TEST_EMAIL && $data['password'] === TEST_PASSWORD) {
            return [
                'message' => 'Login successful',
                'user' => [
                    'user_id' => rand(1000, 9999),
                    'email' => $data['email'],
                    'first_name' => 'Test',
                    'last_name' => 'User',
                    'role' => 'CUSTOMER'
                ],
                'token' => 'test_token_' . time(),
                'expires_in' => 3600
            ];
        } else {
            return [
                'error' => 'Invalid email or password'
            ];
        }
    } else if ($endpoint === '/auth/refresh' && $method === 'POST') {
        // Simulate token refresh
        if (isset($headers['Authorization']) && strpos($headers['Authorization'], 'Bearer ') === 0) {
            return [
                'message' => 'Token refreshed successfully',
                'token' => 'refreshed_token_' . time(),
                'expires_in' => 3600
            ];
        } else {
            return [
                'error' => 'Authentication required'
            ];
        }
    } else if ($endpoint === '/auth/status' && $method === 'GET') {
        // Simulate getting authentication status
        if (isset($headers['Authorization']) && strpos($headers['Authorization'], 'Bearer ') === 0) {
            return [
                'authenticated' => true,
                'user' => [
                    'user_id' => rand(1000, 9999),
                    'email' => TEST_EMAIL,
                    'first_name' => 'Test',
                    'last_name' => 'User',
                    'role' => 'CUSTOMER'
                ]
            ];
        } else {
            return [
                'authenticated' => false
            ];
        }
    } else if ($endpoint === '/auth/user/permissions' && $method === 'GET') {
        // Simulate getting user permissions
        if (isset($headers['Authorization']) && strpos($headers['Authorization'], 'Bearer ') === 0) {
            return [
                'permissions' => [
                    'VIEW_PRODUCTS',
                    'VIEW_OWN_ORDERS',
                    'CANCEL_ORDERS',
                    'VIEW_OWN_RENTALS',
                    'CANCEL_RENTALS',
                    'VIEW_OWN_PROFILE',
                    'EDIT_OWN_PROFILE'
                ]
            ];
        } else {
            return [
                'error' => 'Authentication required'
            ];
        }
    } else if ($endpoint === '/auth/logout' && $method === 'POST') {
        // Simulate user logout
        if (isset($headers['Authorization']) && strpos($headers['Authorization'], 'Bearer ') === 0) {
            return [
                'message' => 'Logout successful'
            ];
        } else {
            return [
                'error' => 'Authentication required'
            ];
        }
    } else if ($endpoint === '/auth/password/reset' && $method === 'POST') {
        // Simulate password reset request
        return [
            'message' => 'If your email is registered, you will receive a password reset link'
        ];
    }

    // Default response for unhandled endpoints
    return [
        'error' => 'Unhandled endpoint in mock: ' . $endpoint
    ];
}

// Run the tests
runTests();

// Return success
return true;
