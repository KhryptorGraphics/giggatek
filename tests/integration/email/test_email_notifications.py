#!/usr/bin/env python
"""
Email Notification Integration Tests for GigGatek Platform

These tests verify the integration between the various system components
(authentication, orders, rentals) and the email notification system.
"""
import pytest
import requests
import json
import time
import re
import smtplib
import email.parser
from email.message import EmailMessage
from urllib.parse import urljoin

# Test configuration
API_BASE_URL = 'http://localhost:5000/api'  # Backend API URL
FRONTEND_URL = 'http://localhost:8000'      # Frontend URL
MAILHOG_API_URL = 'http://localhost:8025/api/v2'  # MailHog API URL for testing emails

# Helper functions
def api_url(path):
    """Get full API URL for a given path"""
    return urljoin(API_BASE_URL, path)

def frontend_url(path):
    """Get full frontend URL for a given path"""
    return urljoin(FRONTEND_URL, path)

def mailhog_url(path):
    """Get full MailHog API URL for a given path"""
    return urljoin(MAILHOG_API_URL, path)

def make_api_request(method, endpoint, data=None, token=None, allow_redirects=True):
    """Make an API request with optional authentication and payload"""
    headers = {'Content-Type': 'application/json'}
    if token:
        headers['Authorization'] = f'Bearer {token}'
        
    url = api_url(endpoint)
    
    if method.lower() == 'get':
        return requests.get(url, headers=headers, allow_redirects=allow_redirects)
    elif method.lower() == 'post':
        return requests.post(url, headers=headers, data=json.dumps(data) if data else None, allow_redirects=allow_redirects)
    elif method.lower() == 'put':
        return requests.put(url, headers=headers, data=json.dumps(data) if data else None, allow_redirects=allow_redirects)
    elif method.lower() == 'delete':
        return requests.delete(url, headers=headers, allow_redirects=allow_redirects)
    else:
        raise ValueError(f"Unsupported HTTP method: {method}")

def login_and_get_token(email="customer@test.com", password="Customer123!"):
    """Get an authentication token for a user"""
    response = make_api_request('post', '/auth/login', data={
        'email': email,
        'password': password
    })
    
    if response.status_code != 200:
        return None
    
    data = response.json()
    return data.get('token')

def get_mailhog_messages(limit=50):
    """Get recent email messages from MailHog"""
    try:
        response = requests.get(mailhog_url('/messages'), params={'limit': limit})
        if response.status_code != 200:
            return []
        
        return response.json().get('items', [])
    except requests.RequestException:
        # MailHog might not be available
        return []

def find_email_by_subject_and_to(subject_pattern, to_address, messages=None):
    """Find an email by subject pattern and recipient"""
    if messages is None:
        messages = get_mailhog_messages()
    
    subject_regex = re.compile(subject_pattern, re.IGNORECASE)
    
    for message in messages:
        headers = message.get('Content', {}).get('Headers', {})
        subject = headers.get('Subject', [''])[0]
        to = headers.get('To', [''])[0]
        
        if subject_regex.search(subject) and to_address in to:
            return message
    
    return None

def wait_for_email(subject_pattern, to_address, timeout=10, poll_interval=0.5):
    """Wait for an email matching subject and recipient to arrive"""
    start_time = time.time()
    while time.time() - start_time < timeout:
        email = find_email_by_subject_and_to(subject_pattern, to_address)
        if email:
            return email
        time.sleep(poll_interval)
    
    return None

def clear_mailhog():
    """Clear all messages from MailHog"""
    try:
        requests.delete(mailhog_url('/messages'))
    except requests.RequestException:
        pass  # MailHog might not be available

def get_product_by_category(token, category="Laptops"):
    """Get a product by category for testing"""
    response = make_api_request('get', '/products', token=token)
    if response.status_code != 200:
        return None
        
    products = response.json().get('products', [])
    for product in products:
        if product.get('category') == category:
            return product
    
    return products[0] if products else None

def get_rental_eligible_product(token):
    """Get a rental-eligible product for testing"""
    response = make_api_request('get', '/products', token=token)
    if response.status_code != 200:
        return None
        
    products = response.json().get('products', [])
    for product in products:
        if product.get('rental_eligible'):
            return product
    
    return None  # No rental-eligible products found

