<?php
/**
 * GigGatek Stripe Webhook Handler
 * 
 * This script processes Stripe webhook events such as successful payments,
 * failed payments, and refunds. It updates the orders and rentals database
 * based on the webhook events.
 */

// Set headers for API responses
header('Content-Type: application/json');

// Get the PHP input stream
$payload = @file_get_contents('php://input');
$sig_header = $_SERVER['HTTP_STRIPE_SIGNATURE'];
$endpoint_secret = 'whsec_your_stripe_webhook_signing_secret'; // Replace with your webhook signing secret

// Initialize Stripe with your API key
// Note: In production, this should be stored in environment variables
require_once '../vendor/autoload.php';
$stripe_secret_key = 'sk_live_YOUR_STRIPE_SECRET_KEY';
\Stripe\Stripe::setApiKey($stripe_secret_key);

// Log the webhook for debugging
$log_file = __DIR__ . '/webhook_log.txt';
file_put_contents($log_file, date('Y-m-d H:i:s') . " - Webhook received\n", FILE_APPEND);
file_put_contents($log_file, "Payload: $payload\n\n", FILE_APPEND);

try {
    // Verify the webhook signature
    $event = \Stripe\Webhook::constructEvent(
        $payload, $sig_header, $endpoint_secret
    );
    
    // Handle the event
    switch ($event->type) {
        case 'payment_intent.succeeded':
            $paymentIntent = $event->data->object;
            handleSuccessfulPayment($paymentIntent);
            break;
            
        case 'payment_intent.payment_failed':
            $paymentIntent = $event->data->object;
            handleFailedPayment($paymentIntent);
            break;
            
        case 'charge.refunded':
            $charge = $event->data->object;
            handleRefund($charge);
            break;
            
        default:
            // Unexpected event type
            http_response_code(400);
            echo json_encode(['error' => 'Unexpected event type: ' . $event->type]);
            exit;
    }
    
    // Return a 200 response to acknowledge receipt of the event
    http_response_code(200);
    echo json_encode(['success' => true]);
} catch(\UnexpectedValueException $e) {
    // Invalid payload
    http_response_code(400);
    echo json_encode(['error' => 'Invalid payload: ' . $e->getMessage()]);
    exit;
} catch(\Stripe\Exception\SignatureVerificationException $e) {
    // Invalid signature
    http_response_code(400);
    echo json_encode(['error' => 'Invalid signature: ' . $e->getMessage()]);
    exit;
} catch (\Exception $e) {
    // General error
    http_response_code(500);
    echo json_encode(['error' => 'Server error: ' . $e->getMessage()]);
    exit;
}

/**
 * Handle a successful payment
 *
 * @param \Stripe\PaymentIntent $paymentIntent The payment intent object
 * @return void
 */
function handleSuccessfulPayment($paymentIntent) {
    // Get metadata from payment intent
    $metadata = $paymentIntent->metadata;
    
    // Connect to the database
    $db = getDatabaseConnection();
    
    // Begin transaction
    $db->beginTransaction();
    
    try {
        // Check metadata to determine what type of payment this is
        if (isset($metadata->order_id)) {
            // This is a regular order
            updateOrderStatus($db, $metadata->order_id, 'paid', $paymentIntent->id);
        } else if (isset($metadata->rental_id) && isset($metadata->payment_id)) {
            // This is a rental payment
            updateRentalPayment($db, $metadata->rental_id, $metadata->payment_id, $paymentIntent->id);
        } else if (isset($metadata->rental_id) && isset($metadata->buyout)) {
            // This is a rental buyout
            processRentalBuyout($db, $metadata->rental_id, $paymentIntent->id);
        } else {
            // Unknown payment type
            throw new Exception('Unknown payment type: No identifiable metadata');
        }
        
        // Log the successful payment
        logPayment($db, $paymentIntent->id, $paymentIntent->amount, 'succeeded', json_encode($metadata));
        
        // Commit the transaction
        $db->commit();
    } catch (Exception $e) {
        // Rollback the transaction on error
        $db->rollBack();
        
        // Log the error
        file_put_contents($GLOBALS['log_file'], 
            date('Y-m-d H:i:s') . " - Error in handleSuccessfulPayment: " . $e->getMessage() . "\n", 
            FILE_APPEND);
        
        // Re-throw the exception
        throw $e;
    }
}

/**
 * Handle a failed payment
 *
 * @param \Stripe\PaymentIntent $paymentIntent The payment intent object
 * @return void
 */
