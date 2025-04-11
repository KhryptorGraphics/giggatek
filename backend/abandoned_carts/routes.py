"""
Routes for abandoned cart functionality.
"""

import json
import uuid
from datetime import datetime, timedelta
from flask import request, jsonify, current_app

from . import abandoned_carts_bp
from ..utils.db import get_db_connection
from ..utils.auth import token_required, get_user_id_from_token
from ..utils.email import send_email_async, render_template
from .marketing_integration import sync_abandoned_cart_to_marketing_tools, send_abandoned_cart_email_via_marketing_tools
from ..predictive.models import predict_recovery_likelihood, extract_features, create_recommendation

# Helper functions
def generate_recovery_token():
    """Generate a unique token for cart recovery"""
    return str(uuid.uuid4())

def save_abandoned_cart(user_id, session_id, email, cart_data):
    """Save an abandoned cart to the database"""
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    try:
        # Check if cart already exists for this user/session
        if user_id:
            cursor.execute(
                "SELECT id FROM abandoned_carts WHERE user_id = %s AND recovered = FALSE",
                (user_id,)
            )
        else:
            cursor.execute(
                "SELECT id FROM abandoned_carts WHERE session_id = %s AND recovered = FALSE",
                (session_id,)
            )

        existing_cart = cursor.fetchone()

        if existing_cart:
            # Update existing cart
            cursor.execute(
                """
                UPDATE abandoned_carts
                SET cart_data = %s, updated_at = NOW(), email = %s
                WHERE id = %s
                """,
                (json.dumps(cart_data), email, existing_cart['id'])
            )
            cart_id = existing_cart['id']
        else:
            # Create new cart
            cursor.execute(
                """
                INSERT INTO abandoned_carts
                (user_id, session_id, email, cart_data, created_at, updated_at)
                VALUES (%s, %s, %s, %s, NOW(), NOW())
                """,
                (user_id, session_id, email, json.dumps(cart_data))
            )
            cart_id = cursor.lastrowid

        conn.commit()
        return cart_id

    except Exception as e:
        conn.rollback()
        current_app.logger.error(f"Error saving abandoned cart: {str(e)}")
        return None

    finally:
        cursor.close()
        conn.close()

def mark_cart_as_recovered(cart_id):
    """Mark a cart as recovered"""
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute(
            """
            UPDATE abandoned_carts
            SET recovered = TRUE, recovery_date = NOW()
            WHERE id = %s
            """,
            (cart_id,)
        )
        conn.commit()
        return True

    except Exception as e:
        conn.rollback()
        current_app.logger.error(f"Error marking cart as recovered: {str(e)}")
        return False

    finally:
        cursor.close()
        conn.close()

def create_recovery_token(cart_id, expiry_hours=72):
    """Create a recovery token for an abandoned cart"""
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        token = generate_recovery_token()
        expires_at = datetime.now() + timedelta(hours=expiry_hours)

        cursor.execute(
            """
            INSERT INTO recovery_tokens
            (abandoned_cart_id, token, created_at, expires_at)
            VALUES (%s, %s, NOW(), %s)
            """,
            (cart_id, token, expires_at)
        )

        conn.commit()
        return token

    except Exception as e:
        conn.rollback()
        current_app.logger.error(f"Error creating recovery token: {str(e)}")
        return None

    finally:
        cursor.close()
        conn.close()

def get_cart_by_token(token):
    """Get an abandoned cart by recovery token"""
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    try:
        cursor.execute(
            """
            SELECT ac.*, rt.token, rt.expires_at, rt.used
            FROM abandoned_carts ac
            JOIN recovery_tokens rt ON ac.id = rt.abandoned_cart_id
            WHERE rt.token = %s AND rt.expires_at > NOW() AND rt.used = FALSE
            """,
            (token,)
        )

        cart = cursor.fetchone()
        return cart

    except Exception as e:
        current_app.logger.error(f"Error getting cart by token: {str(e)}")
        return None

    finally:
        cursor.close()
        conn.close()

