"""
Monitoring utilities for the GigGatek Flask backend

This module provides instrumentation helpers to expose metrics to Prometheus
and send structured logs to the ELK stack.
"""

import time
import os
import logging
import json
from functools import wraps
from flask import request, g
from prometheus_client import Counter, Histogram, Gauge, push_to_gateway

# Configure logging
logger = logging.getLogger(__name__)

# Environment configuration
ENVIRONMENT = os.environ.get('FLASK_ENV', 'development')
PUSH_GATEWAY = os.environ.get('PROMETHEUS_PUSHGATEWAY', 'flask-exporter:9091')
APP_NAME = 'giggatek_backend'

# Define Prometheus metrics
http_requests_total = Counter(
    'http_requests_total', 
    'Total HTTP requests',
    ['method', 'endpoint', 'status']
)

http_request_duration_seconds = Histogram(
    'http_request_duration_seconds',
    'HTTP request duration in seconds',
    ['method', 'endpoint'],
    buckets=[0.01, 0.05, 0.1, 0.5, 1.0, 2.0, 5.0, 10.0]
)

db_query_duration_seconds = Histogram(
    'db_query_duration_seconds',
    'Database query duration in seconds',
    ['query_type', 'table'],
    buckets=[0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1.0]
)

payment_errors_total = Counter(
    'payment_errors_total',
    'Total payment processing errors',
    ['processor', 'error_type']
)

authentication_failures_total = Counter(
    'authentication_failures_total',
    'Total authentication failures',
    ['reason']
)

active_users_gauge = Gauge(
    'active_users',
    'Number of active users',
    ['role']
)

order_processing_duration_seconds = Histogram(
    'order_processing_duration_seconds',
    'Order processing duration in seconds',
    ['order_type'],
    buckets=[0.5, 1.0, 5.0, 10.0, 30.0, 60.0, 300.0]
)

rental_contract_errors_total = Counter(
    'rental_contract_errors_total',
    'Total rental contract errors',
    ['error_type']
)

def http_metrics_middleware():
    """
    Flask middleware to record HTTP request metrics
    """
    def decorator(app):
        @app.before_request
        def before_request():
            g.start_time = time.time()

        @app.after_request
        def after_request(response):
            if hasattr(g, 'start_time'):
                duration = time.time() - g.start_time
                endpoint = request.endpoint or 'unknown'
                status = response.status_code
                
                # Record metrics
                http_requests_total.labels(
                    method=request.method,
                    endpoint=endpoint,
                    status=status
                ).inc()
                
                http_request_duration_seconds.labels(
                    method=request.method,
                    endpoint=endpoint
                ).observe(duration)
                
                # Log structured data for ELK
                log_data = {
                    'method': request.method,
                    'endpoint': endpoint,
                    'status': status,
                    'duration_ms': duration * 1000,
                    'path': request.path,
                    'remote_addr': request.remote_addr,
                    'content_length': request.content_length,
                    'user_agent': request.user_agent.string if request.user_agent else None,
                    'timestamp': time.time(),
                    'type': 'api_request'
                }
                
                # Add custom log fields for business metrics
                if 'user_id' in g:
                    log_data['user_id'] = g.user_id
                if 'is_admin' in g:
                    log_data['is_admin'] = g.is_admin
                    
                if status >= 500:
                    logger.error(f"API request: {request.method} {request.path} failed with {status}", extra=log_data)
                elif status >= 400:
                    logger.warning(f"API request: {request.method} {request.path} failed with {status}", extra=log_data)
                else:
                    logger.info(f"API request: {request.method} {request.path} completed in {duration*1000:.2f}ms", extra=log_data)
                
            return response
            
        return app
    return decorator

def db_query_timer(query_type, table):
    """
    Decorator to measure database query execution time
    
    Args:
        query_type: Type of query (SELECT, INSERT, UPDATE, DELETE)
        table: Database table being queried
    """
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            start_time = time.time()
            try:
                result = func(*args, **kwargs)
                duration = time.time() - start_time
                db_query_duration_seconds.labels(
                    query_type=query_type,
                    table=table
                ).observe(duration)
                
                # Log slow queries
                if duration > 0.5:  # 500ms threshold for slow queries
                    logger.warning(f"Slow DB query: {query_type} on {table} took {duration*1000:.2f}ms", extra={
                        'query_type': query_type,
                        'table': table,
                        'duration_ms': duration * 1000,
                        'query_time': {'ms': duration * 1000},
                        'type': 'db_query',
                        'is_slow_query': True
                    })
                return result
            except Exception as e:
                duration = time.time() - start_time
                logger.error(f"DB query error: {query_type} on {table}: {str(e)}", extra={
                    'query_type': query_type,
                    'table': table,
                    'error': str(e),
                    'duration_ms': duration * 1000,
                    'type': 'db_query_error'
                })
                raise
        return wrapper
    return decorator

def record_payment_error(processor, error_type, details=None):
    """
    Record a payment processing error
    
    Args:
        processor: Payment processor (e.g., 'stripe', 'paypal')
        error_type: Type of error (e.g., 'card_declined', 'insufficient_funds')
        details: Additional error details
    """
    payment_errors_total.labels(
        processor=processor,
        error_type=error_type
    ).inc()
    
    logger.error(f"Payment error: {processor} - {error_type}", extra={
        'processor': processor,
        'error_type': error_type,
        'details': details,
        'timestamp': time.time(),
        'type': 'payment',
        'log_category': 'payment_processing',
        'status': 'failed'
    })

