#!/usr/bin/env python3
"""
Rate Limit Optimizer

This script analyzes API usage and recommends optimal rate limits.
"""

import os
import sys
import json
import time
import argparse
import datetime
import glob
import numpy as np
from collections import defaultdict

# Add the parent directory to the path so we can import the utils module
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

def parse_args():
    """Parse command line arguments"""
    parser = argparse.ArgumentParser(description='Optimize API rate limits')
    parser.add_argument('--data-dir', type=str, default='../data/analytics',
                        help='Directory containing analytics data (default: ../data/analytics)')
    parser.add_argument('--days', type=int, default=7,
                        help='Number of days of data to analyze (default: 7)')
    parser.add_argument('--output', type=str, default='console',
                        choices=['console', 'json'],
                        help='Output format (default: console)')
    parser.add_argument('--output-file', type=str,
                        help='Output file path (required for json output)')
    parser.add_argument('--safety-factor', type=float, default=1.5,
                        help='Safety factor for rate limits (default: 1.5)')
    return parser.parse_args()

def load_request_data(data_dir, days):
    """Load request data from analytics files"""
    # Calculate time threshold
    now = time.time()
    threshold = now - (days * 24 * 60 * 60)
    
    # Find all request files
    request_files = glob.glob(os.path.join(data_dir, 'requests_*.json'))
    
    # Load requests
    all_requests = []
    for file_path in request_files:
        try:
            with open(file_path, 'r') as f:
                file_requests = json.load(f)
                all_requests.extend([r for r in file_requests if r['timestamp'] >= threshold])
        except (json.JSONDecodeError, IOError) as e:
            print(f"Error loading {file_path}: {e}")
    
    return all_requests

def analyze_request_patterns(requests):
    """Analyze request patterns to determine optimal rate limits"""
    # Group requests by client (IP or user ID)
    client_requests = defaultdict(list)
    for request in requests:
        client_id = request.get('user_id') or request.get('ip_address')
        if client_id:
            client_requests[client_id].append(request)
    
    # Group requests by endpoint
    endpoint_requests = defaultdict(list)
    for request in requests:
        endpoint = f"{request.get('method', 'GET')}:{request.get('endpoint', '/')}"
        endpoint_requests[endpoint].append(request)
    
    # Calculate request rates for each client
    client_rates = {}
    for client_id, client_reqs in client_requests.items():
        # Sort requests by timestamp
        client_reqs.sort(key=lambda r: r['timestamp'])
        
        # Calculate request rates in different time windows
        rates = calculate_request_rates(client_reqs)
        client_rates[client_id] = rates
    
    # Calculate request rates for each endpoint
    endpoint_rates = {}
    for endpoint, endpoint_reqs in endpoint_requests.items():
        # Sort requests by timestamp
        endpoint_reqs.sort(key=lambda r: r['timestamp'])
        
        # Calculate request rates in different time windows
        rates = calculate_request_rates(endpoint_reqs)
        endpoint_rates[endpoint] = rates
    
    return {
        'client_rates': client_rates,
        'endpoint_rates': endpoint_rates
    }

def calculate_request_rates(requests):
    """Calculate request rates in different time windows"""
    if not requests:
        return {
            'per_second': 0,
            'per_minute': 0,
            'per_hour': 0,
            'per_day': 0,
            'total': 0
        }
    
    # Get time range
    start_time = requests[0]['timestamp']
    end_time = requests[-1]['timestamp']
    time_range = end_time - start_time
    
    # Calculate total requests
    total_requests = len(requests)
    
    # Calculate rates
    if time_range > 0:
        per_second = total_requests / time_range
        per_minute = per_second * 60
        per_hour = per_minute * 60
        per_day = per_hour * 24
    else:
        per_second = total_requests
        per_minute = total_requests * 60
        per_hour = total_requests * 3600
        per_day = total_requests * 86400
    
    # Calculate burst rates (maximum requests in a short time window)
    burst_rates = calculate_burst_rates(requests)
    
    return {
        'per_second': per_second,
        'per_minute': per_minute,
        'per_hour': per_hour,
        'per_day': per_day,
        'total': total_requests,
        'burst': burst_rates
    }

def calculate_burst_rates(requests):
    """Calculate burst rates (maximum requests in a short time window)"""
    if len(requests) < 2:
        return {
            'per_second': len(requests),
            'per_minute': len(requests),
            'per_5_minutes': len(requests)
        }
    
    # Get timestamps
    timestamps = [r['timestamp'] for r in requests]
    
    # Calculate requests per second
    second_counts = defaultdict(int)
    for ts in timestamps:
        second_counts[int(ts)] += 1
    
    # Calculate requests per minute
    minute_counts = defaultdict(int)
    for ts in timestamps:
        minute_counts[int(ts / 60)] += 1
    
    # Calculate requests per 5 minutes
    five_minute_counts = defaultdict(int)
    for ts in timestamps:
        five_minute_counts[int(ts / 300)] += 1
    
    return {
        'per_second': max(second_counts.values()) if second_counts else 0,
        'per_minute': max(minute_counts.values()) if minute_counts else 0,
        'per_5_minutes': max(five_minute_counts.values()) if five_minute_counts else 0
    }