def mark_token_as_used(token):
    """Mark a recovery token as used"""
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute(
            """
            UPDATE recovery_tokens
            SET used = TRUE, used_at = NOW()
            WHERE token = %s
            """,
            (token,)
        )

        conn.commit()
        return True

    except Exception as e:
        conn.rollback()
        current_app.logger.error(f"Error marking token as used: {str(e)}")
        return False

    finally:
        cursor.close()
        conn.close()

def generate_discount_code(cart_id, notification_count, user_id=None):
    """Generate a discount code for abandoned cart recovery

    The discount percentage increases with each notification:
    - First notification: No discount
    - Second notification: 5% discount
    - Third notification: 10% discount

    Returns a tuple of (discount_code, discount_percentage, expires_in_days)
    """
    if notification_count == 0:
        return None, 0, 0

    # Calculate discount percentage based on notification count
    discount_percentage = min(notification_count * 5, 10)  # Max 10% discount

    # Generate a unique discount code
    discount_code = f"CART{cart_id}{notification_count}{uuid.uuid4().hex[:6]}".upper()

    # Set expiration (7 days)
    expires_in_days = 7
    expires_at = datetime.now() + timedelta(days=expires_in_days)

    # Save discount code to database
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute(
            """
            INSERT INTO discount_codes
            (code, abandoned_cart_id, user_id, discount_percentage, created_at, expires_at)
            VALUES (%s, %s, %s, %s, NOW(), %s)
            """,
            (discount_code, cart_id, user_id, discount_percentage, expires_at)
        )

        conn.commit()
    except Exception as e:
        conn.rollback()
        current_app.logger.error(f"Error saving discount code: {str(e)}")
        return None, 0, 0
    finally:
        cursor.close()
        conn.close()

    return discount_code, discount_percentage, expires_in_days

def send_abandoned_cart_email(cart_id, email, user_name=None, include_discount=False):
    """Send an abandoned cart recovery email"""
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    try:
        # Get cart data
        cursor.execute(
            """
            SELECT * FROM abandoned_carts
            WHERE id = %s
            """,
            (cart_id,)
        )

        cart = cursor.fetchone()

        if not cart:
            return False

        # Create recovery token
        token = create_recovery_token(cart_id)

        if not token:
            return False

        # Parse cart data
        cart_data = json.loads(cart['cart_data'])

        # Create recovery URL
        recovery_url = f"{request.host_url.rstrip('/')}/cart-recovery?token={token}"

        # Generate discount code if needed
        discount_code = None
        discount_percentage = 0
        discount_expires_in = ''

        if include_discount:
            discount_code, discount_percentage, expires_in_days = generate_discount_code(
                cart_id, cart['notification_count'], cart['user_id']
            )
            if discount_code:
                discount_expires_in = f"{expires_in_days} days"

        # Generate unsubscribe token
        unsubscribe_token = generate_recovery_token()

        # Prepare email context
        context = {
            'user_name': user_name or 'Valued Customer',
            'cart_items': cart_data.get('items', []),
            'item_count': len(cart_data.get('items', [])),
            'total': cart_data.get('total', 0),
            'recovery_url': recovery_url,
            'token': token,
            'expires_in': '72 hours',
            'current_year': datetime.now().year,
            'subject': "Complete Your GigGatek Purchase",
            'email': email,
            'unsubscribe_token': unsubscribe_token,
            'discount_code': discount_code,
            'discount_percentage': discount_percentage,
            'discount_expires_in': discount_expires_in
        }

        # Render email template
        html_content = render_template('abandoned_cart', context)

        # Prepare email data for marketing tools
        email_data = {
            'email': email,
            'subject': "Complete Your GigGatek Purchase",
            'html': html_content,
            'context': context
        }

        # Try to send via marketing tools first
        marketing_success = False
        try:
            marketing_result = send_abandoned_cart_email_via_marketing_tools(cart_id, email_data)
            marketing_success = marketing_result.get('success', False)
            current_app.logger.info(f"Marketing email result for cart {cart_id}: {marketing_result}")
        except Exception as e:
            current_app.logger.error(f"Error sending email via marketing tools: {str(e)}")
            marketing_success = False

        # Fall back to direct email if marketing tools fail
        success = marketing_success
        if not marketing_success:
            success = send_email_async(email, "Complete Your GigGatek Purchase", html_content)

        if success:
            # Record notification
            cursor.execute(
                """
                INSERT INTO abandoned_cart_notifications
                (abandoned_cart_id, notification_type, sent_at, status, email)
                VALUES (%s, %s, NOW(), %s, %s)
                """,
                (cart_id, 'email', 'sent' if success else 'failed', email)
            )

            # Update cart notification count
            cursor.execute(
                """
                UPDATE abandoned_carts
                SET notification_count = notification_count + 1, last_notification_sent = NOW()
                WHERE id = %s
                """,
                (cart_id,)
            )

            conn.commit()

        return success

    except Exception as e:
        conn.rollback()
        current_app.logger.error(f"Error sending abandoned cart email: {str(e)}")
        return False

    finally:
        cursor.close()
        conn.close()

