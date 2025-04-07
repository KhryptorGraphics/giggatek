from flask import Blueprint, request, jsonify
from ..utils.db import get_db_connection
from ..auth.routes import token_required

orders_bp = Blueprint('orders', __name__)

@orders_bp.route('/', methods=['GET'])
@token_required
def get_user_orders():
    """
    Get all orders for the authenticated user
    """
    # Get query parameters for filtering and pagination
    status = request.args.get('status')
    page = int(request.args.get('page', 1))
    per_page = min(int(request.args.get('per_page', 10)), 50)  # Limit to 50 max
    
    # Calculate offset for pagination
    offset = (page - 1) * per_page
    
    # Construct the base query
    query = """
        SELECT 
            o.id, o.user_id, o.order_date, o.total, o.status, o.payment_status, 
            o.shipping_address_id, o.billing_address_id, o.shipping_method,
            o.tracking_number, o.notes
        FROM orders o
        WHERE o.user_id = %s
    """
    
    count_query = """
        SELECT COUNT(*) as total
        FROM orders
        WHERE user_id = %s
    """
    
    query_params = [request.user_id]
    count_params = [request.user_id]
    
    # Add status filter if provided
    if status:
        query += " AND o.status = %s"
        count_query += " AND status = %s"
        query_params.append(status)
        count_params.append(status)
    
    # Add sorting and pagination
    query += " ORDER BY o.order_date DESC LIMIT %s OFFSET %s"
    query_params.extend([per_page, offset])
    
    # Execute queries
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        # Get total count
        cursor.execute(count_query, count_params)
        total_count = cursor.fetchone()['total']
        
        # Get paginated results
        cursor.execute(query, query_params)
        orders = cursor.fetchall()
        
        # For each order, get the order items
        for order in orders:
            cursor.execute("""
                SELECT 
                    oi.id, oi.product_id, oi.quantity, oi.price, oi.subtotal,
                    p.name as product_name, p.image_url
                FROM order_items oi
                JOIN products p ON oi.product_id = p.id
                WHERE oi.order_id = %s
            """, (order['id'],))
            order['items'] = cursor.fetchall()
        
        cursor.close()
        conn.close()
        
        # Calculate pagination metadata
        total_pages = (total_count + per_page - 1) // per_page  # Ceiling division
        
        return jsonify({
            'orders': orders,
            'pagination': {
                'total': total_count,
                'page': page,
                'per_page': per_page,
                'total_pages': total_pages
            }
        }), 200
    
    except Exception as e:
        cursor.close()
        conn.close()
        return jsonify({'error': str(e)}), 500

@orders_bp.route('/<int:order_id>', methods=['GET'])
@token_required
def get_order_details(order_id):
    """
    Get detailed information for a specific order
    """
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        # Get the order
        cursor.execute("""
            SELECT 
                o.id, o.user_id, o.order_date, o.total, o.status, o.payment_status, 
                o.shipping_address_id, o.billing_address_id, o.shipping_method,
                o.tracking_number, o.notes
            FROM orders o
            WHERE o.id = %s AND o.user_id = %s
        """, (order_id, request.user_id))
        
        order = cursor.fetchone()
        
        if not order:
            cursor.close()
            conn.close()
            return jsonify({'error': 'Order not found or access denied'}), 404
        
        # Get the order items
        cursor.execute("""
            SELECT 
                oi.id, oi.product_id, oi.quantity, oi.price, oi.subtotal,
                p.name as product_name, p.image_url, p.sku
            FROM order_items oi
            JOIN products p ON oi.product_id = p.id
            WHERE oi.order_id = %s
        """, (order_id,))
        
        order['items'] = cursor.fetchall()
        
        # Get the shipping address
        if order['shipping_address_id']:
            cursor.execute("""
                SELECT 
                    id, first_name, last_name, street_address, city, 
                    state, zip_code, country, phone
                FROM addresses
                WHERE id = %s
            """, (order['shipping_address_id'],))
            
            order['shipping_address'] = cursor.fetchone()
        
        # Get the billing address
        if order['billing_address_id']:
            cursor.execute("""
                SELECT 
                    id, first_name, last_name, street_address, city, 
                    state, zip_code, country, phone
                FROM addresses
                WHERE id = %s
            """, (order['billing_address_id'],))
            
            order['billing_address'] = cursor.fetchone()
        
        # Get payment information
        cursor.execute("""
            SELECT 
                id, order_id, payment_method, amount, status, 
                transaction_id, created_at
            FROM payments
            WHERE order_id = %s
            ORDER BY created_at DESC
        """, (order_id,))
        
        order['payments'] = cursor.fetchall()
        
        # Get order history/status changes
        cursor.execute("""
            SELECT 
                id, order_id, status, notes, created_at, created_by
            FROM order_status_history
            WHERE order_id = %s
            ORDER BY created_at DESC
        """, (order_id,))
        
        order['status_history'] = cursor.fetchall()
        
        cursor.close()
        conn.close()
        
        return jsonify({'order': order}), 200
    
    except Exception as e:
        cursor.close()
        conn.close()
        return jsonify({'error': str(e)}), 500

