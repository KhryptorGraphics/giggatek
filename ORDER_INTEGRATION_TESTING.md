# GigGatek Order Management Integration Testing Guide

This document provides a systematic approach for testing the integration between the frontend order management components (`orders.js`, `checkout.js`) and the backend order API (`orders/routes.py`).

## Prerequisites

Before beginning integration testing, ensure:

1. Authentication integration has been successfully tested
2. Backend API server is running
3. MySQL database is properly configured with order tables
4. Stripe integration is configured for payment testing
5. Frontend is properly compiled and served

## Order System Components

### Frontend Components

- `frontend/js/cart.js` - Shopping cart management
- `frontend/js/checkout.js` - Checkout process handling
- `frontend/js/orders.js` - Order history and details
- `frontend/checkout.php` - Checkout page UI
- `frontend/components/dashboard/orders.php` - Order management dashboard

### Backend Components

- `backend/orders/routes.py` - Order API endpoints
- `backend/payment/stripe_handler.php` - Payment processing
- `backend/database/orders_schema.sql` - Database schema

## Integration Test Cases

### 1. Shopping Cart to Order Creation Flow

**Test Case: Add Products to Cart and Create Order**

1. **Setup**:
   - Authenticated user
   - Clear cart
   - Ensure product inventory is available
   
2. **Test Steps**:
   - Add multiple products to cart
   - Proceed to checkout
   - Fill shipping/billing details
   - Select payment method
   - Complete order
   
3. **Expected Results**:
   - Cart data is properly passed to checkout
   - Order is successfully created in backend
   - Inventory is updated
   - Order confirmation page displays with correct details
   - Order confirmation email is sent

**Test Case: Cart Persistence**

1. **Test Steps**:
   - Add items to cart
   - Log out
   - Log back in
   
2. **Expected Results**:
   - Cart items are preserved between sessions
   - Cart count is correctly updated in UI

### 2. Checkout Process

**Test Case: Address Validation**

1. **Test Steps**:
   - Submit checkout form with invalid address data
   
2. **Expected Results**:
   - Form validation prevents submission
   - Error messages are displayed appropriately
   - Address validation API is called (if implemented)

**Test Case: Payment Processing**

1. **Test Steps**:
   - Complete checkout with Stripe test card
   - Test different card types (visa, mastercard, etc.)
   - Test declined payment
   
2. **Expected Results**:
   - Stripe Elements UI functions correctly
   - Successful payment creates order
   - Failed payment shows appropriate error
   - Payment intent is created server-side

**Test Case: Order Confirmation**

1. **Test Steps**:
   - Complete successful order
   
2. **Expected Results**:
   - Order number is displayed
   - Order details are correctly shown
   - Confirmation email is received with correct details
   - Order is visible in dashboard

### 3. Order Management Dashboard

**Test Case: Order Listing**

1. **Setup**: Multiple orders for test user
2. **Test Steps**:
   - Navigate to orders dashboard
   - Test pagination (if implemented)
   - Test sorting (if implemented)
   - Test filtering by status
   
3. **Expected Results**:
   - Orders display correctly
   - Order details match database
   - Most recent orders appear first
   - Pagination/sorting/filtering works correctly

**Test Case: Order Details View**

1. **Test Steps**:
   - Select an order from the listing
   - View order details
   
2. **Expected Results**:
   - Order items display correctly
   - Pricing information is accurate
   - Shipping/tracking info is displayed
   - Status is current

**Test Case: Order Cancellation**

1. **Test Steps**:
   - Select an order in 'pending' status
   - Request cancellation
   
2. **Expected Results**:
   - Cancellation confirmation dialog appears
   - API call is made to cancel order
   - Order status changes to 'cancelled'
   - Inventory is updated
   - Cancellation confirmation shows

### 4. API Response Handling

**Test Case: Error Handling**

1. **Test Steps**:
   - Simulate API errors (server down, timeout)
   - Test with invalid order data
   
2. **Expected Results**:
   - Frontend shows appropriate error messages
   - User-friendly error handling
   - Retry options where appropriate
   - Form data is preserved on error

**Test Case: Loading States**

1. **Test Steps**:
   - Observe UI during API calls
   
2. **Expected Results**:
   - Loading indicators are shown
   - UI is not blocked during loading
   - Spinners/progress indicators are visible

## Common Integration Issues

### API Endpoint Mismatches

**Issue**: Frontend and backend URL patterns don't match
**Solution**: Standardize API URL patterns or implement proper routing

Example frontend call:
```javascript
fetch('/api/orders', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${auth.getToken()}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(orderData)
});
```

### Data Format Inconsistencies

**Issue**: Frontend sends data in format backend doesn't expect

**Example**:
Frontend sends:
```javascript
{
  items: [
    { product_id: 1, quantity: 2 }
  ],
  shipping_address_id: 5
}
```

