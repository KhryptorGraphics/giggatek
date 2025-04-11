#!/usr/bin/env python3
"""
API Performance Monitor

This script continuously monitors API performance and alerts on issues.
"""

import os
import sys
import json
import time
import argparse
import datetime
import requests
import statistics
import threading
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

# Add the parent directory to the path so we can import the utils module
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

def parse_args():
    """Parse command line arguments"""
    parser = argparse.ArgumentParser(description='Monitor API performance')
    parser.add_argument('--base-url', type=str, default='http://localhost:8000/api/v1',
                        help='Base URL of the API (default: http://localhost:8000/api/v1)')
    parser.add_argument('--endpoints', type=str, nargs='+',
                        default=['/products', '/products/1', '/orders', '/rentals'],
                        help='Endpoints to monitor (default: /products /products/1 /orders /rentals)')
    parser.add_argument('--interval', type=int, default=60,
                        help='Monitoring interval in seconds (default: 60)')
    parser.add_argument('--threshold', type=int, default=500,
                        help='Response time threshold in milliseconds (default: 500)')
    parser.add_argument('--error-threshold', type=float, default=0.1,
                        help='Error rate threshold (default: 0.1 = 10%%)')
    parser.add_argument('--alert-email', type=str,
                        help='Email address to send alerts to')
    parser.add_argument('--smtp-server', type=str, default='localhost',
                        help='SMTP server for sending alerts (default: localhost)')
    parser.add_argument('--smtp-port', type=int, default=25,
                        help='SMTP port (default: 25)')
    parser.add_argument('--smtp-user', type=str,
                        help='SMTP username')
    parser.add_argument('--smtp-password', type=str,
                        help='SMTP password')
    parser.add_argument('--log-file', type=str, default='../logs/api_performance.log',
                        help='Log file path (default: ../logs/api_performance.log)')
    parser.add_argument('--data-dir', type=str, default='../data/performance',
                        help='Directory to store performance data (default: ../data/performance)')
    parser.add_argument('--auth-token', type=str,
                        help='Authentication token for protected endpoints')
    return parser.parse_args()

def setup_logging(log_file):
    """Set up logging"""
    # Create directory if it doesn't exist
    os.makedirs(os.path.dirname(log_file), exist_ok=True)
    
    # Open log file
    log_file_handle = open(log_file, 'a')
    
    # Define log function
    def log(message):
        timestamp = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        log_message = f"[{timestamp}] {message}\n"
        
        # Write to log file
        log_file_handle.write(log_message)
        log_file_handle.flush()
        
        # Print to console
        print(log_message, end='')
    
    return log, log_file_handle

def make_request(url, auth_token=None, timeout=10):
    """Make a request to the API and measure performance"""
    headers = {}
    if auth_token:
        headers['Authorization'] = f'Bearer {auth_token}'
    
    start_time = time.time()
    try:
        response = requests.get(url, headers=headers, timeout=timeout)
        end_time = time.time()
        response_time = (end_time - start_time) * 1000  # Convert to milliseconds
        
        return {
            'url': url,
            'status_code': response.status_code,
            'response_time': response_time,
            'success': 200 <= response.status_code < 300,
            'timestamp': start_time
        }
    except requests.exceptions.RequestException as e:
        end_time = time.time()
        response_time = (end_time - start_time) * 1000  # Convert to milliseconds
        
        return {
            'url': url,
            'status_code': 0,
            'response_time': response_time,
            'success': False,
            'error': str(e),
            'timestamp': start_time
        }

def monitor_endpoints(base_url, endpoints, auth_token=None, timeout=10):
    """Monitor multiple endpoints"""
    results = []
    
    for endpoint in endpoints:
        url = f"{base_url}{endpoint}"
        result = make_request(url, auth_token, timeout)
        results.append(result)
    
    return results

def analyze_results(results, threshold, error_threshold):
    """Analyze monitoring results and check for issues"""
    issues = []
    
    # Check for slow responses
    slow_responses = [r for r in results if r['response_time'] > threshold]
    if slow_responses:
        issues.append({
            'type': 'slow_response',
            'message': f"Slow responses detected ({len(slow_responses)}/{len(results)} endpoints)",
            'endpoints': [r['url'] for r in slow_responses],
            'response_times': [r['response_time'] for r in slow_responses]
        })
    
    # Check for errors
    errors = [r for r in results if not r['success']]
    error_rate = len(errors) / len(results) if results else 0
    
    if error_rate > error_threshold:
        issues.append({
            'type': 'high_error_rate',
            'message': f"High error rate detected ({error_rate:.2%})",
            'endpoints': [r['url'] for r in errors],
            'status_codes': [r['status_code'] for r in errors]
        })
    
    # Calculate statistics
    response_times = [r['response_time'] for r in results]
    stats = {
        'count': len(results),
        'success_rate': (len(results) - len(errors)) / len(results) if results else 0,
        'min_response_time': min(response_times) if response_times else 0,
        'max_response_time': max(response_times) if response_times else 0,
        'avg_response_time': statistics.mean(response_times) if response_times else 0,
        'median_response_time': statistics.median(response_times) if response_times else 0,
        'std_dev': statistics.stdev(response_times) if len(response_times) > 1 else 0
    }
    
    return issues, stats

