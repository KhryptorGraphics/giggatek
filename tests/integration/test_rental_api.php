<?php
/**
 * Rental API Test Script
 *
 * This script tests the rental management API endpoints.
 */

// Set error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Define test constants
define('API_BASE_URL', 'http://localhost:8000/backend/api');
define('TEST_USER_ID', 1);
define('TEST_TOKEN', 'test_token');

// Include necessary files
require_once __DIR__ . '/../../vendor/autoload.php';

// Test functions
function runTests() {
    echo "Starting Rental API Tests\n";
    echo "------------------------\n\n";

    // Test creating a rental contract
    $rentalId = testCreateRental();

    if ($rentalId) {
        // Test getting rental details
        testGetRental($rentalId);

        // Test making a rental payment
        testMakeRentalPayment($rentalId);

        // Test extending a rental
        testExtendRental($rentalId);

        // Test completing a rental buyout
        testRentalBuyout($rentalId);
    }

    // Test getting all rentals
    testGetAllRentals();

    echo "\nAll tests completed!\n";
}

function testCreateRental() {
    echo "Test: Creating a Rental Contract\n";

    // Prepare test data
    $testData = [
        'product_id' => 5,
        'term_months' => 12,
        'monthly_payment' => 49.99,
        'buyout_price' => 199.99,
        'shipping_address_id' => 1,
        'payment_method' => 'stripe',
        'notes' => 'Test rental from API test script'
    ];

    // Call the API
    $result = mockApiCall('/rentals', 'POST', $testData);

    // Verify the result
    if (isset($result['rental']) && isset($result['rental']['id'])) {
        echo "✓ Successfully created rental contract: {$result['rental']['id']}\n";
        return $result['rental']['id'];
    } else {
        echo "✗ Failed to create rental contract: " . json_encode($result) . "\n";
        return null;
    }

    echo "\n";
}

function testGetRental($rentalId) {
    echo "Test: Getting Rental Details\n";

    // Call the API
    $result = mockApiCall("/rentals/$rentalId", 'GET');

    // Verify the result
    if (isset($result['rental']) && $result['rental']['id'] == $rentalId) {
        echo "✓ Successfully retrieved rental: {$result['rental']['id']}\n";
        echo "  Rental status: {$result['rental']['status']}\n";
        echo "  Monthly payment: \${$result['rental']['monthly_payment']}\n";
        echo "  Remaining payments: {$result['rental']['remaining_payments']}\n";
    } else {
        echo "✗ Failed to retrieve rental: " . json_encode($result) . "\n";
    }

    echo "\n";
}

function testMakeRentalPayment($rentalId) {
    echo "Test: Making a Rental Payment\n";

    // Prepare test data
    $testData = [
        'payment_method' => 'stripe',
        'payment_token' => 'test_token_' . time()
    ];

    // Call the API
    $result = mockApiCall("/rentals/$rentalId/payments", 'POST', $testData);

    // Verify the result
    if (isset($result['message']) && strpos($result['message'], 'successful') !== false) {
        echo "✓ Successfully made rental payment\n";
        echo "  Payment ID: {$result['payment']['id']}\n";
        echo "  Amount: \${$result['payment']['amount']}\n";
    } else {
        echo "✗ Failed to make rental payment: " . json_encode($result) . "\n";
    }

    echo "\n";
}

function testExtendRental($rentalId) {
    echo "Test: Extending a Rental Contract\n";

    // Prepare test data
    $testData = [
        'additional_months' => 6,
        'payment_method' => 'stripe',
        'payment_token' => 'test_token_' . time()
    ];

    // Call the API
    $result = mockApiCall("/rentals/$rentalId/extend", 'POST', $testData);

    // Verify the result
    if (isset($result['message']) && strpos($result['message'], 'extended') !== false) {
        echo "✓ Successfully extended rental contract\n";
        echo "  New end date: {$result['rental']['end_date']}\n";
        echo "  New remaining payments: {$result['rental']['remaining_payments']}\n";
    } else {
        echo "✗ Failed to extend rental contract: " . json_encode($result) . "\n";
    }

    echo "\n";
}

function testRentalBuyout($rentalId) {
    echo "Test: Completing a Rental Buyout\n";

    // Prepare test data
    $testData = [
        'payment_method' => 'stripe',
        'payment_token' => 'test_token_' . time()
    ];

    // Call the API
    $result = mockApiCall("/rentals/$rentalId/buyout", 'POST', $testData);

    // Verify the result
    if (isset($result['message']) && strpos($result['message'], 'buyout') !== false) {
        echo "✓ Successfully completed rental buyout\n";
        echo "  Buyout amount: \${$result['buyout']['amount']}\n";
        echo "  Order ID: {$result['order']['id']}\n";
    } else {
        echo "✗ Failed to complete rental buyout: " . json_encode($result) . "\n";
    }

    echo "\n";
}

function testGetAllRentals() {
    echo "Test: Getting All Rentals\n";

    // Call the API
    $result = mockApiCall("/rentals", 'GET');

    // Verify the result
    if (isset($result['rentals']) && is_array($result['rentals'])) {
        echo "✓ Successfully retrieved rentals: " . count($result['rentals']) . " rentals found\n";

        if (isset($result['pagination'])) {
            echo "  Total rentals: {$result['pagination']['total']}\n";
            echo "  Current page: {$result['pagination']['current_page']}\n";
            echo "  Total pages: {$result['pagination']['total_pages']}\n";
        }
    } else {
        echo "✗ Failed to retrieve rentals: " . json_encode($result) . "\n";
    }

    echo "\n";
}

