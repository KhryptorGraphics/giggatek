"""
Order Management Integration Test Script for GigGatek

This script tests the integration between the frontend order management and backend order API.
It verifies the following flows:
1. Order creation
2. Order retrieval
3. Order status updates
4. Order cancellation
5. Order history retrieval

Usage:
    python order_integration_test.py
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
API_ORDER_URL = f"{BASE_URL}/api/orders"
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

def get_sample_products(token):
    print_test_header("Fetching Sample Products")
    
    headers = {
        "Authorization": f"Bearer {token}"
    }
    
    response = requests.get(f"{API_PRODUCT_URL}?limit=2", headers=headers)
    assert_status_code(response, 200)
    products = assert_json_key(response, "products")
    
    if not products or len(products) == 0:
        print("ERROR: No products found in the database")
        sys.exit(1)
    
    print(f"✓ Found {len(products)} products")
    return products

# Test functions
def test_create_order(token, products):
    print_test_header("Order Creation")
    
    headers = {
        "Authorization": f"Bearer {token}"
    }
    
    # Create order items from products
    order_items = []
    total_amount = 0
    
    for product in products:
        quantity = random.randint(1, 3)
        price = float(product["purchase_price"])
        item_total = quantity * price
        total_amount += item_total
        
        order_items.append({
            "product_id": product["product_id"],
            "quantity": quantity,
            "price": price
        })
    
    order_data = {
        "order_items": order_items,
        "total_amount": total_amount,
        "shipping_address": shipping_address,
        "payment_method": "credit_card"
    }
    
    response = requests.post(f"{API_ORDER_URL}", headers=headers, json=order_data)
    print_response(response)
    
    assert_status_code(response, 201)
    order = assert_json_key(response, "order")
    order_id = order["order_id"]
    
    print(f"✓ Order created with ID: {order_id}")
    return order_id

def test_get_order(token, order_id):
    print_test_header(f"Order Retrieval (ID: {order_id})")
    
    headers = {
        "Authorization": f"Bearer {token}"
    }
    
    response = requests.get(f"{API_ORDER_URL}/{order_id}", headers=headers)
    print_response(response)
    
    assert_status_code(response, 200)
    order = assert_json_key(response, "order")
    
    if order["order_id"] != order_id:
        print(f"ERROR: Retrieved order ID {order['order_id']} does not match requested ID {order_id}")
        sys.exit(1)
    
    print("✓ Order retrieved successfully")
    return order

def test_update_order_status(token, order_id):
    print_test_header(f"Order Status Update (ID: {order_id})")
    
    headers = {
        "Authorization": f"Bearer {token}"
    }
    
    update_data = {
        "status": "processing"
    }
    
    response = requests.patch(f"{API_ORDER_URL}/{order_id}", headers=headers, json=update_data)
    print_response(response)
    
    assert_status_code(response, 200)
    order = assert_json_key(response, "order")
    
    if order["status"] != update_data["status"]:
        print(f"ERROR: Order status not updated. Expected '{update_data['status']}', got '{order['status']}'")
        sys.exit(1)
    
    print("✓ Order status updated successfully")
    return order

def test_get_order_history(token):
    print_test_header("Order History Retrieval")
    
    headers = {
        "Authorization": f"Bearer {token}"
    }
    
    response = requests.get(f"{API_ORDER_URL}", headers=headers)
    print_response(response)
    
    assert_status_code(response, 200)
    orders = assert_json_key(response, "orders")
    
    print(f"✓ Retrieved {len(orders)} orders")
    return orders

def test_cancel_order(token, order_id):
    print_test_header(f"Order Cancellation (ID: {order_id})")
    
    headers = {
        "Authorization": f"Bearer {token}"
    }
    
    response = requests.post(f"{API_ORDER_URL}/{order_id}/cancel", headers=headers)
    print_response(response)
    
    assert_status_code(response, 200)
    order = assert_json_key(response, "order")
    
    if order["status"] != "cancelled":
        print(f"ERROR: Order status not updated to 'cancelled'. Got '{order['status']}'")
        sys.exit(1)
    
    print("✓ Order cancelled successfully")
    return order

def run_all_tests():
    print("\n🔍 Starting Order Management Integration Tests")
    
    try:
        # Setup: Register and login a test user
        token, user = register_and_login()
        
        # Get sample products for order creation
        products = get_sample_products(token)
        
        # Run order tests
        order_id = test_create_order(token, products)
        order = test_get_order(token, order_id)
        updated_order = test_update_order_status(token, order_id)
        orders = test_get_order_history(token)
        cancelled_order = test_cancel_order(token, order_id)
        
        print("\n✅ All order management integration tests passed!")
        
    except Exception as e:
        print(f"\n❌ Test failed with error: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    run_all_tests()
