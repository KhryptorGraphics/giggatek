#!/usr/bin/env python
"""
Rental System Integration Tests for GigGatek Platform

These tests verify the integration between the frontend rental components 
and the backend rental API.
"""
import pytest
import requests
import json
import time
from datetime import datetime, timedelta
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

def get_payment_method_id(token):
    """Get a payment method ID for testing"""
    # This would typically come from Stripe
    # For testing, we'll just return a placeholder
    return "pm_test_123456789"

# Test fixtures
@pytest.fixture
def auth_token():
    """Fixture to get an authentication token"""
    return login_and_get_token()

@pytest.fixture
def rental_product(auth_token):
    """Fixture to get a rental-eligible product"""
    product = get_rental_eligible_product(auth_token)
    if not product:
        pytest.skip("No rental-eligible product available")
    return product

@pytest.fixture
def address_id(auth_token):
    """Fixture to get a test address ID"""
    return get_address_id(auth_token)

@pytest.fixture
def payment_method_id(auth_token):
    """Fixture to get a test payment method ID"""
    return get_payment_method_id(auth_token)

@pytest.fixture
def rental_contract_data(rental_product, address_id, payment_method_id):
    """Fixture to create test rental contract data"""
    return {
        'product_id': rental_product.get('id'),
        'total_months': 12,
        'address_id': address_id,
        'payment_method_id': payment_method_id
    }

@pytest.fixture
def created_rental(auth_token, rental_contract_data):
    """Fixture to create a test rental contract"""
    response = make_api_request('post', '/rentals', data=rental_contract_data, token=auth_token)
    
    if response.status_code != 201:
        pytest.skip(f"Failed to create test rental: {response.text}")
    
    rental = response.json().get('rental')
    yield rental
    
    # No cleanup needed as we're using a test database

@pytest.fixture
def signed_rental(auth_token, created_rental):
    """Fixture to create a signed rental contract"""
    # Sign the contract
    signature_data = {
        'signature': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAZAAAA...'  # Simulated signature
    }
    
    response = make_api_request('post', f'/rentals/{created_rental["id"]}/sign-contract', 
                               data=signature_data, token=auth_token)
    
    if response.status_code != 200:
        pytest.skip(f"Failed to sign test rental: {response.text}")
    
    rental = response.json().get('rental')
    return rental

# Rental System Tests

class TestRentalContractCreation:
    """Test rental contract creation functionality"""
    
    def test_create_rental_contract(self, auth_token, rental_contract_data):
        """Test creating a new rental contract"""
        response = make_api_request('post', '/rentals', data=rental_contract_data, token=auth_token)
        
        # Assert successful rental creation
        assert response.status_code == 201, f"Rental creation failed with status {response.status_code}: {response.text}"
        data = response.json()
        
        # Check expected response structure
        assert 'rental' in data, "Rental data not found in response"
        rental = data['rental']
        assert 'id' in rental, "Rental ID not found in response"
        assert rental['product_id'] == rental_contract_data['product_id'], "Product ID mismatch"
        assert rental['total_months'] == rental_contract_data['total_months'], "Total months mismatch"
        
        # Check rental status
        assert rental['status'] == 'pending', f"Expected 'pending' status, got {rental['status']}"
    
    def test_create_rental_requires_auth(self, rental_contract_data):
        """Test that creating a rental requires authentication"""
        response = make_api_request('post', '/rentals', data=rental_contract_data)
        
        # Assert unauthorized without token
        assert response.status_code == 401, f"Expected 401 Unauthorized without token, got {response.status_code}"
    
    def test_create_rental_validates_product(self, auth_token, rental_contract_data):
        """Test rental creation validates product"""
        # Use an invalid product ID
        invalid_data = rental_contract_data.copy()
        invalid_data['product_id'] = 99999
        
        response = make_api_request('post', '/rentals', data=invalid_data, token=auth_token)
        
        # Assert validation error
        assert response.status_code in [400, 404], f"Expected 400/404 for invalid product, got {response.status_code}"
        data = response.json()
        assert 'error' in data, "Error message not found in response"
    
    def test_contract_term_validation(self, auth_token, rental_contract_data):
        """Test rental contract term validation"""
        # Test with invalid term length
        invalid_data = rental_contract_data.copy()
        invalid_data['total_months'] = 1  # Too short (assuming minimum is 6 months)
        
        response = make_api_request('post', '/rentals', data=invalid_data, token=auth_token)
        
        # Assert validation error
        assert response.status_code == 400, f"Expected 400 Bad Request for invalid term, got {response.status_code}"
        data = response.json()
        assert 'error' in data, "Error message not found in response"

