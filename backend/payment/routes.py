from flask import Blueprint, request, jsonify
import stripe
import os
from ..utils.db import get_db_connection
from ..auth.routes import token_required

# Initialize Stripe with secret key
stripe.api_key = os.environ.get('STRIPE_SECRET_KEY', 'sk_test_YOUR_STRIPE_SECRET_KEY')
webhook_secret = os.environ.get('STRIPE_WEBHOOK_SECRET', 'whsec_YOUR_STRIPE_WEBHOOK_SECRET')

payment_bp = Blueprint('payment', __name__)

@payment_bp.route('/create-payment-intent', methods=['POST'])
@token_required
def create_payment_intent():
    """
    Create a Stripe payment intent
    """
    try:
        data = request.get_json()
        
        # Validate required fields
        if not data or 'amount' not in data:
            return jsonify({
                'success': False,
                'error': 'Amount is required'
            }), 400
        
        # Create payment intent
        intent = stripe.PaymentIntent.create(
            amount=data['amount'],
            currency=data.get('currency', 'usd'),
            description=data.get('description', 'GigGatek Purchase'),
            metadata={
                'user_id': request.user_id,
                **data.get('metadata', {})
            }
        )
        
        # Store payment intent in database
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            INSERT INTO payment_intents 
            (payment_intent_id, user_id, amount, currency, description, status, created_at)
            VALUES (%s, %s, %s, %s, %s, %s, NOW())
        """, (
            intent.id,
            request.user_id,
            data['amount'],
            data.get('currency', 'usd'),
            data.get('description', 'GigGatek Purchase'),
            intent.status
        ))
        
        conn.commit()
        cursor.close()
        conn.close()
        
        return jsonify({
            'success': True,
            'client_secret': intent.client_secret,
            'payment_intent': intent.id
        })
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@payment_bp.route('/confirm-payment-intent', methods=['POST'])
@token_required
def confirm_payment_intent():
    """
    Confirm a Stripe payment intent
    """
    try:
        data = request.get_json()
        
        # Validate required fields
        if not data or 'payment_intent_id' not in data:
            return jsonify({
                'success': False,
                'error': 'Payment intent ID is required'
            }), 400
        
        # Retrieve payment intent
        intent = stripe.PaymentIntent.retrieve(data['payment_intent_id'])
        
        # Check if payment intent belongs to user
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        cursor.execute("""
            SELECT * FROM payment_intents
            WHERE payment_intent_id = %s AND user_id = %s
        """, (data['payment_intent_id'], request.user_id))
        
        payment_record = cursor.fetchone()
        
        if not payment_record:
            cursor.close()
            conn.close()
            return jsonify({
                'success': False,
                'error': 'Payment intent not found or does not belong to user'
            }), 404
        
        # Confirm payment intent if needed
        if intent.status == 'requires_confirmation':
            intent = stripe.PaymentIntent.confirm(data['payment_intent_id'])
        
        # Update payment intent status in database
        cursor.execute("""
            UPDATE payment_intents
            SET status = %s, updated_at = NOW()
            WHERE payment_intent_id = %s
        """, (intent.status, intent.id))
        
        conn.commit()
        cursor.close()
        conn.close()
        
        return jsonify({
            'success': True,
            'status': intent.status,
            'requires_action': intent.status == 'requires_action',
            'client_secret': intent.client_secret
        })
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@payment_bp.route('/webhook', methods=['POST'])
def webhook():
    """
    Handle Stripe webhook events
    """
    payload = request.data
    sig_header = request.headers.get('Stripe-Signature')
    
    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, webhook_secret
        )
    except ValueError as e:
        # Invalid payload
        return jsonify({'success': False, 'error': 'Invalid payload'}), 400
    except stripe.error.SignatureVerificationError as e:
        # Invalid signature
        return jsonify({'success': False, 'error': 'Invalid signature'}), 400
    
    # Handle the event
    if event.type == 'payment_intent.succeeded':
        payment_intent = event.data.object
        handle_payment_success(payment_intent)
    elif event.type == 'payment_intent.payment_failed':
        payment_intent = event.data.object
        handle_payment_failure(payment_intent)
    
    return jsonify({'success': True})

def handle_payment_success(payment_intent):
    """
    Handle successful payment
    """
    try:
        # Update payment intent status in database
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            UPDATE payment_intents
            SET status = %s, updated_at = NOW()
            WHERE payment_intent_id = %s
        """, ('succeeded', payment_intent.id))
        
        # Check if this payment is for an order
        if 'order_id' in payment_intent.metadata:
            order_id = payment_intent.metadata['order_id']
            
            # Update order status
            cursor.execute("""
                UPDATE orders
                SET payment_status = 'paid', status = 'processing', updated_at = NOW()
                WHERE order_id = %s
            """, (order_id,))
        
        conn.commit()
        cursor.close()
        conn.close()
    
    except Exception as e:
        print(f"Error handling payment success: {e}")

