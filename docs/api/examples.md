# API Usage Examples

This document provides examples of how to use the GigGatek API for common tasks.

## Authentication

Before making API requests, you need to authenticate and obtain an access token.

### Obtaining an Access Token

```bash
curl -X POST https://api.giggatek.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "your_password"
  }'
```

Response:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_in": 2700,
  "token_type": "Bearer",
  "user": {
    "id": 123,
    "email": "user@example.com",
    "name": "John Doe",
    "role": "CUSTOMER"
  }
}
```

### Using the Access Token

Include the token in the `Authorization` header for all subsequent requests:

```bash
curl -X GET https://api.giggatek.com/api/v1/products \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Refreshing the Access Token

Tokens expire after 45 minutes. Refresh your token before it expires:

```bash
curl -X POST https://api.giggatek.com/api/v1/auth/refresh \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

Response:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_in": 2700,
  "token_type": "Bearer"
}
```

## Products

### List All Products

```bash
curl -X GET https://api.giggatek.com/api/v1/products \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

Response:

```json
{
  "products": [
    {
      "id": 1,
      "name": "Professional Camera",
      "description": "High-end professional camera for photography and videography",
      "price": 1299.99,
      "rental_price": 99.99,
      "category": "cameras",
      "stock": 15,
      "image_url": "https://api.giggatek.com/images/products/camera.jpg"
    },
    {
      "id": 2,
      "name": "Wireless Microphone",
      "description": "Professional wireless microphone for clear audio recording",
      "price": 249.99,
      "rental_price": 19.99,
      "category": "audio",
      "stock": 30,
      "image_url": "https://api.giggatek.com/images/products/microphone.jpg"
    }
  ],
  "total": 2,
  "page": 1,
  "per_page": 10,
  "total_pages": 1
}
```

### Filter Products by Category

```bash
curl -X GET "https://api.giggatek.com/api/v1/products?category=audio" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Search Products

```bash
curl -X GET "https://api.giggatek.com/api/v1/products?search=microphone" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Get Product Details

```bash
curl -X GET https://api.giggatek.com/api/v1/products/1 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

Response:

```json
{
  "id": 1,
  "name": "Professional Camera",
  "description": "High-end professional camera for photography and videography",
  "price": 1299.99,
  "rental_price": 99.99,
  "category": "cameras",
  "stock": 15,
  "image_url": "https://api.giggatek.com/images/products/camera.jpg",
  "specifications": {
    "resolution": "24.2 MP",
    "sensor": "Full-frame CMOS",
    "iso_range": "100-51200",
    "video_resolution": "4K UHD",
    "weight": "680g"
  },
  "reviews": [
    {
      "id": 101,
      "user_id": 456,
      "user_name": "Jane Smith",
      "rating": 5,
      "comment": "Excellent camera, exceeded my expectations!",
      "created_at": "2023-05-15T14:30:00Z"
    }
  ]
}
```

## Orders

### Create a New Order

```bash
curl -X POST https://api.giggatek.com/api/v1/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "items": [
      {
        "product_id": 1,
        "quantity": 1
      },
      {
        "product_id": 2,
        "quantity": 2
      }
    ],
    "shipping_address": {
      "street": "123 Main St",
      "city": "New York",
      "state": "NY",
      "zip": "10001",
      "country": "USA"
    },
    "payment_method": "credit_card",
    "payment_details": {
      "card_token": "tok_visa"
    }
  }'
```

Response:

```json
{
  "id": 1001,
  "user_id": 123,
  "status": "pending",
  "total": 1799.97,
  "items": [
    {
      "product_id": 1,
      "name": "Professional Camera",
      "quantity": 1,
      "price": 1299.99,
      "subtotal": 1299.99
    },
    {
      "product_id": 2,
      "name": "Wireless Microphone",
      "quantity": 2,
      "price": 249.99,
      "subtotal": 499.98
    }
  ],
  "shipping_address": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zip": "10001",
    "country": "USA"
  },
  "payment_method": "credit_card",
  "payment_status": "pending",
  "created_at": "2023-06-10T09:15:00Z",
  "updated_at": "2023-06-10T09:15:00Z"
}
```

### List User Orders

```bash
curl -X GET https://api.giggatek.com/api/v1/orders \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

Response:

```json
{
  "orders": [
    {
      "id": 1001,
      "status": "completed",
      "total": 1799.97,
      "created_at": "2023-06-10T09:15:00Z",
      "items_count": 2
    },
    {
      "id": 1002,
      "status": "shipped",
      "total": 349.99,
      "created_at": "2023-06-15T14:30:00Z",
      "items_count": 1
    }
  ],
  "total": 2,
  "page": 1,
  "per_page": 10,
  "total_pages": 1
}
```

### Get Order Details

```bash
curl -X GET https://api.giggatek.com/api/v1/orders/1001 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Cancel an Order

