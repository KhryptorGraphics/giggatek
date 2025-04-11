"""
Predictive Analytics Module for GigGatek Backend.
Handles predictive analytics for abandoned cart recovery.
"""

from flask import Blueprint

predictive_bp = Blueprint('predictive', __name__, url_prefix='/api/predictive')

# Import routes to register them with the blueprint
from . import routes
