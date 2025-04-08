# GigGatek API Documentation

## Overview

This document provides comprehensive documentation for the GigGatek e-commerce platform API. The API is organized into several modules that handle different aspects of the platform's functionality: Authentication, Order Management, Rental Management, and Email Notifications.

## Base URL

All API endpoints are relative to the base URL:

- Development: `http://localhost:5000/api`
- Staging: `https://staging-api.giggatek.com/api`
- Production: `https://api.giggatek.com/api`

## Authentication

All API requests (except for register and login) require authentication using JWT tokens. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

If a token is expired or invalid, the API will return a 401 Unauthorized response. In this case, you should refresh the token or redirect the user to log in again.

## Response Format

All API responses follow a consistent format:

For successful responses:
```json
{
  "data": { ... },  // Response data object or array
  "message": "...",  // Optional success message
  "status": 200      // HTTP status code
}
```

For error responses:
```json
{
  "error": "Error message",
  "status": 400       // HTTP status code
}
```

## Endpoints

### Authentication API

#### Register a new user

```
POST /auth/register
```

Creates a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "first_name": "John",
  "last_name": "Doe"
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "token": "jwt_token_here",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe"
  }
}
```

**Status Codes:**
- 201: User created successfully
- 400: Invalid input data
- 409: User already exists

#### Login

```
POST /auth/login
```

Authenticates a user and returns a JWT token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "token": "jwt_token_here",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "is_admin": false
  }
}
```

**Status Codes:**
- 200: Login successful
- 401: Invalid email or password

#### Refresh Token

```
POST /auth/refresh-token
```

Refreshes an existing JWT token.

**Authentication Required:** Yes

**Response:**
```json
{
  "message": "Token refreshed successfully",
  "token": "new_jwt_token_here"
}
```

**Status Codes:**
- 200: Token refreshed successfully
- 401: Invalid or expired token

#### Get Current User

```
GET /auth/me
```

Returns information about the currently authenticated user.

**Authentication Required:** Yes

**Response:**
```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "is_admin": false
  }
}
```

**Status Codes:**
- 200: Success
- 401: Not authenticated
- 404: User not found

#### Request Password Reset

```
POST /auth/password-reset-request
```

