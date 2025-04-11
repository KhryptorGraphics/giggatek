<?php
/**
 * Unblock IP
 * 
 * This script handles unblocking an IP address.
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
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['ip'])) {
    $ip = $_POST['ip'];
    
    // Load blocked IPs
    $blockedIPs = [];
    $blockedIPsFile = '../data/analytics/blocked-ips.json';
    if (file_exists($blockedIPsFile)) {
        $blockedIPs = json_decode(file_get_contents($blockedIPsFile), true);
    }
    
    // Remove IP from blocked list
    if (isset($blockedIPs[$ip])) {
        unset($blockedIPs[$ip]);
        
        // Save updated blocked IPs
        file_put_contents($blockedIPsFile, json_encode($blockedIPs, JSON_PRETTY_PRINT));
        
        // Log the action
        $logFile = '../logs/security.log';
        $logMessage = date('Y-m-d H:i:s') . ' - IP unblocked by admin: ' . $ip . ' - User: ' . getCurrentUser()['id'] . "\n";
        file_put_contents($logFile, $logMessage, FILE_APPEND);
        
        // Call the backend API to unblock the IP
        $apiUrl = 'http://localhost:8000/api/v1/security/unblock-ip';
        $data = [
            'ip_address' => $ip
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
            'message' => 'IP address ' . htmlspecialchars($ip) . ' has been unblocked.'
        ];
    } else {
        // Set error message
        $_SESSION['flash_message'] = [
            'type' => 'danger',
            'message' => 'IP address ' . htmlspecialchars($ip) . ' is not in the blocked list.'
        ];
    }
}

// Redirect back to the API dashboard
header('Location: api-dashboard.php');
exit;
