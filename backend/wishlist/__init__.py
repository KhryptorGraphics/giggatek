"""
Wishlist Blueprint for GigGatek Backend.
Handles wishlist management.
"""

from flask import Blueprint

wishlist_bp = Blueprint('wishlist', __name__, url_prefix='/api/wishlist')

# Import routes to register them with the blueprint
from . import routes
