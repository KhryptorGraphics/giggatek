#!/bin/bash
# GigGatek Integration Testing Environment Setup
# This script sets up a complete testing environment for integration testing

echo "Setting up GigGatek Integration Testing Environment"

# Create tests directory structure if it doesn't exist
mkdir -p tests/integration/auth
mkdir -p tests/integration/orders
mkdir -p tests/integration/rentals
mkdir -p tests/integration/email
mkdir -p tests/results

# Set up test database
echo "Setting up test database..."

# Check if MySQL client is installed
if ! command -v mysql &> /dev/null; then
    echo "MySQL client not found, please install it first"
    exit 1
fi

# Database configuration
DB_HOST="localhost"
DB_USER="root"
read -sp "Enter MySQL root password: " DB_PASS
echo ""  # Add a newline after password input

# Create test database and user
mysql -h $DB_HOST -u $DB_USER -p$DB_PASS <<EOF
CREATE DATABASE IF NOT EXISTS giggatek_test;
CREATE USER IF NOT EXISTS 'giggatek_test'@'localhost' IDENTIFIED BY 'test_password';
GRANT ALL PRIVILEGES ON giggatek_test.* TO 'giggatek_test'@'localhost';
FLUSH PRIVILEGES;
EOF

# Import database schema
echo "Importing database schema..."
mysql -h $DB_HOST -u $DB_USER -p$DB_PASS giggatek_test < backend/database/auth_schema.sql
mysql -h $DB_HOST -u $DB_USER -p$DB_PASS giggatek_test < backend/database/orders_schema.sql
mysql -h $DB_HOST -u $DB_USER -p$DB_PASS giggatek_test < backend/database/rentals_schema.sql

# Set up test environment configuration
echo "Creating test environment configuration..."
cat > .env.test <<EOF
# GigGatek Test Environment Configuration

# Database Configuration
DB_HOST=localhost
DB_USER=giggatek_test
DB_PASS=test_password
DB_NAME=giggatek_test

# Authentication Configuration
JWT_SECRET=test_jwt_secret_key_do_not_use_in_production
TOKEN_EXPIRATION=60

# Email Configuration
SMTP_HOST=localhost
SMTP_PORT=1025
SMTP_USER=
SMTP_PASS=
EMAIL_FROM=test@giggatek.com
EMAIL_FROM_NAME=GigGatek Test

# Stripe Configuration
STRIPE_PUBLIC_KEY=pk_test_51ABCDEFghijklmnopqrstuvwxyz1234567890abcdefghijk
STRIPE_SECRET_KEY=sk_test_51ABCDEFghijklmnopqrstuvwxyz1234567890abcdefghijk
STRIPE_WEBHOOK_SECRET=whsec_test_12345678901234567890abcdefghijklmnopqrstuv

# Test Configuration
TEST_MODE=true
LOG_LEVEL=debug
EOF

# Set up MailHog for email testing
echo "Setting up MailHog for email testing..."
if command -v docker &> /dev/null; then
    docker pull mailhog/mailhog
    docker run -d --name mailhog -p 1025:1025 -p 8025:8025 mailhog/mailhog
    echo "MailHog running at http://localhost:8025"
else
    echo "Docker not found, skipping MailHog setup"
    echo "Please install MailHog manually for email testing"
fi

# Install Python test dependencies
echo "Installing Python test dependencies..."
pip install pytest requests pytest-html pymysql pytest-dotenv faker

# Create test data generation script
echo "Creating test data generator script..."
cat > tests/generate_test_data.py <<EOF
#!/usr/bin/env python
"""
Test Data Generator for GigGatek Integration Testing
This script populates the test database with data needed for integration tests
"""
import sys
import os
import pymysql
import bcrypt
import json
from datetime import datetime, timedelta
from faker import Faker

# Initialize Faker
fake = Faker()

# Load environment variables
env_file = '.env.test'
env_vars = {}
with open(env_file, 'r') as f:
    for line in f:
        line = line.strip()
        if line and not line.startswith('#'):
            key, value = line.split('=', 1)
            env_vars[key] = value

# Database connection
def get_db_connection():
    return pymysql.connect(
        host=env_vars.get('DB_HOST', 'localhost'),
        user=env_vars.get('DB_USER', 'giggatek_test'),
        password=env_vars.get('DB_PASS', 'test_password'),
        database=env_vars.get('DB_NAME', 'giggatek_test'),
        charset='utf8mb4',
        cursorclass=pymysql.cursors.DictCursor
    )

