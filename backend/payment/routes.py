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
                'payment_methods': [],
                'has_default_method': False
            })

        # Get payment methods from Stripe
        payment_methods = stripe.PaymentMethod.list(
            customer=user['stripe_customer_id'],
            type='card'
        )

        # Get customer to check default payment method
        customer = stripe.Customer.retrieve(user['stripe_customer_id'])
        default_payment_method = customer.get('invoice_settings', {}).get('default_payment_method')

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
                'billing_details': method.billing_details,
                'is_default': method.id == default_payment_method
            })

        return jsonify({
            'success': True,
            'payment_methods': formatted_methods,
            'has_default_method': default_payment_method is not None
        })

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@payment_bp.route('/payment-methods/default', methods=['POST'])
@token_required
def set_default_payment_method():
    """
    Set a payment method as default for the user
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
        cursor.close()
        conn.close()

        if not user or not user.get('stripe_customer_id'):
            return jsonify({
                'success': False,
                'error': 'User does not have a Stripe customer ID'
            }), 400

        # Verify the payment method belongs to the customer
        payment_method = stripe.PaymentMethod.retrieve(data['payment_method_id'])

        if payment_method.customer != user['stripe_customer_id']:
            return jsonify({
                'success': False,
                'error': 'Payment method does not belong to user'
            }), 403

        # Set as default payment method
        stripe.Customer.modify(
            user['stripe_customer_id'],
            invoice_settings={
                'default_payment_method': data['payment_method_id']
            }
        )

        return jsonify({
            'success': True,
            'message': 'Default payment method updated successfully'
        })

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@payment_bp.route('/subscriptions/rental', methods=['POST'])
@token_required
def create_rental_subscription():
    """
    Create a subscription for automatic rental payments
    """
    try:
        data = request.get_json()

        # Validate required fields
        if not data or 'rental_id' not in data or 'payment_method_id' not in data:
            return jsonify({
                'success': False,
                'error': 'Rental ID and payment method ID are required'
            }), 400

        # Get rental details
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("""
            SELECT r.*, p.name as product_name
            FROM rentals r
            JOIN products p ON r.product_id = p.id
            WHERE r.id = %s AND r.user_id = %s
        """, (data['rental_id'], request.user_id))

        rental = cursor.fetchone()

        if not rental:
            cursor.close()
            conn.close()
            return jsonify({
                'success': False,
                'error': 'Rental not found or does not belong to user'
            }), 404

        # Get customer ID
        cursor.execute("""
            SELECT stripe_customer_id, email, first_name, last_name
            FROM users
            WHERE user_id = %s
        """, (request.user_id,))

        user = cursor.fetchone()

        # Create customer if not exists
        if not user.get('stripe_customer_id'):
            customer = stripe.Customer.create(
                email=user['email'],
                name=f"{user['first_name']} {user['last_name']}",
                metadata={
                    'user_id': request.user_id
                }
            )

            # Save customer ID
            cursor.execute("""
                UPDATE users
                SET stripe_customer_id = %s
                WHERE user_id = %s
            """, (customer.id, request.user_id))

            conn.commit()
            customer_id = customer.id
        else:
            customer_id = user['stripe_customer_id']

        # Attach payment method to customer if not already attached
        try:
            payment_method = stripe.PaymentMethod.retrieve(data['payment_method_id'])

            if not hasattr(payment_method, 'customer') or payment_method.customer != customer_id:
                payment_method = stripe.PaymentMethod.attach(
                    data['payment_method_id'],
                    customer=customer_id
                )
        except stripe.error.InvalidRequestError:
            # Payment method doesn't exist or already attached to another customer
            cursor.close()
            conn.close()
            return jsonify({
                'success': False,
                'error': 'Invalid payment method'
            }), 400

        # Create or get a product for rentals
        try:
            product = stripe.Product.retrieve('rental_subscription')
        except stripe.error.InvalidRequestError:
            product = stripe.Product.create(
                id='rental_subscription',
                name='Rental Subscription',
                description='Monthly rental payment subscription'
            )

        # Create a price for this specific rental
        price_id = f"rental_{rental['id']}_monthly"
        try:
            price = stripe.Price.retrieve(price_id)
        except stripe.error.InvalidRequestError:
            price = stripe.Price.create(
                id=price_id,
                product=product.id,
                unit_amount=int(float(rental['monthly_rate']) * 100),  # Convert to cents
                currency='usd',
                recurring={
                    'interval': 'month'
                },
                metadata={
                    'rental_id': rental['id'],
                    'product_name': rental['product_name']
                }
            )

        # Check if subscription already exists
        cursor.execute("""
            SELECT stripe_subscription_id
            FROM rental_subscriptions
            WHERE rental_id = %s AND user_id = %s AND status = 'active'
        """, (rental['id'], request.user_id))

        existing_subscription = cursor.fetchone()

        if existing_subscription:
            # Update existing subscription
            subscription = stripe.Subscription.modify(
                existing_subscription['stripe_subscription_id'],
                default_payment_method=data['payment_method_id']
            )

            subscription_id = existing_subscription['stripe_subscription_id']
            is_new = False
        else:
            # Create a new subscription
            subscription = stripe.Subscription.create(
                customer=customer_id,
                items=[
                    {
                        'price': price.id,
                    },
                ],
                default_payment_method=data['payment_method_id'],
                metadata={
                    'rental_id': rental['id'],
                    'user_id': request.user_id
                }
            )

            # Save subscription in database
            cursor.execute("""
                INSERT INTO rental_subscriptions
                (rental_id, user_id, stripe_subscription_id, status, created_at)
                VALUES (%s, %s, %s, %s, NOW())
            """, (rental['id'], request.user_id, subscription.id, subscription.status))

            subscription_id = subscription.id
            is_new = True

        conn.commit()
        cursor.close()
        conn.close()

        return jsonify({
            'success': True,
            'subscription_id': subscription_id,
            'status': subscription.status,
            'is_new': is_new,
            'current_period_end': subscription.current_period_end,
            'message': 'Automatic payments set up successfully'
        })

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@payment_bp.route('/subscriptions/rental/<subscription_id>', methods=['GET'])
@token_required
def get_rental_subscription(subscription_id):
    """
    Get details of a rental subscription
    """
    try:
        # Check if subscription exists and belongs to user
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("""
            SELECT rs.*, r.monthly_rate, r.total_months, r.start_date, r.end_date,
                   p.name as product_name, p.image_url
            FROM rental_subscriptions rs
            JOIN rentals r ON rs.rental_id = r.id
            JOIN products p ON r.product_id = p.id
            WHERE rs.stripe_subscription_id = %s AND rs.user_id = %s
        """, (subscription_id, request.user_id))

        subscription_record = cursor.fetchone()

        if not subscription_record:
            cursor.close()
            conn.close()
            return jsonify({
                'success': False,
                'error': 'Subscription not found or does not belong to user'
            }), 404

        # Get subscription details from Stripe
        subscription = stripe.Subscription.retrieve(subscription_id)

        # Get payment history
        cursor.execute("""
            SELECT payment_date, amount, payment_method, status, transaction_id
            FROM rental_payments
            WHERE rental_id = %s AND payment_source = 'subscription'
            ORDER BY payment_date DESC
        """, (subscription_record['rental_id'],))

        payments = cursor.fetchall()

        cursor.close()
        conn.close()

        return jsonify({
            'success': True,
            'subscription': {
                'id': subscription.id,
                'status': subscription.status,
                'current_period_start': subscription.current_period_start,
                'current_period_end': subscription.current_period_end,
                'cancel_at_period_end': subscription.cancel_at_period_end,
                'created': subscription.created,
                'rental_id': subscription_record['rental_id'],
                'product_name': subscription_record['product_name'],
                'product_image': subscription_record['image_url'],
                'monthly_rate': float(subscription_record['monthly_rate']),
                'total_months': subscription_record['total_months'],
                'start_date': subscription_record['start_date'].isoformat() if subscription_record['start_date'] else None,
                'end_date': subscription_record['end_date'].isoformat() if subscription_record['end_date'] else None,
                'payments': payments
            }
        })

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@payment_bp.route('/subscriptions/rental/<subscription_id>', methods=['PATCH'])
@token_required
def update_rental_subscription(subscription_id):
    """
    Update a rental subscription (cancel, reactivate)
    """
    try:
        data = request.get_json()

        # Validate required fields
        if not data or 'action' not in data:
            return jsonify({
                'success': False,
                'error': 'Action is required'
            }), 400

        # Check if subscription exists and belongs to user
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("""
            SELECT * FROM rental_subscriptions
            WHERE stripe_subscription_id = %s AND user_id = %s
        """, (subscription_id, request.user_id))

        subscription_record = cursor.fetchone()

        if not subscription_record:
            cursor.close()
            conn.close()
            return jsonify({
                'success': False,
                'error': 'Subscription not found or does not belong to user'
            }), 404

        # Process based on action
        if data['action'] == 'cancel':
            # Cancel subscription at period end
            subscription = stripe.Subscription.modify(
                subscription_id,
                cancel_at_period_end=True
            )

            # Update status in database
            cursor.execute("""
                UPDATE rental_subscriptions
                SET status = 'canceling', updated_at = NOW()
                WHERE stripe_subscription_id = %s
            """, (subscription_id,))

            message = 'Subscription will be canceled at the end of the current billing period'

        elif data['action'] == 'reactivate':
            # Reactivate subscription
            subscription = stripe.Subscription.modify(
                subscription_id,
                cancel_at_period_end=False
            )

            # Update status in database
            cursor.execute("""
                UPDATE rental_subscriptions
                SET status = 'active', updated_at = NOW()
                WHERE stripe_subscription_id = %s
            """, (subscription_id,))

            message = 'Subscription has been reactivated'

        elif data['action'] == 'cancel_immediately':
            # Cancel subscription immediately
            subscription = stripe.Subscription.delete(subscription_id)

            # Update status in database
            cursor.execute("""
                UPDATE rental_subscriptions
                SET status = 'canceled', updated_at = NOW()
                WHERE stripe_subscription_id = %s
            """, (subscription_id,))

            message = 'Subscription has been canceled immediately'

        else:
            cursor.close()
            conn.close()
            return jsonify({
                'success': False,
                'error': 'Invalid action'
            }), 400

        conn.commit()
        cursor.close()
        conn.close()

        return jsonify({
            'success': True,
            'status': subscription.status,
            'cancel_at_period_end': subscription.get('cancel_at_period_end', False),
            'message': message
        })

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@payment_bp.route('/analytics/rentals', methods=['GET'])
@token_required
def get_rental_payment_analytics():
    """
    Get analytics data for rental payments
    """
    try:
        # Get query parameters
        period = request.args.get('period', 'month')  # day, week, month, year
        start_date = request.args.get('start_date')  # YYYY-MM-DD
        end_date = request.args.get('end_date')  # YYYY-MM-DD

        # Validate period
        valid_periods = ['day', 'week', 'month', 'year']
        if period not in valid_periods:
            return jsonify({
                'success': False,
                'error': f'Invalid period. Must be one of: {", ".join(valid_periods)}'
            }), 400

        # Set default date range if not provided
        if not start_date or not end_date:
            # Default to last 12 months
            end_date = datetime.now().strftime('%Y-%m-%d')
            start_date = (datetime.now() - timedelta(days=365)).strftime('%Y-%m-%d')

        # Connect to database
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        # Get total payments by period
        period_format = {
            'day': '%Y-%m-%d',
            'week': '%Y-%u',  # ISO week number
            'month': '%Y-%m',
            'year': '%Y'
        }

        cursor.execute(f"""
            SELECT
                DATE_FORMAT(payment_date, '{period_format[period]}') as period,
                SUM(amount) as total_amount,
                COUNT(*) as payment_count
            FROM rental_payments
            WHERE user_id = %s
            AND payment_date BETWEEN %s AND %s
            GROUP BY period
            ORDER BY period
        """, (request.user_id, start_date, end_date))

        payments_by_period = cursor.fetchall()

        # Get payment method distribution
        cursor.execute("""
            SELECT
                payment_method,
                COUNT(*) as count,
                SUM(amount) as total_amount
            FROM rental_payments
            WHERE user_id = %s
            AND payment_date BETWEEN %s AND %s
            GROUP BY payment_method
            ORDER BY count DESC
        """, (request.user_id, start_date, end_date))

        payment_methods = cursor.fetchall()

        # Get payment source distribution (manual vs subscription)
        cursor.execute("""
            SELECT
                payment_source,
                COUNT(*) as count,
                SUM(amount) as total_amount
            FROM rental_payments
            WHERE user_id = %s
            AND payment_date BETWEEN %s AND %s
            GROUP BY payment_source
            ORDER BY count DESC
        """, (request.user_id, start_date, end_date))

        payment_sources = cursor.fetchall()

        # Get top products by payment amount
        cursor.execute("""
            SELECT
                p.name as product_name,
                SUM(rp.amount) as total_amount,
                COUNT(*) as payment_count
            FROM rental_payments rp
            JOIN rentals r ON rp.rental_id = r.id
            JOIN products p ON r.product_id = p.id
            WHERE rp.user_id = %s
            AND rp.payment_date BETWEEN %s AND %s
            GROUP BY p.id
            ORDER BY total_amount DESC
            LIMIT 5
        """, (request.user_id, start_date, end_date))

        top_products = cursor.fetchall()

        # Get payment status distribution
        cursor.execute("""
            SELECT
                status,
                COUNT(*) as count,
                SUM(amount) as total_amount
            FROM rental_payments
            WHERE user_id = %s
            AND payment_date BETWEEN %s AND %s
            GROUP BY status
            ORDER BY count DESC
        """, (request.user_id, start_date, end_date))

        payment_statuses = cursor.fetchall()

        # Get total statistics
        cursor.execute("""
            SELECT
                COUNT(*) as total_payments,
                SUM(amount) as total_amount,
                AVG(amount) as average_amount,
                MIN(payment_date) as first_payment_date,
                MAX(payment_date) as last_payment_date
            FROM rental_payments
            WHERE user_id = %s
            AND payment_date BETWEEN %s AND %s
        """, (request.user_id, start_date, end_date))

        totals = cursor.fetchone()

        cursor.close()
        conn.close()

        return jsonify({
            'success': True,
            'analytics': {
                'payments_by_period': payments_by_period,
                'payment_methods': payment_methods,
                'payment_sources': payment_sources,
                'top_products': top_products,
                'payment_statuses': payment_statuses,
                'totals': totals,
                'period': period,
                'start_date': start_date,
                'end_date': end_date
            }
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