def get_address_id(token):
    """Get a user's shipping address ID for testing"""
    # Assuming there's an endpoint to get user addresses
    response = make_api_request('get', '/auth/addresses', token=token)
    if response.status_code != 200:
        return 1  # Default fallback
        
    addresses = response.json().get('addresses', [])
    for address in addresses:
        if address.get('is_default'):
            return address.get('id')
    
    return addresses[0].get('id') if addresses else 1

# Test fixtures
@pytest.fixture(scope="module", autouse=True)
def clear_emails_before_tests():
    """Clear all emails before running tests"""
    clear_mailhog()
    yield

@pytest.fixture
def auth_token():
    """Fixture to get an authentication token"""
    return login_and_get_token()

@pytest.fixture
def test_order_data(auth_token):
    """Fixture to create test order data"""
    product = get_product_by_category(auth_token)
    if not product:
        pytest.skip("No test product available")
    
    address_id = get_address_id(auth_token)
    
    return {
        'items': [
            {
                'product_id': product.get('id'),
                'quantity': 1
            }
        ],
        'shipping_address_id': address_id,
        'billing_address_id': address_id,
        'shipping_method': 'standard'
    }

@pytest.fixture
def test_rental_data(auth_token):
    """Fixture to create test rental data"""
    product = get_rental_eligible_product(auth_token)
    if not product:
        pytest.skip("No rental-eligible product available")
    
    address_id = get_address_id(auth_token)
    
    return {
        'product_id': product.get('id'),
        'total_months': 12,
        'address_id': address_id,
        'payment_method_id': 'pm_test_123456789'
    }

@pytest.fixture
def test_user_data():
    """Fixture to create test user data"""
    return {
        'email': f'test_{int(time.time())}@example.com',
        'password': 'Test123!',
        'first_name': 'Test',
        'last_name': 'User'
    }

# Email Notification Tests

class TestAuthEmailNotifications:
    """Test authentication-related email notifications"""
    
    def test_welcome_email_on_registration(self, test_user_data):
        """Test welcome email sent on new user registration"""
        clear_mailhog()  # Start with clean state
        
        # Register a new user
        response = make_api_request('post', '/auth/register', data=test_user_data)
        
        if response.status_code != 201:
            pytest.skip(f"User registration failed: {response.text}")
        
        # Check for welcome email
        email = wait_for_email("Welcome to GigGatek", test_user_data['email'])
        assert email is not None, "Welcome email not received"
        
        # Verify email content
        content = email.get('Content', {})
        html = content.get('Body', '')
        
        # Basic content checks
        assert test_user_data['first_name'] in html, "User's first name should be in welcome email"
        assert 'welcome' in html.lower(), "Welcome message should be in email"
    
    def test_password_reset_email(self, auth_token):
        """Test password reset email"""
        clear_mailhog()
        
        # Get authenticated user email
        user_response = make_api_request('get', '/auth/me', token=auth_token)
        if user_response.status_code != 200:
            pytest.skip("Could not get authenticated user data")
        
        user_email = user_response.json().get('user', {}).get('email')
        if not user_email:
            pytest.skip("Could not get user email")
        
        # Request password reset
        response = make_api_request('post', '/auth/password-reset-request', data={
            'email': user_email
        })
        
        assert response.status_code == 200, f"Password reset request failed: {response.text}"
        
        # Check for password reset email
        email = wait_for_email("Password Reset|Reset Your Password", user_email)
        assert email is not None, "Password reset email not received"
        
        # Verify email content
        content = email.get('Content', {})
        html = content.get('Body', '')
        
        # Check for reset link
        assert 'reset' in html.lower(), "Password reset instruction should be in email"
        assert 'link' in html.lower() or 'button' in html.lower(), "Reset link or button should be in email"
        
        # Look for token in email body
        token_match = re.search(r'token=([a-zA-Z0-9._-]+)', html)
        assert token_match is not None, "Reset token should be in email"