# API Routes

@abandoned_carts_bp.route('/track', methods=['POST'])
def track_cart():
    """Track an abandoned cart"""
    data = request.get_json()

    if not data or 'cart_data' not in data:
        return jsonify({'error': 'Missing cart data'}), 400

    # Get user ID if authenticated
    user_id = None
    auth_header = request.headers.get('Authorization')
    if auth_header and auth_header.startswith('Bearer '):
        token = auth_header.split(' ')[1]
        user_id = get_user_id_from_token(token)

    # Get session ID
    session_id = data.get('session_id') or request.cookies.get('session_id') or str(uuid.uuid4())

    # Get email if provided
    email = data.get('email')

    # Save cart
    cart_id = save_abandoned_cart(user_id, session_id, email, data['cart_data'])

    if not cart_id:
        return jsonify({'error': 'Failed to save cart'}), 500

    # Sync with marketing tools
    try:
        sync_result = sync_abandoned_cart_to_marketing_tools(cart_id)
        current_app.logger.info(f"Marketing sync result for cart {cart_id}: {sync_result}")
    except Exception as e:
        current_app.logger.error(f"Error syncing cart with marketing tools: {str(e)}")
        # Don't fail the request if marketing sync fails

    # Generate predictive analytics
    try:
        # Get cart data
        predict_conn = get_db_connection()
        cursor = predict_conn.cursor(dictionary=True)
        cursor.execute(
            """
            SELECT * FROM abandoned_carts
            WHERE id = %s
            """,
            (cart_id,)
        )
        cart = cursor.fetchone()
        cursor.close()

        if cart:
            # Extract features
            features = extract_features(cart)

            # Get active models
            cursor = predict_conn.cursor(dictionary=True)
            cursor.execute(
                """
                SELECT * FROM predictive_models
                WHERE active = TRUE AND model_type = 'recovery_likelihood'
                LIMIT 1
                """
            )
            model = cursor.fetchone()
            cursor.close()

            if model:
                # Make prediction
                model_features = json.loads(model['features'])
                model_parameters = json.loads(model['parameters'])
                prediction = predict_recovery_likelihood(features, model_features, model_parameters)

                # Create recommendation
                create_recommendation(cart_id, prediction)

                current_app.logger.info(f"Predictive analytics generated for cart {cart_id}")
    except Exception as e:
        current_app.logger.error(f"Error generating predictive analytics: {str(e)}")
        # Don't fail the request if predictive analytics fails
    finally:
        if 'predict_conn' in locals():
            predict_conn.close()

    return jsonify({
        'success': True,
        'cart_id': cart_id,
        'session_id': session_id
    }), 200

@abandoned_carts_bp.route('/recover/<token>', methods=['GET'])
def get_recovery_cart(token):
    """Get an abandoned cart by recovery token"""
    cart = get_cart_by_token(token)

    if not cart:
        return jsonify({'error': 'Invalid or expired recovery token'}), 404

    # Parse cart data
    try:
        cart_data = json.loads(cart['cart_data'])
    except:
        cart_data = {}

    return jsonify({
        'success': True,
        'cart': {
            'id': cart['id'],
            'user_id': cart['user_id'],
            'email': cart['email'],
            'created_at': cart['created_at'].isoformat() if cart['created_at'] else None,
            'updated_at': cart['updated_at'].isoformat() if cart['updated_at'] else None,
            'data': cart_data
        },
        'token': {
            'value': cart['token'],
            'expires_at': cart['expires_at'].isoformat() if cart['expires_at'] else None
        }
    }), 200

