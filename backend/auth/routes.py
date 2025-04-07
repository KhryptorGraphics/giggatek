from flask import Blueprint, request, jsonify
import jwt
import datetime
import bcrypt
from functools import wraps
import re
from ..utils.db import get_db_connection
from ..utils.validators import validate_email, validate_password

auth_bp = Blueprint('auth', __name__)

# Secret key for JWT token generation and verification
SECRET_KEY = "giggatek_secure_jwt_key_change_in_production"

# Token expiration time (in minutes)
TOKEN_EXPIRATION = 60

# Helper function to generate JWT token
def generate_token(user_id, is_admin=False):
    payload = {
        'user_id': user_id,
        'is_admin': is_admin,
        'exp': datetime.datetime.utcnow() + datetime.timedelta(minutes=TOKEN_EXPIRATION)
    }
    return jwt.encode(payload, SECRET_KEY, algorithm='HS256')

# Decorator for protected routes
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        
        # Extract token from the Authorization header
        auth_header = request.headers.get('Authorization')
        if auth_header and auth_header.startswith('Bearer '):
            token = auth_header.split(' ')[1]
        
        if not token:
            return jsonify({'error': 'Token is missing'}), 401
        
        try:
            # Verify and decode the token
            payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
            request.user_id = payload['user_id']
            request.is_admin = payload.get('is_admin', False)
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token has expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'error': 'Invalid token'}), 401
        
        return f(*args, **kwargs)
    
    return decorated

# Admin role check decorator
def admin_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if not request.is_admin:
            return jsonify({'error': 'Admin privileges required'}), 403
        return f(*args, **kwargs)
    
    return decorated

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    
    # Check required fields
    required_fields = ['email', 'password', 'first_name', 'last_name']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'Missing required field: {field}'}), 400
    
    email = data['email']
    password = data['password']
    first_name = data['first_name']
    last_name = data['last_name']
    
    # Validate email format
    if not validate_email(email):
        return jsonify({'error': 'Invalid email format'}), 400
    
    # Validate password strength
    if not validate_password(password):
        return jsonify({
            'error': 'Password must be at least 8 characters and contain uppercase, lowercase, number, and special character'
        }), 400
    
    # Check if user already exists
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
    existing_user = cursor.fetchone()
    
    if existing_user:
        cursor.close()
        conn.close()
        return jsonify({'error': 'User with this email already exists'}), 409
    
    # Hash the password
    hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
    
    # Create the user
    try:
        cursor.execute(
            "INSERT INTO users (email, password_hash, first_name, last_name) VALUES (%s, %s, %s, %s)",
            (email, hashed_password, first_name, last_name)
        )
        user_id = cursor.lastrowid
        conn.commit()
        
        # Generate JWT token
        token = generate_token(user_id)
        
        cursor.close()
        conn.close()
        
        return jsonify({
            'message': 'User registered successfully',
            'token': token,
            'user': {
                'id': user_id,
                'email': email,
                'first_name': first_name,
                'last_name': last_name
            }
        }), 201
    
    except Exception as e:
        conn.rollback()
        cursor.close()
        conn.close()
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    
    # Check required fields
    if 'email' not in data or 'password' not in data:
        return jsonify({'error': 'Email and password are required'}), 400
    
    email = data['email']
    password = data['password']
    
    # Find the user
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
    user = cursor.fetchone()
    
    if not user:
        cursor.close()
        conn.close()
        return jsonify({'error': 'Invalid email or password'}), 401
    
    # Verify password
    if not bcrypt.checkpw(password.encode('utf-8'), user['password_hash'].encode('utf-8')):
        cursor.close()
        conn.close()
        return jsonify({'error': 'Invalid email or password'}), 401
    
    # Generate JWT token
    token = generate_token(user['id'], is_admin=user.get('is_admin', False))
    
    cursor.close()
    conn.close()
    
    return jsonify({
        'message': 'Login successful',
        'token': token,
        'user': {
            'id': user['id'],
            'email': user['email'],
            'first_name': user['first_name'],
            'last_name': user['last_name'],
            'is_admin': user.get('is_admin', False)
        }
    }), 200

@auth_bp.route('/refresh-token', methods=['POST'])
@token_required
def refresh_token():
    # Generate a new token
    new_token = generate_token(request.user_id, request.is_admin)
    
    return jsonify({
        'message': 'Token refreshed successfully',
        'token': new_token
    }), 200

@auth_bp.route('/me', methods=['GET'])
@token_required
def get_current_user():
    # Get user details from the database
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT id, email, first_name, last_name, is_admin FROM users WHERE id = %s", (request.user_id,))
    user = cursor.fetchone()
    
    cursor.close()
    conn.close()
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    return jsonify({
        'user': user
    }), 200

