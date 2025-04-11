"""
Abandoned Carts Blueprint for GigGatek Backend.
Handles tracking and recovery of abandoned shopping carts.
"""

from flask import Blueprint

abandoned_carts_bp = Blueprint('abandoned_carts', __name__, url_prefix='/api/abandoned-carts')

# Import routes to register them with the blueprint
from . import routes
