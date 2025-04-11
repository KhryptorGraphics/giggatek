<?php
/**
 * GigGatek PayPal Payment Handler
 * 
 * Handles PayPal payment processing for the GigGatek ecommerce platform.
 * This script processes PayPal orders and responds with payment status.
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

// Get the JSON data from the request
$json_data = file_get_contents('php://input');
$data = json_decode($json_data);

// Check if data was parsed correctly
if (!$data) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid JSON data.']);
    exit;
}

// PayPal API configuration
// In production, these should be stored in environment variables
$paypal_client_id = 'YOUR_PAYPAL_CLIENT_ID';
$paypal_secret = 'YOUR_PAYPAL_SECRET';
$paypal_mode = 'sandbox'; // Change to 'live' for production

// Include PayPal SDK
// Note: You need to install the PayPal SDK using Composer:
// composer require paypal/rest-api-sdk-php
require_once '../vendor/autoload.php';

// Initialize PayPal API context
$apiContext = new \PayPal\Rest\ApiContext(
    new \PayPal\Auth\OAuthTokenCredential(
        $paypal_client_id,
        $paypal_secret
    )
);

// Set PayPal mode
$apiContext->setConfig([
    'mode' => $paypal_mode,
    'log.LogEnabled' => true,
    'log.FileName' => '../logs/PayPal.log',
    'log.LogLevel' => 'DEBUG'
]);

try {
    // Determine the action based on the request
    $action = isset($data->action) ? $data->action : '';
    
    switch ($action) {
        case 'create_order':
            // Create a PayPal order
            handleCreateOrder($data, $apiContext);
            break;
            
        case 'capture_order':
            // Capture payment for an approved PayPal order
            handleCaptureOrder($data, $apiContext);
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
 * Creates a PayPal order for the specified amount
 */
function handleCreateOrder($data, $apiContext) {
    // Validate required fields
    if (!isset($data->amount) || !is_numeric($data->amount) || $data->amount <= 0) {
        http_response_code(400);
        echo json_encode(['error' => 'Valid amount is required.']);
        return;
    }
    
    // Create a new PayPal order
    $payer = new \PayPal\Api\Payer();
    $payer->setPaymentMethod('paypal');
    
    // Set up the amount
    $amount = new \PayPal\Api\Amount();
    $amount->setCurrency('USD')
           ->setTotal(number_format($data->amount, 2, '.', ''));
    
    // Create a transaction
    $transaction = new \PayPal\Api\Transaction();
    $transaction->setAmount($amount)
                ->setDescription(isset($data->description) ? $data->description : 'GigGatek Purchase');
    
    // Add item list if provided
    if (isset($data->items) && is_array($data->items)) {
        $itemList = new \PayPal\Api\ItemList();
        $paypalItems = [];
        
        foreach ($data->items as $item) {
            $paypalItem = new \PayPal\Api\Item();
            $paypalItem->setName($item->name)
                       ->setCurrency('USD')
                       ->setQuantity($item->quantity)
                       ->setPrice(number_format($item->price, 2, '.', ''));
            
            $paypalItems[] = $paypalItem;
        }
        
        $itemList->setItems($paypalItems);
        $transaction->setItemList($itemList);
    }
    
    // Set redirect URLs
    $redirectUrls = new \PayPal\Api\RedirectUrls();
    $redirectUrls->setReturnUrl(isset($data->return_url) ? $data->return_url : 'https://giggatek.com/checkout/success')
                 ->setCancelUrl(isset($data->cancel_url) ? $data->cancel_url : 'https://giggatek.com/checkout/cancel');
    
    // Create the payment
    $payment = new \PayPal\Api\Payment();
    $payment->setIntent('sale')
            ->setPayer($payer)
            ->setTransactions([$transaction])
            ->setRedirectUrls($redirectUrls);
    
    // Add metadata if provided
    if (isset($data->metadata) && is_object($data->metadata)) {
        $payment->setCustom(json_encode((array)$data->metadata));
    }
    
    // Create the payment through PayPal
    try {
        $payment->create($apiContext);
        
        // Get the approval URL
        $approvalUrl = null;
        foreach ($payment->getLinks() as $link) {
            if ($link->getRel() == 'approval_url') {
                $approvalUrl = $link->getHref();
                break;
            }
        }
        
        // Return the payment ID and approval URL
        echo json_encode([
            'success' => true,
            'payment_id' => $payment->getId(),
            'approval_url' => $approvalUrl
        ]);
    } catch (\PayPal\Exception\PayPalConnectionException $ex) {
        http_response_code(500);
        echo json_encode([
            'error' => $ex->getData()
        ]);
    }
}

/**
 * Captures payment for an approved PayPal order
 */
function handleCaptureOrder($data, $apiContext) {
    // Validate required fields
    if (!isset($data->payment_id)) {
        http_response_code(400);
        echo json_encode(['error' => 'Payment ID is required.']);
        return;
    }
    
    if (!isset($data->payer_id)) {
        http_response_code(400);
        echo json_encode(['error' => 'Payer ID is required.']);
        return;
    }
    
    // Execute the payment
    try {
        $payment = \PayPal\Api\Payment::get($data->payment_id, $apiContext);
        
        $execution = new \PayPal\Api\PaymentExecution();
        $execution->setPayerId($data->payer_id);
        
        // Execute the payment
        $result = $payment->execute($execution, $apiContext);
        
        // Get the transaction ID
        $transactions = $result->getTransactions();
        $relatedResources = $transactions[0]->getRelatedResources();
        $sale = $relatedResources[0]->getSale();
        $transactionId = $sale->getId();
        
        // Return the payment details
        echo json_encode([
            'success' => true,
            'payment_id' => $result->getId(),
            'transaction_id' => $transactionId,
            'status' => $result->getState()
        ]);
    } catch (\PayPal\Exception\PayPalConnectionException $ex) {
        http_response_code(500);
        echo json_encode([
            'error' => $ex->getData()
        ]);
    }
}

/**
 * Refunds a PayPal payment
 */
function handleRefund($data, $apiContext) {
    // Validate required fields
    if (!isset($data->transaction_id)) {
        http_response_code(400);
        echo json_encode(['error' => 'Transaction ID is required.']);
        return;
    }
    
    // Get the sale
    try {
        $sale = \PayPal\Api\Sale::get($data->transaction_id, $apiContext);
        
        // Create a refund
        $refund = new \PayPal\Api\Refund();
        
        // Set refund amount if provided
        if (isset($data->amount) && is_numeric($data->amount) && $data->amount > 0) {
            $amount = new \PayPal\Api\Amount();
            $amount->setCurrency('USD')
                   ->setTotal(number_format($data->amount, 2, '.', ''));
            $refund->setAmount($amount);
        }
        
        // Process the refund
        $refundedSale = $sale->refund($refund, $apiContext);
        
        // Return the refund details
        echo json_encode([
            'success' => true,
            'refund_id' => $refundedSale->getId(),
            'status' => $refundedSale->getState()
        ]);
    } catch (\PayPal\Exception\PayPalConnectionException $ex) {
        http_response_code(500);
        echo json_encode([
            'error' => $ex->getData()
        ]);
    }
}
