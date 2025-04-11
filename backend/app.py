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
from abandoned_carts import abandoned_carts_bp
from segmentation import segmentation_bp
from ab_testing import ab_testing_bp
from marketing import marketing_bp
from predictive import predictive_bp
from utils.db import get_db_connection

# Initialize Flask app
app = Flask(__name__, template_folder='templates')
CORS(app)  # Enable CORS for all routes

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
app.register_blueprint(abandoned_carts_bp)
app.register_blueprint(segmentation_bp)
app.register_blueprint(ab_testing_bp)
app.register_blueprint(marketing_bp)
app.register_blueprint(predictive_bp)

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
    """API endpoint to get all products."""
    products = []
    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        if conn and conn.is_connected():
            cursor = conn.cursor(dictionary=True)
            # Fetching limited fields for the product list/grid view
            cursor.execute("SELECT product_id, name, category, purchase_price, rental_price_12m, image_urls FROM products WHERE stock_quantity > 0 LIMIT 20")
            products = cursor.fetchall()
            # Basic handling for image_urls JSON string if needed for frontend
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

            return jsonify(products)
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
