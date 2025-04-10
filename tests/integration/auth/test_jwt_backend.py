"""
GigGatek JWT Authentication Backend Integration Test

This test verifies the backend JWT authentication system functionality.
"""

import unittest
import requests
import json
import time
from datetime import datetime, timedelta

# Test configuration
API_BASE_URL = "http://localhost:5000/api"  # Update with your test environment URL
TEST_USER = {
    "email": "test_jwt@example.com",
    "password": "SecurePassword123!",
    "first_name": "JWT",
    "last_name": "Tester"
}

class JWTAuthenticationTest(unittest.TestCase):
    """Test JWT authentication functionality in the backend"""
    
    def setUp(self):
        """Set up test case - create test user if needed"""
        # Try to register the test user (ignore if already exists)
        try:
            response = requests.post(
                f"{API_BASE_URL}/auth/register",
                json=TEST_USER
            )
            if response.status_code == 201:
                print(f"Created test user: {TEST_USER['email']}")
                self.user_token = response.json().get('token')
            else:
                # User might already exist, try to login
                login_response = requests.post(
                    f"{API_BASE_URL}/auth/login",
                    json={
                        "email": TEST_USER["email"],
                        "password": TEST_USER["password"]
                    }
                )
                if login_response.status_code == 200:
                    self.user_token = login_response.json().get('token')
                else:
                    self.fail(f"Failed to set up test user: {login_response.text}")
        except Exception as e:
            self.fail(f"Error setting up test: {str(e)}")
    
    def test_login_returns_valid_jwt(self):
        """Test that login returns a valid JWT token"""
        # Login with test user
        response = requests.post(
            f"{API_BASE_URL}/auth/login",
            json={
                "email": TEST_USER["email"],
                "password": TEST_USER["password"]
            }
        )
        
        # Assert successful login
        self.assertEqual(response.status_code, 200, f"Login failed: {response.text}")
        data = response.json()
        
        # Check token exists
        self.assertIn('token', data, "Token not found in login response")
        token = data['token']
        
        # Verify token format (simple check)
        token_parts = token.split('.')
        self.assertEqual(len(token_parts), 3, "JWT token should have 3 parts")
        
        # Store token for other tests
        self.user_token = token
    
    def test_protected_route_requires_token(self):
        """Test that protected routes require a valid token"""
        # Try to access protected route without token
        response = requests.get(f"{API_BASE_URL}/auth/me")
        
        # Assert unauthorized
        self.assertEqual(response.status_code, 401, "Protected route should require token")
        
        # Now try with token
        response = requests.get(
            f"{API_BASE_URL}/auth/me",
            headers={"Authorization": f"Bearer {self.user_token}"}
        )
        
        # Assert authorized
        self.assertEqual(response.status_code, 200, f"Failed to access with token: {response.text}")
        data = response.json()
        self.assertIn('user', data, "User data not found in response")
        self.assertEqual(data['user']['email'], TEST_USER['email'], "Email in response doesn't match")
    
    def test_token_refresh(self):
        """Test token refresh functionality"""
        # Get initial token
        login_response = requests.post(
            f"{API_BASE_URL}/auth/login",
            json={
                "email": TEST_USER["email"],
                "password": TEST_USER["password"]
            }
        )
        initial_token = login_response.json()['token']
        
        # Refresh token
        refresh_response = requests.post(
            f"{API_BASE_URL}/auth/refresh-token",
            headers={"Authorization": f"Bearer {initial_token}"}
        )
        
        # Assert successful refresh
        self.assertEqual(refresh_response.status_code, 200, f"Token refresh failed: {refresh_response.text}")
        data = refresh_response.json()
        
        # Check new token exists and is different
        self.assertIn('token', data, "New token not found in refresh response")
        new_token = data['token']
        self.assertNotEqual(new_token, initial_token, "Refreshed token should be different from original")
        
        # Verify new token works
        me_response = requests.get(
            f"{API_BASE_URL}/auth/me",
            headers={"Authorization": f"Bearer {new_token}"}
        )
        self.assertEqual(me_response.status_code, 200, "New token should be valid")
    
    def test_invalid_token_rejected(self):
        """Test that invalid tokens are rejected"""
        # Try with malformed token
        response = requests.get(
            f"{API_BASE_URL}/auth/me",
            headers={"Authorization": "Bearer invalid.token.format"}
        )
        self.assertEqual(response.status_code, 401, "Invalid token should be rejected")
        
        # Try with expired token (this is a manually crafted expired token)
        expired_token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJpc19hZG1pbiI6ZmFsc2UsImV4cCI6MTU3NzgzNjgwMH0.QDSfk1LZKlm4ZErrWyDHiYZf3rFJZEYQpFVe5oYSFPc"
        response = requests.get(
            f"{API_BASE_URL}/auth/me",
            headers={"Authorization": f"Bearer {expired_token}"}
        )
        self.assertEqual(response.status_code, 401, "Expired token should be rejected")
    
    def test_token_contains_user_data(self):
        """Test that the token contains the expected user data"""
        # This test requires the backend to be configured to return user data in the token
        # Get user data from /me endpoint
        response = requests.get(
            f"{API_BASE_URL}/auth/me",
            headers={"Authorization": f"Bearer {self.user_token}"}
        )
        user_data = response.json()['user']
        
        # Verify user data matches expected values
        self.assertEqual(user_data['email'], TEST_USER['email'], "Email in token doesn't match")
        self.assertEqual(user_data['first_name'], TEST_USER['first_name'], "First name in token doesn't match")
        self.assertEqual(user_data['last_name'], TEST_USER['last_name'], "Last name in token doesn't match")

if __name__ == '__main__':
    unittest.main()
