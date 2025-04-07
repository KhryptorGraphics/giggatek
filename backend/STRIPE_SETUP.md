# GigGatek Stripe Payment Integration

This document provides instructions for setting up the Stripe payment integration for the GigGatek ecommerce platform.

## Prerequisites

- PHP 7.4 or higher
- Composer installed on your server
- Stripe account with API keys

## Installation

1. Install the Stripe PHP library using Composer:

```bash
cd backend
composer install
```

This will install the Stripe PHP SDK as specified in the `composer.json` file.

## Configuration

### Backend Setup

The `stripe_handler.php` file already contains the Stripe payment processing logic. It handles:

- Creating payment intents
- Confirming payments
- Processing refunds
- Handling webhook events

### API Keys

The production Stripe secret key is already configured in the `stripe_handler.php` file:

```php
$stripeSecretKey = 'sk_live_YOUR_STRIPE_SECRET_KEY';
```

The frontend JavaScript uses a test publishable key in `stripe-integration.js`:

```javascript
this.stripe = Stripe('pk_test_51R2G3HAm1cm6I95vMj6zgoiPafIBlLBZtGpuVbp6w9nR8qFtlAQJYNIixRrZOESpd3GIrJWqUmJK3pCSZXdO4vxp00OjQCi64j');
```

**IMPORTANT**: For production, you should:
1. Replace the test publishable key with your live publishable key
2. Consider storing the secret key in environment variables rather than directly in code
3. Enable webhook signatures for added security

## Frontend Integration

The frontend Stripe integration consists of:

1. `stripe-integration.js` - Handles Stripe Elements initialization and payment processing
2. `stripe-elements.css` - Styles the Stripe Elements to match GigGatek's design
3. Updates to `checkout.js` - Integrates Stripe payment processing into the checkout flow

## Testing

To test the integration:

1. Place items in your cart
2. Proceed to checkout
3. Enter your shipping information
4. On the payment page, use Stripe test card numbers:
   - 4242 4242 4242 4242 (Visa) - Successful payment
   - 4000 0000 0000 0002 (Visa) - Declined payment
   - 4000 0025 0000 3155 (Visa) - 3D Secure authentication required

## Webhooks

For a complete integration, you should set up Stripe webhooks to handle:

- Payment events (successful, failed)
- Refund events
- Dispute events

To set up webhooks:

1. Go to the Stripe Dashboard -> Developers -> Webhooks
2. Add an endpoint URL: `https://yourdomain.com/backend/payment/webhook.php`
3. Subscribe to the following events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.refunded`

## Security Considerations

1. Always use HTTPS for all payment-related traffic
2. Keep your Stripe secret key secure
3. Validate all user inputs
4. Implement proper error handling
5. Consider implementing Stripe Radar for fraud detection

## Support

For issues with this integration:
- Check the Stripe documentation: https://stripe.com/docs
- Contact GigGatek development team
