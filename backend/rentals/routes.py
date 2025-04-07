from flask import Blueprint, request, jsonify
from datetime import datetime, timedelta
import calendar
from ..utils.db import get_db_connection
from ..auth.routes import token_required

rentals_bp = Blueprint('rentals', __name__)

@rentals_bp.route('/', methods=['GET'])
@token_required
def get_user_rentals():
    """
    Get all rentals for the authenticated user
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
            r.id, r.user_id, r.product_id, r.start_date, r.end_date, 
            r.monthly_rate, r.total_months, r.total_amount, r.status,
            r.payments_made, r.remaining_payments, r.next_payment_date,
            r.address_id, r.created_at, r.updated_at,
            p.name as product_name, p.image_url
        FROM rentals r
        JOIN products p ON r.product_id = p.id
        WHERE r.user_id = %s
    """
    
    count_query = """
        SELECT COUNT(*) as total
        FROM rentals
        WHERE user_id = %s
    """
    
    query_params = [request.user_id]
    count_params = [request.user_id]
    
    # Add status filter if provided
    if status:
        query += " AND r.status = %s"
        count_query += " AND status = %s"
        query_params.append(status)
        count_params.append(status)
    
    # Add sorting and pagination
    query += " ORDER BY r.created_at DESC LIMIT %s OFFSET %s"
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
        rentals = cursor.fetchall()
        
        # For each rental, get payment history
        for rental in rentals:
            cursor.execute("""
                SELECT 
                    id, rental_id, amount, payment_date, payment_method,
                    transaction_id, status, created_at
                FROM rental_payments
                WHERE rental_id = %s
                ORDER BY payment_date DESC
            """, (rental['id'],))
            rental['payments'] = cursor.fetchall()
            
            # Calculate payment progress percentage
            if rental['total_months'] > 0:
                rental['payment_progress'] = (rental['payments_made'] / rental['total_months']) * 100
            else:
                rental['payment_progress'] = 0
        
        cursor.close()
        conn.close()
        
        # Calculate pagination metadata
        total_pages = (total_count + per_page - 1) // per_page  # Ceiling division
        
        return jsonify({
            'rentals': rentals,
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

@rentals_bp.route('/<int:rental_id>', methods=['GET'])
@token_required
def get_rental_details(rental_id):
    """
    Get detailed information for a specific rental
    """
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        # Get the rental
        cursor.execute("""
            SELECT 
                r.id, r.user_id, r.product_id, r.start_date, r.end_date, 
                r.monthly_rate, r.total_months, r.total_amount, r.status,
                r.payments_made, r.remaining_payments, r.next_payment_date,
                r.address_id, r.contract_id, r.created_at, r.updated_at,
                p.name as product_name, p.description as product_description, 
                p.image_url, p.category, p.condition, p.specifications
            FROM rentals r
            JOIN products p ON r.product_id = p.id
            WHERE r.id = %s AND r.user_id = %s
        """, (rental_id, request.user_id))
        
        rental = cursor.fetchone()
        
        if not rental:
            cursor.close()
            conn.close()
            return jsonify({'error': 'Rental not found or access denied'}), 404
        
        # Get payment history
        cursor.execute("""
            SELECT 
                id, rental_id, amount, payment_date, payment_method,
                transaction_id, status, created_at
            FROM rental_payments
            WHERE rental_id = %s
            ORDER BY payment_date DESC
        """, (rental_id,))
        
        rental['payments'] = cursor.fetchall()
        
        # Get the address
        if rental['address_id']:
            cursor.execute("""
                SELECT 
                    id, first_name, last_name, street_address, city, 
                    state, zip_code, country, phone
                FROM addresses
                WHERE id = %s
            """, (rental['address_id'],))
            
            rental['address'] = cursor.fetchone()
        
        # Get rental contract if exists
        if rental['contract_id']:
            cursor.execute("""
                SELECT 
                    id, rental_id, contract_text, signed_at, signature_ip,
                    created_at
                FROM rental_contracts
                WHERE id = %s
            """, (rental['contract_id'],))
            
            rental['contract'] = cursor.fetchone()
        
        # Get status history
        cursor.execute("""
            SELECT 
                id, rental_id, status, notes, created_at, created_by
            FROM rental_status_history
            WHERE rental_id = %s
            ORDER BY created_at DESC
        """, (rental_id,))
        
        rental['status_history'] = cursor.fetchall()
        
        # Calculate payment schedule
        payment_schedule = []
        start_date = datetime.strptime(str(rental['start_date']), '%Y-%m-%d')
        monthly_rate = float(rental['monthly_rate'])
        
        for i in range(rental['total_months']):
            payment_date = start_date + timedelta(days=30 * i)
            
            # Find if payment has been made
            payment_status = 'pending'
            transaction_id = None
            
            for payment in rental['payments']:
                payment_dt = datetime.strptime(str(payment['payment_date']), '%Y-%m-%d')
                if payment_dt.month == payment_date.month and payment_dt.year == payment_date.year:
                    payment_status = payment['status']
                    transaction_id = payment['transaction_id']
                    break
            
            payment_schedule.append({
                'month': i + 1,
                'date': payment_date.strftime('%Y-%m-%d'),
                'amount': monthly_rate,
                'status': payment_status,
                'transaction_id': transaction_id
            })
        
        rental['payment_schedule'] = payment_schedule
        
        # Calculate payment progress percentage
        if rental['total_months'] > 0:
            rental['payment_progress'] = (rental['payments_made'] / rental['total_months']) * 100
        else:
            rental['payment_progress'] = 0
        
        # Calculate remaining amount
        rental['remaining_amount'] = float(rental['total_amount']) - sum(
            float(payment['amount']) for payment in rental['payments'] 
            if payment['status'] == 'completed'
        )
        
        cursor.close()
        conn.close()
        
        return jsonify({'rental': rental}), 200
    
    except Exception as e:
        cursor.close()
        conn.close()
        return jsonify({'error': str(e)}), 500

@rentals_bp.route('/', methods=['POST'])
@token_required
def create_rental():
    """
    Create a new rental contract
    """
    data = request.get_json()
    
    # Validate required fields
    required_fields = ['product_id', 'total_months', 'address_id']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'Missing required field: {field}'}), 400
    
    product_id = data['product_id']
    total_months = int(data['total_months'])
    address_id = data['address_id']
    
    # Validate total_months
    if total_months < 1 or total_months > 60:  # 5 years max
        return jsonify({'error': 'Total months must be between 1 and 60'}), 400
    
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        # Start a transaction
        conn.start_transaction()
        
        # Check if product exists and is available for rent
        cursor.execute("""
            SELECT id, name, price, rental_price, inventory_count, is_rentable
            FROM products
            WHERE id = %s
        """, (product_id,))
        
        product = cursor.fetchone()
        
        if not product:
            conn.rollback()
            cursor.close()
            conn.close()
            return jsonify({'error': 'Product not found'}), 404
        
        if not product['is_rentable']:
            conn.rollback()
            cursor.close()
            conn.close()
            return jsonify({'error': 'Product is not available for rent'}), 400
        
        if product['inventory_count'] < 1:
            conn.rollback()
            cursor.close()
            conn.close()
            return jsonify({'error': 'Product is out of stock'}), 400
        
        # Check if address exists and belongs to the user
        cursor.execute("""
            SELECT id
            FROM addresses
            WHERE id = %s AND user_id = %s
        """, (address_id, request.user_id))
        
        address = cursor.fetchone()
        
        if not address:
            conn.rollback()
            cursor.close()
            conn.close()
            return jsonify({'error': 'Address not found or access denied'}), 404
        
        # Calculate rental details
        monthly_rate = float(product['rental_price'])
        total_amount = monthly_rate * total_months
        
        # Calculate start and end dates
        start_date = datetime.now()
        end_date = start_date + timedelta(days=30 * total_months)
        
        # Calculate next payment date (today)
        next_payment_date = start_date
        
        # Create the rental contract
        cursor.execute("""
            INSERT INTO rentals (
                user_id, product_id, start_date, end_date, monthly_rate,
                total_months, total_amount, status, payments_made,
                remaining_payments, next_payment_date, address_id,
                created_at, updated_at
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, NOW(), NOW())
        """, (
            request.user_id,
            product_id,
            start_date.strftime('%Y-%m-%d'),
            end_date.strftime('%Y-%m-%d'),
            monthly_rate,
            total_months,
            total_amount,
            'pending',  # Initial status
            0,  # No payments made yet
            total_months,  # All payments remaining
            next_payment_date.strftime('%Y-%m-%d'),
            address_id
        ))
        
        rental_id = cursor.lastrowid
        
        # Update product inventory
        cursor.execute("""
            UPDATE products
            SET inventory_count = inventory_count - 1
            WHERE id = %s
        """, (product_id,))
        
        # Add rental status history
        cursor.execute("""
            INSERT INTO rental_status_history (
                rental_id, status, notes, created_at, created_by
            ) VALUES (%s, %s, %s, NOW(), %s)
        """, (
            rental_id,
            'pending',
            'Rental contract created',
            f"User {request.user_id}"
        ))
        
        # Generate rental contract
        contract_text = f"""
        RENT-TO-OWN AGREEMENT
        
        This Rent-to-Own Agreement ("Agreement") is entered into on {start_date.strftime('%B %d, %Y')} by and between:
        
        GigGatek ("Lessor") and User ID: {request.user_id} ("Lessee").
        
        1. EQUIPMENT:
           Lessor hereby leases to Lessee, and Lessee hereby leases from Lessor, the following equipment:
           - Product: {product['name']} (ID: {product_id})
        
        2. TERM:
           The term of this lease shall be for {total_months} months, beginning on {start_date.strftime('%B %d, %Y')} and ending on {end_date.strftime('%B %d, %Y')}.
        
        3. RENT:
           Lessee shall pay to Lessor a monthly rental fee of ${monthly_rate:.2f}, due on the {start_date.day}th day of each month.
           Total rent over the lease term: ${total_amount:.2f}
        
        4. OWNERSHIP:
           Upon completion of all scheduled payments, Lessee shall obtain ownership of the equipment without further payment.
        
        5. EARLY PURCHASE OPTION:
           Lessee may purchase the equipment before the end of the lease term by paying the remaining balance.
        
        6. TERMINATION:
           Lessee may terminate this agreement by returning the equipment to Lessor. No refunds will be provided for payments already made.
        
        7. MAINTENANCE:
           Lessee is responsible for maintaining the equipment in good working order.
        
        8. DAMAGE OR LOSS:
           Lessee is responsible for any damage to or loss of the equipment.
        
        This agreement is subject to the complete Terms and Conditions of GigGatek's Rent-to-Own Program.
        
        By accepting this contract, Lessee acknowledges having read, understood, and agreed to all terms and conditions.
        """
        
        # Store the contract
        cursor.execute("""
            INSERT INTO rental_contracts (
                rental_id, contract_text, created_at
            ) VALUES (%s, %s, NOW())
        """, (
            rental_id,
            contract_text
        ))
        
        contract_id = cursor.lastrowid
        
        # Update rental with contract ID
        cursor.execute("""
            UPDATE rentals
            SET contract_id = %s
            WHERE id = %s
        """, (contract_id, rental_id))
        
        # Commit the transaction
        conn.commit()
        
        # Get the created rental
        cursor.execute("""
            SELECT 
                id, user_id, product_id, start_date, end_date, monthly_rate,
                total_months, total_amount, status, payments_made,
                remaining_payments, next_payment_date, address_id
            FROM rentals
            WHERE id = %s
        """, (rental_id,))
        
        new_rental = cursor.fetchone()
        
        cursor.close()
        conn.close()
        
        return jsonify({
            'message': 'Rental contract created successfully',
            'rental': new_rental
        }), 201
    
    except Exception as e:
        conn.rollback()
        cursor.close()
        conn.close()
        return jsonify({'error': str(e)}), 500