Backend expects:
```javascript
{
  items: [
    { productId: 1, qty: 2 }
  ],
  shippingAddressId: 5
}
```

**Solution**: Standardize on snake_case or camelCase and ensure consistent field names

### Price Calculation Discrepancies

**Issue**: Frontend and backend calculate totals differently
**Solution**: 
- Make backend the source of truth for all price calculations
- Recalculate totals on server side
- Return final totals in API response

### Order Status Synchronization

**Issue**: Order status changes not reflecting in real-time
**Solution**:
- Implement polling for status updates
- Consider WebSockets for real-time updates
- Add "refresh" functionality for manual updates

### CORS and Authentication Issues

**Issue**: API calls fail due to CORS or authentication
**Solution**:
- Ensure CORS headers are properly set
- Verify auth token is included in all requests
- Check token expiration and refresh mechanism

## Integration Testing Code Samples

### Frontend Testing: API Connection

```javascript
// Test order creation
async function testOrderCreation() {
  const orderData = {
    items: [{ product_id: 1, quantity: 2 }],
    shipping_address_id: 1,
    billing_address_id: 1,
    shipping_method: "standard"
  };
  
  try {
    const response = await fetch('/api/orders', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${auth.getToken()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(orderData)
    });
    
    const result = await response.json();
    console.log('Order creation result:', result);
    return result;
  } catch (error) {
    console.error('Order creation failed:', error);
    throw error;
  }
}

// Test get orders
async function testGetOrders() {
  try {
    const response = await fetch('/api/orders', {
      headers: {
        'Authorization': `Bearer ${auth.getToken()}`
      }
    });
    
    const result = await response.json();
    console.log('Orders list:', result);
    return result;
  } catch (error) {
    console.error('Get orders failed:', error);
    throw error;
  }
}
```

### Stripe Integration Testing

```javascript
// Test Stripe payment
async function testStripePayment() {
  // Create payment method using Stripe Elements
  const { paymentMethod, error } = await stripe.createPaymentMethod({
    type: 'card',
    card: cardElement,
    billing_details: {
      name: 'Test User'
    }
  });
  
  if (error) {
    console.error('Stripe error:', error);
    return { success: false, error };
  }
  
  // Create payment intent on server
  try {
    const response = await fetch('/payment/stripe_handler.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${auth.getToken()}`
      },
      body: JSON.stringify({
        action: 'create_payment_intent',
        amount: 2999, // $29.99
        payment_method_id: paymentMethod.id
      })
    });
    
    const result = await response.json();
    console.log('Payment result:', result);
    return result;
  } catch (error) {
    console.error('Payment failed:', error);
    throw error;
  }
}
```

## Integration Test Environment

### Local Testing Environment

```bash
# Terminal 1: Run Backend API
cd backend
python app.py

# Terminal 2: Run Frontend Server
cd frontend
php -S localhost:8000

# Terminal 3: Run Stripe CLI for webhook testing
stripe listen --forward-to localhost:5000/payment/webhook.php
```

### Database Test Seed

Create test data with various order statuses:

```sql
-- Test orders for integration testing
INSERT INTO orders (user_id, total, status, payment_status, shipping_address_id, billing_address_id, shipping_method)
VALUES 
(1, 199.99, 'pending', 'pending', 1, 1, 'standard'),
(1, 299.99, 'processing', 'paid', 1, 1, 'express'),
(1, 99.99, 'shipped', 'paid', 1, 1, 'standard'),
(1, 499.99, 'delivered', 'paid', 1, 1, 'standard'),
(1, 199.99, 'cancelled', 'refunded', 1, 1, 'express');
```

### Test Data Generation

For automated testing, create test data generators:

```javascript
function generateTestOrder(status = 'pending') {
  return {
    items: [
      { product_id: Math.floor(Math.random() * 10) + 1, quantity: Math.floor(Math.random() * 3) + 1 },
      { product_id: Math.floor(Math.random() * 10) + 1, quantity: Math.floor(Math.random() * 3) + 1 }
    ],
    shipping_address_id: 1,
    billing_address_id: 1,
    shipping_method: Math.random() > 0.5 ? 'standard' : 'express',
    status: status
  };
}
```

## Test Execution Checklist

- [ ] Authentication integration tests passed
- [ ] Backend order API is running
- [ ] Database contains test products and addresses
- [ ] Stripe test environment configured
- [ ] Shopping cart functionality verified
- [ ] Checkout process verified with test payment
- [ ] Order listing and details display correctly
- [ ] Order cancellation works properly
- [ ] All API endpoints respond as expected
- [ ] Error handling functions correctly

## Next Steps After Order Integration

Once order management integration is verified, proceed to:

1. Rental System integration testing
2. Email notification integration testing

By following this testing guide, you'll ensure that the order management system functions correctly from end to end, providing a seamless customer experience from cart to checkout to order tracking.
