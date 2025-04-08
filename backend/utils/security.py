"""
Security utilities for GigGatek backend.
Includes rate limiting, IP-based throttling, and security-related helpers.
"""

import time
import threading
import ipaddress
from functools import wraps
from flask import request, jsonify, current_app
import redis
from datetime import datetime

# Shared storage for rate limiting
# In production, this would use Redis for distributed rate limiting
class MemoryStore:
    def __init__(self):
        self.storage = {}
        self.lock = threading.Lock()
        # Clean up expired entries periodically
        self.cleanup_interval = 300  # 5 minutes
        self.last_cleanup = time.time()
    
    def get(self, key):
        with self.lock:
            self._cleanup_if_needed()
            entry = self.storage.get(key)
            if entry is None or entry[1] < time.time():
                return None
            return entry[0]
    
    def set(self, key, value, expiry):
        with self.lock:
            self._cleanup_if_needed()
            self.storage[key] = (value, time.time() + expiry)
    
    def increment(self, key, expiry):
        with self.lock:
            self._cleanup_if_needed()
            entry = self.storage.get(key)
            if entry is None or entry[1] < time.time():
                self.storage[key] = (1, time.time() + expiry)
                return 1
            new_value = entry[0] + 1
            self.storage[key] = (new_value, time.time() + expiry)
            return new_value
    
    def _cleanup_if_needed(self):
        now = time.time()
        if now - self.last_cleanup > self.cleanup_interval:
            self._cleanup()
            self.last_cleanup = now
    
    def _cleanup(self):
        now = time.time()
        keys_to_delete = [
            key for key, entry in self.storage.items() if entry[1] < now
        ]
        for key in keys_to_delete:
            del self.storage[key]


# Create a global memory store for rate limiting
memory_store = MemoryStore()

# Try to use Redis if available, otherwise fall back to in-memory store
redis_client = None
try:
    redis_host = current_app.config.get('REDIS_HOST', 'localhost')
    redis_port = current_app.config.get('REDIS_PORT', 6379)
    redis_client = redis.Redis(host=redis_host, port=redis_port, db=0)
    # Test connection
    redis_client.ping()
except (redis.ConnectionError, NameError):
    redis_client = None


def get_client_ip():
    """Get the client IP address from request headers."""
    # Use X-Forwarded-For if available (for clients behind proxy)
    if 'X-Forwarded-For' in request.headers:
        ip = request.headers['X-Forwarded-For'].split(',')[0].strip()
    else:
        ip = request.remote_addr or '127.0.0.1'
    
    # Validate IP address format
    try:
        ipaddress.ip_address(ip)
        return ip
    except ValueError:
        # Fall back to local IP if the IP is invalid
        return '127.0.0.1'


def is_rate_limited(key, limit, period):
    """
    Check if a key is rate limited.
    
    Args:
        key: The rate limiting key
        limit: Number of requests allowed
        period: Time period in seconds
        
    Returns:
        Tuple of (is_limited, current_count, reset_time)
    """
    if redis_client:
        # Use Redis for distributed rate limiting
        count_key = f"ratelimit:{key}"
        current_count = redis_client.incr(count_key)
        # Set expiry on first request
        if current_count == 1:
            redis_client.expire(count_key, period)
        ttl = redis_client.ttl(count_key)
        reset_time = int(time.time() + ttl)
        return current_count > limit, current_count, reset_time
    else:
        # Use memory store for single-server rate limiting
        current_count = memory_store.increment(key, period)
        reset_time = int(time.time() + period)
        return current_count > limit, current_count, reset_time


def rate_limit(limit, period, key_func=None):
    """
    Rate limiting decorator.
    
    Args:
        limit: Number of requests allowed in the period
        period: Time period in seconds
        key_func: Function to generate the rate limit key (default: by IP)
    """
    def decorator(f):
        @wraps(f)
        def wrapped(*args, **kwargs):
            # Generate rate limit key
            if key_func:
                key = key_func()
            else:
                # Default: rate limit by IP
                key = get_client_ip()

            # Check rate limit
            is_limited, current, reset = is_rate_limited(f.__name__ + ":" + key, limit, period)
            
            # Set rate limit headers
            response = None
            if is_limited:
                response = jsonify({
                    'error': 'Rate limit exceeded',
                    'limit': limit,
                    'remaining': 0,
                    'reset': reset
                })
                response.status_code = 429
            else:
                # Execute the route function
                response = f(*args, **kwargs)
            
            # Add rate limit headers
            response.headers['X-RateLimit-Limit'] = str(limit)
            response.headers['X-RateLimit-Remaining'] = str(max(0, limit - current))
            response.headers['X-RateLimit-Reset'] = str(reset)
            
            return response
        return wrapped
    return decorator


def auth_rate_limit(limit, period):
    """
    Special rate limiter for authentication endpoints.
    Implements stricter rules for failed auth attempts.
    """
    def decorator(f):
        @wraps(f)
        def wrapped(*args, **kwargs):
            ip = get_client_ip()
            
            # Check rate limit for this IP
            key = f"auth:{f.__name__}:{ip}"
            is_limited, current, reset = is_rate_limited(key, limit, period)
            
            if is_limited:
                # Log suspicious activity
                now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                log_message = f"[{now}] Authentication rate limit exceeded for IP: {ip}"
                print(log_message)  # In production, use proper logging
                
                # Return 429 with retry-after header
                response = jsonify({
                    'error': 'Too many authentication attempts',
                    'retry_after': reset - int(time.time())
                })
                response.status_code = 429
                response.headers['Retry-After'] = str(reset - int(time.time()))
                return response
                
            # Execute the route function
            response = f(*args, **kwargs)
            
            # Add rate limit headers
            response.headers['X-RateLimit-Limit'] = str(limit)
            response.headers['X-RateLimit-Remaining'] = str(max(0, limit - current))
            response.headers['X-RateLimit-Reset'] = str(reset)
            
            return response
        return wrapped
    return decorator


# IP Blacklisting
class IPBlacklist:
    def __init__(self):
        self.blacklisted_ips = set()
        self.temp_blacklist = {}  # IP -> expiry time
    
    def is_blacklisted(self, ip):
        """Check if an IP is permanently blacklisted."""
        return ip in self.blacklisted_ips
    
    def is_temp_blacklisted(self, ip):
        """Check if an IP is temporarily blacklisted."""
        if ip in self.temp_blacklist:
            if self.temp_blacklist[ip] > time.time():
                return True
            else:
                # Expired, remove from blacklist
                del self.temp_blacklist[ip]
        return False
    
    def blacklist(self, ip):
        """Permanently blacklist an IP."""
        self.blacklisted_ips.add(ip)
    
    def temp_blacklist(self, ip, duration):
        """Temporarily blacklist an IP for a specific duration (in seconds)."""
        self.temp_blacklist[ip] = time.time() + duration


# Create a global IP blacklist
ip_blacklist = IPBlacklist()


def check_ip_blacklist(f):
    """Decorator to check if an IP is blacklisted."""
    @wraps(f)
    def wrapped(*args, **kwargs):
        ip = get_client_ip()
        
        if ip_blacklist.is_blacklisted(ip):
            response = jsonify({'error': 'Access denied'})
            response.status_code = 403
            return response
        
        if ip_blacklist.is_temp_blacklisted(ip):
            response = jsonify({'error': 'Access temporarily restricted'})
            response.status_code = 403
            return response
        
        return f(*args, **kwargs)
    return wrapped