@rentals_bp.route('/<int:rental_id>/cancel', methods=['POST'])
@token_required
def cancel_rental(rental_id):
    """
    Cancel a rental contract
    """
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        # Check if rental exists and belongs to the user
        cursor.execute("""
            SELECT r.id, r.status, r.product_id, p.name as product_name
            FROM rentals r
            JOIN products p ON r.product_id = p.id
            WHERE r.id = %s AND r.user_id = %s
        """, (rental_id, request.user_id))
        
        rental = cursor.fetchone()
        
        if not rental:
            cursor.close()
            conn.close()
            return jsonify({'error': 'Rental not found or access denied'}), 404
        
        # Check if the rental can be cancelled
        if rental['status'] not in ['pending', 'active']:
            cursor.close()
            conn.close()
            return jsonify({
                'error': f"Cannot cancel rental with status '{rental['status']}'"
            }), 400
        
        # Start a transaction
        conn.start_transaction()
        
        # Update rental status
        cursor.execute("""
            UPDATE rentals
            SET status = 'cancelled', updated_at = NOW()
            WHERE id = %s
        """, (rental_id,))
        
        # Restore product inventory
        cursor.execute("""
            UPDATE products
            SET inventory_count = inventory_count + 1
            WHERE id = %s
        """, (rental['product_id'],))
        
        # Add status history entry
        cursor.execute("""
            INSERT INTO rental_status_history (
                rental_id, status, notes, created_at, created_by
            ) VALUES (%s, %s, %s, NOW(), %s)
        """, (
            rental_id,
            'cancelled',
            'Rental contract cancelled by customer',
            f"User {request.user_id}"
        ))
        
        # Commit the transaction
        conn.commit()
        
        cursor.close()
        conn.close()
        
        return jsonify({
            'message': f"Rental for {rental['product_name']} cancelled successfully"
        }), 200
    
    except Exception as e:
        conn.rollback()
        cursor.close()
        conn.close()
        return jsonify({'error': str(e)}), 500

