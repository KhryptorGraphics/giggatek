<?php
/**
 * GigGatek - Testimonial Submission API
 * Handles user-submitted testimonials
 */

// Start session if not already started
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Set headers for JSON response
header('Content-Type: application/json');

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode([
        'success' => false,
        'message' => 'You must be logged in to submit a testimonial'
    ]);
    exit;
}

// Check if request method is POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Method not allowed'
    ]);
    exit;
}

// Get user information from session
$userId = $_SESSION['user_id'];
$username = $_SESSION['username'] ?? 'Anonymous';

// Get post data
$title = isset($_POST['title']) ? trim($_POST['title']) : null;
$rating = isset($_POST['rating']) ? intval($_POST['rating']) : null;
$category = isset($_POST['category']) ? trim($_POST['category']) : null;
$product = isset($_POST['product']) ? trim($_POST['product']) : null;
$content = isset($_POST['content']) ? trim($_POST['content']) : null;
$terms = isset($_POST['terms']) ? true : false;

// Validate required fields
if (!$title || !$rating || !$category || !$content || !$terms) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'All required fields must be filled out'
    ]);
    exit;
}

// Validate rating range
if ($rating < 1 || $rating > 5) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Rating must be between 1 and 5'
    ]);
    exit;
}

// Validate content length
if (strlen($content) < 10 || strlen($content) > 2000) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Testimonial content must be between 10 and 2000 characters'
    ]);
    exit;
}

// Validate title length
if (strlen($title) < 3 || strlen($title) > 100) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Title must be between 3 and 100 characters'
    ]);
    exit;
}

// Include database connection
require_once '../../includes/db-connection.php';

try {
    // Check if user has already submitted a testimonial in the last 30 days
    $checkSql = "SELECT COUNT(*) FROM testimonials WHERE user_id = ? AND created_at > DATE_SUB(NOW(), INTERVAL 30 DAY)";
    $checkStmt = $pdo->prepare($checkSql);
    $checkStmt->execute([$userId]);
    $recentCount = $checkStmt->fetchColumn();
    
    if ($recentCount > 0) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'You can only submit one testimonial every 30 days'
        ]);
        exit;
    }
    
    // Prepare SQL statement
    $sql = "INSERT INTO testimonials (user_id, title, rating, category, product, content, status, created_at) 
            VALUES (?, ?, ?, ?, ?, ?, 'pending', NOW())";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$userId, $title, $rating, $category, $product, $content]);
    
    // Get the ID of the newly inserted testimonial
    $testimonialId = $pdo->lastInsertId();
    
    // Get user avatar
    $avatarSql = "SELECT avatar FROM users WHERE id = ?";
    $avatarStmt = $pdo->prepare($avatarSql);
    $avatarStmt->execute([$userId]);
    $avatar = $avatarStmt->fetchColumn() ?: 'img/avatars/default.jpg';
    
    // Return success response
    echo json_encode([
        'success' => true,
        'message' => 'Thank you for your testimonial! It has been submitted for review and will be published soon.',
        'testimonial' => [
            'id' => $testimonialId,
            'user_id' => $userId,
            'username' => $username,
            'avatar' => $avatar,
            'title' => $title,
            'rating' => $rating,
            'category' => $category,
            'product' => $product,
            'content' => $content,
            'status' => 'pending',
            'date' => date('Y-m-d H:i:s')
        ]
    ]);
    
} catch (PDOException $e) {
    // Log error (in a real application)
    error_log('Database error: ' . $e->getMessage());
    
    // Return error response
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'An error occurred while submitting your testimonial'
    ]);
}