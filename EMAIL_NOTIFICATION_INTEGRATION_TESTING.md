# GigGatek Email Notification Integration Testing Guide

This document provides a methodical approach for testing the integration of the email notification system with the various functional areas of the GigGatek application (authentication, orders, rentals).

## Prerequisites

Before beginning email notification integration testing, ensure:

1. Authentication, order, and rental integration testing is complete
2. Backend API server is running
3. SMTP server is configured or email service is set up
4. Email templates are implemented in `backend/templates/emails/`
5. Frontend triggers for email notifications are functioning

## Email System Components

### Backend Components

- `backend/utils/email.py` - Core email sending framework
- `backend/templates/emails/*.html` - Email templates

### Templates Currently Implemented

- `backend/templates/emails/welcome.html` - New user registration
- `backend/templates/emails/order_confirmation.html` - Successful order completion
- `backend/templates/emails/rental_payment_reminder.html` - Upcoming rental payment

### Templates To Be Implemented

- Password reset email template
- Account verification email template
- Shipping confirmation email template
- Order status update email template
- Rental contract creation email template
- Rental payment confirmation email template

## Integration Test Cases

### 1. Authentication Email Notifications

**Test Case: Welcome Email**

1. **Setup**:
   - SMTP server monitoring or email capture tool
   
2. **Test Steps**:
   - Register a new user account
   - Verify email receipt
   
3. **Expected Results**:
   - Welcome email is sent immediately after registration
   - Email contains correct user information
   - Email styling matches brand guidelines
   - Links in email function correctly

**Test Case: Password Reset Email**

1. **Test Steps**:
   - Request password reset for existing account
   - Verify email receipt
   
2. **Expected Results**:
   - Password reset email is sent promptly
   - Reset link in email is valid and functions correctly
   - Email contains clear instructions
   - Reset token works as expected

**Test Case: Account Verification Email**

1. **Test Steps**:
   - Register new account with verification required
   - Verify email receipt
   
2. **Expected Results**:
   - Verification email is sent immediately
   - Verification link functions correctly
   - Account is properly verified after link is clicked
   - Redirect after verification works properly

### 2. Order Email Notifications

**Test Case: Order Confirmation Email**

1. **Setup**:
   - Complete the purchase process for a test order
   
2. **Test Steps**:
   - Submit order with test payment
   - Verify email receipt
   
3. **Expected Results**:
   - Order confirmation email is sent immediately
   - Email contains correct order details
   - Product information is accurate
   - Payment information is correctly displayed
   - Order tracking information (if available) is included

**Test Case: Shipping Confirmation Email**

1. **Setup**:
   - Create test order in "processing" status
   
2. **Test Steps**:
   - Update order status to "shipped"
   - Verify email receipt
   
3. **Expected Results**:
   - Shipping confirmation email is sent when status changes
   - Tracking information is included (if available)
   - Shipping details are accurate
   - Estimated delivery information is present

**Test Case: Order Status Update Email**

1. **Setup**:
   - Create test order
   
2. **Test Steps**:
   - Change order status (e.g., from "pending" to "processing")
   - Verify email receipt
   
3. **Expected Results**:
   - Status update email is sent for relevant status changes
   - Email correctly describes the new status
   - Order details are included
   - Next steps (if applicable) are clearly communicated

### 3. Rental Email Notifications

**Test Case: Rental Contract Creation Email**

1. **Setup**:
   - Create a test rental contract
   
2. **Test Steps**:
   - Complete rental application and signing
   - Verify email receipt
   
3. **Expected Results**:
   - Contract confirmation email is sent immediately
   - Email contains correct rental details
   - Payment schedule is included
   - Initial payment receipt is included
   - PDF contract attachment is included (if implemented)

**Test Case: Rental Payment Reminder Email**

1. **Setup**:
   - Active rental with upcoming payment
   
2. **Test Steps**:
   - Simulate the payment reminder schedule (3 days before payment)
   - Verify email receipt
   
3. **Expected Results**:
   - Payment reminder email is sent on schedule
   - Payment amount and due date are correct
   - Payment instructions are clear
   - Quick payment link is included
   - Account information is accurate

**Test Case: Rental Payment Confirmation Email**

1. **Setup**:
   - Active rental with scheduled payment
   
2. **Test Steps**:
   - Process scheduled payment
   - Verify email receipt
   
3. **Expected Results**:
   - Payment confirmation email is sent immediately
   - Payment details are accurate
   - Updated rental status is reflected
   - Next payment information is included
   - Receipt information is complete

### 4. Batch Email Processing

**Test Case: Batch Email Sending**

1. **Setup**:
   - Multiple scheduled notifications pending
   
2. **Test Steps**:
   - Trigger batch email processing
   - Monitor delivery rate and timing
   
3. **Expected Results**:
   - Emails are sent without server performance issues
   - No rate limiting errors from SMTP provider
   - All scheduled emails are sent
   - Email logs correctly reflect sent status

**Test Case: Email Error Handling**

1. **Test Steps**:
   - Configure invalid SMTP settings or email address
   - Attempt to send email
   
2. **Expected Results**:
   - Appropriate error is logged
   - Retry mechanism is activated (if implemented)
   - System does not crash on email failure
   - Failed emails are tracked for manual resolution

## Common Integration Issues

### Email Template Rendering Issues

