<?php
/**
 * Authentication Functions
 * 
 * This file contains functions for authentication and authorization.
 */

/**
 * Check if the user is logged in
 * 
 * @return bool True if the user is logged in, false otherwise
 */
function isLoggedIn() {
    return isset($_SESSION['user_id']) && !empty($_SESSION['user_id']);
}

/**
 * Get the current user
 * 
 * @return array|null User data or null if not logged in
 */
function getCurrentUser() {
    if (!isLoggedIn()) {
        return null;
    }
    
    // In a real implementation, this would fetch the user from the database
    // For this example, we'll return mock data
    return [
        'id' => $_SESSION['user_id'],
        'email' => $_SESSION['email'] ?? 'user@example.com',
        'name' => $_SESSION['name'] ?? 'Test User',
        'role' => $_SESSION['role'] ?? 'ADMIN'
    ];
}

/**
 * Check if the user has a specific permission
 * 
 * @param string $permission Permission to check
 * @return bool True if the user has the permission, false otherwise
 */
function hasPermission($permission) {
    if (!isLoggedIn()) {
        return false;
    }
    
    // Get user role
    $role = $_SESSION['role'] ?? 'GUEST';
    
    // Define role permissions
    $rolePermissions = [
        'GUEST' => [
            'VIEW_PRODUCTS'
        ],
        'CUSTOMER' => [
            'VIEW_PRODUCTS',
            'VIEW_OWN_ORDERS',
            'CANCEL_OWN_ORDERS',
            'VIEW_OWN_RENTALS',
            'CANCEL_OWN_RENTALS',
            'VIEW_OWN_PROFILE',
            'EDIT_OWN_PROFILE'
        ],
        'SUPPORT' => [
            'VIEW_PRODUCTS',
            'VIEW_ALL_ORDERS',
            'UPDATE_ORDER_STATUS',
            'VIEW_ALL_RENTALS',
            'UPDATE_RENTAL_STATUS',
            'VIEW_CUSTOMERS',
            'VIEW_ANALYTICS'
        ],
        'ADMIN' => [
            'VIEW_PRODUCTS',
            'CREATE_PRODUCTS',
            'EDIT_PRODUCTS',
            'DELETE_PRODUCTS',
            'VIEW_ALL_ORDERS',
            'UPDATE_ORDER_STATUS',
            'CANCEL_ANY_ORDER',
            'VIEW_ALL_RENTALS',
            'UPDATE_RENTAL_STATUS',
            'CANCEL_ANY_RENTAL',
            'VIEW_CUSTOMERS',
            'EDIT_CUSTOMERS',
            'VIEW_ANALYTICS',
            'MANAGE_SECURITY',
            'MANAGE_SETTINGS'
        ],
        'SUPER_ADMIN' => [
            '*' // All permissions
        ]
    ];
    
    // Check if user has the permission
    if ($role === 'SUPER_ADMIN') {
        return true; // Super admin has all permissions
    }
    
    return in_array($permission, $rolePermissions[$role] ?? []);
}

/**
 * Log in a user
 * 
 * @param int $userId User ID
 * @param string $email User email
 * @param string $name User name
 * @param string $role User role
 * @param string $token JWT token
 * @return bool True if login was successful, false otherwise
 */
function login($userId, $email, $name, $role, $token) {
    $_SESSION['user_id'] = $userId;
    $_SESSION['email'] = $email;
    $_SESSION['name'] = $name;
    $_SESSION['role'] = $role;
    $_SESSION['token'] = $token;
    $_SESSION['login_time'] = time();
    
    return true;
}

/**
 * Log out the current user
 * 
 * @return bool True if logout was successful, false otherwise
 */
function logout() {
    // Clear session variables
    $_SESSION = [];
    
    // Destroy the session
    session_destroy();
    
    return true;
}

/**
 * Check if the token needs to be refreshed
 * 
 * @return bool True if the token needs to be refreshed, false otherwise
 */
function needsTokenRefresh() {
    // Check if user is logged in
    if (!isLoggedIn()) {
        return false;
    }
    
    // Check if login time is set
    if (!isset($_SESSION['login_time'])) {
        return true;
    }
    
    // Check if token is about to expire (refresh 5 minutes before expiry)
    $tokenLifetime = 45 * 60; // 45 minutes in seconds
    $refreshThreshold = 5 * 60; // 5 minutes in seconds
    
    return (time() - $_SESSION['login_time']) > ($tokenLifetime - $refreshThreshold);
}

/**
 * Refresh the token
 * 
 * @return bool True if refresh was successful, false otherwise
 */
function refreshToken() {
    // In a real implementation, this would call the API to refresh the token
    // For this example, we'll just update the login time
    $_SESSION['login_time'] = time();
    
    return true;
}

// Start session if not already started
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Check if token needs to be refreshed
if (needsTokenRefresh()) {
    refreshToken();
}
