"""
GigGatek Role-Based Access Control System
Handles user roles, permissions, and access control
"""

from enum import Enum, auto
from functools import wraps
from flask import request, jsonify, g
import jwt
from datetime import datetime, timedelta
import os
from typing import List, Dict, Any, Callable, Optional, Union

# Define roles
class Role(Enum):
    GUEST = auto()
    CUSTOMER = auto()
    SUPPORT = auto()
    ADMIN = auto()
    SUPER_ADMIN = auto()

# Define permissions
class Permission(Enum):
    # Product permissions
    VIEW_PRODUCTS = auto()
    EDIT_PRODUCTS = auto()
    CREATE_PRODUCTS = auto()
    DELETE_PRODUCTS = auto()
    
    # Order permissions
    VIEW_OWN_ORDERS = auto()
    VIEW_ALL_ORDERS = auto()
    EDIT_ORDERS = auto()
    CANCEL_ORDERS = auto()
    
    # Rental permissions
    VIEW_OWN_RENTALS = auto()
    VIEW_ALL_RENTALS = auto()
    CREATE_RENTALS = auto()
    EDIT_RENTALS = auto()
    CANCEL_RENTALS = auto()
    
    # User permissions
    VIEW_OWN_PROFILE = auto()
    VIEW_ALL_PROFILES = auto()
    EDIT_OWN_PROFILE = auto()
    EDIT_ALL_PROFILES = auto()
    
    # Admin permissions
    VIEW_DASHBOARD = auto()
    VIEW_ANALYTICS = auto()
    MANAGE_SETTINGS = auto()
    MANAGE_USERS = auto()

# Role-permission mapping
ROLE_PERMISSIONS = {
    Role.GUEST: [
        Permission.VIEW_PRODUCTS,
    ],
    Role.CUSTOMER: [
        Permission.VIEW_PRODUCTS,
        Permission.VIEW_OWN_ORDERS,
        Permission.CANCEL_ORDERS,
        Permission.VIEW_OWN_RENTALS,
        Permission.CANCEL_RENTALS,
        Permission.VIEW_OWN_PROFILE,
        Permission.EDIT_OWN_PROFILE,
    ],
    Role.SUPPORT: [
        Permission.VIEW_PRODUCTS,
        Permission.VIEW_ALL_ORDERS,
        Permission.EDIT_ORDERS,
        Permission.VIEW_ALL_RENTALS,
        Permission.EDIT_RENTALS,
        Permission.VIEW_OWN_PROFILE,
        Permission.EDIT_OWN_PROFILE,
        Permission.VIEW_ALL_PROFILES,
        Permission.VIEW_DASHBOARD,
    ],
    Role.ADMIN: [
        Permission.VIEW_PRODUCTS,
        Permission.EDIT_PRODUCTS,
        Permission.CREATE_PRODUCTS,
        Permission.VIEW_ALL_ORDERS,
        Permission.EDIT_ORDERS,
        Permission.CANCEL_ORDERS,
        Permission.VIEW_ALL_RENTALS,
        Permission.CREATE_RENTALS,
        Permission.EDIT_RENTALS,
        Permission.CANCEL_RENTALS,
        Permission.VIEW_OWN_PROFILE,
        Permission.EDIT_OWN_PROFILE,
        Permission.VIEW_ALL_PROFILES,
        Permission.EDIT_ALL_PROFILES,
        Permission.VIEW_DASHBOARD,
        Permission.VIEW_ANALYTICS,
        Permission.MANAGE_SETTINGS,
    ],
    Role.SUPER_ADMIN: [
        Permission.VIEW_PRODUCTS,
        Permission.EDIT_PRODUCTS,
        Permission.CREATE_PRODUCTS,
        Permission.DELETE_PRODUCTS,
        Permission.VIEW_ALL_ORDERS,
        Permission.EDIT_ORDERS,
        Permission.CANCEL_ORDERS,
        Permission.VIEW_ALL_RENTALS,
        Permission.CREATE_RENTALS,
        Permission.EDIT_RENTALS,
        Permission.CANCEL_RENTALS,
        Permission.VIEW_OWN_PROFILE,
        Permission.EDIT_OWN_PROFILE,
        Permission.VIEW_ALL_PROFILES,
        Permission.EDIT_ALL_PROFILES,
        Permission.VIEW_DASHBOARD,
        Permission.VIEW_ANALYTICS,
        Permission.MANAGE_SETTINGS,
        Permission.MANAGE_USERS,
    ],
}

