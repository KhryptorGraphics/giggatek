<?php
/**
 * GigGatek Rental Products API Endpoint
 * 
 * This API provides rental-specific product listings with detailed
 * rental options, availability, and pricing information.
 * 
 * This endpoint implements Redis caching to improve performance and
 * reduce load on the backend API server.
 */

// Start session and initialize
session_start();
header('Content-Type: application/json');

// Include configuration and helper functions
require_once('../../includes/config.php');
require_once('../../includes/functions.php');
require_once('../../includes/cache-manager.php');

// Default parameters
$page = isset($_GET['page']) ? intval($_GET['page']) : 1;
$limit = isset($_GET['limit']) ? intval($_GET['limit']) : 12;
$category = isset($_GET['category']) ? $_GET['category'] : 'all';
$sort = isset($_GET['sort']) ? $_GET['sort'] : 'popular';
$condition = isset($_GET['condition']) ? $_GET['condition'] : '';
$price_min = isset($_GET['price_min']) ? floatval($_GET['price_min']) : 0;
$price_max = isset($_GET['price_max']) ? floatval($_GET['price_max']) : 10000;
$term = isset($_GET['term']) ? intval($_GET['term']) : 0;
$search = isset($_GET['search']) ? $_GET['search'] : '';
$featured = isset($_GET['featured']) && $_GET['featured'] === 'true';

// Validate parameters
if ($page < 1) $page = 1;
if ($limit < 1 || $limit > 50) $limit = 12;
if ($price_min < 0) $price_min = 0;
if ($price_max < $price_min) $price_max = $price_min + 10000;

// Calculate offset
$offset = ($page - 1) * $limit;

// Generate a cache key based on request parameters
$cache_key = 'rental_products_' . md5(json_encode([
    'page' => $page,
    'limit' => $limit,
    'category' => $category,
    'sort' => $sort,
    'condition' => $condition,
    'price_min' => $price_min,
    'price_max' => $price_max,
    'term' => $term,
    'search' => $search,
    'featured' => $featured
]));

// Try to get data from cache first
$products_data = CacheManager::get($cache_key);

// If not in cache or cache is disabled, fetch from API
if ($products_data === null) {
    // Set up API request to backend
    $api_url = API_BASE_URL . '/products';

    // Build query parameters
    $query_params = array(
        'page' => $page,
        'limit' => $limit,
        'rental_only' => 'true',
        'offset' => $offset
    );

    if ($category !== 'all') {
        $query_params['category'] = $category;
    }

    if ($sort) {
        $query_params['sort'] = $sort;
    }

    if ($condition) {
        $query_params['condition'] = $condition;
    }

    if ($price_min > 0) {
        $query_params['price_min'] = $price_min;
    }

    if ($price_max < 10000) {
        $query_params['price_max'] = $price_max;
    }

    if ($term > 0) {
        $query_params['rental_term'] = $term;
    }

    if ($search) {
        $query_params['search'] = $search;
    }

    if ($featured) {
        $query_params['featured'] = 'true';
    }

    // Build query string
    $query_string = http_build_query($query_params);
    $api_url .= '?' . $query_string;

    // Set up cURL request
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $api_url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'Accept: application/json'
    ]);

    // Execute the request
    $response = curl_exec($ch);
    $status_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    // Check for error
    if ($status_code !== 200) {
        http_response_code($status_code);
        echo json_encode([
            'success' => false,
            'message' => 'Failed to retrieve products',
            'status' => $status_code
        ]);
        exit;
    }

    // Parse response from backend
    $products_data = json_decode($response, true);

    // Save to cache for future requests (expires in 10 minutes)
    CacheManager::set($cache_key, $products_data, 600);
}

// Enhance products with calculated rental information
if (isset($products_data['products']) && is_array($products_data['products'])) {
    foreach ($products_data['products'] as &$product) {
        // Default term if not specified
        $rental_term = $term > 0 ? $term : 12;
        
        // Calculate rental rates based on term
        $purchase_price = floatval($product['price']);
        
        // Apply rental factor based on term length
        $rental_factor = 1.25; // Default 25% premium
        if ($rental_term <= 6) {
            $rental_factor = 1.35; // 35% premium for short terms
        } else if ($rental_term > 12) {
            $rental_factor = 1.15; // 15% premium for long terms
        }
        
        $total_rental_cost = $purchase_price * $rental_factor;
        $monthly_rate = $total_rental_cost / $rental_term;
        
        // Add rental information to product
        $product['rental_info'] = [
            'purchase_price' => $purchase_price,
            'monthly_rate' => $monthly_rate,
            'default_term' => $rental_term,
            'total_cost' => $total_rental_cost,
            'rental_premium' => ($rental_factor - 1) * 100,
            'available_terms' => [3, 6, 12, 24, 36],
            'is_available' => $product['stock'] > 0 && $product['rental_eligible'] === true
        ];
        
        // Add dynamic info about savings
        if ($rental_term >= 12) {
            $shorter_term = 6;
            $shorter_factor = 1.35;
            $shorter_total = $purchase_price * $shorter_factor;
            $shorter_monthly = $shorter_total / $shorter_term;
            
            $savings_monthly = $shorter_monthly - $monthly_rate;
            $savings_percentage = ($savings_monthly / $shorter_monthly) * 100;
            
            $product['rental_info']['savings'] = [
                'vs_term' => $shorter_term,
                'monthly_savings' => $savings_monthly,
                'savings_percentage' => $savings_percentage
            ];
        }
        
        // Add early buyout options
        $product['rental_info']['buyout_options'] = [];
        
        // Calculate buyout options at 25%, 50%, and 75% of term
        $quarter_term = ceil($rental_term * 0.25);
        $half_term = ceil($rental_term * 0.5);
        $three_quarter_term = ceil($rental_term * 0.75);
        
        $payments_at_quarter = $quarter_term * $monthly_rate;
        $payments_at_half = $half_term * $monthly_rate;
        $payments_at_three_quarter = $three_quarter_term * $monthly_rate;
        
        $product['rental_info']['buyout_options'] = [
            [
                'at_month' => $quarter_term,
                'payments_made' => $payments_at_quarter,
                'buyout_amount' => max(0, $total_rental_cost - $payments_at_quarter),
                'vs_purchase_savings' => $purchase_price - ($payments_at_quarter + max(0, $total_rental_cost - $payments_at_quarter))
            ],
            [
                'at_month' => $half_term,
                'payments_made' => $payments_at_half,
                'buyout_amount' => max(0, $total_rental_cost - $payments_at_half),
                'vs_purchase_savings' => $purchase_price - ($payments_at_half + max(0, $total_rental_cost - $payments_at_half))
            ],
            [
                'at_month' => $three_quarter_term,
                'payments_made' => $payments_at_three_quarter,
                'buyout_amount' => max(0, $total_rental_cost - $payments_at_three_quarter),
                'vs_purchase_savings' => $purchase_price - ($payments_at_three_quarter + max(0, $total_rental_cost - $payments_at_three_quarter))
            ]
        ];
    }
}

// Add cache status header for debugging
header('X-Cache: ' . (CacheManager::wasHit() ? 'HIT' : 'MISS'));

// Return enhanced data
echo json_encode($products_data);