@rentals_bp.route('/<int:rental_id>/make-payment', methods=['POST'])
@token_required
def make_rental_payment(rental_id):
    """
    Make a payment on a rental contract
    """
    data = request.get_json()
    
    # Validate required fields
    if 'payment_method' not in data or 'transaction_id' not in data:
        return jsonify({'error': 'Payment method and transaction ID are required'}), 400
    
    payment_method = data['payment_method']
    transaction_id = data['transaction_id']
    
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        # Check if rental exists and belongs to the user
        cursor.execute("""
            SELECT id, status, monthly_rate, payments_made, remaining_payments,
                   next_payment_date, total_months
            FROM rentals
            WHERE id = %s AND user_id = %s
        """, (rental_id, request.user_id))
        
        rental = cursor.fetchone()
        
        if not rental:
            cursor.close()
            conn.close()
            return jsonify({'error': 'Rental not found or access denied'}), 404
        
        # Check if the rental is active or pending
        if rental['status'] not in ['pending', 'active']:
            cursor.close()
            conn.close()
            return jsonify({
                'error': f"Cannot make payment on rental with status '{rental['status']}'"
            }), 400
        
        # Check if there are remaining payments
        if rental['remaining_payments'] <= 0:
            cursor.close()
            conn.close()
            return jsonify({'error': 'No remaining payments for this rental'}), 400
        
        # Start a transaction
        conn.start_transaction()
        
        # Record the payment
        cursor.execute("""
            INSERT INTO rental_payments (
                rental_id, amount, payment_date, payment_method,
                transaction_id, status, created_at
            ) VALUES (%s, %s, NOW(), %s, %s, %s, NOW())
        """, (
            rental_id,
            float(rental['monthly_rate']),
            payment_method,
            transaction_id,
            'completed'  # Assuming payment is successful
        ))
        
        # Update rental payment status
        payments_made = rental['payments_made'] + 1
        remaining_payments = rental['remaining_payments'] - 1
        
        # Calculate next payment date (30 days from now)
        next_payment_date = datetime.now() + timedelta(days=30)
        
        # Update rental status to active if it was pending
        status = 'active'
        
        # If all payments are made, mark as completed
        if remaining_payments <= 0:
            status = 'completed'
        
        cursor.execute("""
            UPDATE rentals
            SET status = %s, payments_made = %s, remaining_payments = %s,
                next_payment_date = %s, updated_at = NOW()
            WHERE id = %s
        """, (
            status,
            payments_made,
            remaining_payments,
            next_payment_date.strftime('%Y-%m-%d'),
            rental_id
        ))
        
        # Add status history entry if status changed
        if status != rental['status']:
            cursor.execute("""
                INSERT INTO rental_status_history (
                    rental_id, status, notes, created_at, created_by
                ) VALUES (%s, %s, %s, NOW(), %s)
            """, (
                rental_id,
                status,
                f"Status updated after payment ({payments_made}/{rental['total_months']})",
                f"User {request.user_id}"
            ))
        
        # Commit the transaction
        conn.commit()
        
        # Get updated rental details
        cursor.execute("""
            SELECT 
                id, user_id, product_id, start_date, end_date, monthly_rate,
                total_months, total_amount, status, payments_made,
                remaining_payments, next_payment_date
            FROM rentals
            WHERE id = %s
        """, (rental_id,))
        
        updated_rental = cursor.fetchone()
        
        cursor.close()
        conn.close()
        
        return jsonify({
            'message': 'Payment processed successfully',
            'rental': updated_rental
        }), 200
    
    except Exception as e:
        conn.rollback()
        cursor.close()
        conn.close()
        return jsonify({'error': str(e)}), 500

