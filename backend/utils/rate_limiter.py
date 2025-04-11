"""
Rate Limiter Module

This module provides rate limiting functionality for the API.
"""

import time
import threading
from collections import defaultdict
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('logs/rate_limiter.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger('rate_limiter')

class RateLimiter:
    """Rate limiter implementation using the token bucket algorithm"""
    
    def __init__(self, rate=60, per=60, burst=100):
        """
        Initialize the rate limiter
        
        Args:
            rate: Number of requests allowed per time period
            per: Time period in seconds
            burst: Maximum burst size (token bucket capacity)
        """
        self.rate = rate
        self.per = per
        self.burst = burst
        self.tokens = {}
        self.last_check = {}
        self.lock = threading.Lock()
    
    def check(self, key):
        """
        Check if a request is allowed
        
        Args:
            key: Identifier for the client (e.g., IP address, user ID)
            
        Returns:
            tuple: (allowed, remaining, reset_time)
        """
        with self.lock:
            now = time.time()
            
            # Initialize if this is the first request from this client
            if key not in self.tokens:
                self.tokens[key] = self.burst
                self.last_check[key] = now
                return True, self.burst - 1, now + self.per
            
            # Calculate tokens to add based on time elapsed
            time_passed = now - self.last_check[key]
            self.last_check[key] = now
            
            # Add tokens based on time passed
            new_tokens = time_passed * (self.rate / self.per)
            self.tokens[key] = min(self.burst, self.tokens[key] + new_tokens)
            
            # Check if we have enough tokens
            if self.tokens[key] >= 1:
                self.tokens[key] -= 1
                remaining = int(self.tokens[key])
                reset_time = now + ((self.burst - self.tokens[key]) * self.per / self.rate)
                return True, remaining, reset_time
            else:
                # Calculate when the next token will be available
                time_until_next_token = (1 - self.tokens[key]) * self.per / self.rate
                reset_time = now + time_until_next_token
                return False, 0, reset_time
    
    def get_headers(self, key):
        """
        Get rate limit headers for a client
        
        Args:
            key: Identifier for the client
            
        Returns:
            dict: Rate limit headers
        """
        with self.lock:
            if key not in self.tokens:
                return {
                    'X-RateLimit-Limit': str(self.rate),
                    'X-RateLimit-Remaining': str(self.rate),
                    'X-RateLimit-Reset': str(int(time.time() + self.per))
                }
            
            allowed, remaining, reset_time = self.check(key)
            
            return {
                'X-RateLimit-Limit': str(self.rate),
                'X-RateLimit-Remaining': str(remaining),
                'X-RateLimit-Reset': str(int(reset_time))
            }

# Create global rate limiters
ip_rate_limiter = RateLimiter(rate=100, per=60, burst=120)  # 100 requests per minute per IP
user_rate_limiter = RateLimiter(rate=300, per=60, burst=350)  # 300 requests per minute per user
endpoint_rate_limiters = defaultdict(lambda: RateLimiter(rate=60, per=60, burst=70))  # 60 requests per minute per endpoint

# Flask middleware for rate limiting
def rate_limit_middleware():
    """Flask middleware for rate limiting"""
    def decorator(app):
        @app.before_request
        def before_request():
            # Skip rate limiting for static files
            if request.path.startswith('/static/'):
                return None
            
            # Get client IP
            client_ip = request.remote_addr
            
            # Check IP rate limit
            ip_allowed, ip_remaining, ip_reset = ip_rate_limiter.check(client_ip)
            
            # Get user ID from session or token
            user_id = None
            if hasattr(g, 'user_id'):
                user_id = g.user_id
            
            # Check user rate limit if authenticated
            user_allowed = True
            if user_id is not None:
                user_allowed, user_remaining, user_reset = user_rate_limiter.check(f"user:{user_id}")
            
            # Check endpoint rate limit
            endpoint_key = f"{request.method}:{request.path}"
            endpoint_allowed, endpoint_remaining, endpoint_reset = endpoint_rate_limiters[endpoint_key].check(client_ip)
            
            # Set rate limit headers
            if user_id is not None:
                # Use the more permissive user rate limit for authenticated users
                headers = user_rate_limiter.get_headers(f"user:{user_id}")
            else:
                # Use IP rate limit for anonymous users
                headers = ip_rate_limiter.get_headers(client_ip)
            
            # Add endpoint-specific headers
            endpoint_headers = endpoint_rate_limiters[endpoint_key].get_headers(client_ip)
            headers['X-RateLimit-Endpoint-Limit'] = endpoint_headers['X-RateLimit-Limit']
            headers['X-RateLimit-Endpoint-Remaining'] = endpoint_headers['X-RateLimit-Remaining']
            headers['X-RateLimit-Endpoint-Reset'] = endpoint_headers['X-RateLimit-Reset']
            
            # Check if rate limit is exceeded
            if not ip_allowed or not user_allowed or not endpoint_allowed:
                # Log rate limit exceeded
                logger.warning(f"Rate limit exceeded: IP={client_ip}, User={user_id}, Endpoint={endpoint_key}")
                
                # Return rate limit exceeded response
                response = jsonify({
                    'error': 'Rate limit exceeded',
                    'retry_after': min(ip_reset, user_reset, endpoint_reset) - time.time()
                })
                
                # Add headers to response
                for key, value in headers.items():
                    response.headers[key] = value
                
                response.headers['Retry-After'] = str(int(min(ip_reset, user_reset, endpoint_reset) - time.time()))
                response.status_code = 429
                
                return response
            
            # Store headers for after_request
            g.rate_limit_headers = headers
        
        @app.after_request
        def after_request(response):
            # Add rate limit headers to response
            if hasattr(g, 'rate_limit_headers'):
                for key, value in g.rate_limit_headers.items():
                    response.headers[key] = value
            
            return response
        
        return app
    
    return decorator

# Function to configure rate limits
def configure_rate_limits(ip_rate=100, ip_per=60, ip_burst=120,
                         user_rate=300, user_per=60, user_burst=350,
                         endpoint_rate=60, endpoint_per=60, endpoint_burst=70):
    """
    Configure rate limits
    
    Args:
        ip_rate: Requests per time period per IP
        ip_per: Time period in seconds for IP rate limit
        ip_burst: Maximum burst size for IP rate limit
        user_rate: Requests per time period per user
        user_per: Time period in seconds for user rate limit
        user_burst: Maximum burst size for user rate limit
        endpoint_rate: Requests per time period per endpoint
        endpoint_per: Time period in seconds for endpoint rate limit
        endpoint_burst: Maximum burst size for endpoint rate limit
    """
    global ip_rate_limiter, user_rate_limiter, endpoint_rate_limiters
    
    ip_rate_limiter = RateLimiter(rate=ip_rate, per=ip_per, burst=ip_burst)
    user_rate_limiter = RateLimiter(rate=user_rate, per=user_per, burst=user_burst)
    endpoint_rate_limiters = defaultdict(lambda: RateLimiter(rate=endpoint_rate, per=endpoint_per, burst=endpoint_burst))
    
    logger.info(f"Rate limits configured: IP={ip_rate}/{ip_per}s, User={user_rate}/{user_per}s, Endpoint={endpoint_rate}/{endpoint_per}s")

# Function to configure endpoint-specific rate limits
def configure_endpoint_rate_limit(method, path, rate=60, per=60, burst=70):
    """
    Configure rate limit for a specific endpoint
    
    Args:
        method: HTTP method (e.g., 'GET', 'POST')
        path: Endpoint path (e.g., '/api/v1/products')
        rate: Requests per time period
        per: Time period in seconds
        burst: Maximum burst size
    """
    endpoint_key = f"{method}:{path}"
    endpoint_rate_limiters[endpoint_key] = RateLimiter(rate=rate, per=per, burst=burst)
    
    logger.info(f"Endpoint rate limit configured: {endpoint_key}={rate}/{per}s")

# Function to exempt an IP from rate limiting
def exempt_ip(ip_address):
    """
    Exempt an IP address from rate limiting
    
    Args:
        ip_address: IP address to exempt
    """
    with ip_rate_limiter.lock:
        ip_rate_limiter.tokens[ip_address] = float('inf')
        ip_rate_limiter.last_check[ip_address] = time.time()
    
    logger.info(f"IP address exempted from rate limiting: {ip_address}")

# Function to exempt a user from rate limiting
def exempt_user(user_id):
    """
    Exempt a user from rate limiting
    
    Args:
        user_id: User ID to exempt
    """
    with user_rate_limiter.lock:
        user_key = f"user:{user_id}"
        user_rate_limiter.tokens[user_key] = float('inf')
        user_rate_limiter.last_check[user_key] = time.time()
    
    logger.info(f"User exempted from rate limiting: {user_id}")

# Function to block an IP
def block_ip(ip_address, duration=3600):
    """
    Block an IP address for a specified duration
    
    Args:
        ip_address: IP address to block
        duration: Duration in seconds (default: 1 hour)
    """
    with ip_rate_limiter.lock:
        ip_rate_limiter.tokens[ip_address] = 0
        ip_rate_limiter.last_check[ip_address] = time.time()
        
        # Schedule unblock after duration
        def unblock():
            time.sleep(duration)
            with ip_rate_limiter.lock:
                ip_rate_limiter.tokens[ip_address] = ip_rate_limiter.burst
                ip_rate_limiter.last_check[ip_address] = time.time()
            
            logger.info(f"IP address unblocked: {ip_address}")
        
        threading.Thread(target=unblock, daemon=True).start()
    
    logger.warning(f"IP address blocked for {duration} seconds: {ip_address}")

# Function to get rate limit status
def get_rate_limit_status():
    """
    Get rate limit status for all clients
    
    Returns:
        dict: Rate limit status
    """
    with ip_rate_limiter.lock:
        ip_status = {
            ip: {
                'tokens': tokens,
                'last_check': last_check,
                'remaining': max(0, int(tokens)),
                'reset': last_check + ((ip_rate_limiter.burst - tokens) * ip_rate_limiter.per / ip_rate_limiter.rate)
            }
            for ip, tokens in ip_rate_limiter.tokens.items()
            for last_check in [ip_rate_limiter.last_check[ip]]
        }
    
    with user_rate_limiter.lock:
        user_status = {
            user_key.split(':', 1)[1]: {
                'tokens': tokens,
                'last_check': last_check,
                'remaining': max(0, int(tokens)),
                'reset': last_check + ((user_rate_limiter.burst - tokens) * user_rate_limiter.per / user_rate_limiter.rate)
            }
            for user_key, tokens in user_rate_limiter.tokens.items()
            for last_check in [user_rate_limiter.last_check[user_key]]
            if user_key.startswith('user:')
        }
    
    endpoint_status = {}
    for endpoint_key, limiter in endpoint_rate_limiters.items():
        with limiter.lock:
            endpoint_status[endpoint_key] = {
                'limit': limiter.rate,
                'per': limiter.per,
                'clients': len(limiter.tokens)
            }
    
    return {
        'ip_rate_limit': {
            'limit': ip_rate_limiter.rate,
            'per': ip_rate_limiter.per,
            'burst': ip_rate_limiter.burst,
            'clients': ip_status
        },
        'user_rate_limit': {
            'limit': user_rate_limiter.rate,
            'per': user_rate_limiter.per,
            'burst': user_rate_limiter.burst,
            'clients': user_status
        },
        'endpoint_rate_limits': endpoint_status
    }
