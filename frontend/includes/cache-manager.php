<?php
/**
 * GigGatek Frontend Cache Manager
 * 
 * A Redis-based caching implementation for frontend PHP requests
 * to improve performance and reduce load on backend services.
 */

class CacheManager {
    private static $redis = null;
    private static $enabled = false;
    private static $cacheMiss = true;
    private static $initialized = false;

    /**
     * Initialize Redis connection
     */
    private static function initialize() {
        if (self::$initialized) {
            return;
        }

        self::$initialized = true;

        // Check if Redis caching is enabled in config
        $redisEnabled = getenv('REDIS_ENABLED');
        if ($redisEnabled === false || strtolower($redisEnabled) === 'false') {
            self::$enabled = false;
            return;
        }

        // Try to connect to Redis
        try {
            $host = getenv('REDIS_HOST') ?: 'redis';
            $port = intval(getenv('REDIS_PORT') ?: 6379);
            $db = intval(getenv('REDIS_DB') ?: 0);
            $password = getenv('REDIS_PASSWORD') ?: null;

            $redis = new Redis();
            if ($redis->connect($host, $port, 2)) { // 2 second timeout
                if ($password) {
                    $redis->auth($password);
                }
                
                $redis->select($db);
                self::$redis = $redis;
                self::$enabled = true;
            }
        } catch (Exception $e) {
            // Log error but continue without caching
            error_log('Redis connection error: ' . $e->getMessage());
            self::$enabled = false;
        }
    }

    /**
     * Get a value from cache
     * 
     * @param string $key The cache key
     * @return mixed The cached value or null if not found
     */
    public static function get($key) {
        self::initialize();

        if (!self::$enabled || !self::$redis) {
            return null;
        }

        $prefixedKey = 'giggatek:' . $key;
        $data = self::$redis->get($prefixedKey);
        
        if ($data === false) {
            self::$cacheMiss = true;
            return null;
        }
        
        self::$cacheMiss = false;
        return json_decode($data, true);
    }

    /**
     * Set a value in cache
     * 
     * @param string $key The cache key
     * @param mixed $value The value to cache
     * @param int $ttl Time to live in seconds (default: 3600 = 1 hour)
     * @return bool Success/failure
     */
    public static function set($key, $value, $ttl = 3600) {
        self::initialize();

        if (!self::$enabled || !self::$redis) {
            return false;
        }

        $prefixedKey = 'giggatek:' . $key;
        
        // Encode to JSON to preserve data types and structures
        $encodedValue = json_encode($value);
        if ($encodedValue === false) {
            error_log('Failed to encode value for caching: ' . json_last_error_msg());
            return false;
        }
        
        return self::$redis->setex($prefixedKey, $ttl, $encodedValue);
    }

    /**
     * Delete a key from cache
     * 
     * @param string $key The cache key
     * @return bool Success/failure
     */
    public static function delete($key) {
        self::initialize();

        if (!self::$enabled || !self::$redis) {
            return false;
        }

        $prefixedKey = 'giggatek:' . $key;
        return self::$redis->del($prefixedKey) > 0;
    }

    /**
     * Delete keys matching a pattern
     * 
     * @param string $pattern The pattern to match (e.g., 'products:*')
     * @return int Number of keys deleted
     */
    public static function deletePattern($pattern) {
        self::initialize();

        if (!self::$enabled || !self::$redis) {
            return 0;
        }

        $prefixedPattern = 'giggatek:' . $pattern;
        $keys = self::$redis->keys($prefixedPattern);
        
        if (empty($keys)) {
            return 0;
        }

        return self::$redis->del($keys);
    }

    /**
     * Clear the entire cache
     * 
     * @return bool Success/failure
     */
    public static function clear() {
        self::initialize();

        if (!self::$enabled || !self::$redis) {
            return false;
        }

        return self::$redis->flushDB();
    }

    /**
     * Check if the last get() was a cache hit or miss
     * 
     * @return bool True if cache miss, false if cache hit
     */
    public static function wasHit() {
        return !self::$cacheMiss;
    }

    /**
     * Check if caching is enabled
     * 
     * @return bool True if enabled, false otherwise
     */
    public static function isEnabled() {
        self::initialize();
        return self::$enabled;
    }
}