class RBACError(Exception):
    """Base exception for RBAC errors"""
    pass

class UnauthorizedError(RBACError):
    """Raised when a user is not authenticated"""
    pass

class ForbiddenError(RBACError):
    """Raised when a user does not have the required permissions"""
    pass

def get_user_role(user_id: int) -> Role:
    """
    Get the role of a user from the database
    
    Args:
        user_id: The ID of the user
        
    Returns:
        The role of the user
    """
    # TODO: Implement database lookup
    # For now, return a default role
    return Role.CUSTOMER

def has_permission(user_id: int, permission: Permission) -> bool:
    """
    Check if a user has a specific permission
    
    Args:
        user_id: The ID of the user
        permission: The permission to check
        
    Returns:
        True if the user has the permission, False otherwise
    """
    role = get_user_role(user_id)
    return permission in ROLE_PERMISSIONS[role]

def require_auth(f: Callable) -> Callable:
    """
    Decorator to require authentication for a route
    
    Args:
        f: The function to decorate
        
    Returns:
        The decorated function
    """
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        
        if not auth_header:
            return jsonify({'error': 'Authorization header is missing'}), 401
        
        try:
            # Extract token from header
            token = auth_header.split(' ')[1]
            
            # Decode token
            secret_key = os.environ.get('JWT_SECRET_KEY', 'default_secret_key')
            payload = jwt.decode(token, secret_key, algorithms=['HS256'])
            
            # Store user ID in Flask's g object for use in the route
            g.user_id = payload['sub']
            
            return f(*args, **kwargs)
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token has expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'error': 'Invalid token'}), 401
    
    return decorated

def require_permission(permission: Permission) -> Callable:
    """
    Decorator to require a specific permission for a route
    
    Args:
        permission: The permission required
        
    Returns:
        The decorator function
    """
    def decorator(f: Callable) -> Callable:
        @wraps(f)
        def decorated(*args, **kwargs):
            # First check if user is authenticated
            if not hasattr(g, 'user_id'):
                return jsonify({'error': 'Authentication required'}), 401
            
            # Then check if user has the required permission
            if not has_permission(g.user_id, permission):
                return jsonify({'error': 'Permission denied'}), 403
            
            return f(*args, **kwargs)
        
        return decorated
    
    return decorator

def generate_token(user_id: int, expiry_minutes: int = 60) -> str:
    """
    Generate a JWT token for a user
    
    Args:
        user_id: The ID of the user
        expiry_minutes: The number of minutes until the token expires
        
    Returns:
        The JWT token
    """
    secret_key = os.environ.get('JWT_SECRET_KEY', 'default_secret_key')
    payload = {
        'sub': user_id,
        'iat': datetime.utcnow(),
        'exp': datetime.utcnow() + timedelta(minutes=expiry_minutes)
    }
    
    return jwt.encode(payload, secret_key, algorithm='HS256')

def verify_token(token: str) -> Dict[str, Any]:
    """
    Verify a JWT token
    
    Args:
        token: The JWT token to verify
        
    Returns:
        The decoded token payload
        
    Raises:
        jwt.ExpiredSignatureError: If the token has expired
        jwt.InvalidTokenError: If the token is invalid
    """
    secret_key = os.environ.get('JWT_SECRET_KEY', 'default_secret_key')
    return jwt.decode(token, secret_key, algorithms=['HS256'])

def get_user_permissions(user_id: int) -> List[Permission]:
    """
    Get all permissions for a user
    
    Args:
        user_id: The ID of the user
        
    Returns:
        A list of permissions
    """
    role = get_user_role(user_id)
    return ROLE_PERMISSIONS[role]
