# Rental Management API

This document describes the rental management API endpoints for the GigGatek platform.

## Base URL

All API endpoints are relative to the base URL:

```
https://api.giggatek.com/v1
```

## Authentication

All endpoints require authentication using a JWT token. Include the token in the `Authorization` header:

```
Authorization: Bearer <token>
```

## Endpoints

### Get All Rentals

```
GET /rentals
```

Get a list of rental contracts for the authenticated user. Admins can see all rentals.

#### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| status | string | Filter by rental status (e.g., "pending", "active", "completed", "cancelled") |
| page | integer | Page number (default: 1) |
| per_page | integer | Items per page (default: 10, max: 100) |

#### Response

```json
{
  "rentals": [
    {
      "id": 123,
      "user_id": 456,
      "product_id": 789,
      "product": {
        "name": "Refurbished Gaming PC",
        "image_url": "https://example.com/images/gaming-pc.jpg"
      },
      "status": "active",
      "monthly_payment": 49.99,
      "payments_made": 3,
      "remaining_payments": 9,
      "next_payment_date": "2025-05-10T00:00:00Z"
    },
    {
      "id": 124,
      "user_id": 456,
      "product_id": 790,
      "product": {
        "name": "Professional Monitor",
        "image_url": "https://example.com/images/monitor.jpg"
      },
      "status": "active",
      "monthly_payment": 29.99,
      "payments_made": 6,
      "remaining_payments": 6,
      "next_payment_date": "2025-05-15T00:00:00Z"
    }
  ],
  "pagination": {
    "total": 5,
    "per_page": 10,
    "current_page": 1,
    "total_pages": 1
  }
}
```

### Get Rental Details

```
GET /rentals/{rental_id}
```

Get detailed information about a specific rental contract.

#### Response

```json
{
  "rental": {
    "id": 123,
    "user_id": 456,
    "product_id": 789,
    "product": {
      "id": 789,
      "name": "Refurbished Gaming PC",
      "description": "High-performance gaming PC with RTX 3070",
      "image_url": "https://example.com/images/gaming-pc.jpg"
    },
    "status": "active",
    "term_months": 12,
    "monthly_payment": 49.99,
    "buyout_price": 199.99,
    "start_date": "2025-02-10T00:00:00Z",
    "end_date": "2026-02-10T00:00:00Z",
    "payments_made": 3,
    "remaining_payments": 9,
    "next_payment_date": "2025-05-10T00:00:00Z",
    "address": {
      "street": "123 Main St",
      "city": "Anytown",
      "state": "CA",
      "postal_code": "12345",
      "country": "US"
    },
    "payments": [
      {
        "id": 456,
        "amount": 49.99,
        "status": "paid",
        "payment_date": "2025-02-10T14:30:00Z",
        "transaction_id": "txn_123456"
      },
      {
        "id": 457,
        "amount": 49.99,
        "status": "paid",
        "payment_date": "2025-03-10T15:45:00Z",
        "transaction_id": "txn_234567"
      },
      {
        "id": 458,
        "amount": 49.99,
        "status": "paid",
        "payment_date": "2025-04-10T12:15:00Z",
        "transaction_id": "txn_345678"
      }
    ],
    "created_at": "2025-02-10T14:30:00Z",
    "updated_at": "2025-04-10T12:15:00Z"
  }
}
```

### Create Rental Contract

```
POST /rentals
```

Create a new rental contract.

#### Request Body

```json
{
  "product_id": 789,
  "term_months": 12,
  "monthly_payment": 49.99,
  "buyout_price": 199.99,
  "shipping_address_id": 123,
  "payment_method": "stripe",
  "notes": "First-time rental customer"
}
```

#### Response

