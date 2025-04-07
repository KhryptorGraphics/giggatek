"""
Rental Management Package.
Handles GigGatek rent-to-own functionality.
"""

from flask import Blueprint

# Create the rentals blueprint
rentals_bp = Blueprint('rentals', __name__, url_prefix='/api/rentals')

# Import routes after blueprint creation to avoid circular imports
from . import routes
