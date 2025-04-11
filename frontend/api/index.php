<?php
/**
 * GigGatek API Proxy
 * 
 * This file forwards API requests from the frontend to the backend API server.
 * It handles CORS and authentication forwarding.
 */

// Set content type to JSON
header('Content-Type: application/json');

// Allow CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Backend API URL
$backend_url = 'http://localhost:5000';

// Get the request path (remove /api from the beginning)
$request_uri = $_SERVER['REQUEST_URI'];
$api_prefix = '/api';
$path = substr($request_uri, strpos($request_uri, $api_prefix) + strlen($api_prefix));

// Build the full URL to the backend API
$url = $backend_url . $path;

// Get request method
$method = $_SERVER['REQUEST_METHOD'];

// Get request headers
$headers = getallheaders();
$request_headers = [];

// Forward relevant headers
foreach ($headers as $header => $value) {
    if (strtolower($header) === 'host') {
        continue; // Skip host header
    }
    $request_headers[] = "$header: $value";
}

// Get request body for POST, PUT requests
$body = file_get_contents('php://input');

// Initialize cURL
$ch = curl_init();

// Set cURL options
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, $request_headers);
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);

// Set request body for POST, PUT requests
if ($method === 'POST' || $method === 'PUT') {
    curl_setopt($ch, CURLOPT_POSTFIELDS, $body);
}

// Execute cURL request
$response = curl_exec($ch);
$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);

// Check for cURL errors
if (curl_errno($ch)) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Error connecting to backend API: ' . curl_error($ch)
    ]);
    exit;
}

// Close cURL
curl_close($ch);

// Set HTTP status code
http_response_code($http_code);

// Output response
echo $response;
