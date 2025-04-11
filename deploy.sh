#!/bin/bash
# Deployment script for GigGatek to giggatek.com

# Configuration
FRONTEND_DIR="/var/www/clients/client1/web9/web"
BACKEND_DIR="/opt/giggatek"
GIT_REPO_DIR="/home/kp/dev/giggatek"
LOG_DIR="/var/log/giggatek"

echo "Starting GigGatek deployment..."

# Create backend directory if it doesn't exist
echo "Setting up backend directory..."
sudo mkdir -p $BACKEND_DIR
sudo mkdir -p $LOG_DIR

# Deploy backend
echo "Deploying backend..."
sudo cp -r $GIT_REPO_DIR/backend/* $BACKEND_DIR/
sudo cp $GIT_REPO_DIR/run.py $BACKEND_DIR/
sudo chown -R www-data:www-data $BACKEND_DIR
sudo chmod -R 755 $BACKEND_DIR
sudo chown -R www-data:www-data $LOG_DIR

# Create systemd service for backend
echo "Creating systemd service..."
sudo bash -c "cat > /etc/systemd/system/giggatek-backend.service << 'EOL'
[Unit]
Description=GigGatek Backend Service
After=network.target

[Service]
User=www-data
WorkingDirectory=/opt/giggatek
ExecStart=/usr/bin/python3 run.py
Restart=always
Environment=\"FLASK_ENV=production\"
Environment=\"CORS_ALLOWED_ORIGINS=https://giggatek.com\"

[Install]
WantedBy=multi-user.target
EOL"

# Deploy frontend
echo "Deploying frontend..."
sudo cp -r $GIT_REPO_DIR/frontend/* $FRONTEND_DIR/
sudo chown -R web9:client1 $FRONTEND_DIR
sudo chmod -R 755 $FRONTEND_DIR

# Create API proxy directory and file
echo "Setting up API proxy..."
sudo mkdir -p $FRONTEND_DIR/api
sudo bash -c "cat > $FRONTEND_DIR/api/index.php << 'EOL'
<?php
/**
 * GigGatek API Proxy
 * 
 * This file forwards API requests from the frontend to the backend API server.
 */

// Set content type to JSON
header('Content-Type: application/json');

// Allow CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

// Handle preflight OPTIONS request
if (\$_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Backend API URL
\$backend_url = 'http://localhost:5000';

// Get the request path (remove /api from the beginning)
\$request_uri = \$_SERVER['REQUEST_URI'];
\$api_prefix = '/api';
\$path = substr(\$request_uri, strpos(\$request_uri, \$api_prefix) + strlen(\$api_prefix));

// Build the full URL to the backend API
\$url = \$backend_url . \$path;

// Get request method
\$method = \$_SERVER['REQUEST_METHOD'];

// Get request headers
\$headers = getallheaders();
\$request_headers = [];

// Forward relevant headers
foreach (\$headers as \$header => \$value) {
    if (strtolower(\$header) === 'host') {
        continue; // Skip host header
    }
    \$request_headers[] = \"\$header: \$value\";
}

// Get request body for POST, PUT requests
\$body = file_get_contents('php://input');

// Initialize cURL
\$ch = curl_init();

// Set cURL options
curl_setopt(\$ch, CURLOPT_URL, \$url);
curl_setopt(\$ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt(\$ch, CURLOPT_HTTPHEADER, \$request_headers);
curl_setopt(\$ch, CURLOPT_CUSTOMREQUEST, \$method);

// Set request body for POST, PUT requests
if (\$method === 'POST' || \$method === 'PUT') {
    curl_setopt(\$ch, CURLOPT_POSTFIELDS, \$body);
}

// Execute cURL request
\$response = curl_exec(\$ch);
\$http_code = curl_getinfo(\$ch, CURLINFO_HTTP_CODE);

// Check for cURL errors
if (curl_errno(\$ch)) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Error connecting to backend API: ' . curl_error(\$ch)
    ]);
    exit;
}

// Close cURL
curl_close(\$ch);

// Set HTTP status code
http_response_code(\$http_code);

// Output response
echo \$response;
EOL"

# Create .htaccess file
echo "Creating .htaccess file..."
sudo bash -c "cat > $FRONTEND_DIR/.htaccess << 'EOL'
# GigGatek Frontend .htaccess
# Handles URL rewriting and API routing

# Enable URL rewriting
RewriteEngine On

# API requests - forward to the API proxy
RewriteRule ^api/(.*)$ api/index.php [QSA,L]

# Handle 404 errors
ErrorDocument 404 /404.html

# Prevent directory listing
Options -Indexes

# Set default character set
AddDefaultCharset UTF-8

# Enable CORS
<IfModule mod_headers.c>
    Header set Access-Control-Allow-Origin "*"
    Header set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
    Header set Access-Control-Allow-Headers "Content-Type, Authorization, X-Requested-With"
</IfModule>

# Cache control for static assets
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/gif "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/svg+xml "access plus 1 year"
    ExpiresByType text/css "access plus 1 month"
    ExpiresByType application/javascript "access plus 1 month"
    ExpiresByType application/x-javascript "access plus 1 month"
    ExpiresByType image/x-icon "access plus 1 year"
</IfModule>

# Compress text files
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css application/javascript application/json
</IfModule>
EOL"

# Enable and start the backend service
echo "Starting backend service..."
sudo systemctl daemon-reload
sudo systemctl enable giggatek-backend
sudo systemctl restart giggatek-backend

echo "Deployment completed successfully!"
echo "Frontend: https://giggatek.com"
echo "Backend API: http://localhost:5000 (proxied through https://giggatek.com/api)"
