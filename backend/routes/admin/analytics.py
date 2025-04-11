"""
API Analytics Dashboard Routes

This module provides routes for the API analytics dashboard.
"""

from flask import Blueprint, render_template, request, jsonify, abort
from flask_login import login_required
from backend.auth.roles import require_permission
from backend.utils.api_analytics import get_api_stats
from datetime import datetime, timedelta

# Create blueprint
analytics_bp = Blueprint('analytics', __name__, url_prefix='/admin/analytics')

@analytics_bp.route('/', methods=['GET'])
@login_required
@require_permission('VIEW_ANALYTICS')
def dashboard():
    """Render the analytics dashboard"""
    return render_template('admin/analytics/dashboard.html')

@analytics_bp.route('/api/stats', methods=['GET'])
@login_required
@require_permission('VIEW_ANALYTICS')
def api_stats():
    """Get API stats for the dashboard"""
    # Get time range from query parameters
    time_range = request.args.get('time_range', '1h')
    
    # Convert time range to seconds
    seconds = 3600  # Default: 1 hour
    if time_range == '15m':
        seconds = 15 * 60
    elif time_range == '1h':
        seconds = 60 * 60
    elif time_range == '6h':
        seconds = 6 * 60 * 60
    elif time_range == '24h':
        seconds = 24 * 60 * 60
    elif time_range == '7d':
        seconds = 7 * 24 * 60 * 60
    elif time_range == '30d':
        seconds = 30 * 24 * 60 * 60
    
    # Get stats
    stats = get_api_stats(seconds)
    
    # Add formatted time range
    if time_range == '15m':
        stats['time_range_formatted'] = 'Last 15 minutes'
    elif time_range == '1h':
        stats['time_range_formatted'] = 'Last hour'
    elif time_range == '6h':
        stats['time_range_formatted'] = 'Last 6 hours'
    elif time_range == '24h':
        stats['time_range_formatted'] = 'Last 24 hours'
    elif time_range == '7d':
        stats['time_range_formatted'] = 'Last 7 days'
    elif time_range == '30d':
        stats['time_range_formatted'] = 'Last 30 days'
    
    return jsonify(stats)

@analytics_bp.route('/api/errors', methods=['GET'])
@login_required
@require_permission('VIEW_ANALYTICS')
def api_errors():
    """Get API errors for the dashboard"""
    # Get time range from query parameters
    time_range = request.args.get('time_range', '24h')
    
    # Convert time range to seconds
    seconds = 24 * 60 * 60  # Default: 24 hours
    if time_range == '1h':
        seconds = 60 * 60
    elif time_range == '6h':
        seconds = 6 * 60 * 60
    elif time_range == '24h':
        seconds = 24 * 60 * 60
    elif time_range == '7d':
        seconds = 7 * 24 * 60 * 60
    
    # Get page and limit from query parameters
    page = int(request.args.get('page', 1))
    limit = int(request.args.get('limit', 20))
    
    # Calculate time threshold
    threshold = datetime.now() - timedelta(seconds=seconds)
    
    # In a real implementation, this would query the database
    # For this example, we'll return mock data
    errors = [
        {
            'id': 1,
            'endpoint': '/api/v1/orders',
            'method': 'POST',
            'error_type': 'ValidationError',
            'error_message': 'Missing required field: items',
            'timestamp': (datetime.now() - timedelta(minutes=30)).isoformat(),
            'user_id': 123,
            'ip_address': '192.168.1.1'
        },
        {
            'id': 2,
            'endpoint': '/api/v1/payments/stripe/intent',
            'method': 'POST',
            'error_type': 'StripeError',
            'error_message': 'Invalid API key provided',
            'timestamp': (datetime.now() - timedelta(hours=2)).isoformat(),
            'user_id': 456,
            'ip_address': '192.168.1.2'
        },
        {
            'id': 3,
            'endpoint': '/api/v1/products/999',
            'method': 'GET',
            'error_type': 'NotFoundError',
            'error_message': 'Product not found',
            'timestamp': (datetime.now() - timedelta(hours=5)).isoformat(),
            'user_id': None,
            'ip_address': '192.168.1.3'
        }
    ]
    
    # Filter errors by time range
    filtered_errors = [e for e in errors if datetime.fromisoformat(e['timestamp']) > threshold]
    
    # Paginate errors
    start_index = (page - 1) * limit
    end_index = start_index + limit
    paginated_errors = filtered_errors[start_index:end_index]
    
    return jsonify({
        'errors': paginated_errors,
        'total': len(filtered_errors),
        'page': page,
        'limit': limit,
        'total_pages': (len(filtered_errors) + limit - 1) // limit
    })

