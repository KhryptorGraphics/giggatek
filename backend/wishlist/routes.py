from flask import Blueprint, request, jsonify
from ..utils.db import get_db_connection
from ..auth.routes import token_required

wishlist_bp = Blueprint('wishlist', __name__)

@wishlist_bp.route('/', methods=['GET'])
@token_required
def get_wishlist():
    """
    Get all wishlist items for the authenticated user
    """
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        # Get wishlist items with product details
        cursor.execute("""
            SELECT 
                w.wishlist_item_id, w.user_id, w.product_id, w.added_at,
                p.name, p.description, p.category, p.condition_rating,
                p.purchase_price, p.rental_price_3m, p.rental_price_6m, p.rental_price_12m,
                p.image_urls
            FROM wishlist_items w
            JOIN products p ON w.product_id = p.product_id
            WHERE w.user_id = %s
            ORDER BY w.added_at DESC
        """, (request.user_id,))
        
        wishlist_items = cursor.fetchall()
        
        # Process image URLs
        for item in wishlist_items:
            if item.get('image_urls'):
                try:
                    import json
                    # Assuming image_urls is stored as a JSON array string
                    image_list = json.loads(item['image_urls'])
                    # Use the first image as the primary image for the list view
                    item['primary_image'] = image_list[0] if image_list else None
                except json.JSONDecodeError:
                    item['primary_image'] = None # Handle potential malformed JSON
            else:
                item['primary_image'] = None
        
        cursor.close()
        conn.close()
        
        return jsonify({
            'success': True,
            'items': wishlist_items
        }), 200
    
    except Exception as e:
        cursor.close()
        conn.close()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@wishlist_bp.route('/', methods=['POST'])
@token_required
def add_to_wishlist():
    """
    Add a product to the user's wishlist
    """
    data = request.get_json()
    
    # Validate required fields
    if 'product_id' not in data:
        return jsonify({
            'success': False,
            'error': 'Product ID is required'
        }), 400
    
    product_id = data['product_id']
    
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        # Check if product exists
        cursor.execute("SELECT product_id FROM products WHERE product_id = %s", (product_id,))
        product = cursor.fetchone()
        
        if not product:
            cursor.close()
            conn.close()
            return jsonify({
                'success': False,
                'error': 'Product not found'
            }), 404
        
        # Check if item is already in wishlist
        cursor.execute(
            "SELECT wishlist_item_id FROM wishlist_items WHERE user_id = %s AND product_id = %s",
            (request.user_id, product_id)
        )
        
        existing_item = cursor.fetchone()
        
        if existing_item:
            cursor.close()
            conn.close()
            return jsonify({
                'success': True,
                'message': 'Item already in wishlist'
            }), 200
        
        # Add to wishlist
        cursor.execute(
            "INSERT INTO wishlist_items (user_id, product_id) VALUES (%s, %s)",
            (request.user_id, product_id)
        )
        
        conn.commit()
        
        wishlist_item_id = cursor.lastrowid
        
        cursor.close()
        conn.close()
        
        return jsonify({
            'success': True,
            'message': 'Item added to wishlist',
            'wishlist_item_id': wishlist_item_id
        }), 201
    
    except Exception as e:
        conn.rollback()
        cursor.close()
        conn.close()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@wishlist_bp.route('/<int:product_id>', methods=['DELETE'])
@token_required
def remove_from_wishlist(product_id):
    """
    Remove a product from the user's wishlist
    """
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        # Check if item is in wishlist
        cursor.execute(
            "SELECT wishlist_item_id FROM wishlist_items WHERE user_id = %s AND product_id = %s",
            (request.user_id, product_id)
        )
        
        existing_item = cursor.fetchone()
        
        if not existing_item:
            cursor.close()
            conn.close()
            return jsonify({
                'success': False,
                'error': 'Item not found in wishlist'
            }), 404
        
        # Remove from wishlist
        cursor.execute(
            "DELETE FROM wishlist_items WHERE user_id = %s AND product_id = %s",
            (request.user_id, product_id)
        )
        
        conn.commit()
        
        cursor.close()
        conn.close()
        
        return jsonify({
            'success': True,
            'message': 'Item removed from wishlist'
        }), 200
    
    except Exception as e:
        conn.rollback()
        cursor.close()
        conn.close()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500