@orders_bp.route('/', methods=['POST'])
@token_required
def create_order():
    """
    Create a new order
    """
    data = request.get_json()
    
    # Validate required fields
    required_fields = ['items', 'shipping_address_id', 'billing_address_id', 'shipping_method']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'Missing required field: {field}'}), 400
    
    # Validate items format
    if not isinstance(data['items'], list) or len(data['items']) == 0:
        return jsonify({'error': 'Items must be a non-empty array of product IDs and quantities'}), 400
    
    for item in data['items']:
        if 'product_id' not in item or 'quantity' not in item:
            return jsonify({'error': 'Each item must have product_id and quantity'}), 400
    
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        # Start a transaction
        conn.start_transaction()
        
        # Verify product availability and get prices
        product_ids = [item['product_id'] for item in data['items']]
        placeholders = ', '.join(['%s'] * len(product_ids))
        
        cursor.execute(f"""
            SELECT id, name, price, inventory_count
            FROM products
            WHERE id IN ({placeholders})
        """, product_ids)
        
        products = {product['id']: product for product in cursor.fetchall()}
        
        # Check if all products exist and are in stock
        for item in data['items']:
            product_id = item['product_id']
            quantity = item['quantity']
            
            if product_id not in products:
                conn.rollback()
                cursor.close()
                conn.close()
                return jsonify({
                    'error': f'Product with ID {product_id} not found'
                }), 404
            
            if products[product_id]['inventory_count'] < quantity:
                conn.rollback()
                cursor.close()
                conn.close()
                return jsonify({
                    'error': f"Insufficient stock for {products[product_id]['name']}. "
                             f"Available: {products[product_id]['inventory_count']}, Requested: {quantity}"
                }), 400
        
        # Calculate order total
        total = sum(products[item['product_id']]['price'] * item['quantity'] for item in data['items'])
        
        # Create the order
        cursor.execute("""
            INSERT INTO orders (
                user_id, order_date, total, status, payment_status,
                shipping_address_id, billing_address_id, shipping_method
            ) VALUES (%s, NOW(), %s, 'pending', 'pending', %s, %s, %s)
        """, (
            request.user_id,
            total,
            data['shipping_address_id'],
            data['billing_address_id'],
            data['shipping_method']
        ))
        
        order_id = cursor.lastrowid
        
        # Add order items
        for item in data['items']:
            product_id = item['product_id']
            quantity = item['quantity']
            price = products[product_id]['price']
            subtotal = price * quantity
            
            cursor.execute("""
                INSERT INTO order_items (
                    order_id, product_id, quantity, price, subtotal
                ) VALUES (%s, %s, %s, %s, %s)
            """, (
                order_id,
                product_id,
                quantity,
                price,
                subtotal
            ))
            
            # Update inventory
            cursor.execute("""
                UPDATE products
                SET inventory_count = inventory_count - %s
                WHERE id = %s
            """, (quantity, product_id))
        
        # Add initial status history
        cursor.execute("""
            INSERT INTO order_status_history (
                order_id, status, notes, created_at, created_by
            ) VALUES (%s, 'pending', 'Order created', NOW(), %s)
        """, (
            order_id,
            f"User {request.user_id}"
        ))
        
        # Commit the transaction
        conn.commit()
        
        # Get the created order
        cursor.execute("""
            SELECT 
                id, user_id, order_date, total, status, payment_status,
                shipping_address_id, billing_address_id, shipping_method
            FROM orders
            WHERE id = %s
        """, (order_id,))
        
        new_order = cursor.fetchone()
        
        cursor.close()
        conn.close()
        
        return jsonify({
            'message': 'Order created successfully',
            'order': new_order
        }), 201
    
    except Exception as e:
        conn.rollback()
        cursor.close()
        conn.close()
        return jsonify({'error': str(e)}), 500

