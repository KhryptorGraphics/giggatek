"""
Authentication Integration Test Script for GigGatek

This script tests the integration between the frontend auth.js and backend JWT authentication system.
It verifies the following flows:
1. User registration
2. User login
3. Token refresh
4. Password reset
5. User profile update
6. Protected route access

Usage:
    python auth_integration_test.py
"""

import requests
import json
import time
import sys
import os
import random
import string

# Configuration
BASE_URL = "http://localhost:5000"  # Flask development server
API_AUTH_URL = f"{BASE_URL}/api/auth"
TEST_USER_EMAIL = f"test_user_{int(time.time())}@example.com"
TEST_USER_PASSWORD = "Test@123456"
TEST_USER_FIRST_NAME = "Test"
TEST_USER_LAST_NAME = "User"

# Test data
user_data = {
    "email": TEST_USER_EMAIL,
    "password": TEST_USER_PASSWORD,
    "first_name": TEST_USER_FIRST_NAME,
    "last_name": TEST_USER_LAST_NAME,
    "phone": "555-123-4567"
}

# Helper functions
def print_test_header(test_name):
    print(f"\n{'=' * 80}")
    print(f"TEST: {test_name}")
    print(f"{'=' * 80}")

def print_response(response):
    print(f"Status Code: {response.status_code}")
    try:
        print(f"Response: {json.dumps(response.json(), indent=2)}")
    except:
        print(f"Response: {response.text}")

def assert_status_code(response, expected_code):
    if response.status_code != expected_code:
        print(f"ERROR: Expected status code {expected_code}, got {response.status_code}")
        sys.exit(1)
    print(f"✓ Status code is {expected_code}")

def assert_json_key(response, key):
    try:
        data = response.json()
        if key not in data:
            print(f"ERROR: Expected key '{key}' not found in response")
            sys.exit(1)
        print(f"✓ Response contains '{key}'")
        return data[key]
    except:
        print(f"ERROR: Response is not valid JSON or key '{key}' not found")
        sys.exit(1)

# Test functions
def test_registration():
    print_test_header("User Registration")
    
    response = requests.post(f"{API_AUTH_URL}/register", json=user_data)
    print_response(response)
    
    assert_status_code(response, 201)
    assert_json_key(response, "message")
    
    print("✓ Registration successful")

def test_login():
    print_test_header("User Login")
    
    login_data = {
        "email": TEST_USER_EMAIL,
        "password": TEST_USER_PASSWORD
    }
    
    response = requests.post(f"{API_AUTH_URL}/login", json=login_data)
    print_response(response)
    
    assert_status_code(response, 200)
    token = assert_json_key(response, "token")
    user = assert_json_key(response, "user")
    assert_json_key(response, "expires_in")
    
    print("✓ Login successful")
    return token, user

def test_protected_route(token):
    print_test_header("Protected Route Access")
    
    headers = {
        "Authorization": f"Bearer {token}"
    }
    
    response = requests.get(f"{API_AUTH_URL}/me", headers=headers)
    print_response(response)
    
    assert_status_code(response, 200)
    user = assert_json_key(response, "user")
    
    print("✓ Protected route access successful")
    return user

def test_token_refresh(token):
    print_test_header("Token Refresh")
    
    headers = {
        "Authorization": f"Bearer {token}"
    }
    
    response = requests.post(f"{API_AUTH_URL}/refresh-token", headers=headers)
    print_response(response)
    
    assert_status_code(response, 200)
    new_token = assert_json_key(response, "token")
    assert_json_key(response, "expires_in")
    
    print("✓ Token refresh successful")
    return new_token

def test_profile_update(token):
    print_test_header("Profile Update")
    
    headers = {
        "Authorization": f"Bearer {token}"
    }
    
    update_data = {
        "first_name": f"{TEST_USER_FIRST_NAME}_Updated",
        "phone": "555-987-6543"
    }
    
    response = requests.put(f"{API_AUTH_URL}/profile", headers=headers, json=update_data)
    print_response(response)
    
    assert_status_code(response, 200)
    user = assert_json_key(response, "user")
    
    if user["first_name"] != update_data["first_name"]:
        print(f"ERROR: First name not updated. Expected '{update_data['first_name']}', got '{user['first_name']}'")
        sys.exit(1)
    
    print("✓ Profile update successful")

def test_password_reset_request():
    print_test_header("Password Reset Request")
    
    reset_data = {
        "email": TEST_USER_EMAIL
    }
    
    response = requests.post(f"{API_AUTH_URL}/password-reset-request", json=reset_data)
    print_response(response)
    
    assert_status_code(response, 200)
    assert_json_key(response, "message")
    
    print("✓ Password reset request successful")
    
    # Note: In a real test, we would need to extract the reset token from the email
    # For this integration test, we'll simulate by directly querying the database
    # This part would need to be implemented based on your actual database structure
    
    print("⚠ Note: Full password reset flow cannot be tested automatically without email access")
    print("⚠ Manual verification of email receipt and reset link functionality is required")

def run_all_tests():
    print("\n🔍 Starting Authentication Integration Tests")
    
    try:
        # Run tests in sequence
        test_registration()
        token, user = test_login()
        user_info = test_protected_route(token)
        new_token = test_token_refresh(token)
        test_profile_update(new_token)
        test_password_reset_request()
        
        print("\n✅ All authentication integration tests passed!")
        
    except Exception as e:
        print(f"\n❌ Test failed with error: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    run_all_tests()
