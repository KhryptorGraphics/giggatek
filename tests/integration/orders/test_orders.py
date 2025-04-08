#!/usr/bin/env python
"""
Order Management Integration Tests for GigGatek Platform

These tests verify the integration between the frontend order management components 
and the backend order API.
"""
import pytest
import requests
import json
import time
from urllib.parse import urljoin

# Test configuration
API_BASE_URL = 'http://localhost:5000/api'  # Backend API URL
FRONTEND_URL = 'http://localhost:8000'      # Frontend URL

# Helper functions
def api_url(path):
    """Get full API URL for a given path"""
    return urljoin(API_BASE_URL, path)

def frontend_url(path):
    """Get full frontend URL for a given path"""
    return urljoin(FRONTEND_URL, path)

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
@pytest.fixture
def auth_token():
    """Fixture to get an authentication token"""
    return login_and_get_token()

@pytest.fixture
def test_product(auth_token):
    """Fixture to get a test product"""
    return get_product_by_category(auth_token)

@pytest.fixture
def test_address_id(auth_token):
    """Fixture to get a test address ID"""
    return get_address_id(auth_token)

@pytest.fixture
def test_order_data(auth_token, test_product, test_address_id):
    """Fixture to create test order data"""
    if not test_product:
        pytest.skip("No test product available")
    
    return {
        'items': [
            {
                'product_id': test_product.get('id'),
                'quantity': 1
            }
        ],
        'shipping_address_id': test_address_id,
        'billing_address_id': test_address_id,
        'shipping_method': 'standard'
    }

@pytest.fixture
def created_order(auth_token, test_order_data):
    """Fixture to create a test order and clean it up after tests"""
    response = make_api_request('post', '/orders', data=test_order_data, token=auth_token)
    
    if response.status_code != 201:
        pytest.skip(f"Failed to create test order: {response.text}")
    
    order = response.json().get('order')
    yield order
    
    # No cleanup needed as we're using a test database

# Order Management Tests

class TestOrderCreation:
    """Test order creation functionality"""
    
    def test_create_order(self, auth_token, test_order_data):
        """Test creating a new order"""
        response = make_api_request('post', '/orders', data=test_order_data, token=auth_token)
        
        # Assert successful order creation
        assert response.status_code == 201, f"Order creation failed with status {response.status_code}: {response.text}"
        data = response.json()
        
        # Check expected response structure
        assert 'order' in data, "Order data not found in response"
        order = data['order']
        assert 'id' in order, "Order ID not found in response"
        assert 'items' in order, "Order items not found in response"
        assert len(order['items']) == len(test_order_data['items']), "Order items count mismatch"
        
        # Check order status and payment status
        assert order['status'] == 'pending', f"Expected 'pending' status, got {order['status']}"
        assert order['payment_status'] == 'pending', f"Expected 'pending' payment status, got {order['payment_status']}"
    
    def test_create_order_requires_auth(self, test_order_data):
        """Test that creating an order requires authentication"""
        response = make_api_request('post', '/orders', data=test_order_data)
        
        # Assert unauthorized without token
        assert response.status_code == 401, f"Expected 401 Unauthorized without token, got {response.status_code}"
    
    def test_create_order_validates_data(self, auth_token):
        """Test order creation data validation"""
        # Test missing items
        response1 = make_api_request('post', '/orders', data={
            'shipping_address_id': 1,
            'billing_address_id': 1,
            'shipping_method': 'standard'
        }, token=auth_token)
        
        # Test invalid product ID
        response2 = make_api_request('post', '/orders', data={
            'items': [
                {
                    'product_id': 9999999,  # Non-existent product ID
                    'quantity': 1
                }
            ],
            'shipping_address_id': 1,
            'billing_address_id': 1,
            'shipping_method': 'standard'
        }, token=auth_token)
        
        # Assert validation errors
        assert response1.status_code == 400, f"Expected 400 Bad Request for missing items, got {response1.status_code}"
        assert response2.status_code in [400, 404], f"Expected 400/404 for invalid product, got {response2.status_code}"

class TestOrderRetrieval:
    """Test order retrieval functionality"""
    
    def test_get_orders(self, auth_token):
        """Test retrieving user's orders"""
        response = make_api_request('get', '/orders', token=auth_token)
        
        # Assert successful retrieval
        assert response.status_code == 200, f"Get orders failed with status {response.status_code}: {response.text}"
        data = response.json()
        
        # Check expected response structure
        assert 'orders' in data, "Orders data not found in response"
        assert isinstance(data['orders'], list), "Orders should be a list"
    
    def test_get_specific_order(self, auth_token, created_order):
        """Test retrieving a specific order by ID"""
        response = make_api_request('get', f'/orders/{created_order["id"]}', token=auth_token)
        
        # Assert successful retrieval
        assert response.status_code == 200, f"Get order failed with status {response.status_code}: {response.text}"
        data = response.json()
        
        # Check expected response structure
        assert 'order' in data, "Order data not found in response"
        assert data['order']['id'] == created_order['id'], "Returned order ID doesn't match requested ID"
    
    def test_get_orders_requires_auth(self):
        """Test that retrieving orders requires authentication"""
        response1 = make_api_request('get', '/orders')
        response2 = make_api_request('get', '/orders/1')
        
        # Assert unauthorized without token
        assert response1.status_code == 401, f"Expected 401 Unauthorized without token, got {response1.status_code}"
        assert response2.status_code == 401, f"Expected 401 Unauthorized without token, got {response2.status_code}"