def recommend_rate_limits(analysis, safety_factor=1.5):
    """Recommend rate limits based on analysis"""
    # Calculate client rate limits
    client_limits = {}
    for client_id, rates in analysis['client_rates'].items():
        # Calculate recommended limits with safety factor
        client_limits[client_id] = {
            'per_second': max(1, int(rates['burst']['per_second'] * safety_factor)),
            'per_minute': max(10, int(rates['burst']['per_minute'] * safety_factor)),
            'per_hour': max(100, int(rates['per_hour'] * safety_factor)),
            'current_usage': {
                'per_second': rates['burst']['per_second'],
                'per_minute': rates['burst']['per_minute'],
                'per_hour': rates['per_hour']
            }
        }
    
    # Calculate endpoint rate limits
    endpoint_limits = {}
    for endpoint, rates in analysis['endpoint_rates'].items():
        # Calculate recommended limits with safety factor
        endpoint_limits[endpoint] = {
            'per_second': max(5, int(rates['burst']['per_second'] * safety_factor)),
            'per_minute': max(60, int(rates['burst']['per_minute'] * safety_factor)),
            'per_hour': max(600, int(rates['per_hour'] * safety_factor)),
            'current_usage': {
                'per_second': rates['burst']['per_second'],
                'per_minute': rates['burst']['per_minute'],
                'per_hour': rates['per_hour']
            }
        }
    
    # Calculate global rate limits
    all_client_rates = [rates for rates in analysis['client_rates'].values()]
    all_endpoint_rates = [rates for rates in analysis['endpoint_rates'].values()]
    
    global_per_second = max([rates['burst']['per_second'] for rates in all_client_rates]) if all_client_rates else 0
    global_per_minute = max([rates['burst']['per_minute'] for rates in all_client_rates]) if all_client_rates else 0
    global_per_hour = max([rates['per_hour'] for rates in all_client_rates]) if all_client_rates else 0
    
    global_limits = {
        'per_second': max(10, int(global_per_second * safety_factor)),
        'per_minute': max(100, int(global_per_minute * safety_factor)),
        'per_hour': max(1000, int(global_per_hour * safety_factor)),
        'current_usage': {
            'per_second': global_per_second,
            'per_minute': global_per_minute,
            'per_hour': global_per_hour
        }
    }
    
    return {
        'client_limits': client_limits,
        'endpoint_limits': endpoint_limits,
        'global_limits': global_limits
    }

def print_console_report(recommendations):
    """Print a report to the console"""
    print("\n" + "=" * 80)
    print("Rate Limit Recommendations")
    print("=" * 80)
    
    print("\nGlobal Rate Limits:")
    print(f"Per Second: {recommendations['global_limits']['per_second']} (current max: {recommendations['global_limits']['current_usage']['per_second']:.2f})")
    print(f"Per Minute: {recommendations['global_limits']['per_minute']} (current max: {recommendations['global_limits']['current_usage']['per_minute']:.2f})")
    print(f"Per Hour: {recommendations['global_limits']['per_hour']} (current max: {recommendations['global_limits']['current_usage']['per_hour']:.2f})")
    
    print("\nEndpoint Rate Limits:")
    for endpoint, limits in recommendations['endpoint_limits'].items():
        print(f"\n{endpoint}:")
        print(f"  Per Second: {limits['per_second']} (current max: {limits['current_usage']['per_second']:.2f})")
        print(f"  Per Minute: {limits['per_minute']} (current max: {limits['current_usage']['per_minute']:.2f})")
        print(f"  Per Hour: {limits['per_hour']} (current max: {limits['current_usage']['per_hour']:.2f})")
    
    print("\nTop 5 Client Rate Limits:")
    # Sort clients by per_minute limit (highest first)
    sorted_clients = sorted(
        recommendations['client_limits'].items(),
        key=lambda x: x[1]['per_minute'],
        reverse=True
    )
    
    for client_id, limits in sorted_clients[:5]:
        print(f"\n{client_id}:")
        print(f"  Per Second: {limits['per_second']} (current max: {limits['current_usage']['per_second']:.2f})")
        print(f"  Per Minute: {limits['per_minute']} (current max: {limits['current_usage']['per_minute']:.2f})")
        print(f"  Per Hour: {limits['per_hour']} (current max: {limits['current_usage']['per_hour']:.2f})")
    
    print("\n" + "=" * 80)

def generate_json_report(recommendations):
    """Generate a JSON report"""
    report = {
        'timestamp': time.time(),
        'generated_at': datetime.datetime.now().isoformat(),
        'recommendations': recommendations
    }
    
    return json.dumps(report, indent=2)

def main():
    """Main function"""
    args = parse_args()
    
    print(f"Analyzing API usage data from the last {args.days} days")
    print(f"Data directory: {args.data_dir}")
    print(f"Safety factor: {args.safety_factor}")
    
    # Load request data
    requests = load_request_data(args.data_dir, args.days)
    
    if not requests:
        print("No request data found. Please make sure the data directory exists and contains request data.")
        sys.exit(1)
    
    print(f"Loaded {len(requests)} requests")
    
    # Analyze request patterns
    analysis = analyze_request_patterns(requests)
    
    # Recommend rate limits
    recommendations = recommend_rate_limits(analysis, args.safety_factor)
    
    # Generate the report
    if args.output == 'console':
        print_console_report(recommendations)
    elif args.output == 'json':
        if not args.output_file:
            print("Error: --output-file is required for JSON output")
            sys.exit(1)
        
        json_report = generate_json_report(recommendations)
        with open(args.output_file, 'w') as f:
            f.write(json_report)
        
        print(f"JSON report saved to {args.output_file}")

if __name__ == '__main__':
    main()