def handle_payment_failure(payment_intent):
    """
    Handle failed payment
    """
    try:
        # Update payment intent status in database
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            UPDATE payment_intents
            SET status = %s, updated_at = NOW()
            WHERE payment_intent_id = %s
        """, ('failed', payment_intent.id))
        
        # Check if this payment is for an order
        if 'order_id' in payment_intent.metadata:
            order_id = payment_intent.metadata['order_id']
            
            # Update order status
            cursor.execute("""
                UPDATE orders
                SET payment_status = 'failed', updated_at = NOW()
                WHERE order_id = %s
            """, (order_id,))
        
        conn.commit()
        cursor.close()
        conn.close()
    
    except Exception as e:
        print(f"Error handling payment failure: {e}")

@payment_bp.route('/payment-methods', methods=['GET'])
@token_required
def get_payment_methods():
    """
    Get saved payment methods for the user
    """
    try:
        # Get customer ID from database
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        cursor.execute("""
            SELECT stripe_customer_id FROM users
            WHERE user_id = %s
        """, (request.user_id,))
        
        user = cursor.fetchone()
        cursor.close()
        conn.close()
        
        if not user or not user.get('stripe_customer_id'):
            return jsonify({
                'success': True,
                'payment_methods': []
            })
        
        # Get payment methods from Stripe
        payment_methods = stripe.PaymentMethod.list(
            customer=user['stripe_customer_id'],
            type='card'
        )
        
        # Format payment methods
        formatted_methods = []
        for method in payment_methods.data:
            formatted_methods.append({
                'id': method.id,
                'type': method.type,
                'card': {
                    'brand': method.card.brand,
                    'last4': method.card.last4,
                    'exp_month': method.card.exp_month,
                    'exp_year': method.card.exp_year
                },
                'billing_details': method.billing_details
            })
        
        return jsonify({
            'success': True,
            'payment_methods': formatted_methods
        })
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@payment_bp.route('/payment-methods', methods=['POST'])
@token_required
def add_payment_method():
    """
    Add a new payment method for the user
    """
    try:
        data = request.get_json()
        
        # Validate required fields
        if not data or 'payment_method_id' not in data:
            return jsonify({
                'success': False,
                'error': 'Payment method ID is required'
            }), 400
        
        # Get customer ID from database
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        cursor.execute("""
            SELECT stripe_customer_id FROM users
            WHERE user_id = %s
        """, (request.user_id,))
        
        user = cursor.fetchone()
        
        # Create customer if not exists
        if not user or not user.get('stripe_customer_id'):
            # Get user details
            cursor.execute("""
                SELECT email, first_name, last_name FROM users
                WHERE user_id = %s
            """, (request.user_id,))
            
            user_details = cursor.fetchone()
            
            # Create customer in Stripe
            customer = stripe.Customer.create(
                email=user_details['email'],
                name=f"{user_details['first_name']} {user_details['last_name']}",
                metadata={
                    'user_id': request.user_id
                }
            )
            
            # Save customer ID in database
            cursor.execute("""
                UPDATE users
                SET stripe_customer_id = %s
                WHERE user_id = %s
            """, (customer.id, request.user_id))
            
            conn.commit()
            
            customer_id = customer.id
        else:
            customer_id = user['stripe_customer_id']
        
        # Attach payment method to customer
        stripe.PaymentMethod.attach(
            data['payment_method_id'],
            customer=customer_id
        )
        
        # Set as default payment method if requested
        if data.get('set_default', False):
            stripe.Customer.modify(
                customer_id,
                invoice_settings={
                    'default_payment_method': data['payment_method_id']
                }
            )
        
        cursor.close()
        conn.close()
        
        return jsonify({
            'success': True,
            'message': 'Payment method added successfully'
        })
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@payment_bp.route('/payment-methods/<payment_method_id>', methods=['DELETE'])
@token_required
def remove_payment_method(payment_method_id):
    """
    Remove a payment method for the user
    """
    try:
        # Get customer ID from database
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        cursor.execute("""
            SELECT stripe_customer_id FROM users
            WHERE user_id = %s
        """, (request.user_id,))
        
        user = cursor.fetchone()
        cursor.close()
        conn.close()
        
        if not user or not user.get('stripe_customer_id'):
            return jsonify({
                'success': False,
                'error': 'Customer not found'
            }), 404
        
        # Verify payment method belongs to customer
        payment_method = stripe.PaymentMethod.retrieve(payment_method_id)
        
        if payment_method.customer != user['stripe_customer_id']:
            return jsonify({
                'success': False,
                'error': 'Payment method does not belong to user'
            }), 403
        
        # Detach payment method
        stripe.PaymentMethod.detach(payment_method_id)
        
        return jsonify({
            'success': True,
            'message': 'Payment method removed successfully'
        })
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500