def record_authentication_failure(reason, username=None, ip=None):
    """
    Record an authentication failure
    
    Args:
        reason: Reason for failure (e.g., 'invalid_password', 'account_locked')
        username: Username that failed authentication (optional)
        ip: IP address of the request (optional)
    """
    authentication_failures_total.labels(reason=reason).inc()
    
    log_data = {
        'reason': reason,
        'timestamp': time.time(),
        'type': 'auth',
        'log_category': 'authentication',
        'status': 'failed'
    }
    
    # Only include these if provided
    if username:
        log_data['username'] = username
    if ip:
        log_data['ip'] = ip
        
    logger.warning(f"Authentication failure: {reason}", extra=log_data)

def track_order_processing(order_type):
    """
    Decorator to track order processing time
    
    Args:
        order_type: Type of order (e.g., 'purchase', 'rental')
    """
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            start_time = time.time()
            try:
                result = func(*args, **kwargs)
                duration = time.time() - start_time
                
                order_processing_duration_seconds.labels(
                    order_type=order_type
                ).observe(duration)
                
                # Extract order ID if it's in the result
                order_id = None
                if isinstance(result, dict) and 'order_id' in result:
                    order_id = result['order_id']
                
                logger.info(f"Order processed: {order_type}", extra={
                    'order_type': order_type,
                    'duration_ms': duration * 1000,
                    'order_id': order_id,
                    'timestamp': time.time(),
                    'type': 'order',
                    'log_category': 'order_processing',
                    'status': 'completed'
                })
                
                return result
            except Exception as e:
                duration = time.time() - start_time
                logger.error(f"Order processing error: {order_type}: {str(e)}", extra={
                    'order_type': order_type,
                    'error': str(e),
                    'duration_ms': duration * 1000,
                    'timestamp': time.time(),
                    'type': 'order',
                    'log_category': 'order_processing',
                    'status': 'failed'
                })
                raise
        return wrapper
    return decorator

def record_rental_contract_error(error_type, contract_id=None, details=None):
    """
    Record a rental contract error
    
    Args:
        error_type: Type of error (e.g., 'validation', 'processing')
        contract_id: Rental contract ID (optional)
        details: Additional error details (optional)
    """
    rental_contract_errors_total.labels(error_type=error_type).inc()
    
    log_data = {
        'error_type': error_type,
        'timestamp': time.time(),
        'type': 'rental',
        'log_category': 'rental_contract',
        'status': 'failed'
    }
    
    if contract_id:
        log_data['contract_id'] = contract_id
    if details:
        log_data['details'] = details
        
    logger.error(f"Rental contract error: {error_type}", extra=log_data)

def update_active_users(role, count):
    """
    Update the active users gauge
    
    Args:
        role: User role (e.g., 'customer', 'admin')
        count: Number of active users
    """
    active_users_gauge.labels(role=role).set(count)

def push_metrics():
    """
    Push metrics to Prometheus Pushgateway
    This should be called periodically from a background job
    """
    try:
        from prometheus_client import push_to_gateway, instance_ip_grouping_key
        
        push_to_gateway(
            PUSH_GATEWAY, 
            job=APP_NAME,
            registry=None,  # Uses the default registry
            grouping_key=instance_ip_grouping_key()
        )
    except Exception as e:
        logger.error(f"Error pushing metrics to gateway: {str(e)}")

# Configure JSON formatter for logging that's compatible with ELK
class JsonFormatter(logging.Formatter):
    def format(self, record):
        log_record = {
            'timestamp': time.time(),
            'level': record.levelname,
            'logger': record.name,
            'message': record.getMessage(),
            'environment': ENVIRONMENT
        }
        
        # Add extra fields from the record
        if hasattr(record, 'exc_info') and record.exc_info:
            log_record['exception'] = self.formatException(record.exc_info)
            
        # Add any extra attributes from the LogRecord
        for key, value in record.__dict__.items():
            if key not in ('args', 'asctime', 'created', 'exc_info', 'exc_text', 'filename',
                          'funcName', 'id', 'levelname', 'levelno', 'lineno',
                          'module', 'msecs', 'message', 'msg', 'name', 'pathname',
                          'process', 'processName', 'relativeCreated', 'stack_info',
                          'thread', 'threadName'):
                log_record[key] = value
        
        return json.dumps(log_record)

def setup_logging():
    """
    Set up structured logging for the application
    """
    root_logger = logging.getLogger()
    
    # Remove existing handlers
    for handler in root_logger.handlers[:]:
        root_logger.removeHandler(handler)
    
    # Set up JSON handler for structured logging
    json_handler = logging.StreamHandler()
    json_handler.setFormatter(JsonFormatter())
    
    root_logger.addHandler(json_handler)
    
    # Set log level based on environment
    if ENVIRONMENT == 'production':
        root_logger.setLevel(logging.INFO)
    else:
        root_logger.setLevel(logging.DEBUG)
