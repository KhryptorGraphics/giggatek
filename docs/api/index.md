# GigGatek API Documentation

Welcome to the GigGatek API documentation. This documentation provides information about the available API endpoints for the GigGatek e-commerce platform.

## Base URL

All API endpoints are relative to the base URL:

```
https://api.giggatek.com/v1
```

## Authentication

Most endpoints require authentication using a JWT token. Include the token in the `Authorization` header:

```
Authorization: Bearer <token>
```

To obtain a token, use the [login endpoint](/auth.md#login).

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

- 100 requests per minute for authenticated users
- 20 requests per minute for unauthenticated users

Rate limit information is included in the response headers:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1681234567
```

If you exceed the rate limit, you will receive a 429 Too Many Requests response.

## Versioning

The API is versioned using the URL path (e.g., `/v1/products`). The current version is v1.

## Support

If you have any questions or need assistance with the API, please contact our support team at api-support@giggatek.com.
