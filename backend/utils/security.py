"""
Security Middleware Module

This module provides security middleware for the API.
"""

import re
import time
import uuid
import logging
import threading
from collections import defaultdict

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('logs/security.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger('security')

class SecurityMiddleware:
    """Security middleware for the API"""
    
    def __init__(self):
        """Initialize the security middleware"""
        # CSRF protection
        self.csrf_tokens = {}
        self.csrf_token_expiry = 3600  # 1 hour
        
        # Brute force protection
        self.login_attempts = defaultdict(list)
        self.max_login_attempts = 5
        self.login_attempt_window = 300  # 5 minutes
        self.blocked_ips = {}
        self.block_duration = 3600  # 1 hour
        
        # SQL injection protection
        self.sql_injection_patterns = [
            r"(?i)(\b|')SELECT(\b|')",
            r"(?i)(\b|')INSERT(\b|')",
            r"(?i)(\b|')UPDATE(\b|')",
            r"(?i)(\b|')DELETE(\b|')",
            r"(?i)(\b|')DROP(\b|')",
            r"(?i)(\b|')UNION(\b|')",
            r"(?i)(\b|')OR 1=1(\b|')",
            r"(?i)(\b|')OR '1'='1(\b|')",
            r"(?i)(\b|')--(\b|')",
            r"(?i)(\b|');(\b|')"
        ]
        
        # XSS protection
        self.xss_patterns = [
            r"(?i)<script[^>]*>.*?</script>",
            r"(?i)<img[^>]*onerror[^>]*>",
            r"(?i)<iframe[^>]*>.*?</iframe>",
            r"(?i)javascript:",
            r"(?i)onload=",
            r"(?i)onclick=",
            r"(?i)onmouseover="
        ]
        
        # Start cleanup thread
        self.cleanup_thread = threading.Thread(target=self._cleanup_loop, daemon=True)
        self.cleanup_thread.start()
    
    def _cleanup_loop(self):
        """Background thread for cleaning up expired tokens and attempts"""
        while True:
            time.sleep(60)  # Run every minute
            self._cleanup()
    
    def _cleanup(self):
        """Clean up expired tokens and attempts"""
        now = time.time()
        
        # Clean up expired CSRF tokens
        expired_tokens = []
        for token, expiry in self.csrf_tokens.items():
            if now > expiry:
                expired_tokens.append(token)
        
        for token in expired_tokens:
            del self.csrf_tokens[token]
        
        # Clean up expired login attempts
        for ip, attempts in list(self.login_attempts.items()):
            self.login_attempts[ip] = [attempt for attempt in attempts if now - attempt < self.login_attempt_window]
            if not self.login_attempts[ip]:
                del self.login_attempts[ip]
        
        # Clean up expired IP blocks
        for ip, expiry in list(self.blocked_ips.items()):
            if now > expiry:
                del self.blocked_ips[ip]
    
    def generate_csrf_token(self, user_id=None):
        """
        Generate a CSRF token
        
        Args:
            user_id: User ID to associate with the token
            
        Returns:
            str: CSRF token
        """
        token = str(uuid.uuid4())
        self.csrf_tokens[token] = time.time() + self.csrf_token_expiry
        return token
    
    def validate_csrf_token(self, token):
        """
        Validate a CSRF token
        
        Args:
            token: CSRF token to validate
            
        Returns:
            bool: True if valid, False otherwise
        """
        if token in self.csrf_tokens:
            if time.time() < self.csrf_tokens[token]:
                return True
            else:
                # Token expired
                del self.csrf_tokens[token]
        
        return False
    
    def check_brute_force(self, ip_address):
        """
        Check for brute force attempts
        
        Args:
            ip_address: IP address to check
            
        Returns:
            bool: True if allowed, False if blocked
        """
        # Check if IP is blocked
        if ip_address in self.blocked_ips:
            if time.time() < self.blocked_ips[ip_address]:
                return False
            else:
                # Block expired
                del self.blocked_ips[ip_address]
        
        # Check login attempts
        attempts = self.login_attempts[ip_address]
        now = time.time()
        
        # Remove attempts outside the window
        attempts = [attempt for attempt in attempts if now - attempt < self.login_attempt_window]
        self.login_attempts[ip_address] = attempts
        
        # Check if too many attempts
        if len(attempts) >= self.max_login_attempts:
            # Block the IP
            self.blocked_ips[ip_address] = now + self.block_duration
            logger.warning(f"IP blocked for brute force: {ip_address}")
            return False
        
        return True
    
    def record_login_attempt(self, ip_address, success):
        """
        Record a login attempt
        
        Args:
            ip_address: IP address of the attempt
            success: Whether the attempt was successful
        """
        if success:
            # Clear attempts on successful login
            self.login_attempts[ip_address] = []
        else:
            # Record failed attempt
            self.login_attempts[ip_address].append(time.time())
    
    def check_sql_injection(self, data):
        """
        Check for SQL injection attempts
        
        Args:
            data: Data to check
            
        Returns:
            tuple: (is_safe, detected_pattern)
        """
        if not data:
            return True, None
        
        # Convert data to string if it's not already
        if not isinstance(data, str):
            data = str(data)
        
        # Check each pattern
        for pattern in self.sql_injection_patterns:
            if re.search(pattern, data):
                return False, pattern
        
        return True, None
    
    def check_xss(self, data):
        """
        Check for XSS attempts
        
        Args:
            data: Data to check
            
        Returns:
            tuple: (is_safe, detected_pattern)
        """
        if not data:
            return True, None
        
        # Convert data to string if it's not already
        if not isinstance(data, str):
            data = str(data)
        
        # Check each pattern
        for pattern in self.xss_patterns:
            if re.search(pattern, data):
                return False, pattern
        
        return True, None
    
    def sanitize_input(self, data):
        """
        Sanitize input data
        
        Args:
            data: Data to sanitize
            
        Returns:
            str: Sanitized data
        """
        if not data:
            return data
        
        # Convert data to string if it's not already
        if not isinstance(data, str):
            data = str(data)
        
        # Replace potentially dangerous characters
        sanitized = data
        sanitized = sanitized.replace('<', '&lt;')
        sanitized = sanitized.replace('>', '&gt;')
        sanitized = sanitized.replace('"', '&quot;')
        sanitized = sanitized.replace("'", '&#x27;')
        sanitized = sanitized.replace('/', '&#x2F;')
        
        return sanitized
    
    def get_security_headers(self):
        """
        Get security headers
        
        Returns:
            dict: Security headers
        """
        return {
            'X-Content-Type-Options': 'nosniff',
            'X-Frame-Options': 'DENY',
            'X-XSS-Protection': '1; mode=block',
            'Content-Security-Policy': "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self'",
            'Referrer-Policy': 'strict-origin-when-cross-origin',
            'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
            'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
            'Pragma': 'no-cache'
        }

# Create global security middleware instance
security = SecurityMiddleware()

# Flask middleware for security
def security_middleware():
    """Flask middleware for security"""
    def decorator(app):
        @app.before_request
        def before_request():
            # Skip security checks for static files
            if request.path.startswith('/static/'):
                return None
            
            # Get client IP
            client_ip = request.remote_addr
            
            # Check if IP is blocked
            if client_ip in security.blocked_ips:
                if time.time() < security.blocked_ips[client_ip]:
                    logger.warning(f"Blocked IP attempted access: {client_ip}")
                    return jsonify({'error': 'Access denied'}), 403
                else:
                    # Block expired
                    del security.blocked_ips[client_ip]
            
            # Check for CSRF token on state-changing requests
            if request.method in ['POST', 'PUT', 'DELETE', 'PATCH']:
                # Skip CSRF check for API endpoints that use token authentication
                if not request.path.startswith('/api/v1/'):
                    csrf_token = request.headers.get('X-CSRF-Token') or request.form.get('csrf_token')
                    if not csrf_token or not security.validate_csrf_token(csrf_token):
                        logger.warning(f"CSRF token validation failed: {client_ip}")
                        return jsonify({'error': 'CSRF token validation failed'}), 403
            
            # Check for SQL injection in request parameters
            for key, value in request.args.items():
                is_safe, pattern = security.check_sql_injection(value)
                if not is_safe:
                    logger.warning(f"SQL injection attempt detected: {client_ip}, pattern: {pattern}, param: {key}")
                    return jsonify({'error': 'Invalid input'}), 400
            
            # Check for SQL injection in form data
            for key, value in request.form.items():
                is_safe, pattern = security.check_sql_injection(value)
                if not is_safe:
                    logger.warning(f"SQL injection attempt detected: {client_ip}, pattern: {pattern}, param: {key}")
                    return jsonify({'error': 'Invalid input'}), 400
            
            # Check for SQL injection in JSON data
            if request.is_json:
                json_data = request.get_json(silent=True)
                if json_data:
                    def check_json_data(data, path=''):
                        if isinstance(data, dict):
                            for k, v in data.items():
                                new_path = f"{path}.{k}" if path else k
                                if isinstance(v, (dict, list)):
                                    result = check_json_data(v, new_path)
                                    if result:
                                        return result
                                else:
                                    is_safe, pattern = security.check_sql_injection(v)
                                    if not is_safe:
                                        return new_path, v, pattern
                        elif isinstance(data, list):
                            for i, item in enumerate(data):
                                new_path = f"{path}[{i}]"
                                if isinstance(item, (dict, list)):
                                    result = check_json_data(item, new_path)
                                    if result:
                                        return result
                                else:
                                    is_safe, pattern = security.check_sql_injection(item)
                                    if not is_safe:
                                        return new_path, item, pattern
                        return None
                    
                    result = check_json_data(json_data)
                    if result:
                        path, value, pattern = result
                        logger.warning(f"SQL injection attempt detected: {client_ip}, pattern: {pattern}, path: {path}")
                        return jsonify({'error': 'Invalid input'}), 400
            
            # Check for XSS in request parameters
            for key, value in request.args.items():
                is_safe, pattern = security.check_xss(value)
                if not is_safe:
                    logger.warning(f"XSS attempt detected: {client_ip}, pattern: {pattern}, param: {key}")
                    return jsonify({'error': 'Invalid input'}), 400
            
            # Check for XSS in form data
            for key, value in request.form.items():
                is_safe, pattern = security.check_xss(value)
                if not is_safe:
                    logger.warning(f"XSS attempt detected: {client_ip}, pattern: {pattern}, param: {key}")
                    return jsonify({'error': 'Invalid input'}), 400
        
        @app.after_request
        def after_request(response):
            # Add security headers
            for key, value in security.get_security_headers().items():
                response.headers[key] = value
            
            return response
        
        return app
    
    return decorator

# Function to block an IP
def block_ip(ip_address, duration=3600):
    """
    Block an IP address
    
    Args:
        ip_address: IP address to block
        duration: Duration in seconds (default: 1 hour)
    """
    security.blocked_ips[ip_address] = time.time() + duration
    logger.warning(f"IP blocked manually: {ip_address}, duration: {duration}s")

# Function to unblock an IP
def unblock_ip(ip_address):
    """
    Unblock an IP address
    
    Args:
        ip_address: IP address to unblock
    """
    if ip_address in security.blocked_ips:
        del security.blocked_ips[ip_address]
        logger.info(f"IP unblocked manually: {ip_address}")

# Function to get blocked IPs
def get_blocked_ips():
    """
    Get blocked IPs
    
    Returns:
        dict: Blocked IPs and their expiry times
    """
    now = time.time()
    return {
        ip: {
            'expires_at': expiry,
            'remaining': int(expiry - now)
        }
        for ip, expiry in security.blocked_ips.items()
    }

# Function to sanitize a dictionary recursively
def sanitize_dict(data):
    """
    Sanitize a dictionary recursively
    
    Args:
        data: Dictionary to sanitize
        
    Returns:
        dict: Sanitized dictionary
    """
    if isinstance(data, dict):
        return {k: sanitize_dict(v) for k, v in data.items()}
    elif isinstance(data, list):
        return [sanitize_dict(item) for item in data]
    elif isinstance(data, str):
        return security.sanitize_input(data)
    else:
        return data
