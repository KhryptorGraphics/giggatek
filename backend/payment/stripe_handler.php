<?php
/**
 * GigGatek Stripe Payment Handler
 * 
 * Handles Stripe payment processing for the GigGatek ecommerce platform.
 * This script processes payment intents and responds with payment status.
 */

// Set headers for API responses
header('Content-Type: application/json');

// Allow cross-origin requests from your frontend domain (change in production)
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Ensure this is a POST request
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405); // Method Not Allowed
    echo json_encode(['error' => 'Method not allowed. Please use POST.']);
    exit;
}

// Get POST data
$json_data = file_get_contents('php://input');
$data = json_decode($json_data);

// Check if data was successfully decoded
if ($data === null) {
    http_response_code(400); // Bad Request
    echo json_encode(['error' => 'Invalid JSON data.']);
    exit;
}

// Initialize Stripe with your secret key
// NOTE: In production, this key should be stored in a secure environment variable
// and not directly in the code
$stripeSecretKey = 'sk_live_YOUR_STRIPE_SECRET_KEY';

// Include Stripe PHP library
// Note: You need to install the Stripe PHP library using Composer:
// composer require stripe/stripe-php
require_once '../vendor/autoload.php';

// Set Stripe API key
\Stripe\Stripe::setApiKey($stripeSecretKey);

try {
    // Determine the action based on the request
    $action = isset($data->action) ? $data->action : '';
    
    switch ($action) {
        case 'create_payment_intent':
            // Create a PaymentIntent for charging the customer
            handleCreatePaymentIntent($data);
            break;
            
        case 'confirm_payment_intent':
            // Confirm a PaymentIntent after collecting card details
            handleConfirmPaymentIntent($data);
            break;
            
        default:
            http_response_code(400);
            echo json_encode(['error' => 'Invalid action specified.']);
    }
} catch (\Exception $e) {
    http_response_code(500);
    echo json_encode([
        'error' => $e->getMessage()
    ]);
}

/**
 * Creates a Payment Intent for the specified amount
 */
function handleCreatePaymentIntent($data) {
    // Validate required fields
    if (!isset($data->amount) || !is_numeric($data->amount) || $data->amount <= 0) {
        http_response_code(400);
        echo json_encode(['error' => 'Valid amount is required.']);
        return;
    }
    
    // Convert amount to cents as required by Stripe
    $amount_cents = (int)($data->amount * 100);
    
    // Set up payment intent parameters
    $payment_intent_params = [
        'amount' => $amount_cents,
        'currency' => 'usd', // Change to your desired currency
        'payment_method_types' => ['card'],
        'description' => isset($data->description) ? $data->description : 'GigGatek Purchase',
    ];
    
    // Add metadata if provided
    if (isset($data->metadata) && is_object($data->metadata)) {
        $payment_intent_params['metadata'] = (array)$data->metadata;
    }
    
    // Create a PaymentIntent
    $payment_intent = \Stripe\PaymentIntent::create($payment_intent_params);
    
    // Return the client secret to the frontend
    echo json_encode([
        'success' => true,
        'client_secret' => $payment_intent->client_secret,
        'payment_intent_id' => $payment_intent->id
    ]);
}

/**
 * Confirms a Payment Intent with the provided payment method
 */
function handleConfirmPaymentIntent($data) {
    // Validate required fields
    if (!isset($data->payment_intent_id)) {
        http_response_code(400);
        echo json_encode(['error' => 'Payment intent ID is required.']);
        return;
    }
    
    if (!isset($data->payment_method_id)) {
        http_response_code(400);
        echo json_encode(['error' => 'Payment method ID is required.']);
        return;
    }
    
    // Retrieve the payment intent
    $payment_intent = \Stripe\PaymentIntent::retrieve($data->payment_intent_id);
    
    // Confirm the payment intent with the payment method
    $payment_intent->confirm([
        'payment_method' => $data->payment_method_id
    ]);
    
    // Return the updated payment intent status
    echo json_encode([
        'success' => true,
        'status' => $payment_intent->status,
        'payment_intent_id' => $payment_intent->id
    ]);
}