function handleFailedPayment($paymentIntent) {
    // Get metadata from payment intent
    $metadata = $paymentIntent->metadata;
    
    // Connect to the database
    $db = getDatabaseConnection();
    
    // Begin transaction
    $db->beginTransaction();
    
    try {
        // Check metadata to determine what type of payment this is
        if (isset($metadata->order_id)) {
            // This is a regular order
            updateOrderStatus($db, $metadata->order_id, 'payment_failed', $paymentIntent->id);
        } else if (isset($metadata->rental_id) && isset($metadata->payment_id)) {
            // This is a rental payment
            updateRentalPaymentStatus($db, $metadata->rental_id, $metadata->payment_id, 'failed', $paymentIntent->id);
        } else if (isset($metadata->rental_id) && isset($metadata->buyout)) {
            // This is a rental buyout
            updateRentalBuyoutStatus($db, $metadata->rental_id, 'failed', $paymentIntent->id);
        } else {
            // Unknown payment type
            throw new Exception('Unknown payment type: No identifiable metadata');
        }
        
        // Log the failed payment
        logPayment($db, $paymentIntent->id, $paymentIntent->amount, 'failed', json_encode($metadata));
        
        // Commit the transaction
        $db->commit();
    } catch (Exception $e) {
        // Rollback the transaction on error
        $db->rollBack();
        
        // Log the error
        file_put_contents($GLOBALS['log_file'], 
            date('Y-m-d H:i:s') . " - Error in handleFailedPayment: " . $e->getMessage() . "\n", 
            FILE_APPEND);
        
        // Re-throw the exception
        throw $e;
    }
}

/**
 * Handle a refund
 *
 * @param \Stripe\Charge $charge The charge object
 * @return void
 */
function handleRefund($charge) {
    // Connect to the database
    $db = getDatabaseConnection();
    
    // Begin transaction
    $db->beginTransaction();
    
    try {
        // Get the payment intent ID
        $paymentIntentId = $charge->payment_intent;
        
        // Look up the payment in our database
        $stmt = $db->prepare("SELECT metadata FROM payment_log WHERE payment_id = :payment_id");
        $stmt->bindParam(':payment_id', $paymentIntentId);
        $stmt->execute();
        $payment = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$payment) {
            throw new Exception('Payment not found in database: ' . $paymentIntentId);
        }
        
        // Parse metadata
        $metadata = json_decode($payment['metadata']);
        
        // Process refund based on payment type
        if (isset($metadata->order_id)) {
            // This is a regular order refund
            updateOrderStatus($db, $metadata->order_id, 'refunded', $paymentIntentId);
        } else if (isset($metadata->rental_id)) {
            // This is a rental payment or buyout refund
            updateRentalRefund($db, $metadata->rental_id, $paymentIntentId);
        } else {
            // Unknown payment type
            throw new Exception('Unknown payment type for refund: No identifiable metadata');
        }
        
        // Log the refund
        logRefund($db, $paymentIntentId, $charge->amount_refunded, 'succeeded', $charge->refunds->data[0]->id);
        
        // Commit the transaction
        $db->commit();
    } catch (Exception $e) {
        // Rollback the transaction on error
        $db->rollBack();
        
        // Log the error
        file_put_contents($GLOBALS['log_file'], 
            date('Y-m-d H:i:s') . " - Error in handleRefund: " . $e->getMessage() . "\n", 
            FILE_APPEND);
        
        // Re-throw the exception
        throw $e;
    }
}

/**
 * Update order status
 *
 * @param PDO $db Database connection
 * @param string $orderId Order ID
 * @param string $status New status
 * @param string $paymentIntentId Payment intent ID
 * @return void
 */
function updateOrderStatus($db, $orderId, $status, $paymentIntentId) {
    // Update order status
    $stmt = $db->prepare("UPDATE orders SET status = :status, payment_id = :payment_id WHERE order_id = :order_id");
    $stmt->bindParam(':status', $status);
    $stmt->bindParam(':payment_id', $paymentIntentId);
    $stmt->bindParam(':order_id', $orderId);
    $stmt->execute();
    
    // If status is 'paid', update inventory and send confirmation email
    if ($status === 'paid') {
        // Create shipping record
        $stmt = $db->prepare("INSERT INTO order_shipping (order_id, status, created_at) VALUES (:order_id, 'pending', NOW())");
        $stmt->bindParam(':order_id', $orderId);
        $stmt->execute();
        
        // Get customer email
        $stmt = $db->prepare("SELECT u.email FROM orders o JOIN users u ON o.user_id = u.user_id WHERE o.order_id = :order_id");
        $stmt->bindParam(':order_id', $orderId);
        $stmt->execute();
        $customer = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($customer) {
            // Send confirmation email
            sendOrderConfirmationEmail($customer['email'], $orderId);
        }
    }
}

