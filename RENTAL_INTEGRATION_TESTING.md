# GigGatek Rental System Integration Testing Guide

This document provides a detailed testing methodology for ensuring proper integration between the frontend rental components (`rentals.js`, dashboard rental views) and the backend rental API (`rentals/routes.py`).

## Prerequisites

Before beginning rental system integration testing, ensure:

1. Authentication integration testing is complete
2. Order management integration testing is complete 
3. Backend API server is running
4. MySQL database is properly configured with rental tables
5. Stripe integration is configured for recurring payments
6. Frontend is properly compiled and served

## Rental System Components

### Frontend Components

- `frontend/js/rentals.js` - Rental management logic
- `frontend/js/rent-to-own.js` - Rent-to-own flow handling
- `frontend/css/rentals.css` - Rental UI styling
- `frontend/rent-to-own.php` - Rent-to-own option page
- `frontend/components/dashboard/rentals.php` - Rental dashboard component

### Backend Components

- `backend/rentals/routes.py` - Rental API endpoints
- `backend/payment/stripe_handler.php` - Payment processing
- `backend/database/rentals_schema.sql` - Database schema

## Integration Test Cases

### 1. Rental Contract Creation Flow

**Test Case: Create Rental Contract**

1. **Setup**:
   - Authenticated user
   - Product eligible for rent-to-own
   
2. **Test Steps**:
   - Navigate to product detail page
   - Select rent-to-own option
   - Choose rental duration (6, 12, 24 months)
   - Review payment schedule
   - Complete rental application
   - Sign digital contract
   - Process initial payment
   
3. **Expected Results**:
   - Rental calculator shows correct monthly payment
   - Contract details display correctly 
   - Rental contract is created in database
   - Initial payment is processed via Stripe
   - Confirmation page shows rental details
   - Confirmation email is sent

**Test Case: Rental Contract Validation**

1. **Test Steps**:
   - Submit rental application with invalid data
   
2. **Expected Results**:
   - Form validation prevents submission
   - Error messages are displayed appropriately
   - Credit check API is called if implemented

### 2. Rental Contract Management

**Test Case: View Active Rentals**

1. **Setup**: Multiple rental contracts for test user
2. **Test Steps**:
   - Navigate to rentals dashboard
   - View list of active rentals
   
3. **Expected Results**:
   - Active rentals display correctly
   - Payment progress is visualized
   - Next payment date is accurate
   - Rental details match database records

**Test Case: View Rental Details**

1. **Test Steps**:
   - Select a rental from the dashboard
   - View detailed rental information
   
2. **Expected Results**:
   - Contract details are displayed correctly
   - Payment schedule is accurate
   - Progress visualization is correct
   - Product information is displayed

**Test Case: Make Manual Payment**

1. **Test Steps**:
   - Navigate to a specific rental
   - Select "Make Payment" option
   - Process payment using Stripe
   
2. **Expected Results**:
   - Payment amount is correct
   - Stripe Elements UI functions properly
   - Payment is processed successfully
   - Rental payment record is created
   - Payment progress updates
   - Confirmation email is sent

### 3. Rental Contract Special Scenarios

**Test Case: Early Buyout**

1. **Setup**: Active rental contract with payments made
2. **Test Steps**:
   - View rental details
   - Select "Early Buyout" option
   - Review buyout amount
   - Complete payment
   
3. **Expected Results**:
   - Buyout amount is calculated correctly
   - Payment is processed successfully
   - Rental status changes to "completed"
   - Ownership transfer is recorded
   - Confirmation email is sent

**Test Case: Late Payment**

1. **Setup**: 
   - Active rental with payment due
   - Configure test to simulate overdue payment
   
2. **Test Steps**:
   - Verify late payment notice appears
   - Make payment after due date
   
3. **Expected Results**:
   - Late payment notice displays correctly
   - Late fee is applied (if configured)
   - Payment processes successfully
   - Payment status updates correctly

**Test Case: Rental Cancellation**

1. **Test Steps**:
   - Select an active rental
   - Request cancellation
   - Confirm cancellation
   
2. **Expected Results**:
   - Cancellation confirmation dialog appears
   - Cancellation terms are displayed
   - API call is made to cancel rental
   - Rental status changes to "cancelled"
   - Return instructions are displayed
   - Cancellation confirmation email is sent

### 4. Payment Scheduling and Processing

**Test Case: Scheduled Payments**

1. **Setup**: Active rental with upcoming payment
2. **Test Steps**:
   - Simulate automatic payment processing
   
3. **Expected Results**:
   - Scheduled payment is processed on due date
   - Payment record is created
   - Rental progress is updated
   - Payment confirmation email is sent

**Test Case: Failed Automatic Payment**

1. **Setup**: Active rental with payment method that will fail
2. **Test Steps**:
   - Simulate failed automatic payment
   - Update payment method
   - Retry payment
   
3. **Expected Results**:
   - Failed payment is recorded
   - Notification is shown in dashboard
   - Payment retry options are available
   - Updated payment method works correctly

### 5. API Response Handling

**Test Case: API Error Handling**

1. **Test Steps**:
   - Simulate various API errors
   - Test with invalid rental data
   
2. **Expected Results**:
   - Frontend shows appropriate error messages
   - User-friendly error handling
   - Form data is preserved on error

**Test Case: Loading States**

1. **Test Steps**:
   - Observe UI during API calls
   
2. **Expected Results**:
   - Loading indicators are shown
   - UI is not blocked during loading
   - Spinners/progress indicators are visible

## Common Integration Issues

### Payment Schedule Calculation

**Issue**: Frontend and backend calculate payment schedules differently
**Solution**: 
- Make backend the source of truth for all calculations
- Return full payment schedule from API
- Display server-calculated values in frontend

