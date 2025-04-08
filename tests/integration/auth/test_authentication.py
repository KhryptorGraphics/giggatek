#!/usr/bin/env python
"""
Authentication Integration Tests for GigGatek Platform

These tests verify the integration between the frontend authentication system 
and the backend JWT authentication API.
"""
import pytest
import requests
import json
import os
import time
from urllib.parse import urljoin

# Test configuration
API_BASE_URL = 'http://localhost:5000/api'  # Backend API URL
FRONTEND_URL = 'http://localhost:8000'      # Frontend URL

# Test credentials
TEST_USERS = {
    'valid': {
        'email': 'customer@test.com',
        'password': 'Customer123!',
        'first_name': 'Regular',
        'last_name': 'Customer'
    },
    'invalid': {
        'email': 'nonexistent@test.com',
        'password': 'InvalidPass123!'
    },
    'new': {
        'email': 'new_test_user@example.com',
        'password': 'NewPassword123!',
        'first_name': 'New',
        'last_name': 'Test'
    }
}

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

def login_and_get_token(credentials):
    """Get an authentication token for a user"""
    response = make_api_request('post', '/auth/login', data={
        'email': credentials['email'],
        'password': credentials['password']
    })
    
    if response.status_code != 200:
        return None
    
    data = response.json()
    return data.get('token')

# Test fixtures
@pytest.fixture
def valid_user_token():
    """Fixture to get a valid user token"""
    return login_and_get_token(TEST_USERS['valid'])

@pytest.fixture
def cleanup_test_user():
    """Fixture to clean up test user after tests"""
    yield  # Run the test
    
    # Clean up: Try to get a token as admin
    admin_credentials = {
        'email': 'admin@test.com',
        'password': 'Admin123!'
    }
    admin_token = login_and_get_token(admin_credentials)
    
    if admin_token:
        # Delete the test user if it exists
        # This would require an admin endpoint to delete users
        # For now, we'll just print a message
        print(f"Note: Would delete test user {TEST_USERS['new']['email']} here if admin delete endpoint existed")

# Authentication Tests

class TestRegistration:
    """Test user registration functionality"""
    
    def test_successful_registration(self, cleanup_test_user):
        """Test successful user registration"""
        # Register a new user
        response = make_api_request('post', '/auth/register', data=TEST_USERS['new'])
        
        # Assert successful registration
        assert response.status_code == 201, f"Registration failed with status {response.status_code}: {response.text}"
        data = response.json()
        
        # Check expected response structure
        assert 'token' in data, "Token not found in registration response"
        assert 'user' in data, "User data not found in registration response"
        assert data['user']['email'] == TEST_USERS['new']['email'], "Email in response doesn't match registration email"
        assert data['user']['first_name'] == TEST_USERS['new']['first_name'], "First name in response doesn't match"
        assert data['user']['last_name'] == TEST_USERS['new']['last_name'], "Last name in response doesn't match"
    
    def test_duplicate_email_registration(self, valid_user_token):
        """Test registration with an email that already exists"""
        # Try to register with existing email
        response = make_api_request('post', '/auth/register', data={
            'email': TEST_USERS['valid']['email'],  # Existing email
            'password': 'DifferentPass123!',
            'first_name': 'Duplicate',
            'last_name': 'User'
        })
        
        # Assert registration fails with appropriate error
        assert response.status_code == 409, f"Expected 409 Conflict for duplicate email, got {response.status_code}"
        data = response.json()
        assert 'error' in data, "Error message not found in response"
        assert 'already exists' in data['error'].lower(), f"Unexpected error message: {data['error']}"
    
    def test_invalid_email_format(self):
        """Test registration with invalid email format"""
        # Try to register with invalid email
        response = make_api_request('post', '/auth/register', data={
            'email': 'invalid-email-format',  # Invalid email
            'password': 'ValidPass123!',
            'first_name': 'Invalid',
            'last_name': 'Email'
        })
        
        # Assert registration fails with appropriate error
        assert response.status_code == 400, f"Expected 400 Bad Request for invalid email, got {response.status_code}"
        data = response.json()
        assert 'error' in data, "Error message not found in response"
        assert 'email' in data['error'].lower(), f"Error should mention email issue: {data['error']}"
    
    def test_weak_password(self):
        """Test registration with weak password"""
        # Try to register with weak password
        response = make_api_request('post', '/auth/register', data={
            'email': 'valid-email@example.com',
            'password': 'weak',  # Weak password
            'first_name': 'Weak',
            'last_name': 'Password'
        })
        
        # Assert registration fails with appropriate error
        assert response.status_code == 400, f"Expected 400 Bad Request for weak password, got {response.status_code}"
        data = response.json()
        assert 'error' in data, "Error message not found in response"
        assert 'password' in data['error'].lower(), f"Error should mention password issue: {data['error']}"

