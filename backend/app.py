"""
GigGatek Backend API Server.
Provides endpoints for products, authentication, orders, and rental management.
"""

from flask import Flask, jsonify, render_template, request
from flask_cors import CORS
from flask_jwt_extended import JWTManager
import mysql.connector
from mysql.connector import Error
import json
import os
from datetime import timedelta

# Import blueprints
from admin.routes import admin_bp
from auth import auth_bp
from orders import orders_bp
from utils.db import get_db_connection

# Initialize Flask app
app = Flask(__name__, template_folder='templates')

# Configure CORS with stricter settings
cors_allowed_origins = os.environ.get('CORS_ALLOWED_ORIGINS', 'http://localhost:3000,https://giggatek.com').split(',')
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

# Register Blueprints
app.register_blueprint(admin_bp)
app.register_blueprint(auth_bp)
app.register_blueprint(orders_bp)
from rentals import rentals_bp
app.register_blueprint(rentals_bp)
from wishlist import wishlist_bp
app.register_blueprint(wishlist_bp)

# Import and register payment blueprints
from payment import payment_bp
app.register_blueprint(payment_bp)

# Import and register push notification blueprints
from push import push_bp
app.register_blueprint(push_bp)

# Using the centralized get_db_connection from utils.db

@app.route('/')
def home():
    """Home route for the backend."""
    return "GigGatek Backend is running!"

@app.route('/db-test')
def db_test():
    """Tests the database connection."""
    conn = get_db_connection()
    if conn and conn.is_connected():
        conn.close()
        return jsonify({"status": "success", "message": "Database connection successful!"})
    else:
        return jsonify({"status": "error", "message": "Database connection failed."}), 500

@app.route('/api/products')
def get_products():
    """API endpoint to get all products with filtering and sorting."""
    products = []
    conn = None
    cursor = None

    # Get query parameters for filtering and sorting
    page = request.args.get('page', 1, type=int)
    limit = request.args.get('limit', 24, type=int)
    sort_by = request.args.get('sort', 'featured')

    # Calculate offset for pagination
    offset = (page - 1) * limit

    # Get filter parameters
    categories = request.args.getlist('category')
    brands = request.args.getlist('brand')
    conditions = request.args.getlist('condition')
    price_min = request.args.get('price_min', 0, type=float)
    price_max = request.args.get('price_max', 10000, type=float)

    try:
        conn = get_db_connection()
        if conn and conn.is_connected():
            cursor = conn.cursor(dictionary=True)

            # Build the base query
            query = """SELECT product_id, name, category, purchase_price, rental_price_12m,
                      condition_rating as condition, image_urls
                      FROM products WHERE stock_quantity > 0"""

            # Add filter conditions
            params = []

            # Category filter
            if categories:
                placeholders = ', '.join(['%s'] * len(categories))
                query += f" AND category IN ({placeholders})"
                params.extend(categories)

            # Brand filter (assuming brand is part of specifications JSON)
            if brands:
                # This is a simplified approach - in a real implementation, you'd need to parse the JSON
                # For now, we'll use a LIKE query which is not optimal but works for demonstration
                brand_conditions = []
                for brand in brands:
                    brand_conditions.append("specifications LIKE %s")
                    params.append(f'%"{brand}"%')

                if brand_conditions:
                    query += " AND (" + " OR ".join(brand_conditions) + ")"

            # Condition filter
            if conditions:
                placeholders = ', '.join(['%s'] * len(conditions))
                query += f" AND condition_rating IN ({placeholders})"
                params.extend(conditions)

            # Price range filter
            query += " AND purchase_price BETWEEN %s AND %s"
            params.extend([price_min, price_max])

            # Add sorting
            if sort_by == 'price-low':
                query += " ORDER BY purchase_price ASC"
            elif sort_by == 'price-high':
                query += " ORDER BY purchase_price DESC"
            elif sort_by == 'newest':
                query += " ORDER BY created_at DESC"
            else:  # Default to 'featured'
                query += " ORDER BY is_featured DESC, product_id ASC"

            # Get total count for pagination
            count_query = query.replace("SELECT product_id, name, category, purchase_price, rental_price_12m, \
                      condition_rating as condition, image_urls", "SELECT COUNT(*) as total")

            cursor.execute(count_query, params)
            result = cursor.fetchone()
            total_products = result['total'] if result else 0

            # Add pagination
            query += " LIMIT %s OFFSET %s"
            params.extend([limit, offset])

            # Execute the final query
            cursor.execute(query, params)
            products = cursor.fetchall()

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
                'total': total_products,
                'page': page,
                'limit': limit,
                'pages': (total_products + limit - 1) // limit  # Ceiling division
            })
        else:
            # Log error or return specific message if connection failed
            print("Database connection failed.")
            return jsonify({"status": "error", "message": "Could not connect to the database."}), 500
    except Error as e:
        print(f"Error fetching products: {e}")
        return jsonify({"status": "error", "message": "Error fetching product data."}), 500
    finally:
        if cursor:
            cursor.close()
        if conn and conn.is_connected():
            conn.close()