class TestContractSigning:
    """Test rental contract signing functionality"""
    
    def test_sign_contract(self, auth_token, created_rental):
        """Test signing a rental contract"""
        signature_data = {
            'signature': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAZAAAA...'  # Simulated signature
        }
        
        response = make_api_request('post', f'/rentals/{created_rental["id"]}/sign-contract', 
                                  data=signature_data, token=auth_token)
        
        # Assert successful signing
        assert response.status_code == 200, f"Contract signing failed with status {response.status_code}: {response.text}"
        data = response.json()
        
        # Check expected response structure
        assert 'rental' in data, "Rental data not found in response"
        assert data['rental']['id'] == created_rental['id'], "Rental ID mismatch"
        
        # Check that status has been updated (typically to 'active' after signing)
        assert data['rental']['status'] in ['active', 'pending'], f"Unexpected status: {data['rental']['status']}"
    
    def test_cannot_sign_already_signed_contract(self, auth_token, signed_rental):
        """Test that an already signed contract cannot be signed again"""
        signature_data = {
            'signature': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAZAAAA...'  # New signature
        }
        
        response = make_api_request('post', f'/rentals/{signed_rental["id"]}/sign-contract', 
                                  data=signature_data, token=auth_token)
        
        # Assert error for already signed contract
        assert response.status_code in [400, 409], f"Expected 400/409 for already signed contract, got {response.status_code}"
        data = response.json()
        assert 'error' in data, "Error message not found in response"

class TestRentalRetrieval:
    """Test rental retrieval functionality"""
    
    def test_get_rentals(self, auth_token):
        """Test retrieving user's rentals"""
        response = make_api_request('get', '/rentals', token=auth_token)
        
        # Assert successful retrieval
        assert response.status_code == 200, f"Get rentals failed with status {response.status_code}: {response.text}"
        data = response.json()
        
        # Check expected response structure
        assert 'rentals' in data, "Rentals data not found in response"
        assert isinstance(data['rentals'], list), "Rentals should be a list"
    
    def test_get_specific_rental(self, auth_token, created_rental):
        """Test retrieving a specific rental by ID"""
        response = make_api_request('get', f'/rentals/{created_rental["id"]}', token=auth_token)
        
        # Assert successful retrieval
        assert response.status_code == 200, f"Get rental failed with status {response.status_code}: {response.text}"
        data = response.json()
        
        # Check expected response structure
        assert 'rental' in data, "Rental data not found in response"
        assert data['rental']['id'] == created_rental['id'], "Returned rental ID doesn't match requested ID"
    
    def test_get_rentals_requires_auth(self):
        """Test that retrieving rentals requires authentication"""
        response1 = make_api_request('get', '/rentals')
        response2 = make_api_request('get', '/rentals/1')
        
        # Assert unauthorized without token
        assert response1.status_code == 401, f"Expected 401 Unauthorized without token, got {response1.status_code}"
        assert response2.status_code == 401, f"Expected 401 Unauthorized without token, got {response2.status_code}"

class TestRentalPayments:
    """Test rental payment functionality"""
    
    def test_make_payment(self, auth_token, signed_rental):
        """Test making a payment on a rental contract"""
        payment_data = {
            'payment_method_id': 'pm_test_123456789'
        }
        
        response = make_api_request('post', f'/rentals/{signed_rental["id"]}/make-payment', 
                                  data=payment_data, token=auth_token)
        
        # Skip if payment endpoint is not available
        if response.status_code == 404:
            pytest.skip("Payment endpoint not available")
        
        # Assert successful payment
        assert response.status_code == 200, f"Make payment failed with status {response.status_code}: {response.text}"
        data = response.json()
        
        # Check expected response structure
        assert 'payment' in data, "Payment data not found in response"
        assert data['payment']['rental_id'] == signed_rental['id'], "Rental ID mismatch"
        assert data['payment']['status'] == 'paid', f"Expected 'paid' status, got {data['payment']['status']}"
    
    def test_payment_updates_rental(self, auth_token, signed_rental):
        """Test that payment updates rental status and payment count"""
        # First make a payment
        payment_data = {
            'payment_method_id': 'pm_test_123456789'
        }
        
        payment_response = make_api_request('post', f'/rentals/{signed_rental["id"]}/make-payment', 
                                         data=payment_data, token=auth_token)
        
        if payment_response.status_code != 200:
            pytest.skip(f"Could not make payment: {payment_response.text}")
        
        # Then check that rental has been updated
        response = make_api_request('get', f'/rentals/{signed_rental["id"]}', token=auth_token)
        
        assert response.status_code == 200, f"Get rental failed with status {response.status_code}: {response.text}"
        data = response.json()
        
        # Check payment count has increased
        assert data['rental']['payments_made'] > 0, "Payments made should be incremented"
        
        # Next payment date should be updated
        if 'next_payment_date' in data['rental']:
            next_date = datetime.fromisoformat(data['rental']['next_payment_date'].replace('Z', '+00:00'))
            start_date = datetime.fromisoformat(data['rental']['start_date'].replace('Z', '+00:00'))
            assert next_date > start_date, "Next payment date should be updated"