class TestLogin:
    """Test user login functionality"""
    
    def test_successful_login(self):
        """Test successful login with valid credentials"""
        response = make_api_request('post', '/auth/login', data={
            'email': TEST_USERS['valid']['email'],
            'password': TEST_USERS['valid']['password']
        })
        
        # Assert successful login
        assert response.status_code == 200, f"Login failed with status {response.status_code}: {response.text}"
        data = response.json()
        
        # Check expected response structure
        assert 'token' in data, "Token not found in login response"
        assert 'user' in data, "User data not found in login response"
        assert data['user']['email'] == TEST_USERS['valid']['email'], "Email in response doesn't match login email"
    
    def test_invalid_credentials(self):
        """Test login with invalid credentials"""
        response = make_api_request('post', '/auth/login', data={
            'email': TEST_USERS['invalid']['email'],
            'password': TEST_USERS['invalid']['password']
        })
        
        # Assert login fails with appropriate error
        assert response.status_code == 401, f"Expected 401 Unauthorized for invalid credentials, got {response.status_code}"
        data = response.json()
        assert 'error' in data, "Error message not found in response"
    
    def test_missing_credentials(self):
        """Test login with missing credentials"""
        # No email
        response1 = make_api_request('post', '/auth/login', data={
            'password': TEST_USERS['valid']['password']
        })
        
        # No password
        response2 = make_api_request('post', '/auth/login', data={
            'email': TEST_USERS['valid']['email']
        })
        
        # Assert both fail with appropriate errors
        assert response1.status_code == 400, f"Expected 400 Bad Request for missing email, got {response1.status_code}"
        assert response2.status_code == 400, f"Expected 400 Bad Request for missing password, got {response2.status_code}"

class TestTokenManagement:
    """Test token management functionality"""
    
    def test_protected_route_with_valid_token(self, valid_user_token):
        """Test accessing a protected route with a valid token"""
        response = make_api_request('get', '/auth/me', token=valid_user_token)
        
        # Assert successful access
        assert response.status_code == 200, f"Protected route access failed with status {response.status_code}: {response.text}"
        data = response.json()
        
        # Check expected response structure
        assert 'user' in data, "User data not found in response"
        assert data['user']['email'] == TEST_USERS['valid']['email'], "Email in response doesn't match expected user"
    
    def test_protected_route_without_token(self):
        """Test accessing a protected route without a token"""
        response = make_api_request('get', '/auth/me')
        
        # Assert access is denied
        assert response.status_code == 401, f"Expected 401 Unauthorized without token, got {response.status_code}"
        data = response.json()
        assert 'error' in data, "Error message not found in response"
        assert 'token' in data['error'].lower(), f"Error should mention token issue: {data['error']}"
    
    def test_protected_route_with_invalid_token(self):
        """Test accessing a protected route with an invalid token"""
        response = make_api_request('get', '/auth/me', token='invalid.token.string')
        
        # Assert access is denied
        assert response.status_code == 401, f"Expected 401 Unauthorized with invalid token, got {response.status_code}"
        data = response.json()
        assert 'error' in data, "Error message not found in response"
        assert 'token' in data['error'].lower(), f"Error should mention token issue: {data['error']}"
    
    def test_token_refresh(self, valid_user_token):
        """Test refreshing an authentication token"""
        response = make_api_request('post', '/auth/refresh-token', token=valid_user_token)
        
        # Assert successful token refresh
        assert response.status_code == 200, f"Token refresh failed with status {response.status_code}: {response.text}"
        data = response.json()
        
        # Check expected response structure
        assert 'token' in data, "New token not found in refresh response"
        assert data['token'] != valid_user_token, "Refreshed token should be different from original"

