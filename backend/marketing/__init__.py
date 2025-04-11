"""
Marketing Integrations Module for GigGatek Backend.
Handles integration with various marketing tools.
"""

from flask import Blueprint

marketing_bp = Blueprint('marketing', __name__, url_prefix='/api/marketing')

# Import routes to register them with the blueprint
from . import routes