class TestOrderUpdates:
    """Test order update functionality"""
    
    def test_cancel_order(self, auth_token, created_order):
        """Test cancelling an order"""
        response = make_api_request('post', f'/orders/{created_order["id"]}/cancel', token=auth_token)
        
        # Assert successful cancellation
        assert response.status_code == 200, f"Cancel order failed with status {response.status_code}: {response.text}"
        data = response.json()
        
        # Check expected response structure
        assert 'order' in data, "Order data not found in response"
        assert data['order']['status'] == 'cancelled', f"Expected 'cancelled' status, got {data['order']['status']}"
    
    def test_cannot_cancel_processed_order(self, auth_token, created_order):
        """Test that processed orders cannot be cancelled"""
        # First update the order to 'processing' status (admin would normally do this)
        # This assumes there's an admin endpoint to update order status
        admin_token = login_and_get_token('admin@test.com', 'Admin123!')
        if not admin_token:
            pytest.skip("Could not get admin token for test")
        
        update_response = make_api_request('put', f'/admin/orders/{created_order["id"]}', data={
            'status': 'processing',
            'payment_status': 'paid'
        }, token=admin_token)
        
        if update_response.status_code != 200:
            pytest.skip(f"Could not update order status for test: {update_response.text}")
        
        # Now try to cancel the processed order
        response = make_api_request('post', f'/orders/{created_order["id"]}/cancel', token=auth_token)
        
        # Assert cancellation is rejected
        assert response.status_code in [400, 403, 409], f"Expected error status for cancelling processed order, got {response.status_code}"
        data = response.json()
        assert 'error' in data, "Error message not found in response"

class TestOrderFiltering:
    """Test order filtering functionality"""
    
    def test_filter_orders_by_status(self, auth_token):
        """Test filtering orders by status"""
        # Create orders with different statuses first
        # We already have fixtures for this in the test database
        
        # Filter by 'pending' status
        response = make_api_request('get', '/orders?status=pending', token=auth_token)
        
        # Assert successful filtering
        assert response.status_code == 200, f"Filter orders failed with status {response.status_code}: {response.text}"
        data = response.json()
        
        # Check that all returned orders have 'pending' status
        for order in data.get('orders', []):
            assert order['status'] == 'pending', f"Expected only 'pending' orders, got {order['status']}"

class TestPaymentIntegration:
    """Test payment integration with orders"""
    
    def test_create_payment_intent(self, auth_token, created_order):
        """Test creating a payment intent for an order"""
        # This test assumes there's a Stripe payment endpoint
        payment_data = {
            'order_id': created_order['id']
        }
        
        response = make_api_request('post', '/payment/create-intent', data=payment_data, token=auth_token)
        
        # We can skip this test if the payment endpoint is not available
        if response.status_code == 404:
            pytest.skip("Payment intent endpoint not available")
        
        # Assert successful payment intent creation
        assert response.status_code == 200, f"Create payment intent failed with status {response.status_code}: {response.text}"
        data = response.json()
        
        # Check expected response structure
        assert 'client_secret' in data, "Client secret not found in response"
    
    def test_order_status_after_payment(self, auth_token, created_order):
        """Test order status updates after payment"""
        # This test would typically use a webhook to simulate payment completion
        # For testing purposes, we'll just call an admin endpoint to update the payment status
        
        admin_token = login_and_get_token('admin@test.com', 'Admin123!')
        if not admin_token:
            pytest.skip("Could not get admin token for test")
        
        update_response = make_api_request('put', f'/admin/orders/{created_order["id"]}', data={
            'payment_status': 'paid'
        }, token=admin_token)
        
        if update_response.status_code != 200:
            pytest.skip(f"Could not update payment status for test: {update_response.text}")
        
        # Check that order status is updated after payment
        response = make_api_request('get', f'/orders/{created_order["id"]}', token=auth_token)
        
        assert response.status_code == 200, f"Get order failed with status {response.status_code}: {response.text}"
        data = response.json()
        
        # Check that payment status has been updated
        assert data['order']['payment_status'] == 'paid', f"Expected 'paid' payment status, got {data['order']['payment_status']}"
        
        # Order status should also update, typically to 'processing'
        assert data['order']['status'] in ['processing', 'pending'], f"Unexpected order status: {data['order']['status']}"

# If running directly (not through pytest)
if __name__ == "__main__":
    pytest.main(['-v', __file__])
