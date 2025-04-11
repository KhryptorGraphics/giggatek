# Order Management API

This document describes the order management API endpoints for the GigGatek platform.

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

### Get All Orders

```
GET /orders
```

Get a list of orders for the authenticated user. Admins can see all orders.

#### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| status | string | Filter by order status (e.g., "pending", "processing", "shipped", "delivered", "cancelled") |
| page | integer | Page number (default: 1) |
| per_page | integer | Items per page (default: 10, max: 100) |

#### Response

```json
{
  "orders": [
    {
      "id": 123,
      "user_id": 456,
      "status": "processing",
      "payment_status": "paid",
      "total": 129.97,
      "item_count": 2,
      "created_at": "2025-04-10T14:30:00Z"
    },
    {
      "id": 124,
      "user_id": 456,
      "status": "delivered",
      "payment_status": "paid",
      "total": 79.99,
      "item_count": 1,
      "created_at": "2025-04-05T10:15:00Z"
    }
  ],
  "pagination": {
    "total": 25,
    "per_page": 10,
    "current_page": 1,
    "total_pages": 3
  }
}
```

### Get Order Details

```
GET /orders/{order_id}
```

Get detailed information about a specific order.

#### Response

```json
{
  "order": {
    "id": 123,
    "user_id": 456,
    "status": "processing",
    "payment_status": "paid",
    "subtotal": 119.98,
    "shipping_fee": 9.99,
    "tax": 10.00,
    "discount": 10.00,
    "total": 129.97,
    "shipping_address": {
      "street": "123 Main St",
      "city": "Anytown",
      "state": "CA",
      "postal_code": "12345",
      "country": "US"
    },
    "items": [
      {
        "id": 789,
        "product_id": 101,
        "name": "Refurbished Laptop",
        "sku": "RL-101",
        "quantity": 1,
        "price": 99.99,
        "image_url": "https://example.com/images/laptop.jpg"
      },
      {
        "id": 790,
        "product_id": 102,
        "name": "Wireless Mouse",
        "sku": "WM-102",
        "quantity": 1,
        "price": 19.99,
        "image_url": "https://example.com/images/mouse.jpg"
      }
    ],
    "created_at": "2025-04-10T14:30:00Z",
    "updated_at": "2025-04-10T15:45:00Z"
  }
}
```

### Create Order

```
POST /orders
```

Create a new order.

#### Request Body

```json
{
  "items": [
    {
      "product_id": 101,
      "quantity": 1,
      "price": 99.99
    },
    {
      "product_id": 102,
      "quantity": 1,
      "price": 19.99
    }
  ],
  "shipping_address_id": 789,
  "payment_method": "stripe",
  "shipping_method": "standard",
  "notes": "Please leave package at the door"
}
```

#### Response

```json
{
  "message": "Order created successfully",
  "order": {
    "id": 123,
    "user_id": 456,
    "status": "pending",
    "payment_status": "pending",
    "total": 129.97,
    "created_at": "2025-04-10T14:30:00Z"
  }
}
```

### Update Order Status

```
PUT /orders/{order_id}/status
```

Update the status of an order. Requires admin permissions.

#### Request Body

```json
{
  "status": "processing"
}
```

#### Response

```json
{
  "message": "Order status updated successfully"
}
```

### Update Payment Status

```
PUT /orders/{order_id}/payment
```

Update the payment status of an order. Requires admin permissions.

#### Request Body

```json
{
  "payment_status": "paid"
}
```

#### Response

```json
{
  "message": "Payment status updated successfully"
}
```

### Cancel Order

```
POST /orders/{order_id}/cancel
```

Cancel an order. Users can only cancel their own orders in certain statuses.

#### Response

```json
{
  "message": "Order cancelled successfully"
}
```

## Order Status Values

| Status | Description |
|--------|-------------|
| pending | Order has been created but not processed |
| processing | Order is being processed |
| shipped | Order has been shipped |
| delivered | Order has been delivered |
| cancelled | Order has been cancelled |
| returned | Order has been returned |
| refunded | Order has been refunded |

## Payment Status Values

| Status | Description |
|--------|-------------|
| pending | Payment has not been processed |
| paid | Payment has been processed successfully |
| failed | Payment processing failed |
| refunded | Payment has been refunded |
| partially_refunded | Payment has been partially refunded |

## Error Responses

All endpoints return appropriate HTTP status codes and error messages:

### 400 Bad Request

```json
{
  "error": "Missing required field: items"
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
  "error": "Order not found"
}
```

### 500 Internal Server Error

```json
{
  "error": "Failed to update order status"
}
```
