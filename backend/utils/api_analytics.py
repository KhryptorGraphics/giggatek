"""
API Analytics Module

This module provides functions for tracking API usage and monitoring for errors.
It integrates with popular analytics services and provides a dashboard for monitoring.
"""

import time
import json
import logging
import threading
import os
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional, Union, Callable

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('logs/api_analytics.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger('api_analytics')

# Analytics data store
class AnalyticsStore:
    """In-memory store for analytics data with periodic flushing to disk/database"""
    
    def __init__(self, flush_interval: int = 60):
        """
        Initialize the analytics store
        
        Args:
            flush_interval: Interval in seconds to flush data to disk/database
        """
        self.requests = []
        self.errors = []
        self.endpoints = {}
        self.users = {}
        self.response_times = []
        self.flush_interval = flush_interval
        self.lock = threading.Lock()
        self.last_flush = time.time()
        
        # Start background thread for flushing data
        self.flush_thread = threading.Thread(target=self._flush_loop, daemon=True)
        self.flush_thread.start()
    
    def track_request(self, endpoint: str, method: str, user_id: Optional[int], 
                     response_time: float, status_code: int, ip_address: str,
                     user_agent: str, timestamp: Optional[float] = None) -> None:
        """
        Track an API request
        
        Args:
            endpoint: API endpoint path
            method: HTTP method (GET, POST, etc.)
            user_id: User ID or None for anonymous requests
            response_time: Response time in milliseconds
            status_code: HTTP status code
            ip_address: Client IP address
            user_agent: Client user agent
            timestamp: Request timestamp (defaults to current time)
        """
        if timestamp is None:
            timestamp = time.time()
        
        request_data = {
            'endpoint': endpoint,
            'method': method,
            'user_id': user_id,
            'response_time': response_time,
            'status_code': status_code,
            'ip_address': ip_address,
            'user_agent': user_agent,
            'timestamp': timestamp
        }
        
        with self.lock:
            self.requests.append(request_data)
            
            # Update endpoint stats
            endpoint_key = f"{method}:{endpoint}"
            if endpoint_key not in self.endpoints:
                self.endpoints[endpoint_key] = {
                    'count': 0,
                    'response_times': [],
                    'status_codes': {}
                }
            
            self.endpoints[endpoint_key]['count'] += 1
            self.endpoints[endpoint_key]['response_times'].append(response_time)
            
            status_key = str(status_code)
            if status_key not in self.endpoints[endpoint_key]['status_codes']:
                self.endpoints[endpoint_key]['status_codes'][status_key] = 0
            self.endpoints[endpoint_key]['status_codes'][status_key] += 1
            
            # Update user stats
            if user_id is not None:
                user_key = str(user_id)
                if user_key not in self.users:
                    self.users[user_key] = {
                        'count': 0,
                        'endpoints': {},
                        'first_seen': timestamp,
                        'last_seen': timestamp
                    }
                
                self.users[user_key]['count'] += 1
                self.users[user_key]['last_seen'] = timestamp
                
                if endpoint_key not in self.users[user_key]['endpoints']:
                    self.users[user_key]['endpoints'][endpoint_key] = 0
                self.users[user_key]['endpoints'][endpoint_key] += 1
            
            # Track response time
            self.response_times.append(response_time)
            
            # Check if it's time to flush data
            if time.time() - self.last_flush > self.flush_interval:
                self._flush_data()
    
    def track_error(self, endpoint: str, method: str, user_id: Optional[int],
                   error_type: str, error_message: str, stack_trace: str,
                   request_data: Dict[str, Any], ip_address: str,
                   user_agent: str, timestamp: Optional[float] = None) -> None:
        """
        Track an API error
        
        Args:
            endpoint: API endpoint path
            method: HTTP method (GET, POST, etc.)
            user_id: User ID or None for anonymous requests
            error_type: Type of error
            error_message: Error message
            stack_trace: Error stack trace
            request_data: Request data that caused the error
            ip_address: Client IP address
            user_agent: Client user agent
            timestamp: Error timestamp (defaults to current time)
        """
        if timestamp is None:
            timestamp = time.time()
        
        error_data = {
            'endpoint': endpoint,
            'method': method,
            'user_id': user_id,
            'error_type': error_type,
            'error_message': error_message,
            'stack_trace': stack_trace,
            'request_data': request_data,
            'ip_address': ip_address,
            'user_agent': user_agent,
            'timestamp': timestamp
        }
        
        with self.lock:
            self.errors.append(error_data)
            
            # Log the error
            logger.error(f"API Error: {error_type} - {error_message} - {endpoint}")
            
            # Check if it's time to flush data
            if time.time() - self.last_flush > self.flush_interval:
                self._flush_data()
    
    def get_stats(self, time_range: int = 3600) -> Dict[str, Any]:
        """
        Get analytics stats for the specified time range
        
        Args:
            time_range: Time range in seconds (default: 1 hour)
            
        Returns:
            Dictionary with analytics stats
        """
        with self.lock:
            # Calculate time threshold
            threshold = time.time() - time_range
            
            # Filter requests by time range
            filtered_requests = [r for r in self.requests if r['timestamp'] >= threshold]
            
            # Calculate stats
            total_requests = len(filtered_requests)
            
            if total_requests == 0:
                return {
                    'total_requests': 0,
                    'requests_per_minute': 0,
                    'average_response_time': 0,
                    'error_rate': 0,
                    'top_endpoints': [],
                    'status_code_distribution': {},
                    'time_range': time_range
                }
            
            # Calculate requests per minute
            requests_per_minute = total_requests / (time_range / 60)
            
            # Calculate average response time
            response_times = [r['response_time'] for r in filtered_requests]
            average_response_time = sum(response_times) / len(response_times)
            
            # Calculate error rate
            error_count = sum(1 for r in filtered_requests if r['status_code'] >= 400)
            error_rate = error_count / total_requests
            
            # Calculate top endpoints
            endpoint_counts = {}
            for r in filtered_requests:
                endpoint_key = f"{r['method']}:{r['endpoint']}"
                if endpoint_key not in endpoint_counts:
                    endpoint_counts[endpoint_key] = 0
                endpoint_counts[endpoint_key] += 1
            
            top_endpoints = sorted(
                [{'endpoint': k, 'count': v} for k, v in endpoint_counts.items()],
                key=lambda x: x['count'],
                reverse=True
            )[:10]
            
            # Calculate status code distribution
            status_codes = {}
            for r in filtered_requests:
                status_key = str(r['status_code'])
                if status_key not in status_codes:
                    status_codes[status_key] = 0
                status_codes[status_key] += 1
            
            return {
                'total_requests': total_requests,
                'requests_per_minute': requests_per_minute,
                'average_response_time': average_response_time,
                'error_rate': error_rate,
                'top_endpoints': top_endpoints,
                'status_code_distribution': status_codes,
                'time_range': time_range
            }
    
    def _flush_loop(self) -> None:
        """Background thread for periodically flushing data"""
        while True:
            time.sleep(self.flush_interval)
            self._flush_data()
    
    def _flush_data(self) -> None:
        """Flush analytics data to disk/database"""
        with self.lock:
            if not self.requests and not self.errors:
                self.last_flush = time.time()
                return
            
            # Create directory if it doesn't exist
            os.makedirs('data/analytics', exist_ok=True)
            
            # Generate timestamp for filenames
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            
            # Flush requests
            if self.requests:
                requests_file = f'data/analytics/requests_{timestamp}.json'
                with open(requests_file, 'w') as f:
                    json.dump(self.requests, f)
                self.requests = []
            
            # Flush errors
            if self.errors:
                errors_file = f'data/analytics/errors_{timestamp}.json'
                with open(errors_file, 'w') as f:
                    json.dump(self.errors, f)
                self.errors = []
            
            # Update last flush time
            self.last_flush = time.time()
            
            logger.info(f"Flushed analytics data to disk at {timestamp}")

# Create global analytics store instance
analytics_store = AnalyticsStore()

# Flask middleware for tracking API requests
def api_analytics_middleware():
    """Flask middleware for tracking API requests"""
    def decorator(app):
        @app.before_request
        def before_request():
            # Store request start time
            request.start_time = time.time()
        
        @app.after_request
        def after_request(response):
            # Skip tracking for static files
            if request.path.startswith('/static/'):
                return response
            
            # Calculate response time
            response_time = (time.time() - request.start_time) * 1000  # Convert to ms
            
            # Get user ID from session or token
            user_id = None
            if hasattr(g, 'user_id'):
                user_id = g.user_id
            
            # Track request
            analytics_store.track_request(
                endpoint=request.path,
                method=request.method,
                user_id=user_id,
                response_time=response_time,
                status_code=response.status_code,
                ip_address=request.remote_addr,
                user_agent=request.user_agent.string
            )
            
            return response
        
        @app.errorhandler(Exception)
        def handle_exception(e):
            # Get user ID from session or token
            user_id = None
            if hasattr(g, 'user_id'):
                user_id = g.user_id
            
            # Track error
            analytics_store.track_error(
                endpoint=request.path,
                method=request.method,
                user_id=user_id,
                error_type=type(e).__name__,
                error_message=str(e),
                stack_trace=traceback.format_exc(),
                request_data={
                    'args': request.args.to_dict(),
                    'form': request.form.to_dict(),
                    'json': request.get_json(silent=True)
                },
                ip_address=request.remote_addr,
                user_agent=request.user_agent.string
            )
            
            # Re-raise the exception
            raise e
        
        return app
    
    return decorator

# Function to get analytics stats
def get_api_stats(time_range: int = 3600) -> Dict[str, Any]:
    """
    Get API analytics stats
    
    Args:
        time_range: Time range in seconds (default: 1 hour)
        
    Returns:
        Dictionary with analytics stats
    """
    return analytics_store.get_stats(time_range)

# Function to track custom events
def track_custom_event(event_type: str, event_data: Dict[str, Any],
                      user_id: Optional[int] = None) -> None:
    """
    Track a custom event
    
    Args:
        event_type: Type of event
        event_data: Event data
        user_id: User ID or None for anonymous events
    """
    # Create directory if it doesn't exist
    os.makedirs('data/analytics/events', exist_ok=True)
    
    # Generate timestamp
    timestamp = time.time()
    formatted_timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    
    # Create event data
    event = {
        'event_type': event_type,
        'event_data': event_data,
        'user_id': user_id,
        'timestamp': timestamp
    }
    
    # Write event to file
    event_file = f'data/analytics/events/{event_type}_{formatted_timestamp}.json'
    with open(event_file, 'w') as f:
        json.dump(event, f)
    
    logger.info(f"Tracked custom event: {event_type}")

# Function to set up error alerting
def setup_error_alerting(threshold: int = 10, time_window: int = 300,
                        alert_callback: Optional[Callable[[str, List[Dict[str, Any]]], None]] = None) -> None:
    """
    Set up error alerting
    
    Args:
        threshold: Number of errors to trigger an alert
        time_window: Time window in seconds
        alert_callback: Callback function for alerts
    """
    def check_errors():
        while True:
            time.sleep(60)  # Check every minute
            
            # Get errors in the time window
            now = time.time()
            time_threshold = now - time_window
            
            with analytics_store.lock:
                recent_errors = [e for e in analytics_store.errors if e['timestamp'] >= time_threshold]
            
            # Check if threshold is exceeded
            if len(recent_errors) >= threshold:
                # Generate alert message
                alert_message = f"Error threshold exceeded: {len(recent_errors)} errors in the last {time_window} seconds"
                
                # Log alert
                logger.warning(alert_message)
                
                # Call alert callback if provided
                if alert_callback:
                    alert_callback(alert_message, recent_errors)
    
    # Start background thread for checking errors
    error_thread = threading.Thread(target=check_errors, daemon=True)
    error_thread.start()

# Example alert callback function
def email_alert(message: str, errors: List[Dict[str, Any]]) -> None:
    """
    Send an email alert
    
    Args:
        message: Alert message
        errors: List of errors
    """
    # In a real implementation, this would send an email
    logger.warning(f"EMAIL ALERT: {message}")
    
    # Log the first 5 errors
    for i, error in enumerate(errors[:5]):
        logger.warning(f"Error {i+1}: {error['error_type']} - {error['error_message']} - {error['endpoint']}")

# Initialize error alerting
setup_error_alerting(alert_callback=email_alert)
