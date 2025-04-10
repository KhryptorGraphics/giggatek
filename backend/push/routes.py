from flask import Blueprint, request, jsonify
import json
import os
from pywebpush import webpush, WebPushException
from ..utils.db import get_db_connection
from ..auth.routes import token_required

# Initialize push notification settings
VAPID_PRIVATE_KEY = os.environ.get('VAPID_PRIVATE_KEY', 'your_vapid_private_key')
VAPID_PUBLIC_KEY = os.environ.get('VAPID_PUBLIC_KEY', 'your_vapid_public_key')
VAPID_CLAIMS = {
    "sub": "mailto:admin@giggatek.com"
}

push_bp = Blueprint('push', __name__)

@push_bp.route('/subscribe', methods=['POST'])
@token_required
def subscribe():
    """
    Subscribe to push notifications
    """
    try:
        data = request.get_json()
        
        # Validate required fields
        if not data or 'subscription' not in data:
            return jsonify({
                'success': False,
                'error': 'Subscription data is required'
            }), 400
        
        # Get subscription data
        subscription = data['subscription']
        
        # Store subscription in database
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Check if subscription already exists
        cursor.execute("""
            SELECT subscription_id FROM push_subscriptions
            WHERE user_id = %s AND endpoint = %s
        """, (request.user_id, subscription.get('endpoint')))
        
        existing_subscription = cursor.fetchone()
        
        if existing_subscription:
            # Update existing subscription
            cursor.execute("""
                UPDATE push_subscriptions
                SET subscription_data = %s, updated_at = NOW()
                WHERE user_id = %s AND endpoint = %s
            """, (
                json.dumps(subscription),
                request.user_id,
                subscription.get('endpoint')
            ))
            
            subscription_id = existing_subscription[0]
        else:
            # Create new subscription
            cursor.execute("""
                INSERT INTO push_subscriptions
                (user_id, endpoint, subscription_data, created_at)
                VALUES (%s, %s, %s, NOW())
            """, (
                request.user_id,
                subscription.get('endpoint'),
                json.dumps(subscription)
            ))
            
            subscription_id = cursor.lastrowid
        
        conn.commit()
        cursor.close()
        conn.close()
        
        return jsonify({
            'success': True,
            'message': 'Subscription saved successfully',
            'subscription_id': subscription_id
        })
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@push_bp.route('/unsubscribe', methods=['POST'])
@token_required
def unsubscribe():
    """
    Unsubscribe from push notifications
    """
    try:
        data = request.get_json()
        
        # Validate required fields
        if not data or 'endpoint' not in data:
            return jsonify({
                'success': False,
                'error': 'Endpoint is required'
            }), 400
        
        # Get endpoint
        endpoint = data['endpoint']
        
        # Remove subscription from database
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            DELETE FROM push_subscriptions
            WHERE user_id = %s AND endpoint = %s
        """, (request.user_id, endpoint))
        
        conn.commit()
        cursor.close()
        conn.close()
        
        return jsonify({
            'success': True,
            'message': 'Unsubscribed successfully'
        })
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@push_bp.route('/send', methods=['POST'])
@token_required
def send_notification():
    """
    Send a push notification to a user
    """
    try:
        data = request.get_json()
        
        # Validate required fields
        if not data or 'user_id' not in data or 'notification' not in data:
            return jsonify({
                'success': False,
                'error': 'User ID and notification data are required'
            }), 400
        
        # Get user ID and notification data
        user_id = data['user_id']
        notification = data['notification']
        
        # Check if user has permission to send notifications to this user
        if request.user_id != user_id and not request.is_admin:
            return jsonify({
                'success': False,
                'error': 'You do not have permission to send notifications to this user'
            }), 403
        
        # Get user's subscriptions
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        cursor.execute("""
            SELECT subscription_data FROM push_subscriptions
            WHERE user_id = %s
        """, (user_id,))
        
        subscriptions = cursor.fetchall()
        cursor.close()
        conn.close()
        
        if not subscriptions:
            return jsonify({
                'success': False,
                'error': 'User has no push subscriptions'
            }), 404
        
        # Send notification to each subscription
        sent_count = 0
        failed_count = 0
        
        for subscription_row in subscriptions:
            try:
                subscription_data = json.loads(subscription_row['subscription_data'])
                
                webpush(
                    subscription_info=subscription_data,
                    data=json.dumps(notification),
                    vapid_private_key=VAPID_PRIVATE_KEY,
                    vapid_claims=VAPID_CLAIMS
                )
                
                sent_count += 1
            except WebPushException as e:
                failed_count += 1
                print(f"WebPush error: {e}")
                
                # If subscription is expired or invalid, remove it
                if e.response and e.response.status_code in [404, 410]:
                    conn = get_db_connection()
                    cursor = conn.cursor()
                    
                    cursor.execute("""
                        DELETE FROM push_subscriptions
                        WHERE user_id = %s AND endpoint = %s
                    """, (user_id, subscription_data.get('endpoint')))
                    
                    conn.commit()
                    cursor.close()
                    conn.close()
        
        return jsonify({
            'success': True,
            'message': f'Notification sent to {sent_count} devices, failed on {failed_count} devices'
        })
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@push_bp.route('/vapid-public-key', methods=['GET'])
def get_vapid_public_key():
    """
    Get the VAPID public key for push notifications
    """
    return jsonify({
        'success': True,
        'vapid_public_key': VAPID_PUBLIC_KEY
    })
