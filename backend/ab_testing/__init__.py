"""
A/B Testing Module for GigGatek Backend.
Handles A/B testing for email templates and discount strategies.
"""

from flask import Blueprint

ab_testing_bp = Blueprint('ab_testing', __name__, url_prefix='/api/ab-testing')

# Import routes to register them with the blueprint
from . import routes