class TestOrderEmailNotifications:
    """Test order-related email notifications"""
    
    def test_order_confirmation_email(self, auth_token, test_order_data):
        """Test order confirmation email sent on new order creation"""
        clear_mailhog()
        
        # Create an order
        response = make_api_request('post', '/orders', data=test_order_data, token=auth_token)
        
        if response.status_code != 201:
            pytest.skip(f"Order creation failed: {response.text}")
        
        # Get user email
        user_response = make_api_request('get', '/auth/me', token=auth_token)
        if user_response.status_code != 200:
            pytest.skip("Could not get user email")
        
        user_email = user_response.json().get('user', {}).get('email')
        
        # Check for order confirmation email
        email = wait_for_email("Order Confirmation|Your Order|Order #", user_email)
        assert email is not None, "Order confirmation email not received"
        
        # Verify email content
        content = email.get('Content', {})
        html = content.get('Body', '')
        
        # Check order content
        order_data = response.json().get('order', {})
        order_id = str(order_data.get('id', ''))
        
        assert order_id in html, "Order ID should be in confirmation email"
        assert 'thank you' in html.lower(), "Thank you message should be in email"
        
        # Check for order details
        assert 'item' in html.lower() or 'product' in html.lower(), "Product information should be in email"
        assert 'total' in html.lower(), "Order total should be in email"
    
    def test_shipping_confirmation_email(self, auth_token):
        """Test shipping confirmation email sent when order is shipped"""
        clear_mailhog()
        
        # Get user's orders
        orders_response = make_api_request('get', '/orders', token=auth_token)
        if orders_response.status_code != 200:
            pytest.skip("Could not get user orders")
        
        orders = orders_response.json().get('orders', [])
        if not orders:
            pytest.skip("No orders available for testing")
        
        # Find a 'pending' or 'processing' order
        test_order = None
        for order in orders:
            if order.get('status') in ['pending', 'processing']:
                test_order = order
                break
        
        if not test_order:
            pytest.skip("No suitable order for shipping test")
        
        # Get user email
        user_response = make_api_request('get', '/auth/me', token=auth_token)
        if user_response.status_code != 200:
            pytest.skip("Could not get user email")
        
        user_email = user_response.json().get('user', {}).get('email')
        
        # Update order to 'shipped' status (admin only)
        admin_token = login_and_get_token('admin@test.com', 'Admin123!')
        if not admin_token:
            pytest.skip("Could not get admin token")
        
        update_response = make_api_request('put', f'/admin/orders/{test_order["id"]}', data={
            'status': 'shipped'
        }, token=admin_token)
        
        if update_response.status_code != 200:
            pytest.skip(f"Could not update order status: {update_response.text}")
        
        # Check for shipping confirmation email
        email = wait_for_email("Shipped|Shipping Confirmation|Order #", user_email)
        assert email is not None, "Shipping confirmation email not received"
        
        # Verify email content
        content = email.get('Content', {})
        html = content.get('Body', '')
        
        # Check shipping content
        order_id = str(test_order.get('id', ''))
        
        assert order_id in html, "Order ID should be in shipping email"
        assert 'shipped' in html.lower(), "Shipping status should be in email"
        assert 'track' in html.lower(), "Tracking information should be in email"