Example API response:
```javascript
{
  "rental": {
    "id": 123,
    "product_id": 456,
    "monthly_rate": 49.99,
    "total_months": 12,
    "payments_made": 3,
    "next_payment_date": "2025-05-15",
    "payment_schedule": [
      {
        "payment_number": 1,
        "due_date": "2025-02-15",
        "amount": 49.99,
        "status": "paid"
      },
      {
        "payment_number": 2,
        "due_date": "2025-03-15",
        "amount": 49.99,
        "status": "paid"
      },
      // More payments...
    ]
  }
}
```

### Progress Visualization Inconsistencies

**Issue**: Progress bars/visualizations don't match actual payment progress
**Solution**:
- Calculate visualization values on server
- Return progress percentage with rental data
- Use consistent rounding/calculation methods

```javascript
// Example calculation in frontend
function calculateProgress(rental) {
  // Should match backend calculation exactly
  return Math.round((rental.payments_made / rental.total_months) * 100);
}
```

### Recurring Payment Handling

**Issue**: Recurring payments not being properly tracked or displayed
**Solution**:
- Set up Stripe webhook handling for recurring payment events
- Implement robust payment status tracking
- Add payment retry mechanisms

### Contract Signing Integration

**Issue**: Contract signing not properly connected to backend
**Solution**:
- Implement proper signature capture and validation
- Store signature data securely
- Verify signature status before processing payments

## Integration Testing Code Samples

### Frontend Testing: Rental Creation

```javascript
// Test rental contract creation
async function testRentalCreation() {
  const rentalData = {
    product_id: 123,
    total_months: 12,
    address_id: 1
  };
  
  try {
    const response = await fetch('/api/rentals', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${auth.getToken()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(rentalData)
    });
    
    const result = await response.json();
    console.log('Rental creation result:', result);
    return result;
  } catch (error) {
    console.error('Rental creation failed:', error);
    throw error;
  }
}
```

### Contract Signing Testing

```javascript
// Test contract signing
async function testContractSigning(rentalId, signatureData) {
  try {
    const response = await fetch(`/api/rentals/${rentalId}/sign-contract`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${auth.getToken()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ signature: signatureData })
    });
    
    const result = await response.json();
    console.log('Contract signing result:', result);
    return result;
  } catch (error) {
    console.error('Contract signing failed:', error);
    throw error;
  }
}
```

### Payment Testing

```javascript
// Test rental payment
async function testRentalPayment(rentalId) {
  // Create payment method with Stripe
  const { paymentMethod, error } = await stripe.createPaymentMethod({
    type: 'card',
    card: cardElement,
    billing_details: { name: 'Test User' }
  });
  
  if (error) {
    console.error('Stripe error:', error);
    return { success: false, error };
  }
  
  // Process payment through API
  try {
    const response = await fetch(`/api/rentals/${rentalId}/make-payment`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${auth.getToken()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        payment_method: 'stripe',
        transaction_id: paymentMethod.id
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

Create test data with various rental statuses:

```sql
-- Test rentals for integration testing
INSERT INTO rentals (user_id, product_id, start_date, end_date, monthly_rate, total_months, total_amount, status, payments_made, remaining_payments, next_payment_date, address_id)
VALUES 
(1, 101, '2025-01-01', '2026-01-01', 49.99, 12, 599.88, 'active', 3, 9, '2025-04-01', 1),
(1, 102, '2025-02-01', '2026-02-01', 39.99, 12, 479.88, 'active', 2, 10, '2025-04-01', 1),
(1, 103, '2024-06-01', '2025-06-01', 29.99, 12, 359.88, 'active', 10, 2, '2025-04-01', 1),
(1, 104, '2024-12-01', '2025-12-01', 59.99, 12, 719.88, 'cancelled', 3, 9, NULL, 1),
(1, 105, '2024-03-01', '2025-03-01', 49.99, 12, 599.88, 'completed', 12, 0, NULL, 1);
```

### Test Data Generation

For automated testing, create test data generators:

```javascript
function generateTestRental(status = 'active') {
  const startDate = new Date();
  const endDate = new Date();
  endDate.setFullYear(endDate.getFullYear() + 1);
  
  const monthlyRate = Math.floor(Math.random() * 5 + 3) * 9.99;
  const totalMonths = 12;
  
  return {
    product_id: Math.floor(Math.random() * 10) + 101,
    total_months: totalMonths,
    monthly_rate: monthlyRate,
    total_amount: monthlyRate * totalMonths,
    start_date: startDate.toISOString().split('T')[0],
    end_date: endDate.toISOString().split('T')[0],
    status: status,
    address_id: 1
  };
}
```

## Test Execution Checklist

- [ ] Authentication integration tests passed
- [ ] Order management integration tests passed
- [ ] Backend rental API is running
- [ ] Database contains test products suitable for rental
- [ ] Stripe recurring payment setup configured
- [ ] Rental calculator functionality verified
- [ ] Contract creation and signing flow tested
- [ ] Payment processing verified for initial and recurring payments
- [ ] Early buyout calculation and processing tested
- [ ] Cancellation flow verified
- [ ] All API endpoints respond as expected
- [ ] Error handling functions correctly
- [ ] Email notifications for rental events tested

## Next Steps After Rental Integration

Once rental system integration is verified, proceed to:

1. Email notification integration testing
2. Full end-to-end system testing
3. Performance and load testing

By thoroughly testing the rental system integration, you'll ensure that GigGatek's unique rent-to-own business model is implemented correctly and provides a seamless experience for customers from rental contract creation through the entire rental lifecycle.