class TestProfileManagement:
    """Test user profile management functionality"""
    
    def test_update_profile(self, valid_user_token):
        """Test updating user profile information"""
        # Update profile data
        update_data = {
            'first_name': 'Updated',
            'last_name': 'Name'
        }
        
        response = make_api_request('put', '/auth/update-profile', data=update_data, token=valid_user_token)
        
        # Assert successful update
        assert response.status_code == 200, f"Profile update failed with status {response.status_code}: {response.text}"
        data = response.json()
        
        # Check expected response structure
        assert 'user' in data, "User data not found in response"
        assert data['user']['first_name'] == update_data['first_name'], "First name not updated correctly"
        assert data['user']['last_name'] == update_data['last_name'], "Last name not updated correctly"
        
        # Reset profile data
        reset_data = {
            'first_name': TEST_USERS['valid']['first_name'],
            'last_name': TEST_USERS['valid']['last_name']
        }
        make_api_request('put', '/auth/update-profile', data=reset_data, token=valid_user_token)
    
    def test_change_password(self, valid_user_token):
        """Test changing user password"""
        # Change password
        password_data = {
            'current_password': TEST_USERS['valid']['password'],
            'new_password': 'NewPassword123!'
        }
        
        response = make_api_request('put', '/auth/change-password', data=password_data, token=valid_user_token)
        
        # Assert successful password change
        assert response.status_code == 200, f"Password change failed with status {response.status_code}: {response.text}"
        
        # Verify login with new password
        response = make_api_request('post', '/auth/login', data={
            'email': TEST_USERS['valid']['email'],
            'password': password_data['new_password']
        })
        
        assert response.status_code == 200, "Login with new password failed"
        
        # Reset password back to original
        new_token = response.json()['token']
        reset_data = {
            'current_password': password_data['new_password'],
            'new_password': TEST_USERS['valid']['password']
        }
        
        response = make_api_request('put', '/auth/change-password', data=reset_data, token=new_token)
        assert response.status_code == 200, "Failed to reset password back to original"

class TestPasswordReset:
    """Test password reset functionality"""
    
    def test_password_reset_request(self):
        """Test requesting a password reset"""
        response = make_api_request('post', '/auth/password-reset-request', data={
            'email': TEST_USERS['valid']['email']
        })
        
        # Assert successful request
        assert response.status_code == 200, f"Password reset request failed with status {response.status_code}: {response.text}"
        
        # Even for nonexistent emails, the API should return success for security reasons
        response = make_api_request('post', '/auth/password-reset-request', data={
            'email': 'nonexistent@example.com'
        })
        
        assert response.status_code == 200, "API should not reveal if email exists"
    
    def test_password_reset(self):
        """Test resetting password with a token"""
        # Note: This test is limited because we can't easily get the reset token generated by the backend
        # We can only test that the endpoint exists and returns appropriate status for invalid tokens
        
        response = make_api_request('post', '/auth/password-reset', data={
            'token': 'invalid_token',
            'new_password': 'NewPassword123!'
        })
        
        # Should fail with invalid token
        assert response.status_code == 401, f"Expected 401 Unauthorized for invalid reset token, got {response.status_code}"

# If running directly (not through pytest)
if __name__ == "__main__":
    pytest.main(['-v', __file__])
