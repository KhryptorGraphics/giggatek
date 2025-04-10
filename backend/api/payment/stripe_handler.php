<?php
/**
 * Stripe Payment Handler
 * Handles Stripe payment processing for GigGatek
 */

// Include necessary files
require_once '../../config/config.php';
require_once '../../utils/auth.php';
require_once '../../vendor/autoload.php';

// Set headers
header('Content-Type: application/json');

// Initialize Stripe with secret key
\Stripe\Stripe::setApiKey(STRIPE_SECRET_KEY);

// Verify authentication
$auth = new Auth();
$user = $auth->authenticateRequest();

if (!$user) {
    echo json_encode([
        'success' => false,
        'error' => 'Authentication required'
    ]);
    exit;
}

// Get request data
$requestData = json_decode(file_get_contents('php://input'), true);

if (!$requestData || !isset($requestData['action'])) {
    echo json_encode([
        'success' => false,
        'error' => 'Invalid request'
    ]);
    exit;
}

// Process based on action
switch ($requestData['action']) {
    case 'create_payment_intent':
        createPaymentIntent($requestData, $user);
        break;
    case 'confirm_payment_intent':
        confirmPaymentIntent($requestData, $user);
        break;
    case 'retrieve_payment_intent':
        retrievePaymentIntent($requestData, $user);
        break;
    default:
        echo json_encode([
            'success' => false,
            'error' => 'Invalid action'
        ]);
        break;
}

/**
 * Create a payment intent
 * @param array $data Request data
 * @param array $user User data
 */
function createPaymentIntent($data, $user) {
    try {
        // Validate required fields
        if (!isset($data['amount']) || !is_numeric($data['amount'])) {
            throw new Exception('Invalid amount');
        }
        
        // Prepare metadata
        $metadata = isset($data['metadata']) && is_array($data['metadata']) ? $data['metadata'] : [];
        $metadata['user_id'] = $user['user_id'];
        
        // Create payment intent
        $paymentIntent = \Stripe\PaymentIntent::create([
            'amount' => $data['amount'], // Amount in cents
            'currency' => 'usd',
            'description' => $data['description'] ?? 'GigGatek Purchase',
            'metadata' => $metadata,
            'receipt_email' => $user['email'],
            'automatic_payment_methods' => [
                'enabled' => true,
            ],
        ]);
        
        // Return client secret
        echo json_encode([
            'success' => true,
            'client_secret' => $paymentIntent->client_secret,
            'payment_intent_id' => $paymentIntent->id
        ]);
    } catch (Exception $e) {
        echo json_encode([
            'success' => false,
            'error' => $e->getMessage()
        ]);
    }
}

/**
 * Confirm a payment intent
 * @param array $data Request data
 * @param array $user User data
 */
function confirmPaymentIntent($data, $user) {
    try {
        // Validate required fields
        if (!isset($data['payment_intent_id']) || !isset($data['payment_method_id'])) {
            throw new Exception('Invalid payment data');
        }
        
        // Retrieve payment intent
        $paymentIntent = \Stripe\PaymentIntent::retrieve($data['payment_intent_id']);
        
        // Confirm payment intent
        $paymentIntent->confirm([
            'payment_method' => $data['payment_method_id'],
            'return_url' => isset($data['return_url']) ? $data['return_url'] : SITE_URL . '/checkout.php'
        ]);
        
        // Return status
        echo json_encode([
            'success' => true,
            'status' => $paymentIntent->status,
            'payment_intent_id' => $paymentIntent->id,
            'requires_action' => $paymentIntent->status === 'requires_action',
            'client_secret' => $paymentIntent->client_secret
        ]);
    } catch (Exception $e) {
        echo json_encode([
            'success' => false,
            'error' => $e->getMessage()
        ]);
    }
}

/**
 * Retrieve a payment intent
 * @param array $data Request data
 * @param array $user User data
 */
function retrievePaymentIntent($data, $user) {
    try {
        // Validate required fields
        if (!isset($data['payment_intent_id'])) {
            throw new Exception('Invalid payment intent ID');
        }
        
        // Retrieve payment intent
        $paymentIntent = \Stripe\PaymentIntent::retrieve($data['payment_intent_id']);
        
        // Return payment intent data
        echo json_encode([
            'success' => true,
            'status' => $paymentIntent->status,
            'payment_intent_id' => $paymentIntent->id,
            'amount' => $paymentIntent->amount,
            'currency' => $paymentIntent->currency,
            'description' => $paymentIntent->description,
            'metadata' => $paymentIntent->metadata
        ]);
    } catch (Exception $e) {
        echo json_encode([
            'success' => false,
            'error' => $e->getMessage()
        ]);
    }
}
