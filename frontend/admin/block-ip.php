<?php
/**
 * Block IP
 * 
 * This script handles blocking an IP address.
 */

// Include necessary files
require_once '../includes/header.php';
require_once '../includes/auth.php';

// Check if user is logged in and has admin privileges
if (!isLoggedIn() || !hasPermission('MANAGE_SECURITY')) {
    header('Location: ../login.php?redirect=' . urlencode($_SERVER['REQUEST_URI']));
    exit;
}

// Check if form was submitted
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['ip']) && isset($_POST['duration']) && isset($_POST['reason'])) {
    $ip = $_POST['ip'];
    $duration = intval($_POST['duration']);
    $reason = $_POST['reason'];
    
    // Validate IP address
    if (!filter_var($ip, FILTER_VALIDATE_IP)) {
        $_SESSION['flash_message'] = [
            'type' => 'danger',
            'message' => 'Invalid IP address format.'
        ];
        header('Location: api-dashboard.php');
        exit;
    }
    
    // Validate duration
    if ($duration < 1 || $duration > 86400) {
        $_SESSION['flash_message'] = [
            'type' => 'danger',
            'message' => 'Invalid duration. Must be between 1 and 86400 seconds.'
        ];
        header('Location: api-dashboard.php');
        exit;
    }
    
    // Load blocked IPs
    $blockedIPs = [];
    $blockedIPsFile = '../data/analytics/blocked-ips.json';
    if (file_exists($blockedIPsFile)) {
        $blockedIPs = json_decode(file_get_contents($blockedIPsFile), true);
    }
    
    // Add IP to blocked list
    $blockedIPs[$ip] = [
        'expires_at' => time() + $duration,
        'reason' => $reason
    ];
    
    // Save updated blocked IPs
    file_put_contents($blockedIPsFile, json_encode($blockedIPs, JSON_PRETTY_PRINT));
    
    // Log the action
    $logFile = '../logs/security.log';
    $logMessage = date('Y-m-d H:i:s') . ' - IP blocked by admin: ' . $ip . ' - Duration: ' . $duration . 's - Reason: ' . $reason . ' - User: ' . getCurrentUser()['id'] . "\n";
    file_put_contents($logFile, $logMessage, FILE_APPEND);
    
    // Call the backend API to block the IP
    $apiUrl = 'http://localhost:8000/api/v1/security/block-ip';
    $data = [
        'ip_address' => $ip,
        'duration' => $duration,
        'reason' => $reason
    ];
    
    $ch = curl_init($apiUrl);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'Authorization: Bearer ' . $_SESSION['token']
    ]);
    
    $response = curl_exec($ch);
    curl_close($ch);
    
    // Set success message
    $_SESSION['flash_message'] = [
        'type' => 'success',
        'message' => 'IP address ' . htmlspecialchars($ip) . ' has been blocked for ' . formatDuration($duration) . '.'
    ];
}

// Redirect back to the API dashboard
header('Location: api-dashboard.php');
exit;

/**
 * Format duration in seconds to a human-readable string
 * 
 * @param int $seconds Duration in seconds
 * @return string Formatted duration
 */
function formatDuration($seconds) {
    if ($seconds < 60) {
        return $seconds . ' seconds';
    } elseif ($seconds < 3600) {
        $minutes = floor($seconds / 60);
        return $minutes . ' minute' . ($minutes > 1 ? 's' : '');
    } elseif ($seconds < 86400) {
        $hours = floor($seconds / 3600);
        return $hours . ' hour' . ($hours > 1 ? 's' : '');
    } else {
        $days = floor($seconds / 86400);
        return $days . ' day' . ($days > 1 ? 's' : '');
    }
}
