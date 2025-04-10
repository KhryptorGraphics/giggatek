# Stripe Integration Documentation

## Overview

GigGatek uses Stripe for secure payment processing. This document provides information about how the Stripe integration works, how to set it up, and how to maintain it.

## Table of Contents

1. [Setup](#setup)
2. [Frontend Integration](#frontend-integration)
3. [Backend Integration](#backend-integration)
4. [Payment Flow](#payment-flow)
5. [Webhooks](#webhooks)
6. [Testing](#testing)
7. [Going Live](#going-live)
8. [Troubleshooting](#troubleshooting)

## Setup

### Prerequisites

- Stripe account
- Stripe API keys (publishable and secret)
- SSL certificate for your domain (required for production)

### Configuration

1. Create a Stripe account at [stripe.com](https://stripe.com)
2. Get your API keys from the Stripe Dashboard
3. Add the keys to your environment configuration:

```
# .env file
STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key
STRIPE_SECRET_KEY=sk_test_your_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

## Frontend Integration

The frontend integration is handled by the `stripe-integration.js` file, which provides a `StripeHandler` class for interacting with Stripe.

### Key Components

- **Stripe Elements**: UI components for collecting payment information
- **Payment Intents**: API for handling the payment lifecycle
- **3D Secure Authentication**: Support for Strong Customer Authentication (SCA)

### Usage

1. Include the Stripe.js library:

```html
<script src="https://js.stripe.com/v3/"></script>
```

2. Initialize the Stripe handler:

```javascript
const stripeHandler = new StripeHandler({
  publicKey: 'pk_test_your_publishable_key',
  returnUrl: window.location.origin + '/checkout.php'
});
```

3. Set up the payment form:

```javascript
stripeHandler.setupPaymentForm();
```

4. Create a payment intent:

```javascript
const result = await stripeHandler.createPaymentIntent(
  amount, // Amount in dollars
  description,
  metadata // Optional metadata
);
```

5. Process the payment:

```javascript
const paymentResult = await stripeHandler.processPayment(billingDetails);
if (paymentResult.success) {
  // Payment successful
} else {
  // Payment failed
}
```

## Backend Integration

The backend integration is handled by the `stripe_handler.php` file, which provides API endpoints for creating and confirming payment intents.

### Key Endpoints

- `/api/payment/create-payment-intent`: Creates a new payment intent
- `/api/payment/confirm-payment-intent`: Confirms a payment intent
- `/api/payment/webhook`: Handles Stripe webhook events
- `/api/payment/payment-methods`: Manages saved payment methods

### Creating a Payment Intent

```php
// Initialize Stripe with secret key
\Stripe\Stripe::setApiKey(STRIPE_SECRET_KEY);

// Create payment intent
$intent = \Stripe\PaymentIntent::create([
  'amount' => $amount, // Amount in cents
  'currency' => 'usd',
  'description' => $description,
  'metadata' => $metadata
]);

// Return client secret
return [
  'success' => true,
  'client_secret' => $intent->client_secret,
  'payment_intent_id' => $intent->id
];
```

### Confirming a Payment Intent

```php
// Retrieve payment intent
$intent = \Stripe\PaymentIntent::retrieve($paymentIntentId);

// Confirm payment intent
$intent->confirm([
  'payment_method' => $paymentMethodId,
  'return_url' => $returnUrl
]);

// Return status
return [
  'success' => true,
  'status' => $intent->status,
  'requires_action' => $intent->status === 'requires_action',
  'client_secret' => $intent->client_secret
];
```

## Payment Flow

1. **Customer initiates checkout**:
   - Customer adds items to cart and proceeds to checkout
   - Frontend collects shipping and billing information

2. **Create payment intent**:
   - Frontend calls backend to create a payment intent
   - Backend creates payment intent with Stripe and returns client secret
   - Frontend stores client secret for later use

3. **Collect payment details**:
   - Customer enters payment details in Stripe Elements form
   - Frontend validates input

4. **Process payment**:
   - Frontend confirms payment intent with Stripe
   - If 3D Secure is required, customer completes authentication
   - Stripe processes the payment

5. **Handle result**:
   - If payment succeeds, create order and show confirmation
   - If payment fails, show error message and allow retry

## Webhooks

Stripe webhooks are used to handle asynchronous payment events, such as successful payments, failed payments, and disputes.

### Setting Up Webhooks

1. Go to the Stripe Dashboard > Developers > Webhooks
2. Add a new endpoint with your webhook URL: `https://yourdomain.com/api/payment/webhook`
3. Select the events you want to receive (at minimum: `payment_intent.succeeded`, `payment_intent.payment_failed`)
4. Copy the webhook signing secret and add it to your environment configuration

### Handling Webhook Events

```php
// Verify webhook signature
$payload = file_get_contents('php://input');
$sigHeader = $_SERVER['HTTP_STRIPE_SIGNATURE'];
$event = \Stripe\Webhook::constructEvent($payload, $sigHeader, STRIPE_WEBHOOK_SECRET);

// Handle the event
switch ($event->type) {
  case 'payment_intent.succeeded':
    $paymentIntent = $event->data->object;
    // Handle successful payment
    break;
  case 'payment_intent.payment_failed':
    $paymentIntent = $event->data->object;
    // Handle failed payment
    break;
  // Handle other event types
}
```

## Testing

### Test Cards

Use these test card numbers for testing different scenarios:

- **Successful payment**: 4242 4242 4242 4242
- **Authentication required**: 4000 0025 0000 3155
- **Payment declined**: 4000 0000 0000 0002

### Testing Webhooks

Use the Stripe CLI to test webhooks locally:

1. Install the Stripe CLI: [stripe.com/docs/stripe-cli](https://stripe.com/docs/stripe-cli)
2. Log in to your Stripe account: `stripe login`
3. Forward webhook events to your local server: `stripe listen --forward-to http://localhost/api/payment/webhook`
4. Trigger test webhook events: `stripe trigger payment_intent.succeeded`

## Going Live

Before going live with Stripe, ensure you have:

1. Switched from test to live API keys
2. Set up webhooks in the live environment
3. Updated your privacy policy and terms of service
4. Implemented proper error handling and logging
5. Tested the entire payment flow thoroughly

## Troubleshooting

### Common Issues

- **Payment intent creation fails**: Check your Stripe API key and ensure your account is in good standing
- **Card is declined**: Check the error message from Stripe for specific reasons
- **Webhook verification fails**: Ensure the webhook secret is correct and the request is not modified in transit
- **3D Secure authentication fails**: Ensure the return URL is correct and accessible

### Debugging

- Check the Stripe Dashboard for payment logs and webhook events
- Use the Stripe CLI for local webhook testing
- Enable detailed logging in your application
- Check browser console for JavaScript errors

### Support

If you encounter issues with the Stripe integration, you can:

1. Check the [Stripe documentation](https://stripe.com/docs)
2. Contact Stripe support through the Dashboard
3. Check the GigGatek internal documentation for specific implementation details