```bash
curl -X POST https://api.giggatek.com/api/v1/orders/1001/cancel \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

## Rentals

### Create a New Rental

```bash
curl -X POST https://api.giggatek.com/api/v1/rentals \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "items": [
      {
        "product_id": 1,
        "quantity": 1
      }
    ],
    "start_date": "2023-07-01T10:00:00Z",
    "end_date": "2023-07-05T10:00:00Z",
    "shipping_address": {
      "street": "123 Main St",
      "city": "New York",
      "state": "NY",
      "zip": "10001",
      "country": "USA"
    },
    "payment_method": "credit_card",
    "payment_details": {
      "card_token": "tok_visa"
    }
  }'
```

Response:

```json
{
  "id": 2001,
  "user_id": 123,
  "status": "pending",
  "total": 399.96,
  "items": [
    {
      "product_id": 1,
      "name": "Professional Camera",
      "quantity": 1,
      "daily_rate": 99.99,
      "days": 4,
      "subtotal": 399.96
    }
  ],
  "start_date": "2023-07-01T10:00:00Z",
  "end_date": "2023-07-05T10:00:00Z",
  "shipping_address": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zip": "10001",
    "country": "USA"
  },
  "payment_method": "credit_card",
  "payment_status": "pending",
  "created_at": "2023-06-20T11:30:00Z",
  "updated_at": "2023-06-20T11:30:00Z"
}
```

### List User Rentals

```bash
curl -X GET https://api.giggatek.com/api/v1/rentals \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Get Rental Details

```bash
curl -X GET https://api.giggatek.com/api/v1/rentals/2001 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Extend a Rental

```bash
curl -X POST https://api.giggatek.com/api/v1/rentals/2001/extend \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "new_end_date": "2023-07-07T10:00:00Z",
    "payment_method": "credit_card",
    "payment_details": {
      "card_token": "tok_visa"
    }
  }'
```

### Return a Rental

```bash
curl -X POST https://api.giggatek.com/api/v1/rentals/2001/return \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

## Error Handling

The API uses standard HTTP status codes and returns detailed error messages:

### Authentication Error

```json
{
  "error": "unauthorized",
  "message": "Invalid or expired token",
  "status": 401
}
```

### Validation Error

```json
{
  "error": "validation_error",
  "message": "Validation failed",
  "status": 400,
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    },
    {
      "field": "password",
      "message": "Password must be at least 8 characters"
    }
  ]
}
```

### Resource Not Found

```json
{
  "error": "not_found",
  "message": "Product with ID 999 not found",
  "status": 404
}
```

### Rate Limit Exceeded

```json
{
  "error": "rate_limit_exceeded",
  "message": "Rate limit exceeded. Try again in 60 seconds",
  "status": 429,
  "retry_after": 60
}
```

## Pagination

Many endpoints return paginated results. You can control pagination with the following query parameters:

- `page`: Page number (default: 1)
- `per_page`: Number of items per page (default: 10, max: 100)

Example:

```bash
curl -X GET "https://api.giggatek.com/api/v1/products?page=2&per_page=20" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

Response includes pagination metadata:

```json
{
  "products": [...],
  "total": 45,
  "page": 2,
  "per_page": 20,
  "total_pages": 3
}
```

## Filtering and Sorting

Many endpoints support filtering and sorting:

### Filtering

Use query parameters to filter results:

```bash
curl -X GET "https://api.giggatek.com/api/v1/products?category=audio&min_price=100&max_price=300" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Sorting

Use the `sort` parameter to sort results:

```bash
curl -X GET "https://api.giggatek.com/api/v1/products?sort=price:asc" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

Multiple sort fields are supported:

```bash
curl -X GET "https://api.giggatek.com/api/v1/products?sort=category:asc,price:desc" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

## Rate Limiting

The API implements rate limiting to prevent abuse. Rate limits are applied per client IP address and per user account.

Current rate limits:
- Anonymous: 60 requests per minute
- Authenticated users: 120 requests per minute
- Admin users: 300 requests per minute

Rate limit headers are included in all responses:
- `X-RateLimit-Limit`: Maximum number of requests allowed in the current time window
- `X-RateLimit-Remaining`: Number of requests remaining in the current time window
- `X-RateLimit-Reset`: Time (in seconds) until the rate limit resets

When a rate limit is exceeded, the API returns a 429 Too Many Requests response.