def create_test_users():
    """Create test users with various roles and states"""
    print("Creating test users...")
    
    # User data
    users = [
        {
            'email': 'admin@test.com',
            'password': 'Admin123!',
            'first_name': 'Admin',
            'last_name': 'User',
            'is_admin': True
        },
        {
            'email': 'customer@test.com',
            'password': 'Customer123!',
            'first_name': 'Regular',
            'last_name': 'Customer',
            'is_admin': False
        },
        {
            'email': 'new@test.com',
            'password': 'NewUser123!',
            'first_name': 'New',
            'last_name': 'User',
            'is_admin': False
        }
    ]
    
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            # Clear existing users
            cursor.execute("TRUNCATE TABLE users")
            
            # Insert new users
            for user in users:
                hashed_password = bcrypt.hashpw(user['password'].encode('utf-8'), bcrypt.gensalt())
                cursor.execute(
                    "INSERT INTO users (email, password_hash, first_name, last_name, is_admin) VALUES (%s, %s, %s, %s, %s)",
                    (user['email'], hashed_password, user['first_name'], user['last_name'], user['is_admin'])
                )
                print(f"Created user: {user['email']}")
        
        conn.commit()
    finally:
        conn.close()

def create_test_products():
    """Create test products for orders and rentals"""
    print("Creating test products...")
    
    products = [
        {
            'name': 'Professional Laptop',
            'description': 'High-performance laptop for professionals',
            'category': 'Laptops',
            'price': 1299.99,
            'rental_eligible': True,
            'stock': 10,
            'specifications': json.dumps({
                'processor': 'Intel Core i7',
                'ram': '16GB',
                'storage': '512GB SSD',
                'screen': '15.6 inch'
            })
        },
        {
            'name': 'Budget Desktop PC',
            'description': 'Affordable desktop computer',
            'category': 'Desktops',
            'price': 699.99,
            'rental_eligible': True,
            'stock': 15,
            'specifications': json.dumps({
                'processor': 'AMD Ryzen 5',
                'ram': '8GB',
                'storage': '1TB HDD',
                'graphics': 'Integrated'
            })
        },
        {
            'name': 'Gaming Keyboard',
            'description': 'Mechanical RGB gaming keyboard',
            'category': 'Accessories',
            'price': 129.99,
            'rental_eligible': False,
            'stock': 30,
            'specifications': json.dumps({
                'type': 'Mechanical',
                'switches': 'Cherry MX Red',
                'backlight': 'RGB',
                'connectivity': 'USB-C'
            })
        },
        {
            'name': 'Professional Monitor',
            'description': '4K monitor for professional work',
            'category': 'Monitors',
            'price': 499.99,
            'rental_eligible': True,
            'stock': 8,
            'specifications': json.dumps({
                'size': '27 inch',
                'resolution': '3840x2160',
                'panel': 'IPS',
                'refresh_rate': '60Hz'
            })
        },
        {
            'name': 'External Hard Drive',
            'description': 'Portable external storage',
            'category': 'Storage',
            'price': 89.99,
            'rental_eligible': False,
            'stock': 25,
            'specifications': json.dumps({
                'capacity': '2TB',
                'interface': 'USB 3.0',
                'form_factor': '2.5 inch',
                'speed': '5400 RPM'
            })
        }
    ]
    
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            # Clear existing products
            cursor.execute("TRUNCATE TABLE products")
            
            # Insert new products
            for product in products:
                cursor.execute(
                    "INSERT INTO products (name, description, category, price, rental_eligible, stock, specifications) "
                    "VALUES (%s, %s, %s, %s, %s, %s, %s)",
                    (
                        product['name'], 
                        product['description'], 
                        product['category'], 
                        product['price'], 
                        product['rental_eligible'], 
                        product['stock'], 
                        product['specifications']
                    )
                )
                print(f"Created product: {product['name']}")
        
        conn.commit()
    finally:
        conn.close()

