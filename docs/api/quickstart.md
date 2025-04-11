# GigGatek API Quick Start Guide

This guide will help you get started with the GigGatek API quickly and easily.

## Overview

The GigGatek API allows you to:
- Browse and search products
- Create and manage orders
- Create and manage rentals
- Manage user accounts and authentication

## Base URL

All API requests should be made to:

```
https://api.giggatek.com/api/v1
```

## Authentication

Most API endpoints require authentication. The API uses JWT (JSON Web Tokens) for authentication.

### Step 1: Register a User (if you don't have an account)

```bash
curl -X POST https://api.giggatek.com/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john.doe@example.com",
    "password": "securepassword123"
  }'
```

### Step 2: Log In and Get a Token

```bash
curl -X POST https://api.giggatek.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "securepassword123"
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
    "email": "john.doe@example.com",
    "name": "John Doe",
    "role": "CUSTOMER"
  }
}
```

### Step 3: Use the Token in Subsequent Requests

Include the token in the `Authorization` header:

```bash
curl -X GET https://api.giggatek.com/api/v1/products \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

## Common Tasks

### Browse Products

```bash
# Get all products
curl -X GET https://api.giggatek.com/api/v1/products \
  -H "Authorization: Bearer YOUR_TOKEN"

# Search for products
curl -X GET "https://api.giggatek.com/api/v1/products?search=camera" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Filter by category
curl -X GET "https://api.giggatek.com/api/v1/products?category=audio" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get a specific product
curl -X GET https://api.giggatek.com/api/v1/products/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Create an Order

```bash
curl -X POST https://api.giggatek.com/api/v1/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "items": [
      {
        "product_id": 1,
        "quantity": 1
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

### Create a Rental

```bash
curl -X POST https://api.giggatek.com/api/v1/rentals \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
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

## Client Libraries

We provide official client libraries for several programming languages:

### JavaScript/TypeScript

```bash
npm install giggatek-api-client
```

```javascript
import { GigGatekClient } from 'giggatek-api-client';

const client = new GigGatekClient('YOUR_TOKEN');

// Get products
client.products.list()
  .then(products => console.log(products))
  .catch(error => console.error(error));

// Create an order
client.orders.create({
  items: [{ product_id: 1, quantity: 1 }],
  shipping_address: {
    street: '123 Main St',
    city: 'New York',
    state: 'NY',
    zip: '10001',
    country: 'USA'
  },
  payment_method: 'credit_card',
  payment_details: {
    card_token: 'tok_visa'
  }
})
  .then(order => console.log(order))
  .catch(error => console.error(error));
```

### Python

```bash
pip install giggatek-api-client
```

```python
from giggatek_api_client import GigGatekClient

client = GigGatekClient('YOUR_TOKEN')

# Get products
products = client.products.list()
print(products)

# Create an order
order = client.orders.create(
    items=[{'product_id': 1, 'quantity': 1}],
    shipping_address={
        'street': '123 Main St',
        'city': 'New York',
        'state': 'NY',
        'zip': '10001',
        'country': 'USA'
    },
    payment_method='credit_card',
    payment_details={
        'card_token': 'tok_visa'
    }
)
print(order)
```

### PHP

```bash
composer require giggatek/api-client
```

```php
<?php
require_once 'vendor/autoload.php';

use GigGatek\ApiClient\GigGatekClient;

$client = new GigGatekClient('YOUR_TOKEN');

// Get products
$products = $client->products->list();
print_r($products);

// Create an order
$order = $client->orders->create([
    'items' => [
        ['product_id' => 1, 'quantity' => 1]
    ],
    'shipping_address' => [
        'street' => '123 Main St',
        'city' => 'New York',
        'state' => 'NY',
        'zip' => '10001',
        'country' => 'USA'
    ],
    'payment_method' => 'credit_card',
    'payment_details' => [
        'card_token' => 'tok_visa'
    ]
]);
print_r($order);
```

## Error Handling

The API uses standard HTTP status codes and returns detailed error messages:

```json
{
  "error": "validation_error",
  "message": "Validation failed",
  "status": 400,
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

Common error codes:
- `400 Bad Request`: Invalid request parameters
- `401 Unauthorized`: Invalid or missing authentication
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `422 Unprocessable Entity`: Validation error
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server error

## Rate Limiting

The API implements rate limiting to prevent abuse. Current rate limits:
- Anonymous: 60 requests per minute
- Authenticated users: 120 requests per minute
- Admin users: 300 requests per minute

When a rate limit is exceeded, the API returns a 429 Too Many Requests response.

## Next Steps

- Explore the [full API documentation](https://api.giggatek.com/docs)
- Check out the [API examples](./examples.md)
- Join our [developer community](https://community.giggatek.com)
- Contact [support@giggatek.com](mailto:support@giggatek.com) for assistance
