"""
Validation utility functions for GigGatek backend.
These functions validate various input fields to ensure data integrity.
"""

import re

def is_valid_email(email):
    """
    Validates email format.
    
    Args:
        email (str): Email to validate
        
    Returns:
        bool: True if email is valid, False otherwise
    """
    if not email:
        return False
    
    # Basic email regex pattern
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return bool(re.match(pattern, email))

def is_valid_password(password):
    """
    Validates password strength.
    Password must be at least 8 characters and include uppercase, 
    lowercase, number, and special character.
    
    Args:
        password (str): Password to validate
        
    Returns:
        bool: True if password meets strength requirements, False otherwise
    """
    if not password or len(password) < 8:
        return False
    
    # Check for at least one uppercase letter
    if not re.search(r'[A-Z]', password):
        return False
    
    # Check for at least one lowercase letter
    if not re.search(r'[a-z]', password):
        return False
    
    # Check for at least one digit
    if not re.search(r'\d', password):
        return False
    
    # Check for at least one special character
    if not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
        return False
    
    return True

def is_valid_name(name):
    """
    Validates name format.
    Name should contain only letters, spaces, hyphens, and apostrophes.
    
    Args:
        name (str): Name to validate
        
    Returns:
        bool: True if name is valid, False otherwise
    """
    if not name or len(name) < 2:
        return False
    
    # Name pattern allowing letters, spaces, hyphens, and apostrophes
    pattern = r'^[a-zA-Z\s\'-]+$'
    return bool(re.match(pattern, name))

def is_valid_phone(phone):
    """
    Validates phone number format.
    Allows various formats like (123) 456-7890, 123-456-7890, 1234567890.
    
    Args:
        phone (str): Phone number to validate
        
    Returns:
        bool: True if phone number is valid, False otherwise
    """
    if not phone:
        return False
    
    # Remove all non-numeric characters to normalize
    digits = re.sub(r'\D', '', phone)
    
    # Check if we have 10-15 digits (allowing for country codes)
    if len(digits) < 10 or len(digits) > 15:
        return False
    
    return True