@abandoned_carts_bp.route('/recover/<token>', methods=['POST'])
def recover_cart(token):
    """Recover an abandoned cart"""
    cart = get_cart_by_token(token)

    if not cart:
        return jsonify({'error': 'Invalid or expired recovery token'}), 404

    # Mark token as used
    if not mark_token_as_used(token):
        return jsonify({'error': 'Failed to process recovery token'}), 500

    # Mark cart as recovered
    if not mark_cart_as_recovered(cart['id']):
        return jsonify({'error': 'Failed to mark cart as recovered'}), 500

    # Parse cart data
    try:
        cart_data = json.loads(cart['cart_data'])
    except:
        cart_data = {}

    return jsonify({
        'success': True,
        'message': 'Cart recovered successfully',
        'cart': {
            'id': cart['id'],
            'data': cart_data
        }
    }), 200

@abandoned_carts_bp.route('/notify', methods=['POST'])
def send_notification():
    """Send a notification for an abandoned cart"""
    data = request.get_json()

    if not data or 'cart_id' not in data or 'email' not in data:
        return jsonify({'error': 'Missing required fields'}), 400

    cart_id = data['cart_id']
    email = data['email']
    user_name = data.get('user_name')

    success = send_abandoned_cart_email(cart_id, email, user_name)

    if not success:
        return jsonify({'error': 'Failed to send notification'}), 500

    return jsonify({
        'success': True,
        'message': 'Notification sent successfully'
    }), 200

# Admin routes (protected)

@abandoned_carts_bp.route('/admin/stats', methods=['GET'])
@token_required
def get_stats():
    """Get abandoned cart statistics"""
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    try:
        # Get date range from query params
        days = request.args.get('days', 30)
        date_filter = ""
        params = []

        if days != 'all':
            date_filter = "WHERE created_at >= DATE_SUB(NOW(), INTERVAL %s DAY)"
            params.append(int(days))

        # Get total abandoned carts
        query = f"SELECT COUNT(*) as total FROM abandoned_carts {date_filter}"
        cursor.execute(query, params)
        total = cursor.fetchone()['total']

        # Get recovered carts
        recovered_filter = date_filter
        if recovered_filter:
            recovered_filter += " AND recovered = TRUE"
        else:
            recovered_filter = "WHERE recovered = TRUE"

        query = f"SELECT COUNT(*) as recovered FROM abandoned_carts {recovered_filter}"
        cursor.execute(query, params)
        recovered = cursor.fetchone()['recovered']

        # Get recovery rate
        recovery_rate = (recovered / total) * 100 if total > 0 else 0

        # Get average cart value
        query = f"""
            SELECT AVG(JSON_EXTRACT(cart_data, '$.total')) as avg_value
            FROM abandoned_carts {date_filter}
        """
        cursor.execute(query, params)
        avg_value_result = cursor.fetchone()
        avg_value = avg_value_result['avg_value'] if avg_value_result['avg_value'] else 0

        # Get carts by day
        day_filter = ""
        day_params = []

        if days != 'all':
            day_filter = "WHERE created_at >= DATE_SUB(NOW(), INTERVAL %s DAY)"
            day_params.append(int(days))

        cursor.execute(
            f"""
            SELECT DATE(created_at) as date, COUNT(*) as count
            FROM abandoned_carts
            {day_filter}
            GROUP BY DATE(created_at)
            ORDER BY date DESC
            """,
            day_params
        )
        daily_carts = cursor.fetchall()

        # Get recoveries by day
        recovery_filter = ""
        recovery_params = []

        if days != 'all':
            recovery_filter = "WHERE recovery_date >= DATE_SUB(NOW(), INTERVAL %s DAY)"
            recovery_params.append(int(days))
        else:
            recovery_filter = "WHERE recovery_date IS NOT NULL"

        cursor.execute(
            f"""
            SELECT DATE(recovery_date) as date, COUNT(*) as count
            FROM abandoned_carts
            {recovery_filter}
            GROUP BY DATE(recovery_date)
            ORDER BY date DESC
            """,
            recovery_params
        )
        daily_recoveries = cursor.fetchall()

        # Format dates for JSON serialization
        formatted_daily_carts = []
        for item in daily_carts:
            formatted_daily_carts.append({
                'date': item['date'].isoformat() if item['date'] else None,
                'count': item['count']
            })

        formatted_daily_recoveries = []
        for item in daily_recoveries:
            formatted_daily_recoveries.append({
                'date': item['date'].isoformat() if item['date'] else None,
                'count': item['count']
            })

        return jsonify({
            'success': True,
            'stats': {
                'total_carts': total,
                'recovered_carts': recovered,
                'recovery_rate': round(recovery_rate, 2),
                'avg_cart_value': round(float(avg_value), 2),
                'daily_carts': formatted_daily_carts,
                'daily_recoveries': formatted_daily_recoveries
            }
        }), 200

    except Exception as e:
        current_app.logger.error(f"Error getting abandoned cart stats: {str(e)}")
        return jsonify({'error': 'Failed to get statistics'}), 500

    finally:
        cursor.close()
        conn.close()

