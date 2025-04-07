"""
Orders Blueprint for GigGatek Backend.
Handles order management, tracking, and history.
"""

from flask import Blueprint

orders_bp = Blueprint('orders', __name__, url_prefix='/api/orders')

# Import routes to register them with the blueprint
from . import routes