@rentals_bp.route('/<int:rental_id>/buyout', methods=['POST'])
@token_required
def buyout_rental(rental_id):
    """
    Early buyout of a rental contract
    """
    data = request.get_json()
    
    # Validate required fields
    if 'payment_method' not in data or 'transaction_id' not in data:
        return jsonify({'error': 'Payment method and transaction ID are required'}), 400
    
    payment_method = data['payment_method']
    transaction_id = data['transaction_id']
    
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        # Check if rental exists and belongs to the user
        cursor.execute("""
            SELECT r.id, r.status, r.monthly_rate, r.payments_made, r.remaining_payments,
                   r.total_amount, r.product_id, p.name as product_name
            FROM rentals r
            JOIN products p ON r.product_id = p.id
            WHERE r.id = %s AND r.user_id = %s
        """, (rental_id, request.user_id))
        
        rental = cursor.fetchone()
        
        if not rental:
            cursor.close()
            conn.close()
            return jsonify({'error': 'Rental not found or access denied'}), 404
        
        # Check if the rental is active or pending
        if rental['status'] not in ['pending', 'active']:
            cursor.close()
            conn.close()
            return jsonify({
                'error': f"Cannot buyout rental with status '{rental['status']}'"
            }), 400
        
        # Calculate remaining balance
        cursor.execute("""
            SELECT SUM(amount) as paid_amount
            FROM rental_payments
            WHERE rental_id = %s AND status = 'completed'
        """, (rental_id,))
        
        payment_result = cursor.fetchone()
        paid_amount = payment_result['paid_amount'] if payment_result['paid_amount'] else 0
        
        # Ensure paid_amount is a float for calculation
        if isinstance(paid_amount, str):
            paid_amount = float(paid_amount)
        
        remaining_balance = float(rental['total_amount']) - paid_amount
        
        # Start a transaction
        conn.start_transaction()
        
        # Record the buyout payment
        cursor.execute("""
            INSERT INTO rental_payments (
                rental_id, amount, payment_date, payment_method,
                transaction_id, status, notes, created_at
            ) VALUES (%s, %s, NOW(), %s, %s, %s, %s, NOW())
        """, (
            rental_id,
            remaining_balance,
            payment_method,
            transaction_id,
            'completed',
            'Early buyout payment'
        ))
        
        # Update rental status to completed
        cursor.execute("""
            UPDATE rentals
            SET status = 'completed', payments_made = total_months, 
                remaining_payments = 0, updated_at = NOW()
            WHERE id = %s
        """, (rental_id,))
        
        # Add status history entry
        cursor.execute("""
            INSERT INTO rental_status_history (
                rental_id, status, notes, created_at, created_by
            ) VALUES (%s, %s, %s, NOW(), %s)
        """, (
            rental_id,
            'completed',
            'Early buyout completed',
            f"User {request.user_id}"
        ))
        
        # Commit the transaction
        conn.commit()
        
        cursor.close()
        conn.close()
        
        return jsonify({
            'message': f"Rental for {rental['product_name']} has been successfully bought out",
            'amount_paid': remaining_balance
        }), 200
    
    except Exception as e:
        conn.rollback()
        cursor.close()
        conn.close()
        return jsonify({'error': str(e)}), 500