@orders_bp.route('/<int:order_id>/cancel', methods=['POST'])
@token_required
def cancel_order(order_id):
    """
    Cancel an order
    """
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        # Check if the order exists and belongs to the user
        cursor.execute("""
            SELECT id, status, payment_status
            FROM orders
            WHERE id = %s AND user_id = %s
        """, (order_id, request.user_id))
        
        order = cursor.fetchone()
        
        if not order:
            cursor.close()
            conn.close()
            return jsonify({'error': 'Order not found or access denied'}), 404
        
        # Check if the order can be cancelled
        if order['status'] not in ['pending', 'processing']:
            cursor.close()
            conn.close()
            return jsonify({
                'error': f"Cannot cancel order with status '{order['status']}'"
            }), 400
        
        # Start a transaction
        conn.start_transaction()
        
        # Update order status
        cursor.execute("""
            UPDATE orders
            SET status = 'cancelled'
            WHERE id = %s
        """, (order_id,))
        
        # Get order items to restore inventory
        cursor.execute("""
            SELECT product_id, quantity
            FROM order_items
            WHERE order_id = %s
        """, (order_id,))
        
        items = cursor.fetchall()
        
        # Restore inventory
        for item in items:
            cursor.execute("""
                UPDATE products
                SET inventory_count = inventory_count + %s
                WHERE id = %s
            """, (item['quantity'], item['product_id']))
        
        # Add status history entry
        cursor.execute("""
            INSERT INTO order_status_history (
                order_id, status, notes, created_at, created_by
            ) VALUES (%s, 'cancelled', 'Order cancelled by customer', NOW(), %s)
        """, (
            order_id,
            f"User {request.user_id}"
        ))
        
        # Commit the transaction
        conn.commit()
        
        cursor.close()
        conn.close()
        
        return jsonify({
            'message': 'Order cancelled successfully'
        }), 200
    
    except Exception as e:
        conn.rollback()
        cursor.close()
        conn.close()
        return jsonify({'error': str(e)}), 500

@orders_bp.route('/<int:order_id>/status', methods=['PUT'])
@token_required
def update_order_status(order_id):
    """
    Update order status (admin only)
    """
    # Check if user is admin
    if not request.is_admin:
        return jsonify({'error': 'Admin privileges required'}), 403
    
    data = request.get_json()
    
    if 'status' not in data:
        return jsonify({'error': 'Status field is required'}), 400
    
    new_status = data['status']
    notes = data.get('notes', '')
    
    # Validate status
    valid_statuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']
    if new_status not in valid_statuses:
        return jsonify({'error': f'Invalid status. Must be one of: {", ".join(valid_statuses)}'}), 400
    
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        # Check if the order exists
        cursor.execute("""
            SELECT id, status
            FROM orders
            WHERE id = %s
        """, (order_id,))
        
        order = cursor.fetchone()
        
        if not order:
            cursor.close()
            conn.close()
            return jsonify({'error': 'Order not found'}), 404
        
        # Start a transaction
        conn.start_transaction()
        
        # Update order status
        cursor.execute("""
            UPDATE orders
            SET status = %s
            WHERE id = %s
        """, (new_status, order_id))
        
        # Add status history entry
        cursor.execute("""
            INSERT INTO order_status_history (
                order_id, status, notes, created_at, created_by
            ) VALUES (%s, %s, %s, NOW(), %s)
        """, (
            order_id,
            new_status,
            notes,
            f"Admin {request.user_id}"
        ))
        
        # If cancelled, restore inventory
        if new_status == 'cancelled' and order['status'] != 'cancelled':
            cursor.execute("""
                SELECT product_id, quantity
                FROM order_items
                WHERE order_id = %s
            """, (order_id,))
            
            items = cursor.fetchall()
            
            for item in items:
                cursor.execute("""
                    UPDATE products
                    SET inventory_count = inventory_count + %s
                    WHERE id = %s
                """, (item['quantity'], item['product_id']))
        
        # Commit the transaction
        conn.commit()
        
        cursor.close()
        conn.close()
        
        return jsonify({
            'message': 'Order status updated successfully'
        }), 200
    
    except Exception as e:
        conn.rollback()
        cursor.close()
        conn.close()
        return jsonify({'error': str(e)}), 500

@orders_bp.route('/stats', methods=['GET'])
@token_required
def get_order_stats():
    """
    Get order statistics for the authenticated user
    """
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        # Get total orders
        cursor.execute("""
            SELECT COUNT(*) as total_orders
            FROM orders
            WHERE user_id = %s
        """, (request.user_id,))
        
        stats = cursor.fetchone()
        
        # Get orders by status
        cursor.execute("""
            SELECT status, COUNT(*) as count
            FROM orders
            WHERE user_id = %s
            GROUP BY status
        """, (request.user_id,))
        
        status_counts = cursor.fetchall()
        stats['status_counts'] = {item['status']: item['count'] for item in status_counts}
        
        # Get total spent
        cursor.execute("""
            SELECT SUM(total) as total_spent
            FROM orders
            WHERE user_id = %s AND status != 'cancelled'
        """, (request.user_id,))
        
        total_spent = cursor.fetchone()
        stats['total_spent'] = total_spent['total_spent'] or 0
        
        # Get most recent order
        cursor.execute("""
            SELECT id, order_date, total, status
            FROM orders
            WHERE user_id = %s
            ORDER BY order_date DESC
            LIMIT 1
        """, (request.user_id,))
        
        stats['most_recent_order'] = cursor.fetchone()
        
        cursor.close()
        conn.close()
        
        return jsonify(stats), 200
    
    except Exception as e:
        cursor.close()
        conn.close()
        return jsonify({'error': str(e)}), 500