/**
 * Update rental payment
 *
 * @param PDO $db Database connection
 * @param int $rentalId Rental ID
 * @param int $paymentId Payment ID
 * @param string $transactionId Transaction ID
 * @return void
 */
function updateRentalPayment($db, $rentalId, $paymentId, $transactionId) {
    // Update payment status
    $stmt = $db->prepare("
        UPDATE rental_payments 
        SET status = 'paid', payment_date = NOW(), transaction_id = :transaction_id 
        WHERE payment_id = :payment_id AND rental_id = :rental_id
    ");
    $stmt->bindParam(':transaction_id', $transactionId);
    $stmt->bindParam(':payment_id', $paymentId);
    $stmt->bindParam(':rental_id', $rentalId);
    $stmt->execute();
    
    // Check if all payments are complete
    $stmt = $db->prepare("
        SELECT COUNT(*) as total, SUM(CASE WHEN status = 'paid' THEN 1 ELSE 0 END) as paid
        FROM rental_payments
        WHERE rental_id = :rental_id
    ");
    $stmt->bindParam(':rental_id', $rentalId);
    $stmt->execute();
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($result['total'] == $result['paid']) {
        // All payments are complete, update rental status
        $stmt = $db->prepare("UPDATE rentals SET status = 'completed', buyout_price = 0 WHERE rental_id = :rental_id");
        $stmt->bindParam(':rental_id', $rentalId);
        $stmt->execute();
        
        // Add status history
        $stmt = $db->prepare("
            INSERT INTO rental_status_history (rental_id, status, comment, created_at)
            VALUES (:rental_id, 'completed', 'All payments completed, product ownership transferred', NOW())
        ");
        $stmt->bindParam(':rental_id', $rentalId);
        $stmt->execute();
        
        // Get customer email
        $stmt = $db->prepare("
            SELECT u.email 
            FROM rentals r 
            JOIN users u ON r.user_id = u.user_id 
            WHERE r.rental_id = :rental_id
        ");
        $stmt->bindParam(':rental_id', $rentalId);
        $stmt->execute();
        $customer = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($customer) {
            // Send completion email
            sendRentalCompletionEmail($customer['email'], $rentalId);
        }
    } else {
        // Update buyout price (remaining payments)
        $stmt = $db->prepare("
            SELECT SUM(amount) as remaining
            FROM rental_payments
            WHERE rental_id = :rental_id AND status != 'paid'
        ");
        $stmt->bindParam(':rental_id', $rentalId);
        $stmt->execute();
        $remaining = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($remaining && isset($remaining['remaining'])) {
            $stmt = $db->prepare("UPDATE rentals SET buyout_price = :buyout_price WHERE rental_id = :rental_id");
            $stmt->bindParam(':buyout_price', $remaining['remaining']);
            $stmt->bindParam(':rental_id', $rentalId);
            $stmt->execute();
        }
    }
}

/**
 * Process a rental buyout
 *
 * @param PDO $db Database connection
 * @param int $rentalId Rental ID
 * @param string $transactionId Transaction ID
 * @return void
 */
function processRentalBuyout($db, $rentalId, $transactionId) {
    // Mark all pending payments as paid
    $stmt = $db->prepare("
        UPDATE rental_payments
        SET status = 'paid', payment_date = NOW(), transaction_id = :transaction_id
        WHERE rental_id = :rental_id AND status != 'paid'
    ");
    $stmt->bindParam(':transaction_id', $transactionId);
    $stmt->bindParam(':rental_id', $rentalId);
    $stmt->execute();
    
    // Update rental status
    $stmt = $db->prepare("UPDATE rentals SET status = 'completed', buyout_price = 0 WHERE rental_id = :rental_id");
    $stmt->bindParam(':rental_id', $rentalId);
    $stmt->execute();
    
    // Add status history
    $stmt = $db->prepare("
        INSERT INTO rental_status_history (rental_id, status, comment, created_at)
        VALUES (:rental_id, 'completed', 'Rental bought out, product ownership transferred', NOW())
    ");
    $stmt->bindParam(':rental_id', $rentalId);
    $stmt->execute();
    
    // Get customer email
    $stmt = $db->prepare("
        SELECT u.email 
        FROM rentals r 
        JOIN users u ON r.user_id = u.user_id 
        WHERE r.rental_id = :rental_id
    ");
    $stmt->bindParam(':rental_id', $rentalId);
    $stmt->execute();
    $customer = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($customer) {
        // Send buyout completion email
        sendRentalBuyoutEmail($customer['email'], $rentalId);
    }
}

/**
 * Get database connection
 *
 * @return PDO Database connection
 */
function getDatabaseConnection() {
    // Database connection details
    $dbHost = 'localhost';
    $dbName = 'giggatek';
    $dbUser = 'giggatek_user';
    $dbPass = 'your_db_password'; // Replace with actual password
    
    try {
        // Create new PDO instance
        $db = new PDO("mysql:host=$dbHost;dbname=$dbName;charset=utf8mb4", $dbUser, $dbPass);
        
        // Set error mode to exception
        $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        
        return $db;
    } catch (PDOException $e) {
        // Log error
        file_put_contents($GLOBALS['log_file'], 
            date('Y-m-d H:i:s') . " - Database connection error: " . $e->getMessage() . "\n", 
            FILE_APPEND);
        
        throw new Exception('Database connection failed: ' . $e->getMessage());
    }
}

/**
 * Log payment
 *
 * @param PDO $db Database connection
 * @param string $paymentId Payment ID
 * @param int $amount Amount in cents
 * @param string $status Status
 * @param string $metadata Metadata
 * @return void
 */
function logPayment($db, $paymentId, $amount, $status, $metadata) {
    $stmt = $db->prepare("
        INSERT INTO payment_log (payment_id, amount, status, metadata, created_at)
        VALUES (:payment_id, :amount, :status, :metadata, NOW())
        ON DUPLICATE KEY UPDATE
            status = :status,
            metadata = :metadata,
            updated_at = NOW()
    ");
    
    $stmt->bindParam(':payment_id', $paymentId);
    $stmt->bindParam(':amount', $amount);
    $stmt->bindParam(':status', $status);
    $stmt->bindParam(':metadata', $metadata);
    
    $stmt->execute();
}

/**
 * Log refund
 *
 * @param PDO $db Database connection
 * @param string $paymentId Payment ID
 * @param int $amount Amount in cents
 * @param string $status Status
 * @param string $refundId Refund ID
 * @return void
 */
function logRefund($db, $paymentId, $amount, $status, $refundId) {
    $stmt = $db->prepare("
        INSERT INTO refund_log (payment_id, refund_id, amount, status, created_at)
        VALUES (:payment_id, :refund_id, :amount, :status, NOW())
    ");
    
    $stmt->bindParam(':payment_id', $paymentId);
    $stmt->bindParam(':refund_id', $refundId);
    $stmt->bindParam(':amount', $amount);
    $stmt->bindParam(':status', $status);
    
    $stmt->execute();
}

/**
 * Send order confirmation email
 *
 * @param string $email Customer email
 * @param string $orderId Order ID
 * @return void
 */
function sendOrderConfirmationEmail($email, $orderId) {
    // In a production environment, this would send an actual email
    // For now, just log it
    file_put_contents($GLOBALS['log_file'], 
        date('Y-m-d H:i:s') . " - Would send order confirmation email to $email for order $orderId\n", 
        FILE_APPEND);
}

/**
 * Send rental completion email
 *
 * @param string $email Customer email
 * @param int $rentalId Rental ID
 * @return void
 */
function sendRentalCompletionEmail($email, $rentalId) {
    // In a production environment, this would send an actual email
    // For now, just log it
    file_put_contents($GLOBALS['log_file'], 
        date('Y-m-d H:i:s') . " - Would send rental completion email to $email for rental $rentalId\n", 
        FILE_APPEND);
}

/**
 * Send rental buyout email
 *
 * @param string $email Customer email
 * @param int $rentalId Rental ID
 * @return void
 */
function sendRentalBuyoutEmail($email, $rentalId) {
    // In a production environment, this would send an actual email
    // For now, just log it
    file_put_contents($GLOBALS['log_file'], 
        date('Y-m-d H:i:s') . " - Would send rental buyout email to $email for rental $rentalId\n", 
        FILE_APPEND);
}
