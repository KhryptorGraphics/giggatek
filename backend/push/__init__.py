"""
Push Notification Blueprint for GigGatek Backend.
Handles push notification subscriptions and sending.
"""

from flask import Blueprint

push_bp = Blueprint('push', __name__, url_prefix='/api/push')

# Import routes to register them with the blueprint
from . import routes