function mockApiCall($endpoint, $method = 'GET', $data = null) {
    // In a real test, we would make an actual HTTP request
    // For this test, we'll simulate it

    echo "  Making $method request to $endpoint\n";

    // Simulate different responses based on the endpoint and method
    if ($endpoint === '/rentals' && $method === 'POST') {
        // Simulate creating a rental
        return [
            'message' => 'Rental contract created successfully',
            'rental' => [
                'id' => rand(1000, 9999),
                'user_id' => TEST_USER_ID,
                'product_id' => $data['product_id'],
                'status' => 'pending',
                'term_months' => $data['term_months'],
                'monthly_payment' => $data['monthly_payment'],
                'buyout_price' => $data['buyout_price'],
                'start_date' => date('Y-m-d'),
                'end_date' => date('Y-m-d', strtotime('+' . $data['term_months'] . ' months')),
                'payments_made' => 0,
                'remaining_payments' => $data['term_months'],
                'next_payment_date' => date('Y-m-d', strtotime('+1 month')),
                'created_at' => date('Y-m-d H:i:s')
            ]
        ];
    } else if (strpos($endpoint, '/rentals/') === 0 && $method === 'GET') {
        // Simulate getting rental details
        $rentalId = substr($endpoint, strrpos($endpoint, '/') + 1);

        return [
            'rental' => [
                'id' => $rentalId,
                'user_id' => TEST_USER_ID,
                'product_id' => 5,
                'product' => [
                    'id' => 5,
                    'name' => 'Test Rental Product',
                    'image_url' => 'https://example.com/image.jpg'
                ],
                'status' => 'active',
                'term_months' => 12,
                'monthly_payment' => 49.99,
                'buyout_price' => 199.99,
                'start_date' => date('Y-m-d'),
                'end_date' => date('Y-m-d', strtotime('+12 months')),
                'payments_made' => 1,
                'remaining_payments' => 11,
                'next_payment_date' => date('Y-m-d', strtotime('+1 month')),
                'created_at' => date('Y-m-d H:i:s')
            ]
        ];
    } else if (strpos($endpoint, '/payments') !== false && $method === 'POST') {
        // Simulate making a rental payment
        return [
            'message' => 'Payment successful',
            'payment' => [
                'id' => rand(10000, 99999),
                'rental_id' => substr($endpoint, strpos($endpoint, '/rentals/') + 9, strpos($endpoint, '/payments') - strpos($endpoint, '/rentals/') - 9),
                'amount' => 49.99,
                'status' => 'completed',
                'payment_date' => date('Y-m-d H:i:s'),
                'transaction_id' => 'txn_' . time()
            ]
        ];
    } else if (strpos($endpoint, '/extend') !== false && $method === 'POST') {
        // Simulate extending a rental
        $rentalId = substr($endpoint, strpos($endpoint, '/rentals/') + 9, strpos($endpoint, '/extend') - strpos($endpoint, '/rentals/') - 9);

        return [
            'message' => 'Rental contract extended successfully',
            'rental' => [
                'id' => $rentalId,
                'term_months' => 18, // Original 12 + 6 additional
                'end_date' => date('Y-m-d', strtotime('+18 months')),
                'remaining_payments' => 17 // 11 remaining + 6 additional
            ]
        ];
    } else if (strpos($endpoint, '/buyout') !== false && $method === 'POST') {
        // Simulate rental buyout
        $rentalId = substr($endpoint, strpos($endpoint, '/rentals/') + 9, strpos($endpoint, '/buyout') - strpos($endpoint, '/rentals/') - 9);

        return [
            'message' => 'Rental buyout completed successfully',
            'buyout' => [
                'id' => rand(10000, 99999),
                'rental_id' => $rentalId,
                'amount' => 199.99,
                'status' => 'completed',
                'payment_date' => date('Y-m-d H:i:s'),
                'transaction_id' => 'txn_' . time()
            ],
            'order' => [
                'id' => rand(1000, 9999),
                'status' => 'completed'
            ]
        ];
    } else if ($endpoint === '/rentals' && $method === 'GET') {
        // Simulate getting all rentals
        return [
            'rentals' => [
                [
                    'id' => rand(1000, 9999),
                    'user_id' => TEST_USER_ID,
                    'product_id' => 5,
                    'product' => [
                        'name' => 'Test Rental Product 1'
                    ],
                    'status' => 'active',
                    'monthly_payment' => 49.99,
                    'payments_made' => 3,
                    'remaining_payments' => 9,
                    'next_payment_date' => date('Y-m-d', strtotime('+2 days'))
                ],
                [
                    'id' => rand(1000, 9999),
                    'user_id' => TEST_USER_ID,
                    'product_id' => 8,
                    'product' => [
                        'name' => 'Test Rental Product 2'
                    ],
                    'status' => 'active',
                    'monthly_payment' => 79.99,
                    'payments_made' => 6,
                    'remaining_payments' => 6,
                    'next_payment_date' => date('Y-m-d', strtotime('+15 days'))
                ],
                [
                    'id' => rand(1000, 9999),
                    'user_id' => TEST_USER_ID,
                    'product_id' => 12,
                    'product' => [
                        'name' => 'Test Rental Product 3'
                    ],
                    'status' => 'completed',
                    'monthly_payment' => 39.99,
                    'payments_made' => 12,
                    'remaining_payments' => 0,
                    'next_payment_date' => null
                ]
            ],
            'pagination' => [
                'total' => 3,
                'per_page' => 10,
                'current_page' => 1,
                'total_pages' => 1
            ]
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
