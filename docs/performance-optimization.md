# Performance Optimization Guide

## Overview

This guide provides strategies and best practices for optimizing the performance of the GigGatek application. Performance optimization is crucial for providing a fast, responsive user experience and improving conversion rates.

## Table of Contents

1. [Frontend Optimization](#frontend-optimization)
2. [Backend Optimization](#backend-optimization)
3. [Database Optimization](#database-optimization)
4. [Network Optimization](#network-optimization)
5. [Caching Strategies](#caching-strategies)
6. [Monitoring and Analysis](#monitoring-and-analysis)
7. [Implementation Checklist](#implementation-checklist)

## Frontend Optimization

### JavaScript Optimization

#### Code Bundling and Minification

We use Webpack to bundle and minify JavaScript files:

```javascript
// webpack.config.js
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  // ...
  optimization: {
    minimize: process.env.NODE_ENV === 'production',
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          format: {
            comments: false
          },
          compress: {
            drop_console: process.env.NODE_ENV === 'production'
          }
        },
        extractComments: false
      })
    ]
  }
};
```

#### Code Splitting

Split code into smaller chunks to load only what's needed:

```javascript
// webpack.config.js
module.exports = {
  // ...
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all'
        }
      }
    }
  }
};
```

#### Lazy Loading

Lazy load components that aren't immediately needed:

```javascript
// Example of lazy loading the dashboard
if (document.querySelector('.dashboard-container')) {
  import('./dashboard.js').then(module => {
    const Dashboard = module.default;
    window.dashboard = new Dashboard();
  });
}
```

### CSS Optimization

#### CSS Minification

Minify CSS files to reduce file size:

```javascript
// webpack.config.js
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');

module.exports = {
  // ...
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader'
        ]
      }
    ]
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'css/[name].bundle.css'
    })
  ],
  optimization: {
    minimizer: [
      new CssMinimizerPlugin()
    ]
  }
};
```

#### Critical CSS

Inline critical CSS to improve initial render time:

```php
<!-- In the head section of your HTML -->
<style>
  <?php include 'dist/css/critical.css'; ?>
</style>
<link rel="preload" href="dist/css/main.bundle.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
<noscript><link rel="stylesheet" href="dist/css/main.bundle.css"></noscript>
```

### Image Optimization

#### Responsive Images

Use responsive images to serve appropriate sizes:

```html
<img 
  src="img/product-small.jpg" 
  srcset="img/product-small.jpg 400w, img/product-medium.jpg 800w, img/product-large.jpg 1200w" 
  sizes="(max-width: 600px) 400px, (max-width: 1200px) 800px, 1200px" 
  alt="Product Image"
>
```

#### Lazy Loading Images

Lazy load images that aren't in the initial viewport:

```html
<img 
  src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==" 
  data-src="img/product.jpg" 
  alt="Product Image" 
  class="lazy-load"
>
```

```javascript
// Lazy load images when they enter the viewport
document.addEventListener('DOMContentLoaded', function() {
  const lazyImages = document.querySelectorAll('.lazy-load');
  
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver(function(entries, observer) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          const image = entry.target;
          image.src = image.dataset.src;
          image.classList.remove('lazy-load');
          imageObserver.unobserve(image);
        }
      });
    });
    
    lazyImages.forEach(function(image) {
      imageObserver.observe(image);
    });
  } else {
    // Fallback for browsers that don't support IntersectionObserver
    // ...
  }
});
```

#### Image Formats

Use modern image formats like WebP with fallbacks:

```html
<picture>
  <source srcset="img/product.webp" type="image/webp">
  <source srcset="img/product.jpg" type="image/jpeg">
  <img src="img/product.jpg" alt="Product Image">
</picture>
```

### Performance Metrics

Monitor key performance metrics:

- **First Contentful Paint (FCP)**: Time until the first content is rendered
- **Largest Contentful Paint (LCP)**: Time until the largest content is rendered
- **First Input Delay (FID)**: Time until the page responds to user interaction
- **Cumulative Layout Shift (CLS)**: Measure of visual stability

## Backend Optimization

### PHP Optimization

#### OPcache

Enable OPcache to cache compiled PHP code:

```php
// php.ini
opcache.enable=1
opcache.memory_consumption=128
opcache.interned_strings_buffer=8
opcache.max_accelerated_files=4000
opcache.revalidate_freq=60
opcache.fast_shutdown=1
```

#### Autoloading

Use Composer's autoloader in production mode:

```bash
composer dump-autoload --optimize
```

### API Optimization

#### Response Compression

Enable GZIP compression for API responses:

```php
// .htaccess
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE application/json
  AddOutputFilterByType DEFLATE application/javascript
  AddOutputFilterByType DEFLATE text/css
  AddOutputFilterByType DEFLATE text/html
  AddOutputFilterByType DEFLATE text/plain
</IfModule>
```

#### Pagination

Implement pagination for large data sets:

```php
// API endpoint with pagination
function getProducts($page = 1, $limit = 20) {
  $offset = ($page - 1) * $limit;
  
  $conn = get_db_connection();
  $stmt = $conn->prepare("
    SELECT * FROM products
    LIMIT ?, ?
  ");
  
  $stmt->bind_param("ii", $offset, $limit);
  $stmt->execute();
  $result = $stmt->get_result();
  
  $products = [];
  while ($row = $result->fetch_assoc()) {
    $products[] = $row;
  }
  
  // Get total count for pagination
  $stmt = $conn->prepare("SELECT COUNT(*) as total FROM products");
  $stmt->execute();
  $totalResult = $stmt->get_result();
  $total = $totalResult->fetch_assoc()['total'];
  
  $stmt->close();
  $conn->close();
  
  return [
    'products' => $products,
    'total' => $total,
    'page' => $page,
    'limit' => $limit,
    'pages' => ceil($total / $limit)
  ];
}
```

#### Response Filtering

Allow clients to request only the fields they need:

```php
// API endpoint with field filtering
function getProduct($productId, $fields = null) {
  $conn = get_db_connection();
  
  // Determine which fields to select
  if ($fields) {
    $allowedFields = ['product_id', 'name', 'description', 'price', 'image_url'];
    $requestedFields = explode(',', $fields);
    $selectedFields = array_intersect($allowedFields, $requestedFields);
    
    if (empty($selectedFields)) {
      $selectedFields = ['product_id', 'name']; // Default fields
    }
    
    $fieldList = implode(', ', $selectedFields);
  } else {
    $fieldList = '*'; // All fields
  }
  
  $stmt = $conn->prepare("
    SELECT $fieldList FROM products
    WHERE product_id = ?
  ");
  
  $stmt->bind_param("i", $productId);
  $stmt->execute();
  $result = $stmt->get_result();
  $product = $result->fetch_assoc();
  
  $stmt->close();
  $conn->close();
  
  return $product;
}
```

## Database Optimization

### Query Optimization

#### Indexing

Create appropriate indexes for frequently queried columns:

```sql
-- Add index for product searches
CREATE INDEX idx_products_name ON products(name);

-- Add index for order lookups
CREATE INDEX idx_orders_user_id ON orders(user_id);

-- Add composite index for wishlist
CREATE INDEX idx_wishlist_user_product ON wishlist_items(user_id, product_id);
```

#### Query Caching

Cache frequently used queries:

```php
function getPopularProducts($limit = 10) {
  $cacheKey = "popular_products_$limit";
  $cache = getCache();
  
  // Check if data is in cache
  $cachedData = $cache->get($cacheKey);
  if ($cachedData !== false) {
    return $cachedData;
  }
  
  // If not in cache, query the database
  $conn = get_db_connection();
  $stmt = $conn->prepare("
    SELECT p.* FROM products p
    JOIN order_items oi ON p.product_id = oi.product_id
    GROUP BY p.product_id
    ORDER BY COUNT(oi.order_item_id) DESC
    LIMIT ?
  ");
  
  $stmt->bind_param("i", $limit);
  $stmt->execute();
  $result = $stmt->get_result();
  
  $products = [];
  while ($row = $result->fetch_assoc()) {
    $products[] = $row;
  }
  
  $stmt->close();
  $conn->close();
  
  // Store in cache for 1 hour
  $cache->set($cacheKey, $products, 3600);
  
  return $products;
}
```

#### Connection Pooling

Use connection pooling to reduce database connection overhead:

```php
// Database connection pool
class DatabaseConnectionPool {
  private static $instance;
  private $connections = [];
  private $maxConnections = 10;
  
  public static function getInstance() {
    if (!self::$instance) {
      self::$instance = new self();
    }
    return self::$instance;
  }
  
  public function getConnection() {
    // Check if there's an available connection
    foreach ($this->connections as $key => $conn) {
      if (!$conn['in_use']) {
        $this->connections[$key]['in_use'] = true;
        return [
          'connection' => $conn['connection'],
          'key' => $key
        ];
      }
    }
    
    // If no available connection and not at max, create a new one
    if (count($this->connections) < $this->maxConnections) {
      $conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
      $key = count($this->connections);
      $this->connections[$key] = [
        'connection' => $conn,
        'in_use' => true
      ];
      return [
        'connection' => $conn,
        'key' => $key
      ];
    }
    
    // If at max connections, wait for one to become available
    return null;
  }
  
  public function releaseConnection($key) {
    if (isset($this->connections[$key])) {
      $this->connections[$key]['in_use'] = false;
    }
  }
}
```

## Network Optimization

### HTTP/2

Enable HTTP/2 for faster parallel loading:

```apache
# Apache config
<IfModule mod_http2.c>
    Protocols h2 h2c http/1.1
</IfModule>
```

### Content Delivery Network (CDN)

Use a CDN for static assets:

```html
<!-- Use CDN for libraries -->
<script src="https://cdn.jsdelivr.net/npm/jquery@3.6.0/dist/jquery.min.js"></script>

<!-- Use CDN for your own assets in production -->
<link rel="stylesheet" href="https://cdn.yourdomain.com/css/main.bundle.css">
<script src="https://cdn.yourdomain.com/js/main.bundle.js"></script>
```

### Resource Hints

Use resource hints to improve loading performance:

```html
<!-- Preconnect to CDN -->
<link rel="preconnect" href="https://cdn.yourdomain.com">

<!-- Preload critical resources -->
<link rel="preload" href="fonts/roboto.woff2" as="font" type="font/woff2" crossorigin>

<!-- Prefetch resources for next page -->
<link rel="prefetch" href="js/product-detail.bundle.js">
```

## Caching Strategies

### Browser Caching

Set appropriate cache headers for static assets:

```apache
# Apache config
<IfModule mod_expires.c>
    ExpiresActive On
    
    # Images
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/webp "access plus 1 year"
    
    # CSS and JavaScript
    ExpiresByType text/css "access plus 1 month"
    ExpiresByType application/javascript "access plus 1 month"
    
    # Fonts
    ExpiresByType font/woff "access plus 1 year"
    ExpiresByType font/woff2 "access plus 1 year"
</IfModule>
```

### Application Caching

Implement application-level caching:

```php
// Cache service
class CacheService {
  private $cache;
  
  public function __construct() {
    // Use APCu if available, otherwise use file cache
    if (function_exists('apcu_fetch')) {
      $this->cache = new APCuCache();
    } else {
      $this->cache = new FileCache();
    }
  }
  
  public function get($key) {
    return $this->cache->get($key);
  }
  
  public function set($key, $value, $ttl = 3600) {
    return $this->cache->set($key, $value, $ttl);
  }
  
  public function delete($key) {
    return $this->cache->delete($key);
  }
  
  public function clear() {
    return $this->cache->clear();
  }
}

// APCu cache implementation
class APCuCache {
  public function get($key) {
    return apcu_fetch($key);
  }
  
  public function set($key, $value, $ttl = 3600) {
    return apcu_store($key, $value, $ttl);
  }
  
  public function delete($key) {
    return apcu_delete($key);
  }
  
  public function clear() {
    return apcu_clear_cache();
  }
}

// File cache implementation
class FileCache {
  private $cacheDir;
  
  public function __construct() {
    $this->cacheDir = __DIR__ . '/../cache/';
    
    if (!is_dir($this->cacheDir)) {
      mkdir($this->cacheDir, 0755, true);
    }
  }
  
  public function get($key) {
    $file = $this->cacheDir . md5($key) . '.cache';
    
    if (!file_exists($file)) {
      return false;
    }
    
    $data = unserialize(file_get_contents($file));
    
    if ($data['expires'] < time()) {
      unlink($file);
      return false;
    }
    
    return $data['value'];
  }
  
  public function set($key, $value, $ttl = 3600) {
    $file = $this->cacheDir . md5($key) . '.cache';
    $data = [
      'value' => $value,
      'expires' => time() + $ttl
    ];
    
    return file_put_contents($file, serialize($data)) !== false;
  }
  
  public function delete($key) {
    $file = $this->cacheDir . md5($key) . '.cache';
    
    if (file_exists($file)) {
      return unlink($file);
    }
    
    return true;
  }
  
  public function clear() {
    $files = glob($this->cacheDir . '*.cache');
    
    foreach ($files as $file) {
      unlink($file);
    }
    
    return true;
  }
}
```

### API Response Caching

Cache API responses to reduce database load:

```php
// API endpoint with caching
function getProductsAPI() {
  $cache = new CacheService();
  $cacheKey = 'api_products_' . md5($_SERVER['QUERY_STRING']);
  
  // Check if response is cached
  $cachedResponse = $cache->get($cacheKey);
  if ($cachedResponse !== false) {
    header('X-Cache: HIT');
    echo $cachedResponse;
    return;
  }
  
  // Get products from database
  $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
  $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 20;
  $products = getProducts($page, $limit);
  
  // Convert to JSON
  $response = json_encode($products);
  
  // Cache the response
  $cache->set($cacheKey, $response, 300); // Cache for 5 minutes
  
  header('X-Cache: MISS');
  echo $response;
}
```

## Monitoring and Analysis

### Performance Monitoring

Implement performance monitoring to track metrics:

```javascript
// Performance monitoring
document.addEventListener('DOMContentLoaded', function() {
  // Report performance metrics
  if ('performance' in window && 'getEntriesByType' in performance) {
    window.addEventListener('load', function() {
      setTimeout(function() {
        const navigationEntry = performance.getEntriesByType('navigation')[0];
        const paintEntries = performance.getEntriesByType('paint');
        
        const metrics = {
          // Navigation timing
          dnsLookup: navigationEntry.domainLookupEnd - navigationEntry.domainLookupStart,
          tcpConnection: navigationEntry.connectEnd - navigationEntry.connectStart,
          requestTime: navigationEntry.responseStart - navigationEntry.requestStart,
          responseTime: navigationEntry.responseEnd - navigationEntry.responseStart,
          domProcessing: navigationEntry.domComplete - navigationEntry.responseEnd,
          domInteractive: navigationEntry.domInteractive - navigationEntry.fetchStart,
          domContentLoaded: navigationEntry.domContentLoadedEventEnd - navigationEntry.fetchStart,
          loadComplete: navigationEntry.loadEventEnd - navigationEntry.fetchStart,
          
          // Paint timing
          firstPaint: paintEntries.find(entry => entry.name === 'first-paint')?.startTime,
          firstContentfulPaint: paintEntries.find(entry => entry.name === 'first-contentful-paint')?.startTime
        };
        
        // Send metrics to analytics server
        fetch('/api/performance', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(metrics)
        });
      }, 0);
    });
  }
});
```

### Error Tracking

Implement error tracking to identify issues:

```javascript
// Error tracking
window.addEventListener('error', function(event) {
  const error = {
    message: event.message,
    source: event.filename,
    line: event.lineno,
    column: event.colno,
    stack: event.error ? event.error.stack : null,
    url: window.location.href,
    userAgent: navigator.userAgent,
    timestamp: new Date().toISOString()
  };
  
  // Send error to tracking server
  fetch('/api/errors', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(error)
  });
});
```

## Implementation Checklist

Use this checklist to ensure you've implemented all performance optimizations:

### Frontend Checklist

- [ ] Minify and bundle JavaScript files
- [ ] Minify and bundle CSS files
- [ ] Optimize images (compression, responsive sizes, lazy loading)
- [ ] Implement critical CSS
- [ ] Enable HTTP/2
- [ ] Set up browser caching
- [ ] Use a CDN for static assets
- [ ] Implement resource hints (preconnect, preload, prefetch)
- [ ] Lazy load non-critical components
- [ ] Optimize web fonts

### Backend Checklist

- [ ] Enable OPcache
- [ ] Optimize Composer autoloader
- [ ] Implement API response compression
- [ ] Implement pagination for large data sets
- [ ] Implement response filtering
- [ ] Set up application-level caching
- [ ] Optimize database queries
- [ ] Create appropriate database indexes
- [ ] Implement connection pooling
- [ ] Set up API response caching

### Monitoring Checklist

- [ ] Implement performance monitoring
- [ ] Set up error tracking
- [ ] Monitor server resources
- [ ] Set up alerting for performance issues
- [ ] Regularly analyze performance metrics