Sends a password reset email to the specified address.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "message": "If the email exists, a password reset link has been sent"
}
```

**Status Codes:**
- 200: Request processed (sent for security, regardless of whether email exists)

#### Reset Password

```
POST /auth/password-reset
```

Resets a user's password using a reset token.

**Request Body:**
```json
{
  "token": "reset_token_here",
  "new_password": "NewSecurePassword123!"
}
```

**Response:**
```json
{
  "message": "Password has been reset successfully"
}
```

**Status Codes:**
- 200: Password reset successful
- 400: Invalid password format
- 401: Invalid or expired reset token

#### Update Profile

```
PUT /auth/update-profile
```

Updates the current user's profile information.

**Authentication Required:** Yes

**Request Body:**
```json
{
  "first_name": "John",
  "last_name": "Smith",
  "phone": "555-123-4567"
}
```

**Response:**
```json
{
  "message": "Profile updated successfully",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Smith",
    "phone": "555-123-4567"
  }
}
```

**Status Codes:**
- 200: Profile updated successfully
- 400: Invalid input data
- 401: Not authenticated

#### Change Password

```
PUT /auth/change-password
```

Changes the current user's password.

**Authentication Required:** Yes

**Request Body:**
```json
{
  "current_password": "CurrentPassword123!",
  "new_password": "NewPassword123!"
}
```

**Response:**
```json
{
  "message": "Password changed successfully"
}
```

**Status Codes:**
- 200: Password changed successfully
- 400: Invalid password format
- 401: Current password is incorrect

### Order Management API

#### List User Orders

```
GET /orders/
```

Returns a list of orders for the authenticated user.

**Authentication Required:** Yes

**Query Parameters:**
- `status` (optional): Filter by order status
- `page` (optional): Page number (default: 1)
- `per_page` (optional): Items per page (default: 10, max: 50)

**Response:**
```json
{
  "orders": [
    {
      "id": 1,
      "user_id": 1,
      "order_date": "2025-04-01T12:30:45Z",
      "total": 599.99,
      "status": "processing",
      "payment_status": "paid",
      "shipping_address_id": 1,
      "billing_address_id": 1,
      "shipping_method": "standard",
      "tracking_number": null,
      "notes": null,
      "items": [
        {
          "id": 1,
          "product_id": 101,
          "quantity": 1,
          "price": 599.99,
          "subtotal": 599.99,
          "product_name": "Refurbished Laptop XPS 13",
          "image_url": "/images/products/laptop-xps-13.jpg"
        }
      ]
    }
  ],
  "pagination": {
    "total": 5,
    "page": 1,
    "per_page": 10,
    "total_pages": 1
  }
}
```

**Status Codes:**
- 200: Success
- 401: Not authenticated

#### Get Order Details

```
GET /orders/:order_id
```

Returns detailed information for a specific order.

**Authentication Required:** Yes

**Response:**
```json
{
  "order": {
    "id": 1,
    "user_id": 1,
    "order_date": "2025-04-01T12:30:45Z",
    "total": 599.99,
    "status": "processing",
    "payment_status": "paid",
    "shipping_address_id": 1,
    "billing_address_id": 1,
    "shipping_method": "standard",
    "tracking_number": null,
    "notes": null,
    "items": [
      {
        "id": 1,
        "product_id": 101,
        "quantity": 1,
        "price": 599.99,
        "subtotal": 599.99,
        "product_name": "Refurbished Laptop XPS 13",
        "image_url": "/images/products/laptop-xps-13.jpg",
        "sku": "XPS13-R-2025"
      }
    ],
    "shipping_address": {
      "id": 1,
      "first_name": "John",
      "last_name": "Doe",
      "street_address": "123 Main St",
      "city": "San Francisco",
      "state": "CA",
      "zip_code": "94107",
      "country": "US",
      "phone": "555-123-4567"
    },
    "billing_address": {
      "id": 1,
      "first_name": "John",
      "last_name": "Doe",
      "street_address": "123 Main St",
      "city": "San Francisco",
      "state": "CA",
      "zip_code": "94107",
      "country": "US",
      "phone": "555-123-4567"
    },
    "payments": [
      {
        "id": 1,
        "order_id": 1,
        "payment_method": "stripe",
        "amount": 599.99,
        "status": "completed",
        "transaction_id": "ch_1abcdefghijklmnopqrst",
        "created_at": "2025-04-01T12:31:15Z"
      }
    ],
    "status_history": [
      {
        "id": 2,
        "order_id": 1,
        "status": "processing",
        "notes": "Payment confirmed, processing order",
        "created_at": "2025-04-01T12:31:20Z",
        "created_by": "System"
      },
      {
        "id": 1,
        "order_id": 1,
        "status": "pending",
        "notes": "Order created",
        "created_at": "2025-04-01T12:30:45Z",
        "created_by": "User 1"
      }
    ]
  }
}
```

**Status Codes:**
- 200: Success
- 401: Not authenticated
- 404: Order not found or access denied

#### Create Order

```
POST /orders/
```

Creates a new order.

**Authentication Required:** Yes

**Request Body:**
```json
{
  "items": [
    {
      "product_id": 101,
      "quantity": 1
    }
  ],
  "shipping_address_id": 1,
  "billing_address_id": 1,
  "shipping_method": "standard"
}
```

**Response:**
```json
{
  "message": "Order created successfully",
  "order": {
    "id": 2,
    "user_id": 1,
    "order_date": "2025-04-07T14:25:30Z",
    "total": 599.99,
    "status": "pending",
    "payment_status": "pending",
    "shipping_address_id": 1,
    "billing_address_id": 1,
    "shipping_method": "standard"
  }
}
```

**Status Codes:**
- 201: Order created successfully
- 400: Invalid input data
- 401: Not authenticated
- 404: Product not found
- 400: Insufficient stock

#### Cancel Order

```
POST /orders/:order_id/cancel
```

Cancels an existing order.

**Authentication Required:** Yes

**Response:**
```json
{
  "message": "Order cancelled successfully"
}
```

**Status Codes:**
- 200: Order cancelled successfully
- 400: Order cannot be cancelled (wrong status)
- 401: Not authenticated
- 404: Order not found or access denied

#### Update Order Status (Admin Only)

```
PUT /orders/:order_id/status
```

Updates the status of an order.

**Authentication Required:** Yes (Admin only)

**Request Body:**
```json
{
  "status": "shipped",
  "notes": "Shipped via USPS, tracking provided"
}
```

**Response:**
```json
{
  "message": "Order status updated successfully"
}
```

**Status Codes:**
- 200: Status updated successfully
- 400: Invalid status
- 401: Not authenticated
- 403: Not authorized (not admin)
- 404: Order not found

#### Get Order Statistics

```
GET /orders/stats
```

Returns statistics about the user's orders.

**Authentication Required:** Yes

**Response:**
```json
{
  "total_orders": 5,
  "status_counts": {
    "pending": 1,
    "processing": 2,
    "shipped": 1,
    "delivered": 1,
    "cancelled": 0
  },
  "total_spent": 2199.95,
  "most_recent_order": {
    "id": 5,
    "order_date": "2025-04-05T09:15:30Z",
    "total": 399.99,
    "status": "processing"
  }
}
```

**Status Codes:**
- 200: Success
- 401: Not authenticated

### Rental Management API

#### List User Rentals

```
GET /rentals/
```

Returns a list of rentals for the authenticated user.

**Authentication Required:** Yes

**Query Parameters:**
- `status` (optional): Filter by rental status
- `page` (optional): Page number (default: 1)
- `per_page` (optional): Items per page (default: 10, max: 50)

**Response:**
```json
{
  "rentals": [
    {
      "id": 1,
      "user_id": 1,
      "product_id": 201,
      "start_date": "2025-04-01",
      "end_date": "2026-04-01",
      "monthly_rate": 49.99,
      "total_months": 12,
      "total_amount": 599.88,
      "status": "active",
      "payments_made": 1,
      "remaining_payments": 11,
      "next_payment_date": "2025-05-01",
      "address_id": 1,
      "created_at": "2025-04-01T10:00:00Z",
      "updated_at": "2025-04-01T10:05:00Z",
      "product_name": "Refurbished Gaming PC",
      "image_url": "/images/products/gaming-pc.jpg",
      "payments": [
        {
          "id": 1,
          "rental_id": 1,
          "amount": 49.99,
          "payment_date": "2025-04-01",
          "payment_method": "stripe",
          "transaction_id": "ch_2abcdefghijklmnopqrst",
          "status": "completed",
          "created_at": "2025-04-01T10:05:00Z"
        }
      ],
      "payment_progress": 8.33
    }
  ],
  "pagination": {
    "total": 1,
    "page": 1,
    "per_page": 10,
    "total_pages": 1
  }
}
```

**Status Codes:**
- 200: Success
- 401: Not authenticated

#### Get Rental Details

```
GET /rentals/:rental_id
```

Returns detailed information for a specific rental.

**Authentication Required:** Yes

**Response:**
```json
{
  "rental": {
    "id": 1,
    "user_id": 1,
    "product_id": 201,
    "start_date": "2025-04-01",
    "end_date": "2026-04-01",
    "monthly_rate": 49.99,
    "total_months": 12,
    "total_amount": 599.88,
    "status": "active",
    "payments_made": 1,
    "remaining_payments": 11,
    "next_payment_date": "2025-05-01",
    "address_id": 1,
    "contract_id": 1,
    "created_at": "2025-04-01T10:00:00Z",
    "updated_at": "2025-04-01T10:05:00Z",
    "product_name": "Refurbished Gaming PC",
    "product_description": "High-performance gaming PC with RTX 3070 graphics",
    "image_url": "/images/products/gaming-pc.jpg",
    "category": "desktop",
    "condition": "excellent",
    "specifications": "{\"cpu\":\"Intel i7 11700K\",\"ram\":\"32GB DDR4\",\"storage\":\"1TB SSD\",\"gpu\":\"RTX 3070\"}",
    "payments": [
      {
        "id": 1,
        "rental_id": 1,
        "amount": 49.99,
        "payment_date": "2025-04-01",
        "payment_method": "stripe",
        "transaction_id": "ch_2abcdefghijklmnopqrst",
        "status": "completed",
        "created_at": "2025-04-01T10:05:00Z"
      }
    ],
    "address": {
      "id": 1,
      "first_name": "John",
      "last_name": "Doe",
      "street_address": "123 Main St",
      "city": "San Francisco",
      "state": "CA",
      "zip_code": "94107",
      "country": "US",
      "phone": "555-123-4567"
    },
    "contract": {
      "id": 1,
      "rental_id": 1,
      "contract_text": "RENT-TO-OWN AGREEMENT...",
      "signed_at": "2025-04-01T10:10:00Z",
      "signature_ip": "192.168.1.1",
      "created_at": "2025-04-01T10:00:00Z"
    },
    "status_history": [
      {
        "id": 2,
        "rental_id": 1,
        "status": "active",
        "notes": "Rental contract signed by customer",
        "created_at": "2025-04-01T10:10:00Z",
        "created_by": "User 1"
      },
      {
        "id": 1,
        "rental_id": 1,
        "status": "pending",
        "notes": "Rental contract created",
        "created_at": "2025-04-01T10:00:00Z",
        "created_by": "User 1"
      }
    ],
    "payment_schedule": [
      {
        "month": 1,
        "date": "2025-04-01",
        "amount": 49.99,
        "status": "completed",
        "transaction_id": "ch_2abcdefghijklmnopqrst"
      },
      {
        "month": 2,
        "date": "2025-05-01",
        "amount": 49.99,
        "status": "pending",
        "transaction_id": null
      },
      // ... more months ...
    ],
    "payment_progress": 8.33,
    "remaining_amount": 549.89
  }
}
```

**Status Codes:**
- 200: Success
- 401: Not authenticated
- 404: Rental not found or access denied

#### Create Rental

```
POST /rentals/
```

Creates a new rental contract.

**Authentication Required:** Yes

**Request Body:**
```json
{
  "product_id": 201,
  "total_months": 12,
  "address_id": 1
}
```

**Response:**
```json
{
  "message": "Rental contract created successfully",
  "rental": {
    "id": 2,
    "user_id": 1,
    "product_id": 201,
    "start_date": "2025-04-07",
    "end_date": "2026-04-07",
    "monthly_rate": 49.99,
    "total_months": 12,
    "total_amount": 599.88,
    "status": "pending",
    "payments_made": 0,
    "remaining_payments": 12,
    "next_payment_date": "2025-04-07",
    "address_id": 1
  }
}
```

**Status Codes:**
- 201: Rental created successfully
- 400: Invalid input data
- 401: Not authenticated
- 404: Product or address not found
- 400: Product not available for rent or out of stock

#### Cancel Rental

```
POST /rentals/:rental_id/cancel
```

Cancels a rental contract.

**Authentication Required:** Yes

**Response:**
```json
{
  "message": "Rental for Refurbished Gaming PC cancelled successfully"
}
```

**Status Codes:**
- 200: Rental cancelled successfully
- 400: Rental cannot be cancelled (wrong status)
- 401: Not authenticated
- 404: Rental not found or access denied

#### Make Rental Payment

```
POST /rentals/:rental_id/make-payment
```

Make a payment on a rental contract.

**Authentication Required:** Yes

**Request Body:**
```json
{
  "payment_method": "stripe",
  "transaction_id": "ch_3abcdefghijklmnopqrst"
}
```

**Response:**
```json
{
  "message": "Payment processed successfully",
  "rental": {
    "id": 1,
    "user_id": 1,
    "product_id": 201,
    "start_date": "2025-04-01",
    "end_date": "2026-04-01",
    "monthly_rate": 49.99,
    "total_months": 12,
    "total_amount": 599.88,
    "status": "active",
    "payments_made": 2,
    "remaining_payments": 10,
    "next_payment_date": "2025-06-01"
  }
}
```

**Status Codes:**
- 200: Payment processed successfully
- 400: Invalid payment data or no remaining payments
- 401: Not authenticated
- 404: Rental not found or access denied

#### Early Buyout

```
POST /rentals/:rental_id/buyout
```

Completes an early buyout of a rental contract.

**Authentication Required:** Yes

**Request Body:**
```json
{
  "payment_method": "stripe",
  "transaction_id": "ch_4abcdefghijklmnopqrst"
}
```

**Response:**
```json
{
  "message": "Rental for Refurbished Gaming PC has been successfully bought out",
  "amount_paid": 499.90
}
```

**Status Codes:**
- 200: Buyout completed successfully
- 400: Invalid payment data or rental not eligible for buyout
- 401: Not authenticated
- 404: Rental not found or access denied

#### Sign Rental Contract

```
POST /rentals/:rental_id/sign-contract
```

Digitally signs a rental contract.

**Authentication Required:** Yes

**Response:**
```json
{
  "message": "Rental contract signed successfully",
  "signed_at": "2025-04-07T14:30:00Z"
}
```

**Status Codes:**
- 200: Contract signed successfully
- 400: Contract already signed
- 401: Not authenticated
- 404: Rental or contract not found

#### Get Rental Statistics

```
GET /rentals/stats
```

Returns statistics about the user's rentals.

**Authentication Required:** Yes

**Response:**
```json
{
  "total_rentals": 2,
  "status_counts": {
    "pending": 0,
    "active": 1,
    "completed": 0,
    "cancelled": 1
  },
  "total_spent": 99.98,
  "upcoming_payments": [
    {
      "id": 1,
      "product_id": 201,
      "next_payment_date": "2025-05-01",
      "monthly_rate": 49.99,
      "product_name": "Refurbished Gaming PC"
    }
  ],
  "total_products_rented": 2
}
```

**Status Codes:**
- 200: Success
- 401: Not authenticated

## Data Models

### User

```json
{
  "id": 1,
  "email": "user@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "phone": "555-123-4567",
  "is_admin": false
}
```

### Product

```json
{
  "id": 101,
  "name": "Refurbished Laptop XPS 13",
  "description": "Like-new Dell XPS 13 laptop",
  "price": 599.99,
  "rental_price": 49.99,
  "category": "laptop",
  "condition": "excellent",
  "specifications": "{\"cpu\":\"Intel i7 1165G7\",\"ram\":\"16GB\",\"storage\":\"512GB SSD\",\"display\":\"13.4-inch FHD+\"}",
  "inventory_count": 5,
  "is_rentable": true,
  "image_url": "/images/products/laptop-xps-13.jpg",
  "sku": "XPS13-R-2025"
}
```

### Order

```json
{
  "id": 1,
  "user_id": 1,
  "order_date": "2025-04-01T12:30:45Z",
  "total": 599.99,
  "status": "processing",
  "payment_status": "paid",
  "shipping_address_id": 1,
  "billing_address_id": 1,
  "shipping_method": "standard",
  "tracking_number": null,
  "notes": null
}
```

### Rental

```json
{
  "id": 1,
  "user_id": 1,
  "product_id": 201,
  "start_date": "2025-04-01",
  "end_date": "2026-04-01",
  "monthly_rate": 49.99,
  "total_months": 12,
  "total_amount": 599.88,
  "status": "active",
  "payments_made": 1,
  "remaining_payments": 11,
  "next_payment_date": "2025-05-01",
  "address_id": 1,
  "contract_id": 1,
  "created_at": "2025-04-01T10:00:00Z",
  "updated_at": "2025-04-01T10:05:00Z"
}
```

### Address

```json
{
  "id": 1,
  "user_id": 1,
  "first_name": "John",
  "last_name": "Doe",
  "street_address": "123 Main St",
  "city": "San Francisco",
  "state": "CA",
  "zip_code": "94107",
  "country": "US",
  "phone": "555-123-4567",
  "is_default": true,
  "address_type": "both" // shipping, billing, or both
}
```

## Authentication Flow

1. **Registration:** User creates an account via `/auth/register`
2. **Login:** User logs in via `/auth/login` and receives a JWT token
3. **Token Usage:** Client includes the token in the Authorization header for all authenticated requests
4. **Token Refresh:** When the token is about to expire, client calls `/auth/refresh-token` to get a new token
5. **Logout:** Client removes the token from storage

## Error Codes

| Status Code | Description |
|-------------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request - Invalid input data |
| 401 | Unauthorized - Missing or invalid authentication |
| 403 | Forbidden - Not authorized to access this resource |
| 404 | Not Found - Resource not found |
| 409 | Conflict - Resource already exists |
| 500 | Internal Server Error |

## Rate Limiting

The API implements rate limiting to prevent abuse. Limits are based on client IP address and/or user ID.

- 100 requests per minute for authenticated users
- 30 requests per minute for unauthenticated users

When rate limit is exceeded, the API returns a 429 Too Many Requests status code.

## Versioning

The API uses URL versioning. The current version is v1:

`https://api.giggatek.com/api/v1/...`

While not currently used in the base URL, this pattern allows for future API versions without breaking existing clients.

## Testing

For testing the API, you can use the staging environment which is refreshed daily with anonymized data.

You can create test accounts with different roles for testing various scenarios:

- Regular user: Register normally
- Admin user: Contact development team for admin credentials

The staging environment does not send real emails or process real payments.

## Support

If you encounter any issues or have questions about the API, please contact:

- Email: api-support@giggatek.com
- Support Hours: Monday-Friday, 9am-5pm Pacific Time