@analytics_bp.route('/api/endpoints', methods=['GET'])
@login_required
@require_permission('VIEW_ANALYTICS')
def api_endpoints():
    """Get API endpoint stats for the dashboard"""
    # Get time range from query parameters
    time_range = request.args.get('time_range', '24h')
    
    # Convert time range to seconds
    seconds = 24 * 60 * 60  # Default: 24 hours
    if time_range == '1h':
        seconds = 60 * 60
    elif time_range == '6h':
        seconds = 6 * 60 * 60
    elif time_range == '24h':
        seconds = 24 * 60 * 60
    elif time_range == '7d':
        seconds = 7 * 24 * 60 * 60
    
    # Get stats
    stats = get_api_stats(seconds)
    
    # Extract endpoint stats
    endpoints = stats.get('top_endpoints', [])
    
    # Add more details to each endpoint
    for endpoint in endpoints:
        # In a real implementation, this would include more details
        endpoint['average_response_time'] = round(stats.get('average_response_time', 0), 2)
        endpoint['error_rate'] = round(stats.get('error_rate', 0) * 100, 2)
    
    return jsonify({
        'endpoints': endpoints,
        'time_range': time_range
    })

@analytics_bp.route('/api/users', methods=['GET'])
@login_required
@require_permission('VIEW_ANALYTICS')
def api_users():
    """Get API user stats for the dashboard"""
    # Get time range from query parameters
    time_range = request.args.get('time_range', '7d')
    
    # Convert time range to seconds
    seconds = 7 * 24 * 60 * 60  # Default: 7 days
    if time_range == '24h':
        seconds = 24 * 60 * 60
    elif time_range == '7d':
        seconds = 7 * 24 * 60 * 60
    elif time_range == '30d':
        seconds = 30 * 24 * 60 * 60
    
    # In a real implementation, this would query the database
    # For this example, we'll return mock data
    users = [
        {
            'user_id': 123,
            'email': 'user1@example.com',
            'request_count': 156,
            'last_active': (datetime.now() - timedelta(hours=2)).isoformat(),
            'top_endpoints': [
                {'endpoint': 'GET:/api/v1/products', 'count': 45},
                {'endpoint': 'GET:/api/v1/orders', 'count': 32},
                {'endpoint': 'POST:/api/v1/orders', 'count': 12}
            ]
        },
        {
            'user_id': 456,
            'email': 'user2@example.com',
            'request_count': 89,
            'last_active': (datetime.now() - timedelta(hours=5)).isoformat(),
            'top_endpoints': [
                {'endpoint': 'GET:/api/v1/products', 'count': 30},
                {'endpoint': 'GET:/api/v1/rentals', 'count': 25},
                {'endpoint': 'POST:/api/v1/rentals', 'count': 8}
            ]
        },
        {
            'user_id': 789,
            'email': 'user3@example.com',
            'request_count': 42,
            'last_active': (datetime.now() - timedelta(days=1)).isoformat(),
            'top_endpoints': [
                {'endpoint': 'GET:/api/v1/products', 'count': 20},
                {'endpoint': 'GET:/api/v1/products/123', 'count': 15},
                {'endpoint': 'POST:/api/v1/orders', 'count': 5}
            ]
        }
    ]
    
    return jsonify({
        'users': users,
        'time_range': time_range
    })
