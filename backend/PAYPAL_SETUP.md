# GigGatek PayPal Payment Integration

This document provides instructions for setting up the PayPal payment integration for the GigGatek ecommerce platform.

## Prerequisites

- PHP 7.4 or higher
- Composer installed on your server
- PayPal Business account with API credentials

## Installation

1. Install the PayPal PHP SDK using Composer:

```bash
cd backend
composer require paypal/rest-api-sdk-php
```

This will install the PayPal PHP SDK as specified in the `composer.json` file.

## Configuration

### Backend Setup

The `paypal_handler.php` file contains the PayPal payment processing logic. It handles:

- Creating PayPal orders
- Capturing payments
- Processing refunds
- Handling webhook events

### API Credentials

You need to set up your PayPal API credentials in the `paypal_handler.php` file:

1. Log in to your PayPal Developer Dashboard at [developer.paypal.com](https://developer.paypal.com/)
2. Navigate to "My Apps & Credentials"
3. Create a new REST API app or select an existing one
4. Copy the Client ID and Secret
5. Update the following variables in `paypal_handler.php`:
   ```php
   $paypal_client_id = 'YOUR_PAYPAL_CLIENT_ID';
   $paypal_secret = 'YOUR_PAYPAL_SECRET';
   $paypal_mode = 'sandbox'; // Change to 'live' for production
   ```

6. Also update the client ID in `frontend/js/paypal-integration.js`:
   ```javascript
   this.clientId = 'YOUR_PAYPAL_CLIENT_ID';
   ```
   
   And in the script loading section:
   ```javascript
   script.src = `https://www.paypal.com/sdk/js?client-id=YOUR_PAYPAL_CLIENT_ID&currency=USD`;
   ```

### Frontend Integration

The frontend integration consists of:

1. `paypal-integration.js` - Handles PayPal button initialization and payment processing
2. Updates to `checkout.js` - Integrates PayPal payment processing into the checkout flow

## Checkout Integration

To integrate PayPal into the checkout process, add the following HTML to your checkout page:

```html
<!-- PayPal Payment Option -->
<div class="payment-method" id="payment-method-paypal">
    <h3>Pay with PayPal</h3>
    <p>You will be redirected to PayPal to complete your payment.</p>
    
    <!-- PayPal Button Container -->
    <div id="paypal-button-container"></div>
    
    <!-- PayPal Error Messages -->
    <div id="paypal-errors" class="payment-errors"></div>
    
    <!-- PayPal Loading Indicator -->
    <div id="paypal-loading" class="loading-indicator">
        <div class="spinner"></div>
        <p>Processing payment...</p>
    </div>
</div>
```

Then, include the PayPal integration script:

```html
<script src="js/paypal-integration.js"></script>
```

## Webhook Setup

To handle asynchronous payment events (like successful payments, refunds, disputes), you should set up PayPal webhooks:

1. Log in to your PayPal Developer Dashboard
2. Navigate to "My Apps & Credentials"
3. Select your app
4. Scroll down to "Webhooks"
5. Click "Add Webhook"
6. Enter your webhook URL: `https://yourdomain.com/backend/payment/paypal_webhook.php`
7. Select the following events:
   - PAYMENT.SALE.COMPLETED
   - PAYMENT.SALE.REFUNDED
   - PAYMENT.SALE.REVERSED
   - CHECKOUT.ORDER.COMPLETED

## Testing

To test the integration:

1. Place items in your cart
2. Proceed to checkout
3. Enter your shipping information
4. On the payment page, select PayPal
5. Click the PayPal button
6. Log in to PayPal with a sandbox account:
   - Buyer account: `sb-buyer@example.com` / password: `test1234`
   - You can create more sandbox accounts in the PayPal Developer Dashboard

## Troubleshooting

### Common Issues

1. **PayPal buttons not appearing**
   - Check browser console for errors
   - Verify that the PayPal SDK is loading correctly
   - Ensure your Client ID is correct

2. **Payment creation fails**
   - Check server logs for errors
   - Verify API credentials
   - Ensure the payment amount is valid

3. **Webhook events not being received**
   - Verify webhook URL is accessible from the internet
   - Check webhook configuration in PayPal Developer Dashboard
   - Ensure webhook events are properly selected

## Security Considerations

1. **API Credentials**
   - Never expose your PayPal Secret in client-side code
   - Store credentials in environment variables, not in code

2. **Payment Verification**
   - Always verify payment status on your server
   - Don't rely solely on client-side confirmation

3. **Webhook Validation**
   - Validate webhook signatures to prevent spoofing
   - Implement idempotency to prevent duplicate processing

## Going Live

When you're ready to go live:

1. Switch from sandbox to live credentials
2. Update the `paypal_mode` variable to `'live'`
3. Update the Client ID to your live Client ID
4. Set up webhooks for your production environment
5. Perform end-to-end testing with real payments (small amounts)

## Support

If you encounter issues with the PayPal integration, refer to:

- [PayPal Developer Documentation](https://developer.paypal.com/docs/api/overview/)
- [PayPal REST API Reference](https://developer.paypal.com/api/rest/)
- [PayPal SDK Documentation](https://github.com/paypal/PayPal-PHP-SDK)
