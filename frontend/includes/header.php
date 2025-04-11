<?php
/**
 * Header Include
 * 
 * This file contains common header code for all pages.
 */

// Start session if not already started
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Set default timezone
date_default_timezone_set('UTC');

// Create data directories if they don't exist
$dataDirs = [
    '../data',
    '../data/analytics',
    '../data/analytics/errors',
    '../logs'
];

foreach ($dataDirs as $dir) {
    if (!is_dir($dir)) {
        mkdir($dir, 0755, true);
    }
}

/**
 * Display a flash message
 * 
 * @return void
 */
function displayFlashMessage() {
    if (isset($_SESSION['flash_message'])) {
        $type = $_SESSION['flash_message']['type'] ?? 'info';
        $message = $_SESSION['flash_message']['message'] ?? '';
        
        echo '<div class="alert alert-' . htmlspecialchars($type) . ' alert-dismissible fade show" role="alert">';
        echo htmlspecialchars($message);
        echo '<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>';
        echo '</div>';
        
        // Clear the flash message
        unset($_SESSION['flash_message']);
    }
}