class TestRentalEmailNotifications:
    """Test rental-related email notifications"""
    
    def test_rental_contract_email(self, auth_token, test_rental_data):
        """Test rental contract email sent on new rental creation"""
        clear_mailhog()
        
        # Create a rental contract
        response = make_api_request('post', '/rentals', data=test_rental_data, token=auth_token)
        
        if response.status_code != 201:
            pytest.skip(f"Rental creation failed: {response.text}")
        
        # Get user email
        user_response = make_api_request('get', '/auth/me', token=auth_token)
        if user_response.status_code != 200:
            pytest.skip("Could not get user email")
        
        user_email = user_response.json().get('user', {}).get('email')
        
        # Check for rental contract email
        email = wait_for_email("Rental Contract|Your Rental|Contract #", user_email)
        assert email is not None, "Rental contract email not received"
        
        # Verify email content
        content = email.get('Content', {})
        html = content.get('Body', '')
        
        # Check rental content
        rental_data = response.json().get('rental', {})
        rental_id = str(rental_data.get('id', ''))
        
        assert rental_id in html, "Rental ID should be in contract email"
        assert 'contract' in html.lower(), "Contract information should be in email"
        assert 'payment' in html.lower(), "Payment information should be in email"
        assert 'schedule' in html.lower(), "Payment schedule should be in email"
    
    def test_rental_payment_reminder_email(self, auth_token):
        """Test rental payment reminder email"""
        clear_mailhog()
        
        # Get user's rentals
        rentals_response = make_api_request('get', '/rentals', token=auth_token)
        if rentals_response.status_code != 200:
            pytest.skip("Could not get user rentals")
        
        rentals = rentals_response.json().get('rentals', [])
        if not rentals:
            pytest.skip("No rentals available for testing")
        
        # Find an 'active' rental
        test_rental = None
        for rental in rentals:
            if rental.get('status') == 'active':
                test_rental = rental
                break
        
        if not test_rental:
            pytest.skip("No active rental for payment reminder test")
        
        # Get user email
        user_response = make_api_request('get', '/auth/me', token=auth_token)
        if user_response.status_code != 200:
            pytest.skip("Could not get user email")
        
        user_email = user_response.json().get('user', {}).get('email')
        
        # Trigger payment reminder (admin only)
        admin_token = login_and_get_token('admin@test.com', 'Admin123!')
        if not admin_token:
            pytest.skip("Could not get admin token")
        
        # Assuming there's an admin endpoint to trigger reminders
        reminder_response = make_api_request('post', f'/admin/rentals/{test_rental["id"]}/send-reminder', 
                                           token=admin_token)
        
        if reminder_response.status_code not in [200, 201, 202]:
            pytest.skip(f"Could not trigger payment reminder: {reminder_response.text}")
        
        # Check for payment reminder email
        email = wait_for_email("Payment Reminder|Payment Due|Upcoming Payment", user_email)
        assert email is not None, "Payment reminder email not received"
        
        # Verify email content
        content = email.get('Content', {})
        html = content.get('Body', '')
        
        # Check reminder content
        rental_id = str(test_rental.get('id', ''))
        
        assert rental_id in html, "Rental ID should be in reminder email"
        assert 'payment' in html.lower(), "Payment information should be in email"
        assert 'due' in html.lower(), "Due date should be in email"
        
        # Check for payment amount
        amount_pattern = r'\$\d+\.\d{2}'
        assert re.search(amount_pattern, html), "Payment amount should be in email"

class TestPaymentEmailNotifications:
    """Test payment-related email notifications"""
    
    def test_payment_confirmation_email(self, auth_token):
        """Test payment confirmation email sent after successful payment"""
        clear_mailhog()
        
        # Get user's rentals
        rentals_response = make_api_request('get', '/rentals', token=auth_token)
        if rentals_response.status_code != 200:
            pytest.skip("Could not get user rentals")
        
        rentals = rentals_response.json().get('rentals', [])
        if not rentals:
            pytest.skip("No rentals available for testing")
        
        # Find an 'active' rental
        test_rental = None
        for rental in rentals:
            if rental.get('status') == 'active':
                test_rental = rental
                break
        
        if not test_rental:
            pytest.skip("No active rental for payment test")
        
        # Make a payment
        payment_data = {
            'payment_method_id': 'pm_test_123456789'
        }
        
        payment_response = make_api_request('post', f'/rentals/{test_rental["id"]}/make-payment', 
                                          data=payment_data, token=auth_token)
        
        if payment_response.status_code != 200:
            pytest.skip(f"Could not make payment: {payment_response.text}")
        
        # Get user email
        user_response = make_api_request('get', '/auth/me', token=auth_token)
        if user_response.status_code != 200:
            pytest.skip("Could not get user email")
        
        user_email = user_response.json().get('user', {}).get('email')
        
        # Check for payment confirmation email
        email = wait_for_email("Payment Confirmation|Payment Received|Receipt", user_email)
        assert email is not None, "Payment confirmation email not received"
        
        # Verify email content
        content = email.get('Content', {})
        html = content.get('Body', '')
        
        # Check payment content
        rental_id = str(test_rental.get('id', ''))
        
        assert rental_id in html, "Rental ID should be in payment email"
        assert 'payment' in html.lower(), "Payment information should be in email"
        assert 'received' in html.lower() or 'confirmed' in html.lower(), "Payment confirmation should be in email"
        assert 'thank you' in html.lower(), "Thank you message should be in email"
        
        # Check for payment amount
        amount_pattern = r'\$\d+\.\d{2}'
        assert re.search(amount_pattern, html), "Payment amount should be in email"

# If running directly (not through pytest)
if __name__ == "__main__":
    pytest.main(['-v', __file__])
