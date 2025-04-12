<?php
/**
 * GigGatek - Blog Comment API
 * Handles adding comments to blog posts
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
        'message' => 'You must be logged in to comment'
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
$postId = isset($_POST['post_id']) ? intval($_POST['post_id']) : null;
$comment = isset($_POST['comment']) ? trim($_POST['comment']) : null;
$parentId = isset($_POST['parent_id']) ? intval($_POST['parent_id']) : null;

// Validate required fields
if (!$postId || !$comment) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Post ID and comment are required'
    ]);
    exit;
}

// Validate comment length
if (strlen($comment) < 2 || strlen($comment) > 1000) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Comment must be between 2 and 1000 characters'
    ]);
    exit;
}

// Include database connection
require_once '../../includes/db-connection.php';

try {
    // Prepare SQL statement
    if ($parentId) {
        // This is a reply to another comment
        $sql = "INSERT INTO blog_comments (post_id, user_id, parent_id, content, created_at) 
                VALUES (?, ?, ?, ?, NOW())";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$postId, $userId, $parentId, $comment]);
    } else {
        // This is a top-level comment
        $sql = "INSERT INTO blog_comments (post_id, user_id, content, created_at) 
                VALUES (?, ?, ?, NOW())";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$postId, $userId, $comment]);
    }
    
    // Get the ID of the newly inserted comment
    $commentId = $pdo->lastInsertId();
    
    // Update comment count for the post
    $updateSql = "UPDATE blog_posts SET comment_count = comment_count + 1 WHERE id = ?";
    $updateStmt = $pdo->prepare($updateSql);
    $updateStmt->execute([$postId]);
    
    // Get user avatar
    $avatarSql = "SELECT avatar FROM users WHERE id = ?";
    $avatarStmt = $pdo->prepare($avatarSql);
    $avatarStmt->execute([$userId]);
    $avatar = $avatarStmt->fetchColumn() ?: 'img/avatars/default.jpg';
    
    // Return success response
    echo json_encode([
        'success' => true,
        'message' => 'Comment added successfully',
        'comment' => [
            'id' => $commentId,
            'user_id' => $userId,
            'username' => $username,
            'avatar' => $avatar,
            'content' => $comment,
            'date' => date('Y-m-d H:i:s'),
            'likes' => 0,
            'parent_id' => $parentId
        ]
    ]);
    
} catch (PDOException $e) {
    // Log error (in a real application)
    error_log('Database error: ' . $e->getMessage());
    
    // Return error response
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'An error occurred while adding your comment'
    ]);
}