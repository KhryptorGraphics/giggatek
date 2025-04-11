#!/usr/bin/env python3
"""
API Usage Monitor

This script monitors API usage and generates reports.
"""

import os
import sys
import json
import time
import argparse
import datetime
import glob
from collections import defaultdict, Counter

# Add the parent directory to the path so we can import the utils module
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

try:
    from utils.api_analytics import get_api_stats
except ImportError:
    print("Error: Could not import api_analytics module")
    print("Make sure you're running this script from the backend/scripts directory")
    sys.exit(1)

def parse_args():
    """Parse command line arguments"""
    parser = argparse.ArgumentParser(description='Monitor API usage and generate reports')
    parser.add_argument('--time-range', type=str, default='1h',
                        choices=['15m', '1h', '6h', '24h', '7d', '30d'],
                        help='Time range for the report (default: 1h)')
    parser.add_argument('--output', type=str, default='console',
                        choices=['console', 'json', 'html'],
                        help='Output format (default: console)')
    parser.add_argument('--output-file', type=str,
                        help='Output file path (required for json and html output)')
    parser.add_argument('--watch', action='store_true',
                        help='Watch mode - continuously monitor API usage')
    parser.add_argument('--watch-interval', type=int, default=60,
                        help='Watch interval in seconds (default: 60)')
    parser.add_argument('--alert-threshold', type=float, default=0.05,
                        help='Error rate threshold for alerts (default: 0.05)')
    return parser.parse_args()

def time_range_to_seconds(time_range):
    """Convert time range string to seconds"""
    if time_range == '15m':
        return 15 * 60
    elif time_range == '1h':
        return 60 * 60
    elif time_range == '6h':
        return 6 * 60 * 60
    elif time_range == '24h':
        return 24 * 60 * 60
    elif time_range == '7d':
        return 7 * 24 * 60 * 60
    elif time_range == '30d':
        return 30 * 24 * 60 * 60
    else:
        return 60 * 60  # Default to 1 hour

def format_time_range(time_range):
    """Format time range for display"""
    if time_range == '15m':
        return 'Last 15 minutes'
    elif time_range == '1h':
        return 'Last hour'
    elif time_range == '6h':
        return 'Last 6 hours'
    elif time_range == '24h':
        return 'Last 24 hours'
    elif time_range == '7d':
        return 'Last 7 days'
    elif time_range == '30d':
        return 'Last 30 days'
    else:
        return 'Last hour'

def load_analytics_data(time_range_seconds):
    """Load analytics data from files"""
    # In a real implementation, this would load data from a database
    # For this example, we'll generate mock data
    
    # Get current time
    now = time.time()
    
    # Calculate time threshold
    threshold = now - time_range_seconds
    
    # Find all analytics files
    data_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', 'data', 'analytics'))
    os.makedirs(data_dir, exist_ok=True)
    
    request_files = glob.glob(os.path.join(data_dir, 'requests_*.json'))
    error_files = glob.glob(os.path.join(data_dir, 'errors_*.json'))
    
    # Load requests
    requests = []
    for file_path in request_files:
        try:
            with open(file_path, 'r') as f:
                file_requests = json.load(f)
                requests.extend([r for r in file_requests if r['timestamp'] >= threshold])
        except (json.JSONDecodeError, IOError) as e:
            print(f"Error loading {file_path}: {e}")
    
    # Load errors
    errors = []
    for file_path in error_files:
        try:
            with open(file_path, 'r') as f:
                file_errors = json.load(f)
                errors.extend([e for e in file_errors if e['timestamp'] >= threshold])
        except (json.JSONDecodeError, IOError) as e:
            print(f"Error loading {file_path}: {e}")
    
    # If no data is found, generate mock data
    if not requests:
        print("No request data found, generating mock data...")
        requests = generate_mock_requests(time_range_seconds)
    
    if not errors:
        print("No error data found, generating mock data...")
        errors = generate_mock_errors(time_range_seconds)
    
    return requests, errors