class TestEarlyBuyout:
    """Test early buyout functionality"""
    
    def test_calculate_buyout(self, auth_token, signed_rental):
        """Test calculating early buyout amount"""
        response = make_api_request('get', f'/rentals/{signed_rental["id"]}/buyout-amount', token=auth_token)
        
        # Skip if buyout endpoint is not available
        if response.status_code == 404:
            pytest.skip("Buyout calculation endpoint not available")
        
        # Assert successful calculation
        assert response.status_code == 200, f"Buyout calculation failed with status {response.status_code}: {response.text}"
        data = response.json()
        
        # Check expected response structure
        assert 'buyout_amount' in data, "Buyout amount not found in response"
        assert isinstance(data['buyout_amount'], (int, float)), "Buyout amount should be a number"
        assert data['buyout_amount'] > 0, "Buyout amount should be positive"
    
    def test_process_buyout(self, auth_token, signed_rental):
        """Test processing an early buyout"""
        # First get buyout amount
        calc_response = make_api_request('get', f'/rentals/{signed_rental["id"]}/buyout-amount', token=auth_token)
        
        if calc_response.status_code != 200:
            pytest.skip("Buyout calculation endpoint not available")
        
        buyout_amount = calc_response.json().get('buyout_amount')
        
        # Process buyout
        buyout_data = {
            'payment_method_id': 'pm_test_123456789',
            'amount': buyout_amount
        }
        
        response = make_api_request('post', f'/rentals/{signed_rental["id"]}/process-buyout', 
                                  data=buyout_data, token=auth_token)
        
        # Assert successful buyout
        assert response.status_code == 200, f"Buyout processing failed with status {response.status_code}: {response.text}"
        data = response.json()
        
        # Check that rental status is updated to 'completed'
        assert 'rental' in data, "Rental data not found in response"
        assert data['rental']['status'] == 'completed', f"Expected 'completed' status, got {data['rental']['status']}"

class TestRentalCancellation:
    """Test rental cancellation functionality"""
    
    def test_cancel_rental(self, auth_token, created_rental):
        """Test cancelling a rental contract"""
        response = make_api_request('post', f'/rentals/{created_rental["id"]}/cancel', token=auth_token)
        
        # Assert successful cancellation
        assert response.status_code == 200, f"Rental cancellation failed with status {response.status_code}: {response.text}"
        data = response.json()
        
        # Check that rental status is updated to 'cancelled'
        assert 'rental' in data, "Rental data not found in response"
        assert data['rental']['status'] == 'cancelled', f"Expected 'cancelled' status, got {data['rental']['status']}"
    
    def test_cannot_cancel_active_rental(self, auth_token, signed_rental):
        """Test that an active rental cannot be cancelled without additional steps"""
        # Make at least one payment to ensure it's fully active
        payment_data = {
            'payment_method_id': 'pm_test_123456789'
        }
        
        payment_response = make_api_request('post', f'/rentals/{signed_rental["id"]}/make-payment', 
                                         data=payment_data, token=auth_token)
        
        if payment_response.status_code == 200:
            # Try to cancel
            response = make_api_request('post', f'/rentals/{signed_rental["id"]}/cancel', token=auth_token)
            
            # Assert cancellation is rejected or requires special handling
            assert response.status_code in [400, 403, 409], f"Expected error status for cancelling active rental, got {response.status_code}"
            data = response.json()
            assert 'error' in data, "Error message not found in response"
        else:
            pytest.skip("Could not prepare active rental for cancellation test")

# If running directly (not through pytest)
if __name__ == "__main__":
    pytest.main(['-v', __file__])