@auth_bp.route('/password-reset-request', methods=['POST'])
def password_reset_request():
    data = request.get_json()
    
    if 'email' not in data:
        return jsonify({'error': 'Email is required'}), 400
    
    email = data['email']
    
    # Find the user
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
    user = cursor.fetchone()
    
    if not user:
        # For security reasons, don't reveal that the email doesn't exist
        cursor.close()
        conn.close()
        return jsonify({'message': 'If the email exists, a password reset link has been sent'}), 200
    
    # Generate reset token (valid for 1 hour)
    reset_payload = {
        'user_id': user['id'],
        'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=1)
    }
    reset_token = jwt.encode(reset_payload, SECRET_KEY, algorithm='HS256')
    
    # Store reset token in the database
    try:
        cursor.execute(
            "UPDATE users SET reset_token = %s, reset_token_exp = %s WHERE id = %s",
            (reset_token, reset_payload['exp'], user['id'])
        )
        conn.commit()
        
        # In a real implementation, this would send an email with the reset link
        # For now, we'll just return the token in the response
        cursor.close()
        conn.close()
        
        # TODO: Integrate with email service
        
        return jsonify({
            'message': 'Password reset link has been sent to your email',
            'debug_token': reset_token  # Remove this in production
        }), 200
    
    except Exception as e:
        conn.rollback()
        cursor.close()
        conn.close()
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/password-reset', methods=['POST'])
def password_reset():
    data = request.get_json()
    
    if 'token' not in data or 'new_password' not in data:
        return jsonify({'error': 'Token and new password are required'}), 400
    
    token = data['token']
    new_password = data['new_password']
    
    # Validate password strength
    if not validate_password(new_password):
        return jsonify({
            'error': 'Password must be at least 8 characters and contain uppercase, lowercase, number, and special character'
        }), 400
    
    try:
        # Verify and decode the token
        payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
        user_id = payload['user_id']
    except jwt.ExpiredSignatureError:
        return jsonify({'error': 'Reset token has expired'}), 401
    except jwt.InvalidTokenError:
        return jsonify({'error': 'Invalid reset token'}), 401
    
    # Verify token in the database
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM users WHERE id = %s AND reset_token = %s", (user_id, token))
    user = cursor.fetchone()
    
    if not user:
        cursor.close()
        conn.close()
        return jsonify({'error': 'Invalid reset token'}), 401
    
    # Hash the new password
    hashed_password = bcrypt.hashpw(new_password.encode('utf-8'), bcrypt.gensalt())
    
    # Update the password and clear the reset token
    try:
        cursor.execute(
            "UPDATE users SET password_hash = %s, reset_token = NULL, reset_token_exp = NULL WHERE id = %s",
            (hashed_password, user_id)
        )
        conn.commit()
        
        cursor.close()
        conn.close()
        
        return jsonify({'message': 'Password has been reset successfully'}), 200
    
    except Exception as e:
        conn.rollback()
        cursor.close()
        conn.close()
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/update-profile', methods=['PUT'])
@token_required
def update_profile():
    data = request.get_json()
    
    # Fields that can be updated
    allowed_fields = ['first_name', 'last_name', 'phone']
    
    # Check if any allowed field is provided
    update_data = {}
    for field in allowed_fields:
        if field in data:
            update_data[field] = data[field]
    
    if not update_data:
        return jsonify({'error': 'No valid fields to update'}), 400
    
    # Construct the SQL query dynamically
    set_clause = ', '.join([f"{field} = %s" for field in update_data.keys()])
    query = f"UPDATE users SET {set_clause} WHERE id = %s"
    
    # Prepare values for the query
    values = list(update_data.values())
    values.append(request.user_id)
    
    # Execute the update
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute(query, values)
        conn.commit()
        
        # Get updated user data
        cursor.execute("SELECT id, email, first_name, last_name, phone FROM users WHERE id = %s", (request.user_id,))
        updated_user = cursor.fetchone()
        
        cursor.close()
        conn.close()
        
        return jsonify({
            'message': 'Profile updated successfully',
            'user': updated_user
        }), 200
    
    except Exception as e:
        conn.rollback()
        cursor.close()
        conn.close()
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/change-password', methods=['PUT'])
@token_required
def change_password():
    data = request.get_json()
    
    if 'current_password' not in data or 'new_password' not in data:
        return jsonify({'error': 'Current password and new password are required'}), 400
    
    current_password = data['current_password']
    new_password = data['new_password']
    
    # Validate password strength
    if not validate_password(new_password):
        return jsonify({
            'error': 'Password must be at least 8 characters and contain uppercase, lowercase, number, and special character'
        }), 400
    
    # Get user's current password hash
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT password_hash FROM users WHERE id = %s", (request.user_id,))
    user = cursor.fetchone()
    
    if not user:
        cursor.close()
        conn.close()
        return jsonify({'error': 'User not found'}), 404
    
    # Verify current password
    if not bcrypt.checkpw(current_password.encode('utf-8'), user['password_hash'].encode('utf-8')):
        cursor.close()
        conn.close()
        return jsonify({'error': 'Current password is incorrect'}), 401
    
    # Hash the new password
    hashed_password = bcrypt.hashpw(new_password.encode('utf-8'), bcrypt.gensalt())
    
    # Update the password
    try:
        cursor.execute(
            "UPDATE users SET password_hash = %s WHERE id = %s",
            (hashed_password, request.user_id)
        )
        conn.commit()
        
        cursor.close()
        conn.close()
        
        return jsonify({'message': 'Password changed successfully'}), 200
    
    except Exception as e:
        conn.rollback()
        cursor.close()
        conn.close()
        return jsonify({'error': str(e)}), 500