def generate_mock_requests(time_range_seconds):
    """Generate mock request data"""
    now = time.time()
    requests = []
    
    # Generate requests over the time range
    num_requests = min(1000, time_range_seconds // 10)  # 1 request per 10 seconds, max 1000
    
    endpoints = [
        '/api/v1/products',
        '/api/v1/products/123',
        '/api/v1/orders',
        '/api/v1/orders/456',
        '/api/v1/rentals',
        '/api/v1/rentals/789',
        '/api/v1/auth/login',
        '/api/v1/auth/status',
        '/api/v1/payments/stripe/intent',
        '/api/v1/payments/paypal/order'
    ]
    
    methods = ['GET', 'POST', 'PUT', 'DELETE']
    method_weights = [0.7, 0.2, 0.05, 0.05]  # 70% GET, 20% POST, 5% PUT, 5% DELETE
    
    status_codes = [200, 201, 400, 401, 403, 404, 500]
    status_weights = [0.8, 0.05, 0.05, 0.03, 0.02, 0.03, 0.02]  # 80% 200, 5% 201, 5% 400, etc.
    
    for i in range(num_requests):
        # Generate random timestamp within the time range
        timestamp = now - (time_range_seconds * (i / num_requests))
        
        # Generate random endpoint and method
        endpoint = endpoints[i % len(endpoints)]
        method_index = weighted_choice(method_weights)
        method = methods[method_index]
        
        # Generate random status code
        status_index = weighted_choice(status_weights)
        status_code = status_codes[status_index]
        
        # Generate random response time (50-500ms)
        response_time = 50 + (450 * (i % 10) / 10)
        
        # Generate random user ID (some requests are anonymous)
        user_id = None if i % 5 == 0 else (i % 100) + 1
        
        # Create request data
        request = {
            'endpoint': endpoint,
            'method': method,
            'user_id': user_id,
            'response_time': response_time,
            'status_code': status_code,
            'ip_address': f'192.168.1.{i % 255}',
            'user_agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'timestamp': timestamp
        }
        
        requests.append(request)
    
    return requests

def generate_mock_errors(time_range_seconds):
    """Generate mock error data"""
    now = time.time()
    errors = []
    
    # Generate errors over the time range
    num_errors = min(50, time_range_seconds // 200)  # 1 error per 200 seconds, max 50
    
    error_types = [
        'ValidationError',
        'AuthenticationError',
        'AuthorizationError',
        'NotFoundError',
        'DatabaseError',
        'PaymentError',
        'RateLimitError',
        'InternalServerError'
    ]
    
    endpoints = [
        '/api/v1/products',
        '/api/v1/orders',
        '/api/v1/rentals',
        '/api/v1/auth/login',
        '/api/v1/payments/stripe/intent',
        '/api/v1/payments/paypal/order'
    ]
    
    methods = ['GET', 'POST', 'PUT', 'DELETE']
    
    for i in range(num_errors):
        # Generate random timestamp within the time range
        timestamp = now - (time_range_seconds * (i / num_errors))
        
        # Generate random endpoint and method
        endpoint = endpoints[i % len(endpoints)]
        method = methods[i % len(methods)]
        
        # Generate random error type
        error_type = error_types[i % len(error_types)]
        
        # Generate random error message
        error_message = f"Mock {error_type} for testing"
        
        # Generate random user ID (some errors are from anonymous users)
        user_id = None if i % 3 == 0 else (i % 100) + 1
        
        # Create error data
        error = {
            'endpoint': endpoint,
            'method': method,
            'user_id': user_id,
            'error_type': error_type,
            'error_message': error_message,
            'stack_trace': f"Mock stack trace for {error_type}",
            'request_data': {
                'args': {},
                'form': {},
                'json': {}
            },
            'ip_address': f'192.168.1.{i % 255}',
            'user_agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'timestamp': timestamp
        }
        
        errors.append(error)
    
    return errors

def weighted_choice(weights):
    """Make a weighted random choice"""
    import random
    total = sum(weights)
    r = random.uniform(0, total)
    upto = 0
    for i, w in enumerate(weights):
        upto += w
        if upto >= r:
            return i
    return len(weights) - 1

def analyze_data(requests, errors):
    """Analyze the data and generate statistics"""
    stats = {}
    
    # Basic stats
    stats['total_requests'] = len(requests)
    stats['total_errors'] = len(errors)
    stats['error_rate'] = len(errors) / len(requests) if len(requests) > 0 else 0
    
    # Calculate average response time
    response_times = [r['response_time'] for r in requests]
    stats['average_response_time'] = sum(response_times) / len(response_times) if response_times else 0
    
    # Calculate requests per minute
    if requests:
        time_range = max(r['timestamp'] for r in requests) - min(r['timestamp'] for r in requests)
        stats['requests_per_minute'] = len(requests) / (time_range / 60) if time_range > 0 else 0
    else:
        stats['requests_per_minute'] = 0
    
    # Endpoint stats
    endpoint_stats = defaultdict(lambda: {'count': 0, 'response_times': [], 'errors': 0})
    for request in requests:
        endpoint_key = f"{request['method']}:{request['endpoint']}"
        endpoint_stats[endpoint_key]['count'] += 1
        endpoint_stats[endpoint_key]['response_times'].append(request['response_time'])
        if request['status_code'] >= 400:
            endpoint_stats[endpoint_key]['errors'] += 1
    
    for error in errors:
        endpoint_key = f"{error['method']}:{error['endpoint']}"
        if endpoint_key not in endpoint_stats:
            endpoint_stats[endpoint_key] = {'count': 0, 'response_times': [], 'errors': 0}
        endpoint_stats[endpoint_key]['errors'] += 1
    
    # Calculate average response time and error rate for each endpoint
    for endpoint, data in endpoint_stats.items():
        data['average_response_time'] = sum(data['response_times']) / len(data['response_times']) if data['response_times'] else 0
        data['error_rate'] = data['errors'] / data['count'] if data['count'] > 0 else 0
    
    # Sort endpoints by count
    stats['endpoints'] = sorted(
        [{'endpoint': k, **v} for k, v in endpoint_stats.items()],
        key=lambda x: x['count'],
        reverse=True
    )
    
    # Status code distribution
    status_codes = Counter(r['status_code'] for r in requests)
    stats['status_codes'] = {str(k): v for k, v in status_codes.items()}
    
    # Group status codes by category
    status_categories = {
        '2xx': sum(v for k, v in status_codes.items() if 200 <= k < 300),
        '3xx': sum(v for k, v in status_codes.items() if 300 <= k < 400),
        '4xx': sum(v for k, v in status_codes.items() if 400 <= k < 500),
        '5xx': sum(v for k, v in status_codes.items() if 500 <= k < 600)
    }
    stats['status_categories'] = status_categories
    
    # Error type distribution
    error_types = Counter(e['error_type'] for e in errors)
    stats['error_types'] = dict(error_types.most_common())
    
    # User stats
    user_stats = defaultdict(lambda: {'count': 0, 'endpoints': Counter()})
    for request in requests:
        if request['user_id'] is not None:
            user_id = str(request['user_id'])
            user_stats[user_id]['count'] += 1
            endpoint_key = f"{request['method']}:{request['endpoint']}"
            user_stats[user_id]['endpoints'][endpoint_key] += 1
    
    # Sort users by request count
    stats['users'] = sorted(
        [{'user_id': k, 'count': v['count'], 'top_endpoints': v['endpoints'].most_common(3)} for k, v in user_stats.items()],
        key=lambda x: x['count'],
        reverse=True
    )[:10]  # Top 10 users
    
    return stats

def print_console_report(stats, time_range):
    """Print a report to the console"""
    print("\n" + "=" * 80)
    print(f"API Usage Report - {format_time_range(time_range)}")
    print("=" * 80)
    
    print(f"\nTotal Requests: {stats['total_requests']}")
    print(f"Requests per Minute: {stats['requests_per_minute']:.2f}")
    print(f"Average Response Time: {stats['average_response_time']:.2f} ms")
    print(f"Error Rate: {stats['error_rate'] * 100:.2f}%")
    
    print("\nStatus Code Distribution:")
    for category, count in stats['status_categories'].items():
        print(f"  {category}: {count} ({count / stats['total_requests'] * 100:.2f}%)")
    
    print("\nTop 10 Endpoints:")
    for i, endpoint in enumerate(stats['endpoints'][:10], 1):
        print(f"  {i}. {endpoint['endpoint']}")
        print(f"     Requests: {endpoint['count']}")
        print(f"     Avg Response Time: {endpoint['average_response_time']:.2f} ms")
        print(f"     Error Rate: {endpoint['error_rate'] * 100:.2f}%")
    
    if stats['error_types']:
        print("\nTop Error Types:")
        for error_type, count in stats['error_types'].items():
            print(f"  {error_type}: {count}")
    
    print("\nTop 5 Users:")
    for i, user in enumerate(stats['users'][:5], 1):
        print(f"  {i}. User {user['user_id']}")
        print(f"     Requests: {user['count']}")
        print(f"     Top Endpoints: {', '.join(endpoint for endpoint, count in user['top_endpoints'])}")
    
    print("\n" + "=" * 80)

def generate_json_report(stats, time_range):
    """Generate a JSON report"""
    report = {
        'timestamp': time.time(),
        'generated_at': datetime.datetime.now().isoformat(),
        'time_range': time_range,
        'time_range_formatted': format_time_range(time_range),
        'stats': stats
    }
    
    return json.dumps(report, indent=2)

def generate_html_report(stats, time_range):
    """Generate an HTML report"""
    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>API Usage Report - {format_time_range(time_range)}</title>
    <style>
        body {{
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }}
        h1, h2, h3 {{
            color: #0066cc;
        }}
        .container {{
            display: flex;
            flex-wrap: wrap;
            gap: 20px;
            margin-bottom: 20px;
        }}
        .card {{
            background-color: #f9f9f9;
            border-radius: 5px;
            padding: 20px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            flex: 1;
            min-width: 250px;
        }}
        .stat {{
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 5px;
        }}
        .label {{
            font-size: 14px;
            color: #666;
        }}
        table {{
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }}
        th, td {{
            padding: 10px;
            text-align: left;
            border-bottom: 1px solid #ddd;
        }}
        th {{
            background-color: #f2f2f2;
        }}
        tr:hover {{
            background-color: #f5f5f5;
        }}
        .error-rate {{
            color: {('#cc0000' if stats['error_rate'] > 0.05 else '#0066cc')};
        }}
        .chart {{
            height: 300px;
            margin-bottom: 20px;
        }}
    </style>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
</head>
<body>
    <h1>API Usage Report</h1>
    <p>Generated at: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}</p>
    <p>Time Range: {format_time_range(time_range)}</p>
    
    <div class="container">
        <div class="card">
            <div class="stat">{stats['total_requests']}</div>
            <div class="label">Total Requests</div>
        </div>
        <div class="card">
            <div class="stat">{stats['requests_per_minute']:.2f}</div>
            <div class="label">Requests per Minute</div>
        </div>
        <div class="card">
            <div class="stat">{stats['average_response_time']:.2f} ms</div>
            <div class="label">Average Response Time</div>
        </div>
        <div class="card">
            <div class="stat error-rate">{stats['error_rate'] * 100:.2f}%</div>
            <div class="label">Error Rate</div>
        </div>
    </div>
    
    <div class="container">
        <div class="card" style="flex: 1;">
            <h2>Status Code Distribution</h2>
            <div class="chart">
                <canvas id="statusChart"></canvas>
            </div>
        </div>
        <div class="card" style="flex: 1;">
            <h2>Top Error Types</h2>
            <div class="chart">
                <canvas id="errorChart"></canvas>
            </div>
        </div>
    </div>
    
    <h2>Top 10 Endpoints</h2>
    <table>
        <thead>
            <tr>
                <th>Endpoint</th>
                <th>Requests</th>
                <th>Avg Response Time</th>
                <th>Error Rate</th>
            </tr>
        </thead>
        <tbody>
"""
    
    # Add endpoint rows
    for endpoint in stats['endpoints'][:10]:
        html += f"""
            <tr>
                <td>{endpoint['endpoint']}</td>
                <td>{endpoint['count']}</td>
                <td>{endpoint['average_response_time']:.2f} ms</td>
                <td>{endpoint['error_rate'] * 100:.2f}%</td>
            </tr>
"""
    
    html += """
        </tbody>
    </table>
    
    <h2>Top 10 Users</h2>
    <table>
        <thead>
            <tr>
                <th>User ID</th>
                <th>Requests</th>
                <th>Top Endpoints</th>
            </tr>
        </thead>
        <tbody>
"""
    
    # Add user rows
    for user in stats['users'][:10]:
        top_endpoints = ', '.join(endpoint for endpoint, count in user['top_endpoints'])
        html += f"""
            <tr>
                <td>{user['user_id']}</td>
                <td>{user['count']}</td>
                <td>{top_endpoints}</td>
            </tr>
"""
    
    html += """
        </tbody>
    </table>
    
    <script>
        // Status code chart
        const statusCtx = document.getElementById('statusChart').getContext('2d');
        const statusChart = new Chart(statusCtx, {
            type: 'pie',
            data: {
                labels: [
"""
    
    # Add status category labels
    for category in stats['status_categories'].keys():
        html += f"                    '{category}',\n"
    
    html += """
                ],
                datasets: [{
                    data: [
"""
    
    # Add status category values
    for count in stats['status_categories'].values():
        html += f"                        {count},\n"
    
    html += """
                    ],
                    backgroundColor: [
                        '#4CAF50',
                        '#2196F3',
                        '#FFC107',
                        '#F44336'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right'
                    }
                }
            }
        });
        
        // Error type chart
        const errorCtx = document.getElementById('errorChart').getContext('2d');
        const errorChart = new Chart(errorCtx, {
            type: 'bar',
            data: {
                labels: [
"""
    
    # Add error type labels
    for error_type in list(stats['error_types'].keys())[:5]:
        html += f"                    '{error_type}',\n"
    
    html += """
                ],
                datasets: [{
                    label: 'Errors',
                    data: [
"""
    
    # Add error type values
    for count in list(stats['error_types'].values())[:5]:
        html += f"                        {count},\n"
    
    html += """
                    ],
                    backgroundColor: '#F44336'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    </script>
</body>
</html>
"""
    
    return html

def check_alerts(stats, alert_threshold):
    """Check for alerts based on the stats"""
    alerts = []
    
    # Check overall error rate
    if stats['error_rate'] > alert_threshold:
        alerts.append(f"High error rate: {stats['error_rate'] * 100:.2f}%")
    
    # Check endpoint error rates
    for endpoint in stats['endpoints']:
        if endpoint['error_rate'] > alert_threshold and endpoint['count'] >= 10:
            alerts.append(f"High error rate for {endpoint['endpoint']}: {endpoint['error_rate'] * 100:.2f}%")
    
    # Check for 5xx errors
    if stats['status_categories'].get('5xx', 0) > 0:
        alerts.append(f"Server errors detected: {stats['status_categories'].get('5xx', 0)} 5xx errors")
    
    return alerts

def main():
    """Main function"""
    args = parse_args()
    
    # Convert time range to seconds
    time_range_seconds = time_range_to_seconds(args.time_range)
    
    if args.watch:
        print(f"Watching API usage (press Ctrl+C to stop)...")
        try:
            while True:
                # Load data
                requests, errors = load_analytics_data(time_range_seconds)
                
                # Analyze data
                stats = analyze_data(requests, errors)
                
                # Check for alerts
                alerts = check_alerts(stats, args.alert_threshold)
                
                # Clear screen
                os.system('cls' if os.name == 'nt' else 'clear')
                
                # Print report
                print_console_report(stats, args.time_range)
                
                # Print alerts
                if alerts:
                    print("\nALERTS:")
                    for alert in alerts:
                        print(f"  ! {alert}")
                
                # Wait for next update
                time.sleep(args.watch_interval)
        except KeyboardInterrupt:
            print("\nStopped watching API usage")
    else:
        # Load data
        requests, errors = load_analytics_data(time_range_seconds)
        
        # Analyze data
        stats = analyze_data(requests, errors)
        
        # Generate report
        if args.output == 'console':
            print_console_report(stats, args.time_range)
        elif args.output == 'json':
            if not args.output_file:
                print("Error: --output-file is required for JSON output")
                sys.exit(1)
            
            json_report = generate_json_report(stats, args.time_range)
            with open(args.output_file, 'w') as f:
                f.write(json_report)
            
            print(f"JSON report saved to {args.output_file}")
        elif args.output == 'html':
            if not args.output_file:
                print("Error: --output-file is required for HTML output")
                sys.exit(1)
            
            html_report = generate_html_report(stats, args.time_range)
            with open(args.output_file, 'w') as f:
                f.write(html_report)
            
            print(f"HTML report saved to {args.output_file}")
        
        # Check for alerts
        alerts = check_alerts(stats, args.alert_threshold)
        if alerts:
            print("\nALERTS:")
            for alert in alerts:
                print(f"  ! {alert}")

if __name__ == '__main__':
    main()
