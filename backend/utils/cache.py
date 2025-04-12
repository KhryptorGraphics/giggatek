"""
Redis-based caching utility for the GigGatek application.
Provides functions for storing and retrieving cached data.
"""

import json
import redis
import logging
from datetime import timedelta
import hashlib
import os
from functools import wraps

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Redis connection from environment variables
REDIS_HOST = os.environ.get('REDIS_HOST', 'localhost')
REDIS_PORT = int(os.environ.get('REDIS_PORT', 6379))
REDIS_DB = int(os.environ.get('REDIS_DB', 0))
REDIS_PASSWORD = os.environ.get('REDIS_PASSWORD', None)
REDIS_ENABLED = os.environ.get('REDIS_ENABLED', 'true').lower() == 'true'

# Cache expiration times (in seconds)
DEFAULT_CACHE_TTL = 3600  # 1 hour
RENTAL_DETAILS_TTL = 1800  # 30 minutes
RENTAL_LIST_TTL = 300     # 5 minutes
PRODUCT_DETAILS_TTL = 3600  # 1 hour

# Initialize Redis client
redis_client = None

if REDIS_ENABLED:
    try:
        redis_client = redis.Redis(
            host=REDIS_HOST,
            port=REDIS_PORT,
            db=REDIS_DB,
            password=REDIS_PASSWORD,
            socket_timeout=5,
            decode_responses=False  # Keep response as bytes for proper serialization
        )
        # Test connection
        redis_client.ping()
        logger.info("Redis cache connection established")
    except redis.ConnectionError:
        logger.warning("Redis cache connection failed, caching disabled")
        redis_client = None
        REDIS_ENABLED = False
else:
    logger.info("Redis caching disabled by configuration")


def generate_cache_key(prefix, *args, **kwargs):
    """
    Generate a unique cache key based on function arguments.
    
    Args:
        prefix (str): Prefix for the cache key
        *args: Positional arguments to include in the key
        **kwargs: Keyword arguments to include in the key
        
    Returns:
        str: A unique cache key
    """
    key_parts = [prefix]
    
    # Add all args to key
    for arg in args:
        if arg is not None:
            key_parts.append(str(arg))
    
    # Add all kwargs to key, sorted for consistency
    for k in sorted(kwargs.keys()):
        if kwargs[k] is not None:
            key_parts.append(f"{k}={kwargs[k]}")
    
    # Join all parts with a separator
    key_base = ":".join(key_parts)
    
    # Hash the key if it's too long for Redis
    if len(key_base) > 200:
        return f"{prefix}:hash:{hashlib.md5(key_base.encode()).hexdigest()}"
    
    return key_base


def cache_get(key):
    """
    Get a value from the cache.
    
    Args:
        key (str): Cache key
        
    Returns:
        The cached value, or None if not found or cache is disabled
    """
    if not REDIS_ENABLED or not redis_client:
        return None
    
    try:
        cached_data = redis_client.get(key)
        if cached_data:
            return json.loads(cached_data)
        return None
    except Exception as e:
        logger.error(f"Error retrieving from cache: {e}")
        return None


def cache_set(key, value, ttl=DEFAULT_CACHE_TTL):
    """
    Set a value in the cache.
    
    Args:
        key (str): Cache key
        value: Value to cache (must be JSON serializable)
        ttl (int): Time to live in seconds
        
    Returns:
        bool: True if set successfully, False otherwise
    """
    if not REDIS_ENABLED or not redis_client:
        return False
    
    try:
        serialized_value = json.dumps(value)
        return redis_client.setex(key, ttl, serialized_value)
    except Exception as e:
        logger.error(f"Error setting cache: {e}")
        return False


def cache_delete(key):
    """
    Delete a value from the cache.
    
    Args:
        key (str): Cache key or pattern
        
    Returns:
        bool: True if deleted successfully, False otherwise
    """
    if not REDIS_ENABLED or not redis_client:
        return False
    
    try:
        if '*' in key:
            # Pattern delete
            keys = redis_client.keys(key)
            if keys:
                return redis_client.delete(*keys)
            return 0
        else:
            # Single key delete
            return redis_client.delete(key)
    except Exception as e:
        logger.error(f"Error deleting from cache: {e}")
        return False


def invalidate_user_rentals_cache(user_id=None):
    """
    Invalidate all rental caches for a user or all users.
    
    Args:
        user_id (str, optional): User ID, or None to invalidate all rental caches
        
    Returns:
        bool: True if invalidated successfully, False otherwise
    """
    if not REDIS_ENABLED or not redis_client:
        return False
    
    try:
        pattern = f"rental:user:{user_id}:*" if user_id else "rental:*"
        keys = redis_client.keys(pattern)
        if keys:
            return redis_client.delete(*keys)
        return True
    except Exception as e:
        logger.error(f"Error invalidating rental cache: {e}")
        return False


def invalidate_rental_cache(rental_id):
    """
    Invalidate cache for a specific rental.
    
    Args:
        rental_id (int): Rental ID
        
    Returns:
        bool: True if invalidated successfully, False otherwise
    """
    if not REDIS_ENABLED or not redis_client:
        return False
    
    try:
        pattern = f"rental:*:id:{rental_id}*"
        keys = redis_client.keys(pattern)
        if keys:
            return redis_client.delete(*keys)
        return True
    except Exception as e:
        logger.error(f"Error invalidating rental cache: {e}")
        return False


def cache_decorator(prefix, ttl=DEFAULT_CACHE_TTL):
    """
    Decorator for caching function results.
    
    Args:
        prefix (str): Prefix for the cache key
        ttl (int): Time to live in seconds
        
    Returns:
        function: Decorated function
    """
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            if not REDIS_ENABLED or not redis_client:
                return func(*args, **kwargs)
            
            # Skip first arg if it's 'self' or 'cls'
            skip_first = False
            if args and (func.__qualname__.endswith('.__call__') or 
                        func.__module__ == args[0].__module__):
                skip_first = True
            
            # Generate cache key
            cache_args = args[1:] if skip_first else args
            cache_key = generate_cache_key(prefix, *cache_args, **kwargs)
            
            # Try to get from cache
            cached_result = cache_get(cache_key)
            if cached_result is not None:
                logger.debug(f"Cache hit for key: {cache_key}")
                return cached_result
            
            # Cache miss, execute function
            result = func(*args, **kwargs)
            
            # Store in cache
            cache_set(cache_key, result, ttl)
            logger.debug(f"Cached result for key: {cache_key}")
            
            return result
        return wrapper
    return decorator