@rentals_bp.route('/<int:rental_id>/sign-contract', methods=['POST'])
@token_required
def sign_rental_contract(rental_id):
    """
    Sign a rental contract
    """
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        # Check if rental exists and belongs to the user
        cursor.execute("""
            SELECT r.id, r.status, r.contract_id, c.signed_at
            FROM rentals r
            LEFT JOIN rental_contracts c ON r.contract_id = c.id
            WHERE r.id = %s AND r.user_id = %s
        """, (rental_id, request.user_id))
        
        rental = cursor.fetchone()
        
        if not rental:
            cursor.close()
            conn.close()
            return jsonify({'error': 'Rental not found or access denied'}), 404
        
        # Check if contract exists
        if not rental['contract_id']:
            cursor.close()
            conn.close()
            return jsonify({'error': 'No contract found for this rental'}), 404
        
        # Check if contract is already signed
        if rental['signed_at']:
            cursor.close()
            conn.close()
            return jsonify({'error': 'Contract has already been signed'}), 400
        
        # Get client IP
        client_ip = request.remote_addr
        
        # Start a transaction
        conn.start_transaction()
        
        # Update contract with signature
        cursor.execute("""
            UPDATE rental_contracts
            SET signed_at = NOW(), signature_ip = %s
            WHERE id = %s
        """, (client_ip, rental['contract_id']))
        
        # If rental status is pending, update to active
        if rental['status'] == 'pending':
            cursor.execute("""
                UPDATE rentals
                SET status = 'active', updated_at = NOW()
                WHERE id = %s
            """, (rental_id,))
            
            # Add status history entry
            cursor.execute("""
                INSERT INTO rental_status_history (
                    rental_id, status, notes, created_at, created_by
                ) VALUES (%s, %s, %s, NOW(), %s)
            """, (
                rental_id,
                'active',
                'Rental contract signed by customer',
                f"User {request.user_id}"
            ))
        
        # Commit the transaction
        conn.commit()
        
        cursor.close()
        conn.close()
        
        return jsonify({
            'message': 'Rental contract signed successfully',
            'signed_at': datetime.now().isoformat()
        }), 200
    
    except Exception as e:
        conn.rollback()
        cursor.close()
        conn.close()
        return jsonify({'error': str(e)}), 500

