# GigGatek API Documentation

Welcome to the GigGatek API documentation. This documentation provides information about the available API endpoints for the GigGatek e-commerce platform.

## Base URL

All API endpoints are relative to the base URL:

```text
https://api.giggatek.com/v1
```

## Authentication

Most endpoints require authentication using a JWT token. Include the token in the `Authorization` header:

```http
Authorization: Bearer <token>
```

To obtain a token, use the [login endpoint](/auth.md#login).

## Getting Started

- [Quick Start Guide](quickstart.md) - Get up and running quickly
- [API Examples](examples.md) - Code examples for common tasks
- [Troubleshooting Guide](troubleshooting.md) - Solutions for common issues

## API Sections

- [Authentication API](auth.md) - User registration, login, and authentication
- [Products API](products.md) - Product catalog, details, and reviews
- [Orders API](orders.md) - Order management and processing
- [Rentals API](rentals.md) - Rental contract management
- [Payments API](payments.md) - Payment processing with Stripe and PayPal

## Response Format

All API responses are in JSON format and follow a consistent structure:

### Success Responses

Success responses include the relevant data and a HTTP status code in the 2xx range:

```json
{
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Responses

Error responses include an error message and a HTTP status code in the 4xx or 5xx range:

```json
{
  "error": "Error message"
}
```

## Common Status Codes

| Status Code | Description |
|-------------|-------------|
| 200 | OK - The request was successful |
| 201 | Created - A new resource was created |
| 400 | Bad Request - The request was invalid |
| 401 | Unauthorized - Authentication is required |
| 403 | Forbidden - The user does not have permission |
| 404 | Not Found - The resource was not found |
| 409 | Conflict - The request conflicts with the current state |
| 422 | Unprocessable Entity - Validation errors |
| 500 | Internal Server Error - An unexpected error occurred |

## Pagination

Endpoints that return lists of items support pagination using the following query parameters:

- `page` - The page number (default: 1)
- `per_page` - The number of items per page (default varies by endpoint)

Paginated responses include a `pagination` object with the following properties:

```json
{
  "pagination": {
    "total": 150,
    "per_page": 20,
    "current_page": 1,
    "total_pages": 8
  }
}
```

## Rate Limiting

The API implements rate limiting to prevent abuse. The current limits are:

- Anonymous: 60 requests per minute
- Authenticated users: 120 requests per minute
- Admin users: 300 requests per minute

Rate limit information is included in the response headers:

```http
X-RateLimit-Limit: 120
X-RateLimit-Remaining: 115
X-RateLimit-Reset: 45
```

If you exceed the rate limit, you will receive a 429 Too Many Requests response with a `Retry-After` header indicating how many seconds to wait before retrying.

## Versioning

The API is versioned using the URL path (e.g., `/v1/products`). The current version is v1.

## Support

If you have any questions or need assistance with the API, please contact our support team at [api-support@giggatek.com](mailto:api-support@giggatek.com).
