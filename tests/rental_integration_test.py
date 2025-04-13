"""
Rental System Integration Test Script for GigGatek

This script tests the integration between the frontend rental management and backend rental API.
It verifies the following flows:
1. Rental contract creation
2. Rental contract retrieval
3. Rental payment tracking
4. Early buyout calculation
5. Rental history retrieval

Usage:
    python rental_integration_test.py
"""

import requests
import json
import time
import sys
import os
import random
import string
from datetime import datetime, timedelta

# Configuration
BASE_URL = "http://localhost:5000"  # Flask development server
API_AUTH_URL = f"{BASE_URL}/api/auth"
API_RENTAL_URL = f"{BASE_URL}/api/rentals"
API_PRODUCT_URL = f"{BASE_URL}/api/products"
TEST_USER_EMAIL = f"test_user_{int(time.time())}@example.com"
TEST_USER_PASSWORD = "Test@123456"

# Test data
user_data = {
    "email": TEST_USER_EMAIL,
    "password": TEST_USER_PASSWORD,
    "first_name": "Test",
    "last_name": "User",
    "phone": "555-123-4567"
}

shipping_address = {
    "street": "123 Test Street",
    "city": "Test City",
    "state": "TS",
    "zip": "12345",
    "country": "Test Country"
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

# Test setup functions
def register_and_login():
    print_test_header("User Registration and Login")
    
    # Register user
    response = requests.post(f"{API_AUTH_URL}/register", json=user_data)
    assert_status_code(response, 201)
    
    # Login user
    login_data = {
        "email": TEST_USER_EMAIL,
        "password": TEST_USER_PASSWORD
    }
    
    response = requests.post(f"{API_AUTH_URL}/login", json=login_data)
    assert_status_code(response, 200)
    token = assert_json_key(response, "token")
    user = assert_json_key(response, "user")
    
    print("✓ User registered and logged in")
    return token, user

def get_rentable_product(token):
    print_test_header("Fetching Rentable Product")
    
    headers = {
        "Authorization": f"Bearer {token}"
    }
    
    # Get products that have rental prices
    response = requests.get(f"{API_PRODUCT_URL}?limit=5", headers=headers)
    assert_status_code(response, 200)
    products = assert_json_key(response, "products")
    
    rentable_products = [p for p in products if float(p.get("rental_price_3m", 0)) > 0]
    
    if not rentable_products:
        print("ERROR: No rentable products found in the database")
        sys.exit(1)
    
    product = rentable_products[0]
    print(f"✓ Found rentable product: {product['name']} (ID: {product['product_id']})")
    return product

# Test functions
def test_create_rental(token, product):
    print_test_header("Rental Contract Creation")
    
    headers = {
        "Authorization": f"Bearer {token}"
    }
    
    # Calculate dates
    start_date = datetime.now().strftime("%Y-%m-%d")
    end_date = (datetime.now() + timedelta(days=90)).strftime("%Y-%m-%d")  # 3-month rental
    
    rental_data = {
        "product_id": product["product_id"],
        "start_date": start_date,
        "end_date": end_date,
        "monthly_rate": float(product["rental_price_3m"]),
        "shipping_address": shipping_address
    }
    
    response = requests.post(f"{API_RENTAL_URL}", headers=headers, json=rental_data)
    print_response(response)
    
    assert_status_code(response, 201)
    rental = assert_json_key(response, "rental")
    rental_id = rental["rental_id"]
    
    print(f"✓ Rental contract created with ID: {rental_id}")
    return rental_id

def test_get_rental(token, rental_id):
    print_test_header(f"Rental Contract Retrieval (ID: {rental_id})")
    
    headers = {
        "Authorization": f"Bearer {token}"
    }
    
    response = requests.get(f"{API_RENTAL_URL}/{rental_id}", headers=headers)
    print_response(response)
    
    assert_status_code(response, 200)
    rental = assert_json_key(response, "rental")
    
    if rental["rental_id"] != rental_id:
        print(f"ERROR: Retrieved rental ID {rental['rental_id']} does not match requested ID {rental_id}")
        sys.exit(1)
    
    print("✓ Rental contract retrieved successfully")
    return rental

def test_get_rental_payments(token, rental_id):
    print_test_header(f"Rental Payment Schedule (ID: {rental_id})")
    
    headers = {
        "Authorization": f"Bearer {token}"
    }
    
    response = requests.get(f"{API_RENTAL_URL}/{rental_id}/payments", headers=headers)
    print_response(response)
    
    assert_status_code(response, 200)
    payments = assert_json_key(response, "payments")
    
    print(f"✓ Retrieved {len(payments)} scheduled payments")
    return payments

def test_calculate_buyout(token, rental_id):
    print_test_header(f"Early Buyout Calculation (ID: {rental_id})")
    
    headers = {
        "Authorization": f"Bearer {token}"
    }
    
    response = requests.get(f"{API_RENTAL_URL}/{rental_id}/buyout", headers=headers)
    print_response(response)
    
    assert_status_code(response, 200)
    buyout = assert_json_key(response, "buyout_price")
    
    print(f"✓ Calculated buyout price: ${buyout}")
    return buyout

def test_get_rental_history(token):
    print_test_header("Rental History Retrieval")
    
    headers = {
        "Authorization": f"Bearer {token}"
    }
    
    response = requests.get(f"{API_RENTAL_URL}", headers=headers)
    print_response(response)
    
    assert_status_code(response, 200)
    rentals = assert_json_key(response, "rentals")
    
    print(f"✓ Retrieved {len(rentals)} rental contracts")
    return rentals

def test_record_payment(token, rental_id):
    print_test_header(f"Record Rental Payment (ID: {rental_id})")
    
    headers = {
        "Authorization": f"Bearer {token}"
    }
    
    payment_data = {
        "amount": 100.00,
        "payment_method": "credit_card",
        "transaction_id": f"test_txn_{int(time.time())}"
    }
    
    response = requests.post(f"{API_RENTAL_URL}/{rental_id}/payments", headers=headers, json=payment_data)
    print_response(response)
    
    assert_status_code(response, 201)
    payment = assert_json_key(response, "payment")
    
    print("✓ Payment recorded successfully")
    return payment

def run_all_tests():
    print("\n🔍 Starting Rental System Integration Tests")
    
    try:
        # Setup: Register and login a test user
        token, user = register_and_login()
        
        # Get a rentable product
        product = get_rentable_product(token)
        
        # Run rental tests
        rental_id = test_create_rental(token, product)
        rental = test_get_rental(token, rental_id)
        payments = test_get_rental_payments(token, rental_id)
        buyout_price = test_calculate_buyout(token, rental_id)
        payment = test_record_payment(token, rental_id)
        rentals = test_get_rental_history(token)
        
        print("\n✅ All rental system integration tests passed!")
        
    except Exception as e:
        print(f"\n❌ Test failed with error: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    run_all_tests()