@rentals_bp.route('/stats', methods=['GET'])
@token_required
def get_rental_stats():
    """
    Get rental statistics for the authenticated user
    """
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        # Get total rentals
        cursor.execute("""
            SELECT COUNT(*) as total_rentals
            FROM rentals
            WHERE user_id = %s
        """, (request.user_id,))
        
        stats = cursor.fetchone()
        
        # Get rentals by status
        cursor.execute("""
            SELECT status, COUNT(*) as count
            FROM rentals
            WHERE user_id = %s
            GROUP BY status
        """, (request.user_id,))
        
        status_counts = cursor.fetchall()
        stats['status_counts'] = {item['status']: item['count'] for item in status_counts}
        
        # Get total spent on rentals
        cursor.execute("""
            SELECT SUM(amount) as total_spent
            FROM rental_payments
            WHERE rental_id IN (SELECT id FROM rentals WHERE user_id = %s)
            AND status = 'completed'
        """, (request.user_id,))
        
        total_spent = cursor.fetchone()
        stats['total_spent'] = total_spent['total_spent'] or 0
        
        # Get active rentals with next payment info
        cursor.execute("""
            SELECT r.id, r.product_id, r.next_payment_date, r.monthly_rate,
                   p.name as product_name
            FROM rentals r
            JOIN products p ON r.product_id = p.id
            WHERE r.user_id = %s AND r.status = 'active'
            ORDER BY r.next_payment_date ASC
        """, (request.user_id,))
        
        active_rentals = cursor.fetchall()
        stats['upcoming_payments'] = active_rentals
        
        # Get total products rented all-time
        cursor.execute("""
            SELECT COUNT(DISTINCT product_id) as total_products_rented
            FROM rentals
            WHERE user_id = %s
        """, (request.user_id,))
        
        products_result = cursor.fetchone()
        stats['total_products_rented'] = products_result['total_products_rented']
        
        cursor.close()
        conn.close()
        
        return jsonify(stats), 200
    
    except Exception as e:
        cursor.close()
        conn.close()
        return jsonify({'error': str(e)}), 500