@abandoned_carts_bp.route('/admin/cart/<int:cart_id>', methods=['GET'])
@token_required
def get_cart(cart_id):
    """Get a specific abandoned cart"""
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    try:
        # Get cart
        cursor.execute(
            """
            SELECT * FROM abandoned_carts
            WHERE id = %s
            """,
            (cart_id,)
        )

        cart = cursor.fetchone()

        if not cart:
            return jsonify({'error': 'Cart not found'}), 404

        # Get notifications
        cursor.execute(
            """
            SELECT * FROM abandoned_cart_notifications
            WHERE abandoned_cart_id = %s
            ORDER BY sent_at DESC
            """,
            (cart_id,)
        )

        notifications = cursor.fetchall()

        # Format cart data
        try:
            cart_data = json.loads(cart['cart_data'])
        except:
            cart_data = {}

        # Format dates for JSON serialization
        formatted_cart = {
            'id': cart['id'],
            'user_id': cart['user_id'],
            'email': cart['email'],
            'created_at': cart['created_at'].isoformat() if cart['created_at'] else None,
            'updated_at': cart['updated_at'].isoformat() if cart['updated_at'] else None,
            'last_notification_sent': cart['last_notification_sent'].isoformat() if cart['last_notification_sent'] else None,
            'notification_count': cart['notification_count'],
            'recovered': cart['recovered'],
            'recovery_date': cart['recovery_date'].isoformat() if cart['recovery_date'] else None,
            'data': cart_data
        }

        # Format notifications
        formatted_notifications = []
        for notification in notifications:
            formatted_notifications.append({
                'id': notification['id'],
                'notification_type': notification['notification_type'],
                'sent_at': notification['sent_at'].isoformat() if notification['sent_at'] else None,
                'status': notification['status'],
                'email': notification['email']
            })

        return jsonify({
            'success': True,
            'cart': formatted_cart,
            'notifications': formatted_notifications
        }), 200

    except Exception as e:
        current_app.logger.error(f"Error getting cart: {str(e)}")
        return jsonify({'error': 'Failed to get cart'}), 500

    finally:
        cursor.close()
        conn.close()

