"""
Authentication Blueprint for GigGatek Backend.
Handles user authentication, registration, and authorization.
"""

from flask import Blueprint

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

# Import routes to register them with the blueprint
from . import routes