def create_test_addresses():
    """Create test addresses for users"""
    print("Creating test addresses...")
    
    # Get user IDs
    conn = get_db_connection()
    user_ids = []
    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT id FROM users")
            user_ids = [row['id'] for row in cursor.fetchall()]
    finally:
        conn.close()
    
    # Create addresses for each user
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            # Clear existing addresses
            cursor.execute("TRUNCATE TABLE addresses")
            
            # Create 1-2 addresses per user
            for user_id in user_ids:
                # Primary address
                cursor.execute(
                    "INSERT INTO addresses (user_id, address_line1, address_line2, city, state, postal_code, country, is_default) "
                    "VALUES (%s, %s, %s, %s, %s, %s, %s, %s)",
                    (
                        user_id,
                        fake.street_address(),
                        fake.secondary_address() if fake.boolean(chance_of_getting_true=30) else None,
                        fake.city(),
                        fake.state_abbr(),
                        fake.zipcode(),
                        'USA',
                        True
                    )
                )
                
                # Secondary address (30% chance)
                if fake.boolean(chance_of_getting_true=30):
                    cursor.execute(
                        "INSERT INTO addresses (user_id, address_line1, address_line2, city, state, postal_code, country, is_default) "
                        "VALUES (%s, %s, %s, %s, %s, %s, %s, %s)",
                        (
                            user_id,
                            fake.street_address(),
                            fake.secondary_address() if fake.boolean(chance_of_getting_true=30) else None,
                            fake.city(),
                            fake.state_abbr(),
                            fake.zipcode(),
                            'USA',
                            False
                        )
                    )
            
            print(f"Created addresses for {len(user_ids)} users")
        
        conn.commit()
    finally:
        conn.close()

def create_test_orders():
    """Create test orders with various statuses"""
    print("Creating test orders...")
    
    # Get user IDs and address IDs
    conn = get_db_connection()
    users_addresses = []
    product_ids = []
    try:
        with conn.cursor() as cursor:
            # Get users and their addresses
            cursor.execute("SELECT u.id as user_id, a.id as address_id FROM users u JOIN addresses a ON u.id = a.user_id WHERE a.is_default = 1")
            users_addresses = cursor.fetchall()
            
            # Get product IDs
            cursor.execute("SELECT id, price FROM products")
            products = cursor.fetchall()
            product_ids = products
    finally:
        conn.close()
    
    # Order statuses
    statuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']
    payment_statuses = ['pending', 'paid', 'refunded', 'failed']
    
    # Create orders
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            # Clear existing orders and items
            cursor.execute("TRUNCATE TABLE order_items")
            cursor.execute("TRUNCATE TABLE orders")
            
            # Create 5-10 orders
            for i in range(fake.random_int(min=5, max=10)):
                # Select random user and address
                user_address = fake.random_element(users_addresses)
                user_id = user_address['user_id']
                address_id = user_address['address_id']
                
                # Determine order status
                status = fake.random_element(statuses)
                payment_status = 'paid' if status in ['processing', 'shipped', 'delivered'] else fake.random_element(payment_statuses)
                
                # Create order date (between 1-60 days ago)
                order_date = datetime.now() - timedelta(days=fake.random_int(min=1, max=60))
                
                # Create 1-5 order items
                items = []
                total = 0
                for j in range(fake.random_int(min=1, max=5)):
                    product = fake.random_element(product_ids)
                    quantity = fake.random_int(min=1, max=3)
                    item_total = product['price'] * quantity
                    total += item_total
                    items.append({
                        'product_id': product['id'],
                        'quantity': quantity,
                        'price': product['price'],
                        'total': item_total
                    })
                
                # Insert order
                cursor.execute(
                    "INSERT INTO orders (user_id, date, total, status, payment_status, shipping_address_id, billing_address_id, shipping_method) "
                    "VALUES (%s, %s, %s, %s, %s, %s, %s, %s)",
                    (
                        user_id,
                        order_date,
                        total,
                        status,
                        payment_status,
                        address_id,
                        address_id,
                        fake.random_element(['standard', 'express'])
                    )
                )
                order_id = cursor.lastrowid
                
                # Insert order items
                for item in items:
                    cursor.execute(
                        "INSERT INTO order_items (order_id, product_id, quantity, price, total) VALUES (%s, %s, %s, %s, %s)",
                        (order_id, item['product_id'], item['quantity'], item['price'], item['total'])
                    )
            
            print(f"Created {i+1} test orders")
        
        conn.commit()
    finally:
        conn.close()

