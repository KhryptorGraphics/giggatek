# GigGatek API Documentation

This directory contains the API documentation for the GigGatek e-commerce platform.

## Overview

The GigGatek API provides a comprehensive set of endpoints for interacting with the platform programmatically. It allows developers to:

- Access product information
- Manage user accounts
- Process orders
- Handle rental contracts
- Process payments

## Documentation Structure

- [index.md](index.md) - Overview and general information
- [auth.md](auth.md) - Authentication API documentation
- [products.md](products.md) - Products API documentation
- [orders.md](orders.md) - Orders API documentation
- [rentals.md](rentals.md) - Rentals API documentation
- [payments.md](payments.md) - Payments API documentation

## Getting Started

To get started with the GigGatek API:

1. Register for an account at [giggatek.com](https://giggatek.com)
2. Obtain API credentials from your account dashboard
3. Use the authentication endpoints to get a JWT token
4. Use the token to access other API endpoints

## API Base URL

All API endpoints are relative to the base URL:

```
https://api.giggatek.com/v1
```

## Authentication

Most endpoints require authentication using a JWT token. Include the token in the `Authorization` header:

```
Authorization: Bearer <token>
```

## Example Usage

Here's a simple example of how to use the API with cURL:

```bash
# Login and get a token
curl -X POST https://api.giggatek.com/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"SecurePassword123!"}'

# Use the token to get a list of products
curl -X GET https://api.giggatek.com/v1/products \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

## Support

If you have any questions or need assistance with the API, please contact our support team at api-support@giggatek.com.
