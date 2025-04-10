"""
Payment Blueprint for GigGatek Backend.
Handles payment processing with Stripe.
"""

from flask import Blueprint

payment_bp = Blueprint('payment', __name__, url_prefix='/api/payment')

# Import routes to register them with the blueprint
from . import routes