@abandoned_carts_bp.route('/admin/list', methods=['GET'])
@token_required
def list_carts():
    """List abandoned carts"""
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    try:
        # Get query parameters
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 20))
        recovered = request.args.get('recovered')
        days = request.args.get('days')
        search = request.args.get('search')

        # Calculate offset
        offset = (page - 1) * per_page

        # Build query
        query = """
            SELECT ac.*,
                   COUNT(acn.id) as notification_count
            FROM abandoned_carts ac
            LEFT JOIN abandoned_cart_notifications acn ON ac.id = acn.abandoned_cart_id
        """

        params = []

        # Add filters
        where_clauses = []

        if recovered is not None:
            where_clauses.append("ac.recovered = %s")
            params.append(recovered.lower() == 'true')

        if days and days != 'all':
            where_clauses.append("ac.created_at >= DATE_SUB(NOW(), INTERVAL %s DAY)")
            params.append(int(days))

        if search:
            where_clauses.append("(ac.email LIKE %s OR ac.id = %s)")
            params.append(f"%{search}%")
            try:
                search_id = int(search)
                params.append(search_id)
            except ValueError:
                params.append(0)  # Invalid ID, will not match any records

        if where_clauses:
            query += " WHERE " + " AND ".join(where_clauses)

        # Add group by
        query += " GROUP BY ac.id"

        # Add order by
        query += " ORDER BY ac.created_at DESC"

        # Add limit
        query += " LIMIT %s OFFSET %s"
        params.extend([per_page, offset])

        # Execute query
        cursor.execute(query, params)
        carts = cursor.fetchall()

        # Get total count
        count_query = """
            SELECT COUNT(*) as total FROM abandoned_carts ac
        """

        count_params = params.copy()

        if where_clauses:
            count_query += " WHERE " + " AND ".join(where_clauses)

        cursor.execute(count_query, count_params)
        total = cursor.fetchone()['total']

        # Format results
        formatted_carts = []
        for cart in carts:
            try:
                cart_data = json.loads(cart['cart_data'])
            except:
                cart_data = {}

            formatted_carts.append({
                'id': cart['id'],
                'user_id': cart['user_id'],
                'email': cart['email'],
                'created_at': cart['created_at'].isoformat() if cart['created_at'] else None,
                'updated_at': cart['updated_at'].isoformat() if cart['updated_at'] else None,
                'last_notification_sent': cart['last_notification_sent'].isoformat() if cart['last_notification_sent'] else None,
                'notification_count': cart['notification_count'],
                'recovered': cart['recovered'],
                'recovery_date': cart['recovery_date'].isoformat() if cart['recovery_date'] else None,
                'item_count': len(cart_data.get('items', [])),
                'total': cart_data.get('total', 0)
            })

        return jsonify({
            'success': True,
            'carts': formatted_carts,
            'pagination': {
                'total': total,
                'page': page,
                'per_page': per_page,
                'total_pages': (total + per_page - 1) // per_page
            }
        }), 200

    except Exception as e:
        current_app.logger.error(f"Error listing abandoned carts: {str(e)}")
        return jsonify({'error': 'Failed to list carts'}), 500

    finally:
        cursor.close()
        conn.close()

@abandoned_carts_bp.route('/admin/send-batch', methods=['POST'])
@token_required
def send_batch_notifications():
    """Send batch notifications for abandoned carts"""
    data = request.get_json()

    if not data:
        return jsonify({'error': 'Missing request data'}), 400

    # Get parameters
    hours_threshold = data.get('hours_threshold', 1)
    max_notifications = data.get('max_notifications', 3)
    include_discount = data.get('include_discount', True)

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    try:
        # Find eligible carts
        cursor.execute(
            """
            SELECT ac.*, u.first_name
            FROM abandoned_carts ac
            LEFT JOIN users u ON ac.user_id = u.id
            WHERE ac.recovered = FALSE
              AND ac.email IS NOT NULL
              AND (
                  ac.last_notification_sent IS NULL
                  OR ac.last_notification_sent < DATE_SUB(NOW(), INTERVAL %s HOUR)
              )
              AND ac.notification_count < %s
              AND ac.created_at < DATE_SUB(NOW(), INTERVAL %s HOUR)
            ORDER BY ac.created_at DESC
            """,
            (24, max_notifications, hours_threshold)
        )

        eligible_carts = cursor.fetchall()

        # Send notifications
        success_count = 0
        failed_count = 0

        for cart in eligible_carts:
            # Include discount for second and third notifications
            use_discount = include_discount and cart['notification_count'] >= 1

            success = send_abandoned_cart_email(
                cart['id'],
                cart['email'],
                cart.get('first_name'),
                include_discount=use_discount
            )

            if success:
                success_count += 1
            else:
                failed_count += 1

        return jsonify({
            'success': True,
            'message': f'Sent {success_count} notifications ({failed_count} failed)',
            'details': {
                'success_count': success_count,
                'failed_count': failed_count,
                'total_eligible': len(eligible_carts)
            }
        }), 200

    except Exception as e:
        conn.rollback()
        current_app.logger.error(f"Error sending batch notifications: {str(e)}")
        return jsonify({'error': 'Failed to send batch notifications'}), 500

    finally:
        cursor.close()
        conn.close()
