"""
Customer Segmentation Module for GigGatek Backend.
Handles customer segmentation for targeted marketing campaigns.
"""

from flask import Blueprint

segmentation_bp = Blueprint('segmentation', __name__, url_prefix='/api/segmentation')

# Import routes to register them with the blueprint
from . import routes