@app.route('/api/products/<int:product_id>')
def get_product(product_id):
    """API endpoint to get a product by ID."""
    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        if conn and conn.is_connected():
            cursor = conn.cursor(dictionary=True)
            # Fetch all details for a specific product
            cursor.execute("""
                SELECT product_id, name, description, category, specifications,
                condition_rating, purchase_price, rental_price_3m, rental_price_6m,
                rental_price_12m, stock_quantity, image_urls
                FROM products
                WHERE product_id = %s
            """, (product_id,))

            product = cursor.fetchone()

            if not product:
                return jsonify({"status": "error", "message": "Product not found"}), 404

            # Process JSON fields
            for field in ['specifications', 'image_urls']:
                if product.get(field) and isinstance(product[field], str):
                    try:
                        product[field] = json.loads(product[field])
                    except json.JSONDecodeError:
                        product[field] = None

            # Set primary_image from image_urls if available
            if product.get('image_urls') and isinstance(product['image_urls'], list) and len(product['image_urls']) > 0:
                product['primary_image'] = product['image_urls'][0]
            else:
                product['primary_image'] = None

            return jsonify(product)
        else:
            print("Database connection failed.")
            return jsonify({"status": "error", "message": "Could not connect to the database."}), 500
    except Error as e:
        print(f"Error fetching product: {e}")
        return jsonify({"status": "error", "message": "Error fetching product data."}), 500
    finally:
        if cursor:
            cursor.close()
        if conn and conn.is_connected():
            conn.close()

# Add security headers middleware
@app.after_request
def add_security_headers(response):
    # Prevent browsers from trying to guess the MIME type
    response.headers['X-Content-Type-Options'] = 'nosniff'
    # Prevent clickjacking
    response.headers['X-Frame-Options'] = 'DENY'
    # Enable XSS protection
    response.headers['X-XSS-Protection'] = '1; mode=block'
    # Set strict content security policy
    response.headers['Content-Security-Policy'] = "default-src 'self'; script-src 'self'; object-src 'none'"
    # Set HTTP Strict Transport Security (HSTS)
    response.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'
    return response

# Placeholder product data for development - can be returned when DB is not available
PLACEHOLDER_PRODUCTS = [
    {
        "product_id": 1,
        "name": "Refurbished GPU Model X",
        "category": "GPUs",
        "description": "A powerful refurbished GPU perfect for gaming and professional work.",
        "specifications": {
            "Memory": "8GB GDDR6",
            "Core Clock": "1.8 GHz",
            "CUDA Cores": "3584",
            "Power Consumption": "215W",
            "Outputs": "3x DisplayPort, 1x HDMI",
            "Warranty": "1 Year Limited"
        },
        "condition_rating": "Excellent",
        "purchase_price": 399.99,
        "rental_price_3m": 49.99,
        "rental_price_6m": 44.99,
        "rental_price_12m": 39.99,
        "primary_image": None
    },
    {
        "product_id": 2,
        "name": "Refurbished CPU Model Y",
        "category": "CPUs",
        "purchase_price": 249.99,
        "rental_price_12m": 24.99,
        "primary_image": None
    },
    {
        "product_id": 3,
        "name": "Refurbished System Z",
        "category": "Systems",
        "purchase_price": 899.99,
        "rental_price_12m": 89.99,
        "primary_image": None
    }
]

if __name__ == '__main__':
    # Note: For production, use a proper WSGI server like Gunicorn or uWSGI
    # integrated with Apache2 using mod_wsgi or a reverse proxy setup.
    app.run(debug=True) # debug=True is not suitable for production
