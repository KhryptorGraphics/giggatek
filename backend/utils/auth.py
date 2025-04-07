"""
Authentication utility functions and middleware for GigGatek backend.
Includes role-based access control and route protection functions.
"""

from functools import wraps
from flask import jsonify, request
from flask_jwt_extended import get_jwt, verify_jwt_in_request

def role_required(role_list):
    """
    Decorator for API routes that checks if the current user has the required roles.
    
    Args:
        role_list (list or str): A list of roles or a single role required to access the route.
        
    Returns:
        Function: Decorated route function.
    """
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            # First verify JWT is valid
            verify_jwt_in_request()
            
            # Convert single role to list
            roles = role_list if isinstance(role_list, list) else [role_list]
            
            # Get claims from JWT
            claims = get_jwt()
            
            # Check if user role is in the required roles list
            if 'role' not in claims or claims['role'] not in roles:
                return jsonify({"status": "error", "message": "Insufficient permissions"}), 403
            
            return fn(*args, **kwargs)
        return wrapper
    return decorator

# Predefined role decorators for common use cases
def admin_required(fn):
    """
    Decorator for routes that require admin privileges.
    """
    return role_required('admin')(fn)

def manager_required(fn):
    """
    Decorator for routes that require manager privileges.
    Manager or admin roles are allowed.
    """
    return role_required(['manager', 'admin'])(fn)

def customer_or_higher_required(fn):
    """
    Decorator for routes that require customer or higher privileges.
    Customer, manager, or admin roles are allowed.
    """
    return role_required(['customer', 'manager', 'admin'])(fn)

# Helper functions for authentication
def get_user_id_from_token():
    """
    Extract user_id from JWT token.
    
    Returns:
        int: The user_id from the token or None if no token or invalid token.
    """
    try:
        verify_jwt_in_request()
        claims = get_jwt()
        return claims.get('sub')  # 'sub' is the JWT subject, which contains the user_id
    except:
        return None

def get_user_role_from_token():
    """
    Extract user role from JWT token.
    
    Returns:
        str: The user role from the token or None if no token or invalid token.
    """
    try:
        verify_jwt_in_request()
        claims = get_jwt()
        return claims.get('role')
    except:
        return None
