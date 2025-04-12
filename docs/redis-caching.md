# Redis Caching System

GigGatek now implements a Redis-based caching system to improve API performance and response times, particularly for rental operations.

## Overview

The caching system is designed to:

- Reduce database load by caching frequently accessed data
- Improve API response times, especially for complex rental calculations
- Provide a configurable and controllable caching mechanism
- Allow easy cache invalidation when data changes

## Implementation Details

### Cache Utility

The caching functionality is implemented in `backend/utils/cache.py`, which provides:

- A flexible interface for storing and retrieving data from Redis
- Automatic serialization and deserialization of complex data types
- Configurable TTL (Time-To-Live) for cached items
- Cache invalidation methods

### Integration with Rental Routes

The rental module's API endpoints have been enhanced with caching support:

- Available rental products are cached to reduce database queries
- Rental payment calculations are cached based on product ID and term
- User rental history is cached to improve dashboard performance
- Cache keys are structured to allow targeted invalidation

## Configuration

Redis caching can be configured through environment variables:

```
REDIS_HOST=redis        # Redis server hostname
REDIS_PORT=6379         # Redis server port
REDIS_DB=0              # Redis database number
REDIS_PASSWORD=null     # Optional password authentication
REDIS_ENABLED=true      # Enable/disable caching functionality
```

For local development using Docker Compose, these variables are already configured to use the Redis container.

## Usage in Code

### Basic Usage

```python
from utils.cache import cache

# Store a value in cache with default TTL (1 hour)
cache.set("my_key", my_value)

# Retrieve a value (returns None if not found)
my_value = cache.get("my_key")

# Store with custom TTL (in seconds)
cache.set("short_lived_key", value, ttl=60)  # 1 minute TTL
```

### Caching Decorators

```python
from utils.cache import cached

# Cache function result with default settings
@cached()
def get_product_details(product_id):
    # Expensive database operation
    return product

# Cache with custom key and TTL
@cached(key_prefix="user_rentals", ttl=300)  # 5 minutes
def get_user_rentals(user_id):
    # Complex query
    return rentals
```

### Cache Invalidation

```python
from utils.cache import cache

# Invalidate a specific key
cache.delete("my_key")

# Invalidate all keys with a prefix
cache.delete_pattern("user_rentals:*")

# Clear the entire cache
cache.clear()
```

## Monitoring

Redis metrics are integrated with the monitoring stack. You can view:

- Cache hit rate
- Memory usage
- Command execution times
- Connection counts

Access these metrics through the Grafana dashboard at http://your-server:3000.

## Troubleshooting

If you encounter unexpected behavior:

1. Check if Redis is running:
   ```bash
   docker-compose exec redis redis-cli ping
   ```

2. Disable caching temporarily by setting `REDIS_ENABLED=false` in your environment.

3. View the Redis logs:
   ```bash
   docker-compose logs redis
   ```

4. Flush the cache if necessary:
   ```bash
   docker-compose exec redis redis-cli flushdb
   ```

## Best Practices

- Use cache for read-heavy operations
- Keep TTL values appropriate for the data's nature
- Always ensure the system works correctly with caching disabled
- Invalidate cache when related data is modified
- Use structured key patterns for better organization