def send_alert(issues, stats, results, alert_email, smtp_server, smtp_port, smtp_user, smtp_password, log):
    """Send an alert email"""
    if not alert_email:
        log("No alert email configured, skipping alert")
        return
    
    # Create message
    msg = MIMEMultipart()
    msg['From'] = smtp_user or 'api-monitor@giggatek.com'
    msg['To'] = alert_email
    msg['Subject'] = f"API Performance Alert: {', '.join(issue['type'] for issue in issues)}"
    
    # Build message body
    body = f"""
API Performance Alert
=====================

Time: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

Issues:
"""
    
    for issue in issues:
        body += f"\n- {issue['message']}\n"
        
        if issue['type'] == 'slow_response':
            for i, endpoint in enumerate(issue['endpoints']):
                body += f"  - {endpoint}: {issue['response_times'][i]:.2f} ms\n"
        elif issue['type'] == 'high_error_rate':
            for i, endpoint in enumerate(issue['endpoints']):
                body += f"  - {endpoint}: Status {issue['status_codes'][i]}\n"
    
    body += f"""
Statistics:
- Success Rate: {stats['success_rate']:.2%}
- Average Response Time: {stats['avg_response_time']:.2f} ms
- Median Response Time: {stats['median_response_time']:.2f} ms
- Min Response Time: {stats['min_response_time']:.2f} ms
- Max Response Time: {stats['max_response_time']:.2f} ms
- Standard Deviation: {stats['std_dev']:.2f} ms

Endpoint Details:
"""
    
    for result in results:
        status = "Success" if result['success'] else f"Error ({result['status_code']})"
        body += f"- {result['url']}: {result['response_time']:.2f} ms, {status}\n"
    
    msg.attach(MIMEText(body, 'plain'))
    
    try:
        # Connect to SMTP server
        server = smtplib.SMTP(smtp_server, smtp_port)
        server.ehlo()
        
        # Use TLS if available
        if smtp_user and smtp_password:
            server.starttls()
            server.login(smtp_user, smtp_password)
        
        # Send email
        server.send_message(msg)
        server.quit()
        
        log(f"Alert sent to {alert_email}")
    except Exception as e:
        log(f"Failed to send alert: {e}")

def save_results(results, data_dir):
    """Save monitoring results to a file"""
    # Create directory if it doesn't exist
    os.makedirs(data_dir, exist_ok=True)
    
    # Generate filename based on timestamp
    timestamp = datetime.datetime.now().strftime('%Y%m%d%H%M%S')
    filename = os.path.join(data_dir, f"performance_{timestamp}.json")
    
    # Save results
    with open(filename, 'w') as f:
        json.dump(results, f, indent=2)
    
    return filename

def monitor_loop(args, log):
    """Main monitoring loop"""
    log(f"Starting API performance monitoring")
    log(f"Base URL: {args.base_url}")
    log(f"Endpoints: {', '.join(args.endpoints)}")
    log(f"Interval: {args.interval} seconds")
    log(f"Response time threshold: {args.threshold} ms")
    log(f"Error rate threshold: {args.error_threshold:.2%}")
    
    while True:
        try:
            # Monitor endpoints
            log(f"Monitoring {len(args.endpoints)} endpoints...")
            results = monitor_endpoints(args.base_url, args.endpoints, args.auth_token)
            
            # Analyze results
            issues, stats = analyze_results(results, args.threshold, args.error_threshold)
            
            # Save results
            filename = save_results(results, args.data_dir)
            log(f"Results saved to {filename}")
            
            # Log statistics
            log(f"Success rate: {stats['success_rate']:.2%}")
            log(f"Average response time: {stats['avg_response_time']:.2f} ms")
            
            # Check for issues
            if issues:
                log(f"Issues detected: {len(issues)}")
                for issue in issues:
                    log(f"- {issue['message']}")
                
                # Send alert
                send_alert(
                    issues,
                    stats,
                    results,
                    args.alert_email,
                    args.smtp_server,
                    args.smtp_port,
                    args.smtp_user,
                    args.smtp_password,
                    log
                )
            else:
                log("No issues detected")
            
            # Wait for next interval
            log(f"Waiting {args.interval} seconds until next check...")
            time.sleep(args.interval)
        
        except KeyboardInterrupt:
            log("Monitoring stopped by user")
            break
        
        except Exception as e:
            log(f"Error in monitoring loop: {e}")
            time.sleep(args.interval)

def main():
    """Main function"""
    args = parse_args()
    
    # Set up logging
    log, log_file_handle = setup_logging(args.log_file)
    
    try:
        # Start monitoring loop
        monitor_loop(args, log)
    
    finally:
        # Close log file
        log_file_handle.close()

if __name__ == '__main__':
    main()
