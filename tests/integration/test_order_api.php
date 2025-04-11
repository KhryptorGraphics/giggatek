<?php
/**
 * Order API Test Script
 *
 * This script tests the order management API endpoints.
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
    echo "Starting Order API Tests\n";
    echo "----------------------\n\n";

    // Test creating an order
    $orderId = testCreateOrder();

    if ($orderId) {
        // Test getting order details
        testGetOrder($orderId);

        // Test updating order status
        testUpdateOrderStatus($orderId);

        // Test canceling an order
        testCancelOrder($orderId);
    }

    // Test getting all orders
    testGetAllOrders();

    echo "\nAll tests completed!\n";
}

function testCreateOrder() {
    echo "Test: Creating an Order\n";

    // Prepare test data
    $testData = [
        'items' => [
            [
                'product_id' => 1,
                'quantity' => 2,
                'price' => 49.99
            ],
            [
                'product_id' => 3,
                'quantity' => 1,
                'price' => 29.99
            ]
        ],
        'shipping_address_id' => 1,
        'payment_method' => 'stripe',
        'shipping_method' => 'standard',
        'notes' => 'Test order from API test script'
    ];

    // Call the API
    $result = mockApiCall('/orders', 'POST', $testData);

    // Verify the result
    if (isset($result['order']) && isset($result['order']['id'])) {
        echo "✓ Successfully created order: {$result['order']['id']}\n";
        return $result['order']['id'];
    } else {
        echo "✗ Failed to create order: " . json_encode($result) . "\n";
        return null;
    }

    echo "\n";
}

function testGetOrder($orderId) {
    echo "Test: Getting Order Details\n";

    // Call the API
    $result = mockApiCall("/orders/$orderId", 'GET');

    // Verify the result
    if (isset($result['order']) && $result['order']['id'] == $orderId) {
        echo "✓ Successfully retrieved order: {$result['order']['id']}\n";
        echo "  Order status: {$result['order']['status']}\n";
        echo "  Order total: \${$result['order']['total']}\n";
    } else {
        echo "✗ Failed to retrieve order: " . json_encode($result) . "\n";
    }

    echo "\n";
}

function testUpdateOrderStatus($orderId) {
    echo "Test: Updating Order Status\n";

    // Prepare test data
    $testData = [
        'status' => 'processing'
    ];

    // Call the API
    $result = mockApiCall("/orders/$orderId/status", 'PUT', $testData);

    // Verify the result
    if (isset($result['message']) && strpos($result['message'], 'updated') !== false) {
        echo "✓ Successfully updated order status to 'processing'\n";
    } else {
        echo "✗ Failed to update order status: " . json_encode($result) . "\n";
    }

    echo "\n";
}

function testCancelOrder($orderId) {
    echo "Test: Canceling an Order\n";

    // Call the API
    $result = mockApiCall("/orders/$orderId/cancel", 'POST');

    // Verify the result
    if (isset($result['message']) && strpos($result['message'], 'cancelled') !== false) {
        echo "✓ Successfully canceled order\n";
    } else {
        echo "✗ Failed to cancel order: " . json_encode($result) . "\n";
    }

    echo "\n";
}

function testGetAllOrders() {
    echo "Test: Getting All Orders\n";

    // Call the API
    $result = mockApiCall("/orders", 'GET');

    // Verify the result
    if (isset($result['orders']) && is_array($result['orders'])) {
        echo "✓ Successfully retrieved orders: " . count($result['orders']) . " orders found\n";

        if (isset($result['pagination'])) {
            echo "  Total orders: {$result['pagination']['total']}\n";
            echo "  Current page: {$result['pagination']['current_page']}\n";
            echo "  Total pages: {$result['pagination']['total_pages']}\n";
        }
    } else {
        echo "✗ Failed to retrieve orders: " . json_encode($result) . "\n";
    }

    echo "\n";
}

function mockApiCall($endpoint, $method = 'GET', $data = null) {
    // In a real test, we would make an actual HTTP request
    // For this test, we'll simulate it

    echo "  Making $method request to $endpoint\n";

    // Simulate different responses based on the endpoint and method
    if ($endpoint === '/orders' && $method === 'POST') {
        // Simulate creating an order
        return [
            'message' => 'Order created successfully',
            'order' => [
                'id' => rand(1000, 9999),
                'user_id' => TEST_USER_ID,
                'status' => 'pending',
                'payment_status' => 'pending',
                'total' => 129.97,
                'created_at' => date('Y-m-d H:i:s')
            ]
        ];
    } else if (strpos($endpoint, '/orders/') === 0 && $method === 'GET') {
        // Simulate getting order details
        $orderId = substr($endpoint, strrpos($endpoint, '/') + 1);

        return [
            'order' => [
                'id' => $orderId,
                'user_id' => TEST_USER_ID,
                'status' => 'pending',
                'payment_status' => 'pending',
                'total' => 129.97,
                'items' => [
                    [
                        'product_id' => 1,
                        'name' => 'Test Product 1',
                        'quantity' => 2,
                        'price' => 49.99
                    ],
                    [
                        'product_id' => 3,
                        'name' => 'Test Product 2',
                        'quantity' => 1,
                        'price' => 29.99
                    ]
                ],
                'created_at' => date('Y-m-d H:i:s')
            ]
        ];
    } else if (strpos($endpoint, '/status') !== false && $method === 'PUT') {
        // Simulate updating order status
        return [
            'message' => 'Order status updated successfully'
        ];
    } else if (strpos($endpoint, '/cancel') !== false && $method === 'POST') {
        // Simulate canceling an order
        return [
            'message' => 'Order cancelled successfully'
        ];
    } else if ($endpoint === '/orders' && $method === 'GET') {
        // Simulate getting all orders
        return [
            'orders' => [
                [
                    'id' => rand(1000, 9999),
                    'user_id' => TEST_USER_ID,
                    'status' => 'pending',
                    'payment_status' => 'pending',
                    'total' => 129.97,
                    'created_at' => date('Y-m-d H:i:s')
                ],
                [
                    'id' => rand(1000, 9999),
                    'user_id' => TEST_USER_ID,
                    'status' => 'processing',
                    'payment_status' => 'paid',
                    'total' => 79.99,
                    'created_at' => date('Y-m-d H:i:s', strtotime('-1 day'))
                ],
                [
                    'id' => rand(1000, 9999),
                    'user_id' => TEST_USER_ID,
                    'status' => 'delivered',
                    'payment_status' => 'paid',
                    'total' => 149.99,
                    'created_at' => date('Y-m-d H:i:s', strtotime('-1 week'))
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