def create_test_rentals():
    """Create test rental contracts with various statuses"""
    print("Creating test rentals...")
    
    # Get user IDs, address IDs, and rental-eligible products
    conn = get_db_connection()
    users_addresses = []
    rental_products = []
    try:
        with conn.cursor() as cursor:
            # Get users and their addresses
            cursor.execute("SELECT u.id as user_id, a.id as address_id FROM users u JOIN addresses a ON u.id = a.user_id WHERE a.is_default = 1")
            users_addresses = cursor.fetchall()
            
            # Get rental-eligible products
            cursor.execute("SELECT id, price FROM products WHERE rental_eligible = 1")
            rental_products = cursor.fetchall()
    finally:
        conn.close()
    
    # Rental contract statuses
    statuses = ['pending', 'active', 'completed', 'cancelled']
    
    # Create rentals
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            # Clear existing rentals
            cursor.execute("TRUNCATE TABLE rental_payments")
            cursor.execute("TRUNCATE TABLE rentals")
            
            # Create 3-7 rentals
            for i in range(fake.random_int(min=3, max=7)):
                # Select random user and address
                user_address = fake.random_element(users_addresses)
                user_id = user_address['user_id']
                address_id = user_address['address_id']
                
                # Select random rental product
                product = fake.random_element(rental_products)
                product_id = product['id']
                
                # Determine rental status
                status = fake.random_element(statuses)
                
                # Rental terms
                total_months = fake.random_element([6, 12, 24])
                monthly_rate = round(product['price'] * 0.1, 2)  # 10% of product price per month
                total_amount = monthly_rate * total_months
                
                # Create start date (between 1-180 days ago)
                start_date = datetime.now() - timedelta(days=fake.random_int(min=1, max=180))
                end_date = start_date + timedelta(days=30 * total_months)
                
                # Determine payments made based on status and start date
                payments_made = 0
                if status in ['active', 'completed']:
                    # Calculate months elapsed
                    months_elapsed = (datetime.now() - start_date).days // 30
                    payments_made = min(months_elapsed, total_months)
                    if status == 'completed':
                        payments_made = total_months
                
                remaining_payments = total_months - payments_made
                
                # Next payment date if active
                next_payment_date = None
                if status == 'active' and remaining_payments > 0:
                    next_payment_date = start_date + timedelta(days=30 * payments_made)
                
                # Insert rental contract
                cursor.execute(
                    "INSERT INTO rentals (user_id, product_id, start_date, end_date, monthly_rate, total_months, "
                    "total_amount, status, payments_made, remaining_payments, next_payment_date, address_id) "
                    "VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)",
                    (
                        user_id,
                        product_id,
                        start_date,
                        end_date,
                        monthly_rate,
                        total_months,
                        total_amount,
                        status,
                        payments_made,
                        remaining_payments,
                        next_payment_date,
                        address_id
                    )
                )
                rental_id = cursor.lastrowid
                
                # Create payment records for past payments
                for payment_num in range(1, payments_made + 1):
                    payment_date = start_date + timedelta(days=30 * (payment_num - 1))
                    cursor.execute(
                        "INSERT INTO rental_payments (rental_id, payment_number, amount, payment_date, status) "
                        "VALUES (%s, %s, %s, %s, %s)",
                        (rental_id, payment_num, monthly_rate, payment_date, 'paid')
                    )
            
            print(f"Created {i+1} test rentals")
        
        conn.commit()
    finally:
        conn.close()

def main():
    """Main execution function"""
    print("Generating test data for GigGatek integration testing...")
    
    # Create test data in sequence
    create_test_users()
    create_test_products()
    create_test_addresses()
    create_test_orders()
    create_test_rentals()
    
    print("Test data generation complete!")

if __name__ == "__main__":
    main()
EOF

# Make test data generator script executable
chmod +x tests/generate_test_data.py

echo "Test environment setup complete!"
echo "To finalize setup:"
echo "1. Run 'python tests/generate_test_data.py' to populate the test database"
echo "2. Start the backend server with the test configuration:"
echo "   cd backend && python app.py --config=../.env.test"
echo "3. Start the frontend server: cd frontend && php -S localhost:8000"
echo "4. Run integration tests: cd tests && pytest integration/"

exit 0
