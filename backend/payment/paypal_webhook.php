<?php
/**
 * GigGatek PayPal Webhook Handler
 * 
 * This script processes PayPal webhook events such as successful payments,
 * refunds, and disputes. It updates the orders and rentals database
 * based on the webhook events.
 */

// Set headers for API responses
header('Content-Type: application/json');

// Get the PHP input stream
$payload = @file_get_contents('php://input');
$headers = getallheaders();

// Get PayPal webhook ID for verification
$webhook_id = 'YOUR_PAYPAL_WEBHOOK_ID'; // Replace with your webhook ID

// PayPal API configuration
// In production, these should be stored in environment variables
$paypal_client_id = 'YOUR_PAYPAL_CLIENT_ID';
$paypal_secret = 'YOUR_PAYPAL_SECRET';
$paypal_mode = 'sandbox'; // Change to 'live' for production

// Include PayPal SDK
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

// Connect to database
require_once '../utils/db.php';
$db = get_db_connection();

try {
    // Verify webhook signature
    $signatureVerification = new \PayPal\Api\VerifyWebhookSignature();
    $signatureVerification->setAuthAlgo($headers['PAYPAL-AUTH-ALGO']);
    $signatureVerification->setTransmissionId($headers['PAYPAL-TRANSMISSION-ID']);
    $signatureVerification->setCertUrl($headers['PAYPAL-CERT-URL']);
    $signatureVerification->setWebhookId($webhook_id);
    $signatureVerification->setTransmissionSig($headers['PAYPAL-TRANSMISSION-SIG']);
    $signatureVerification->setTransmissionTime($headers['PAYPAL-TRANSMISSION-TIME']);
    
    $signatureVerification->setRequestBody($payload);
    $response = $signatureVerification->post($apiContext);
    
    // Check if signature is valid
    $verificationStatus = $response->getVerificationStatus();
    if ($verificationStatus !== 'SUCCESS') {
        http_response_code(401);
        echo json_encode(['error' => 'Invalid webhook signature']);
        exit;
    }
    
    // Parse the event
    $event_json = json_decode($payload);
    $event_type = $event_json->event_type;
    
    // Log the event
    error_log("Received PayPal webhook: $event_type");
    
    // Handle different event types
    switch ($event_type) {
        case 'PAYMENT.SALE.COMPLETED':
            handlePaymentCompleted($event_json, $db);
            break;
            
        case 'PAYMENT.SALE.REFUNDED':
            handlePaymentRefunded($event_json, $db);
            break;
            
        case 'PAYMENT.SALE.REVERSED':
            handlePaymentReversed($event_json, $db);
            break;
            
        case 'CHECKOUT.ORDER.COMPLETED':
            handleOrderCompleted($event_json, $db);
            break;
            
        default:
            // Unhandled event type
            http_response_code(200);
            echo json_encode(['status' => 'ignored', 'message' => "Unhandled event type: $event_type"]);
            exit;
    }
    
    // Return success response
    http_response_code(200);
    echo json_encode(['status' => 'success']);
} catch (Exception $e) {
    error_log("PayPal webhook error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}

/**
 * Handle PAYMENT.SALE.COMPLETED event
 */
function handlePaymentCompleted($event, $db) {
    $resource = $event->resource;
    $transaction_id = $resource->id;
    $payment_id = $resource->parent_payment;
    $custom = isset($resource->custom) ? json_decode($resource->custom, true) : null;
    
    // Check if we have order metadata
    if (!$custom) {
        error_log("No custom data found for transaction: $transaction_id");
        return;
    }
    
    try {
        // Start transaction
        $db->begin_transaction();
        
        // Check metadata to determine what type of payment this is
        if (isset($custom['order_id'])) {
            // This is a regular order
            updateOrderStatus($db, $custom['order_id'], 'paid', $transaction_id);
        } else if (isset($custom['rental_id']) && isset($custom['payment_id'])) {
            // This is a rental payment
            updateRentalPayment($db, $custom['rental_id'], $custom['payment_id'], $transaction_id);
        } else if (isset($custom['rental_id']) && isset($custom['buyout'])) {
            // This is a rental buyout
            processRentalBuyout($db, $custom['rental_id'], $transaction_id);
        } else {
            // Unknown payment type
            error_log("Unknown payment type for transaction: $transaction_id");
            throw new Exception('Unknown payment type: No identifiable metadata');
        }
        
        // Commit transaction
        $db->commit();
    } catch (Exception $e) {
        $db->rollback();
        error_log("Error processing payment completion: " . $e->getMessage());
        throw $e;
    }
}

/**
 * Handle PAYMENT.SALE.REFUNDED event
 */
function handlePaymentRefunded($event, $db) {
    $resource = $event->resource;
    $transaction_id = $resource->id;
    $parent_transaction_id = $resource->sale_id;
    
    try {
        // Start transaction
        $db->begin_transaction();
        
        // Find the original payment
        $stmt = $db->prepare("
            SELECT payment_type, reference_id 
            FROM payments 
            WHERE transaction_id = ?
        ");
        $stmt->bind_param("s", $parent_transaction_id);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows === 0) {
            error_log("No payment found for transaction: $parent_transaction_id");
            throw new Exception("No payment found for transaction: $parent_transaction_id");
        }
        
        $payment = $result->fetch_assoc();
        $payment_type = $payment['payment_type'];
        $reference_id = $payment['reference_id'];
        
        // Handle based on payment type
        if ($payment_type === 'order') {
            // Update order status to refunded
            $stmt = $db->prepare("
                UPDATE orders 
                SET status = 'refunded', updated_at = NOW() 
                WHERE id = ?
            ");
            $stmt->bind_param("i", $reference_id);
            $stmt->execute();
            
            // Add order status history
            $stmt = $db->prepare("
                INSERT INTO order_status_history (
                    order_id, status, notes, created_at, created_by
                ) VALUES (?, 'refunded', 'Payment refunded via PayPal', NOW(), 'system')
            ");
            $stmt->bind_param("i", $reference_id);
            $stmt->execute();
        } else if ($payment_type === 'rental') {
            // Update rental payment status to refunded
            $stmt = $db->prepare("
                UPDATE rental_payments 
                SET status = 'refunded', updated_at = NOW() 
                WHERE id = ?
            ");
            $stmt->bind_param("i", $reference_id);
            $stmt->execute();
            
            // Add rental status history
            $stmt = $db->prepare("
                INSERT INTO rental_status_history (
                    rental_id, status, notes, created_at, created_by
                ) VALUES (
                    (SELECT rental_id FROM rental_payments WHERE id = ?),
                    'payment_refunded',
                    'Payment refunded via PayPal',
                    NOW(),
                    'system'
                )
            ");
            $stmt->bind_param("i", $reference_id);
            $stmt->execute();
        }
        
        // Record the refund
        $stmt = $db->prepare("
            INSERT INTO refunds (
                payment_id, transaction_id, amount, status, created_at
            ) VALUES (
                (SELECT id FROM payments WHERE transaction_id = ?),
                ?,
                ?,
                'completed',
                NOW()
            )
        ");
        $amount = $resource->amount->total;
        $stmt->bind_param("ssd", $parent_transaction_id, $transaction_id, $amount);
        $stmt->execute();
        
        // Commit transaction
        $db->commit();
    } catch (Exception $e) {
        $db->rollback();
        error_log("Error processing refund: " . $e->getMessage());
        throw $e;
    }
}

/**
 * Handle PAYMENT.SALE.REVERSED event
 */
function handlePaymentReversed($event, $db) {
    $resource = $event->resource;
    $transaction_id = $resource->id;
    $parent_transaction_id = $resource->parent_payment;
    
    try {
        // Start transaction
        $db->begin_transaction();
        
        // Find the original payment
        $stmt = $db->prepare("
            SELECT payment_type, reference_id 
            FROM payments 
            WHERE transaction_id = ?
        ");
        $stmt->bind_param("s", $parent_transaction_id);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows === 0) {
            error_log("No payment found for transaction: $parent_transaction_id");
            throw new Exception("No payment found for transaction: $parent_transaction_id");
        }
        
        $payment = $result->fetch_assoc();
        $payment_type = $payment['payment_type'];
        $reference_id = $payment['reference_id'];
        
        // Handle based on payment type
        if ($payment_type === 'order') {
            // Update order status to reversed
            $stmt = $db->prepare("
                UPDATE orders 
                SET status = 'payment_reversed', updated_at = NOW() 
                WHERE id = ?
            ");
            $stmt->bind_param("i", $reference_id);
            $stmt->execute();
            
            // Add order status history
            $stmt = $db->prepare("
                INSERT INTO order_status_history (
                    order_id, status, notes, created_at, created_by
                ) VALUES (?, 'payment_reversed', 'Payment reversed via PayPal', NOW(), 'system')
            ");
            $stmt->bind_param("i", $reference_id);
            $stmt->execute();
        } else if ($payment_type === 'rental') {
            // Update rental payment status to reversed
            $stmt = $db->prepare("
                UPDATE rental_payments 
                SET status = 'reversed', updated_at = NOW() 
                WHERE id = ?
            ");
            $stmt->bind_param("i", $reference_id);
            $stmt->execute();
            
            // Add rental status history
            $stmt = $db->prepare("
                INSERT INTO rental_status_history (
                    rental_id, status, notes, created_at, created_by
                ) VALUES (
                    (SELECT rental_id FROM rental_payments WHERE id = ?),
                    'payment_reversed',
                    'Payment reversed via PayPal',
                    NOW(),
                    'system'
                )
            ");
            $stmt->bind_param("i", $reference_id);
            $stmt->execute();
        }
        
        // Record the reversal
        $stmt = $db->prepare("
            INSERT INTO payment_reversals (
                payment_id, transaction_id, reason, created_at
            ) VALUES (
                (SELECT id FROM payments WHERE transaction_id = ?),
                ?,
                ?,
                NOW()
            )
        ");
        $reason = $resource->reason_code ?? 'unknown';
        $stmt->bind_param("sss", $parent_transaction_id, $transaction_id, $reason);
        $stmt->execute();
        
        // Commit transaction
        $db->commit();
    } catch (Exception $e) {
        $db->rollback();
        error_log("Error processing payment reversal: " . $e->getMessage());
        throw $e;
    }
}

/**
 * Handle CHECKOUT.ORDER.COMPLETED event
 */
function handleOrderCompleted($event, $db) {
    $resource = $event->resource;
    $order_id = $resource->id;
    
    // Get the purchase units
    $purchase_units = $resource->purchase_units;
    if (empty($purchase_units)) {
        error_log("No purchase units found for order: $order_id");
        return;
    }
    
    // Get the first purchase unit
    $purchase_unit = $purchase_units[0];
    $custom_id = $purchase_unit->custom_id ?? null;
    
    // If no custom ID, try to parse from reference ID
    if (!$custom_id && isset($purchase_unit->reference_id)) {
        $custom_id = $purchase_unit->reference_id;
    }
    
    // If still no custom ID, we can't process this order
    if (!$custom_id) {
        error_log("No custom ID found for order: $order_id");
        return;
    }
    
    // Parse the custom ID
    $custom = json_decode($custom_id, true);
    if (!$custom) {
        // Try to parse as a simple order ID
        $custom = ['order_id' => $custom_id];
    }
    
    try {
        // Start transaction
        $db->begin_transaction();
        
        // Check metadata to determine what type of payment this is
        if (isset($custom['order_id'])) {
            // This is a regular order
            $payments = $purchase_unit->payments->captures ?? [];
            if (!empty($payments)) {
                $transaction_id = $payments[0]->id;
                updateOrderStatus($db, $custom['order_id'], 'paid', $transaction_id);
            }
        } else if (isset($custom['rental_id']) && isset($custom['payment_id'])) {
            // This is a rental payment
            $payments = $purchase_unit->payments->captures ?? [];
            if (!empty($payments)) {
                $transaction_id = $payments[0]->id;
                updateRentalPayment($db, $custom['rental_id'], $custom['payment_id'], $transaction_id);
            }
        } else if (isset($custom['rental_id']) && isset($custom['buyout'])) {
            // This is a rental buyout
            $payments = $purchase_unit->payments->captures ?? [];
            if (!empty($payments)) {
                $transaction_id = $payments[0]->id;
                processRentalBuyout($db, $custom['rental_id'], $transaction_id);
            }
        } else {
            // Unknown payment type
            error_log("Unknown payment type for order: $order_id");
            throw new Exception('Unknown payment type: No identifiable metadata');
        }
        
        // Commit transaction
        $db->commit();
    } catch (Exception $e) {
        $db->rollback();
        error_log("Error processing order completion: " . $e->getMessage());
        throw $e;
    }
}

/**
 * Update order status
 */
function updateOrderStatus($db, $order_id, $status, $transaction_id) {
    // Update order status
    $stmt = $db->prepare("
        UPDATE orders 
        SET status = ?, payment_status = 'paid', updated_at = NOW() 
        WHERE id = ?
    ");
    $stmt->bind_param("si", $status, $order_id);
    $stmt->execute();
    
    // Add order status history
    $stmt = $db->prepare("
        INSERT INTO order_status_history (
            order_id, status, notes, created_at, created_by
        ) VALUES (?, ?, 'Payment completed via PayPal', NOW(), 'system')
    ");
    $stmt->bind_param("is", $order_id, $status);
    $stmt->execute();
    
    // Record payment
    $stmt = $db->prepare("
        INSERT INTO payments (
            payment_type, reference_id, amount, payment_method, 
            transaction_id, status, created_at
        ) SELECT 
            'order', ?, total_amount, 'paypal', ?, 'completed', NOW()
        FROM orders
        WHERE id = ?
    ");
    $stmt->bind_param("isi", $order_id, $transaction_id, $order_id);
    $stmt->execute();
}

/**
 * Update rental payment
 */
function updateRentalPayment($db, $rental_id, $payment_id, $transaction_id) {
    // Update rental payment status
    $stmt = $db->prepare("
        UPDATE rental_payments 
        SET status = 'paid', payment_date = NOW(), transaction_id = ?, updated_at = NOW() 
        WHERE id = ? AND rental_id = ?
    ");
    $stmt->bind_param("sii", $transaction_id, $payment_id, $rental_id);
    $stmt->execute();
    
    // Update rental status if needed
    $stmt = $db->prepare("
        UPDATE rentals 
        SET 
            status = CASE WHEN status = 'pending' THEN 'active' ELSE status END,
            payments_made = payments_made + 1,
            remaining_payments = remaining_payments - 1,
            next_payment_date = DATE_ADD(next_payment_date, INTERVAL 1 MONTH),
            updated_at = NOW()
        WHERE id = ?
    ");
    $stmt->bind_param("i", $rental_id);
    $stmt->execute();
    
    // Add rental status history
    $stmt = $db->prepare("
        INSERT INTO rental_status_history (
            rental_id, status, notes, created_at, created_by
        ) VALUES (?, 'payment_received', 'Payment completed via PayPal', NOW(), 'system')
    ");
    $stmt->bind_param("i", $rental_id);
    $stmt->execute();
    
    // Record payment
    $stmt = $db->prepare("
        INSERT INTO payments (
            payment_type, reference_id, amount, payment_method, 
            transaction_id, status, created_at
        ) SELECT 
            'rental', ?, amount, 'paypal', ?, 'completed', NOW()
        FROM rental_payments
        WHERE id = ?
    ");
    $stmt->bind_param("isi", $payment_id, $transaction_id, $payment_id);
    $stmt->execute();
}

/**
 * Process rental buyout
 */
function processRentalBuyout($db, $rental_id, $transaction_id) {
    // Update rental status
    $stmt = $db->prepare("
        UPDATE rentals 
        SET 
            status = 'completed',
            buyout_date = NOW(),
            updated_at = NOW()
        WHERE id = ?
    ");
    $stmt->bind_param("i", $rental_id);
    $stmt->execute();
    
    // Add rental status history
    $stmt = $db->prepare("
        INSERT INTO rental_status_history (
            rental_id, status, notes, created_at, created_by
        ) VALUES (?, 'completed', 'Rental buyout completed via PayPal', NOW(), 'system')
    ");
    $stmt->bind_param("i", $rental_id);
    $stmt->execute();
    
    // Record payment
    $stmt = $db->prepare("
        INSERT INTO payments (
            payment_type, reference_id, amount, payment_method, 
            transaction_id, status, created_at
        ) SELECT 
            'rental_buyout', ?, buyout_price, 'paypal', ?, 'completed', NOW()
        FROM rentals
        WHERE id = ?
    ");
    $stmt->bind_param("isi", $rental_id, $transaction_id, $rental_id);
    $stmt->execute();
    
    // Transfer ownership - create a new order for the product
    $stmt = $db->prepare("
        INSERT INTO orders (
            user_id, order_date, total_amount, status, 
            payment_status, shipping_address_id, notes, created_at
        ) SELECT 
            user_id, NOW(), buyout_price, 'completed', 
            'paid', address_id, 'Created from rental buyout', NOW()
        FROM rentals
        WHERE id = ?
    ");
    $stmt->bind_param("i", $rental_id);
    $stmt->execute();
    
    // Get the new order ID
    $order_id = $db->insert_id;
    
    // Add the product to the order
    $stmt = $db->prepare("
        INSERT INTO order_items (
            order_id, product_id, quantity, price, subtotal
        ) SELECT 
            ?, product_id, 1, buyout_price, buyout_price
        FROM rentals
        WHERE id = ?
    ");
    $stmt->bind_param("ii", $order_id, $rental_id);
    $stmt->execute();
}
