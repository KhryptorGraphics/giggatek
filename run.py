"""
GigGatek Backend API Server Runner.
This script runs the Flask application.
"""

import os
import sys
import flask
from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_jwt_extended import JWTManager
import sqlite3
import json
from datetime import timedelta

# Initialize Flask app
app = Flask(__name__, template_folder='backend/templates')

# Configure CORS with stricter settings
cors_allowed_origins = os.environ.get('CORS_ALLOWED_ORIGINS', 'http://localhost:8000,http://localhost:3000,https://giggatek.com').split(',')
cors_allowed_methods = ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
cors_allowed_headers = ['Content-Type', 'Authorization', 'X-Requested-With']
cors_max_age = 86400  # 24 hours

CORS(app,
     resources={r"/*": {"origins": cors_allowed_origins}},
     methods=cors_allowed_methods,
     allow_headers=cors_allowed_headers,
     supports_credentials=True,
     max_age=cors_max_age)

# Configure JWT
app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', 'giggatek-dev-key-change-in-production')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=1)
app.config['JWT_REFRESH_TOKEN_EXPIRES'] = timedelta(days=30)
jwt = JWTManager(app)

# Database Configuration
def get_db_connection():
    """
    Establishes a connection to the SQLite database.

    Returns:
        A SQLite connection object if successful, None otherwise.
    """
    # Use SQLite for development
    db_file = 'giggatek.db'

    conn = None
    try:
        conn = sqlite3.connect(db_file)
        conn.row_factory = sqlite3.Row  # This allows accessing columns by name
        print(f"Connected to SQLite database: {db_file}")
    except sqlite3.Error as e:
        print(f"Error connecting to SQLite Database: {e}")
    return conn

@app.route('/')
def home():
    """Home route for the backend."""
    return "GigGatek Backend is running!"

@app.route('/db-test')
def db_test():
    """Tests the database connection."""
    conn = get_db_connection()
    if conn:
        conn.close()
        return jsonify({"status": "success", "message": "Database connection successful!"})
    else:
        return jsonify({"status": "error", "message": "Database connection failed."}), 500

@app.route('/api/products')
def get_products():
    """API endpoint to get all products with filtering and sorting."""
    products = []
    conn = None

    # Get query parameters for filtering and sorting
    page = request.args.get('page', 1, type=int)
    limit = request.args.get('limit', 24, type=int)
    sort_by = request.args.get('sort', 'featured')

    # Calculate offset for pagination
    offset = (page - 1) * limit

    try:
        conn = get_db_connection()
        if conn:
            # Create the products table if it doesn't exist
            conn.execute('''
                CREATE TABLE IF NOT EXISTS products (
                    product_id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL,
                    category TEXT NOT NULL,
                    purchase_price REAL NOT NULL,
                    rental_price_12m REAL,
                    condition_rating TEXT NOT NULL,
                    stock_quantity INTEGER DEFAULT 0,
                    is_featured INTEGER DEFAULT 0,
                    image_urls TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ''')

            # Check if we have any products, if not, insert some sample data
            cursor = conn.execute("SELECT COUNT(*) FROM products")
            count = cursor.fetchone()[0]

            if count == 0:
                # Insert sample products
                sample_products = [
                    ('Refurbished GPU Model X', 'GPUs', 399.99, 39.99, 'Excellent', 5, 1, '["img/products/gpu_x_1.jpg", "img/products/gpu_x_2.jpg"]'),
                    ('Refurbished CPU Model Y', 'CPUs', 249.99, 24.99, 'Good', 8, 1, '["img/products/cpu_y_1.jpg"]'),
                    ('Refurbished System Z', 'Systems', 899.99, 79.99, 'Excellent', 3, 1, '["img/products/system_z_1.jpg", "img/products/system_z_2.jpg"]')
                ]

                conn.executemany('''
                    INSERT INTO products (name, category, purchase_price, rental_price_12m, condition_rating, stock_quantity, is_featured, image_urls)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                ''', sample_products)
                conn.commit()

            # Build the base query
            query = """SELECT product_id, name, category, purchase_price, rental_price_12m,
                      condition_rating as condition, image_urls
                      FROM products WHERE stock_quantity > 0"""

            # Add sorting
            if sort_by == 'price-low':
                query += " ORDER BY purchase_price ASC"
            elif sort_by == 'price-high':
                query += " ORDER BY purchase_price DESC"
            elif sort_by == 'newest':
                query += " ORDER BY created_at DESC"
            else:  # Default to 'featured'
                query += " ORDER BY is_featured DESC, product_id ASC"

            # Add pagination
            query += " LIMIT ? OFFSET ?"

            # Execute the final query
            cursor = conn.execute(query, (limit, offset))
            products = [dict(row) for row in cursor.fetchall()]

            # Process image URLs
            for product in products:
                if product.get('image_urls'):
                    try:
                        # Assuming image_urls is stored as a JSON array string
                        image_list = json.loads(product['image_urls'])
                        # Use the first image as the primary image for the list view
                        product['primary_image'] = image_list[0] if image_list else None
                    except json.JSONDecodeError:
                        product['primary_image'] = None # Handle potential malformed JSON
                else:
                    product['primary_image'] = None

            # Return products with pagination info
            return jsonify({
                'products': products,
                'total': len(products),
                'page': page,
                'limit': limit,
                'pages': (len(products) + limit - 1) // limit  # Ceiling division
            })
        else:
            # Log error or return specific message if connection failed
            print("Database connection failed.")
            return jsonify({"status": "error", "message": "Could not connect to the database."}), 500
    except sqlite3.Error as e:
        print(f"Error fetching products: {e}")
        return jsonify({"status": "error", "message": "Error fetching product data."}), 500
    finally:
        if conn:
            conn.close()

if __name__ == '__main__':
    # Run the Flask app
    app.run(host='0.0.0.0', port=5000, debug=True)