**Issue**: Variables not properly replaced in templates
**Solution**: 
- Verify template variable syntax
- Ensure all required variables are passed to the template engine
- Test templates with various data combinations

Example email template with variables:
```html
<h2>Welcome, {{ user.first_name }}!</h2>
<p>Thank you for joining GigGatek. Your account has been created with the email: {{ user.email }}</p>
```

### SMTP Configuration Issues

**Issue**: Emails not being sent due to SMTP configuration
**Solution**:
- Verify SMTP server settings
- Check authentication credentials
- Test connection directly to SMTP server
- Consider using a dedicated email service API instead of direct SMTP

### Email Delivery Timing Issues

**Issue**: Emails being sent with delays or at wrong times
**Solution**:
- Implement queue-based email processing
- Add monitoring for email sending process
- Set up retry mechanism for failed emails
- Track email sending metrics

### Email Content and Formatting Issues

**Issue**: Emails displaying incorrectly in various email clients
**Solution**:
- Use table-based layouts for compatibility
- Test emails in multiple clients (Gmail, Outlook, Apple Mail)
- Keep designs responsive but simple
- Provide plain text alternatives

## Integration Testing Code Samples

### Email Sending Function Testing

```python
# Test email sending functionality
def test_email_sending():
    from utils.email import send_email
    
    # Test basic email
    result = send_email(
        to_email="test@example.com",
        subject="Test Email",
        template_name="welcome",
        template_data={
            "user": {
                "first_name": "Test",
                "last_name": "User",
                "email": "test@example.com"
            }
        }
    )
    
    print(f"Email send result: {result}")
    return result
```

### Template Rendering Testing

```python
# Test template rendering
def test_template_rendering():
    from utils.email import render_template
    
    # Test welcome template
    welcome_html = render_template(
        "welcome", 
        {
            "user": {
                "first_name": "Test",
                "last_name": "User",
                "email": "test@example.com"
            }
        }
    )
    
    # Write to file for inspection
    with open("test_welcome_email.html", "w") as f:
        f.write(welcome_html)
    
    print("Template rendered and saved to test_welcome_email.html")
    return welcome_html
```

### Email Trigger Testing

```javascript
// Frontend test for email trigger events
async function testEmailTriggers() {
  // Test order confirmation email trigger
  async function testOrderConfirmationEmail() {
    // Create test order
    const orderData = {
      items: [{ product_id: 1, quantity: 2 }],
      shipping_address_id: 1,
      billing_address_id: 1
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
      console.log('Order created, email should be triggered:', result);
      return result;
    } catch (error) {
      console.error('Order creation failed:', error);
      throw error;
    }
  }
  
  // Run tests
  await testOrderConfirmationEmail();
}
```

## Integration Test Environment

### Local Testing Environment

```bash
# Terminal 1: Run Backend API with email debug mode
cd backend
EMAIL_DEBUG=1 python app.py

# Terminal 2: Run Email Capture Server (e.g., Mailhog or similar)
mailhog

# Terminal 3: Run Frontend Server
cd frontend
php -S localhost:8000
```

### Email Testing Tools

1. **MailHog**: Local SMTP server and web interface for testing emails
   ```bash
   # Install and run MailHog
   docker run -p 1025:1025 -p 8025:8025 mailhog/mailhog
   ```

2. **Email Template Previewer**:
   ```bash
   # Preview email template with test data
   python -m utils.email_preview welcome '{"user": {"first_name": "Test", "last_name": "User"}}'
   ```

### Email Configuration for Testing

```python
# Email config for testing
EMAIL_CONFIG = {
    'smtp_server': 'localhost',
    'smtp_port': 1025,  # MailHog default port
    'smtp_username': None,
    'smtp_password': None,
    'from_email': 'test@giggatek.com',
    'from_name': 'GigGatek Test',
    'debug': True  # Log email content instead of sending in dev
}
```

## Test Execution Checklist

- [ ] Authentication integration tests passed
- [ ] Order management integration tests passed
- [ ] Rental system integration tests passed
- [ ] Email sending framework is functional
- [ ] All required email templates are implemented
- [ ] SMTP server or email service is configured
- [ ] Test email addresses are configured
- [ ] Template rendering is verified
- [ ] Email triggers are connected to appropriate actions
- [ ] Email content and formatting is tested in various clients
- [ ] Batch email processing is tested
- [ ] Error handling is verified

## Troubleshooting Guide

### Email Not Sending

1. Check SMTP server settings
2. Verify network connectivity to SMTP server
3. Check for rate limiting or sending quota issues
4. Review email logs for specific errors
5. Verify sender email is properly configured
6. Ensure template exists and can be rendered

### Email Content Issues

1. Check template variable syntax
2. Verify all required data is passed to template
3. Test template rendering directly
4. Review HTML/CSS compatibility
5. Check for broken links or images
6. Test across multiple email clients

### Email Timing Issues

1. Check async processing setup
2. Review email queue implementation
3. Verify scheduled jobs are running
4. Check server time and timezone settings
5. Monitor email sending performance metrics

## Next Steps After Email Integration

Once email notification integration is verified:

1. Set up monitoring for email delivery rates and failures
2. Implement email analytics tracking
3. Create email preference management for users
4. Set up email bounce and complaint handling
5. Consider implementing message throttling for high-volume scenarios

By thoroughly testing the email notification system, you'll ensure reliable communication with users throughout their customer journey, from registration to orders and throughout the rental lifecycle.