```json
{
  "message": "Rental contract created successfully",
  "rental": {
    "id": 123,
    "user_id": 456,
    "product_id": 789,
    "status": "pending",
    "term_months": 12,
    "monthly_payment": 49.99,
    "buyout_price": 199.99,
    "start_date": "2025-04-10T00:00:00Z",
    "end_date": "2026-04-10T00:00:00Z",
    "payments_made": 0,
    "remaining_payments": 12,
    "next_payment_date": "2025-05-10T00:00:00Z",
    "created_at": "2025-04-10T14:30:00Z"
  },
  "payment": {
    "id": 456,
    "amount": 49.99,
    "status": "pending",
    "payment_url": "https://example.com/pay/456"
  }
}
```

### Make Rental Payment

```
POST /rentals/{rental_id}/payments
```

Make a payment for a rental contract.

#### Request Body

```json
{
  "payment_method": "stripe",
  "payment_token": "tok_visa"
}
```

#### Response

```json
{
  "message": "Payment successful",
  "payment": {
    "id": 456,
    "rental_id": 123,
    "amount": 49.99,
    "status": "completed",
    "payment_date": "2025-04-10T14:30:00Z",
    "transaction_id": "txn_123456"
  },
  "rental": {
    "payments_made": 1,
    "remaining_payments": 11,
    "next_payment_date": "2025-05-10T00:00:00Z",
    "status": "active"
  }
}
```

### Extend Rental Contract

```
POST /rentals/{rental_id}/extend
```

Extend a rental contract by adding more months.

#### Request Body

```json
{
  "additional_months": 6,
  "payment_method": "stripe",
  "payment_token": "tok_visa"
}
```

#### Response

```json
{
  "message": "Rental contract extended successfully",
  "rental": {
    "id": 123,
    "term_months": 18,
    "end_date": "2026-10-10T00:00:00Z",
    "remaining_payments": 17
  },
  "payment": {
    "id": 457,
    "amount": 49.99,
    "status": "completed",
    "payment_date": "2025-04-10T14:30:00Z",
    "transaction_id": "txn_234567"
  }
}
```

### Complete Rental Buyout

```
POST /rentals/{rental_id}/buyout
```

Complete a buyout of a rental contract.

#### Request Body

```json
{
  "payment_method": "stripe",
  "payment_token": "tok_visa"
}
```

#### Response

```json
{
  "message": "Rental buyout completed successfully",
  "buyout": {
    "id": 123,
    "rental_id": 123,
    "amount": 199.99,
    "status": "completed",
    "payment_date": "2025-04-10T14:30:00Z",
    "transaction_id": "txn_345678"
  },
  "order": {
    "id": 456,
    "status": "completed"
  }
}
```

### Cancel Rental Contract

```
POST /rentals/{rental_id}/cancel
```

Cancel a rental contract. Only available for contracts in "pending" status.

#### Response

```json
{
  "message": "Rental contract cancelled successfully"
}
```

## Rental Status Values

| Status | Description |
|--------|-------------|
| pending | Contract has been created but first payment not processed |
| active | Contract is active with payments being made |
| completed | Contract has been completed (all payments made or buyout) |
| cancelled | Contract has been cancelled |
| defaulted | Contract is in default due to missed payments |

## Payment Status Values

| Status | Description |
|--------|-------------|
| pending | Payment has not been processed |
| paid | Payment has been processed successfully |
| failed | Payment processing failed |
| reversed | Payment has been reversed |
| refunded | Payment has been refunded |

## Error Responses

All endpoints return appropriate HTTP status codes and error messages:

### 400 Bad Request

```json
{
  "error": "Missing required field: product_id"
}
```

### 401 Unauthorized

```json
{
  "error": "Authentication required"
}
```

### 403 Forbidden

```json
{
  "error": "Permission denied"
}
```

### 404 Not Found

```json
{
  "error": "Rental not found"
}
```

### 409 Conflict

```json
{
  "error": "Rental contract cannot be cancelled in its current status"
}
```

### 500 Internal Server Error

```json
{
  "error": "Failed to process payment"
}
```
