# Payment API

This document describes the payment processing API endpoints for the GigGatek platform.

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

## Stripe Integration

### Create Payment Intent

```
POST /payments/stripe/intent
```

Create a Stripe payment intent for charging a customer.

#### Request Body

```json
{
  "amount": 129.97,
  "description": "GigGatek Order #123",
  "metadata": {
    "order_id": "123",
    "customer_name": "John Doe",
    "customer_email": "john@example.com",
    "items_count": 2
  }
}
```

#### Response

```json
{
  "success": true,
  "client_secret": "pi_3NJkCpKXnVQrqQAZ1geFWXcR_secret_vPUjMsZRhJwRmkRPMPvYmJGtx",
  "payment_intent_id": "pi_3NJkCpKXnVQrqQAZ1geFWXcR"
}
```

### Confirm Payment Intent

```
POST /payments/stripe/confirm
```

Confirm a Stripe payment intent after collecting card details.

#### Request Body

```json
{
  "payment_intent_id": "pi_3NJkCpKXnVQrqQAZ1geFWXcR",
  "payment_method_id": "pm_1NJkCqKXnVQrqQAZDVgztYxR"
}
```

#### Response

```json
{
  "success": true,
  "status": "succeeded",
  "payment_intent_id": "pi_3NJkCpKXnVQrqQAZ1geFWXcR"
}
```

### Stripe Webhook

```
POST /payments/stripe/webhook
```

Endpoint for receiving Stripe webhook events.

#### Request Headers

```
Stripe-Signature: t=1681234567,v1=5257a869e7ecebeda32affa62cdca3fa51cad7e77a0e56ff536d0ce8e108d8bd,v0=6ffbb59b2300aae63f272406069a9788598b792a944a07aba816edb039989a39
```

#### Request Body

Stripe event object (varies by event type).

#### Response

```json
{
  "status": "success"
}
```

## PayPal Integration

### Create PayPal Order

```
POST /payments/paypal/order
```

Create a PayPal order for payment processing.

#### Request Body

```json
{
  "amount": 129.97,
  "description": "GigGatek Purchase",
  "items": [
    {
      "name": "Refurbished Laptop",
      "quantity": 1,
      "price": 99.99
    },
    {
      "name": "Wireless Mouse",
      "quantity": 1,
      "price": 19.99
    }
  ],
  "metadata": {
    "order_id": "123",
    "customer_name": "John Doe",
    "customer_email": "john@example.com",
    "items_count": 2
  },
  "return_url": "https://giggatek.com/checkout/success",
  "cancel_url": "https://giggatek.com/checkout/cancel"
}
```

#### Response

```json
{
  "success": true,
  "payment_id": "PAYID-MJTL2LQ7Y5227465X4269034",
  "approval_url": "https://www.sandbox.paypal.com/checkoutnow?token=EC-5Y644243RX369735H"
}
```

### Capture PayPal Payment

```
POST /payments/paypal/capture
```

Capture payment for an approved PayPal order.

#### Request Body

```json
{
  "payment_id": "PAYID-MJTL2LQ7Y5227465X4269034",
  "payer_id": "QPPLBGFCKHGKY"
}
```

#### Response

```json
{
  "success": true,
  "payment_id": "PAYID-MJTL2LQ7Y5227465X4269034",
  "transaction_id": "8MC585209K746392H",
  "status": "approved"
}
```

### PayPal Webhook

```
POST /payments/paypal/webhook
```

Endpoint for receiving PayPal webhook events.

#### Request Headers

```
PAYPAL-TRANSMISSION-ID: 721c4a60-f63a-11eb-9a03-0242ac130003
PAYPAL-TRANSMISSION-TIME: 2025-04-10T14:30:00Z
PAYPAL-CERT-URL: https://api.sandbox.paypal.com/v1/notifications/certs/CERT-360caa42-fca2a594-a5cafa77
PAYPAL-AUTH-ALGO: SHA256withRSA
PAYPAL-TRANSMISSION-SIG: vSOIQFIZQHv8G2vpbOpD/4fSC4/MYhdHyv+AmgJyeJQq6q9JyBMDIaQ/K0pQU0nz...
```

#### Request Body

PayPal event object (varies by event type).

#### Response

```json
{
  "status": "success"
}
```

## Refund Processing

### Process Refund

```
POST /payments/refund
```

Process a refund for a previous payment. Requires admin permissions.

#### Request Body

```json
{
  "payment_type": "order",
  "reference_id": "123",
  "transaction_id": "8MC585209K746392H",
  "amount": 129.97,
  "reason": "Customer request"
}
```

#### Response

```json
{
  "success": true,
  "refund_id": "ref_123456",
  "status": "completed"
}
```

### Get Refund Status

```
GET /payments/refund/{refund_id}
```

Get the status of a refund.

#### Response

```json
{
  "refund": {
    "id": "ref_123456",
    "payment_id": "pay_789012",
    "transaction_id": "8MC585209K746392H",
    "amount": 129.97,
    "status": "completed",
    "created_at": "2025-04-10T14:30:00Z"
  }
}
```

## Payment Status Values

| Status | Description |
|--------|-------------|
| pending | Payment has not been processed |
| processing | Payment is being processed |
| completed | Payment has been processed successfully |
| failed | Payment processing failed |
| refunded | Payment has been refunded |
| partially_refunded | Payment has been partially refunded |

## Error Responses

All endpoints return appropriate HTTP status codes and error messages:

### 400 Bad Request

```json
{
  "error": "Valid amount is required"
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
  "error": "Payment not found"
}
```

### 500 Internal Server Error

```json
{
  "error": "Failed to process payment"
}
```
