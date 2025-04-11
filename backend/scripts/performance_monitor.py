#!/usr/bin/env python3
"""
API Performance Monitor

This script monitors the performance of the API and generates reports.
"""

import os
import sys
import json
import time
import argparse
import datetime
import requests
import statistics
import matplotlib.pyplot as plt
from concurrent.futures import ThreadPoolExecutor

# Add the parent directory to the path so we can import the utils module
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

def parse_args():
    """Parse command line arguments"""
    parser = argparse.ArgumentParser(description='Monitor API performance')
    parser.add_argument('--base-url', type=str, default='http://localhost:8000/api/v1',
                        help='Base URL of the API (default: http://localhost:8000/api/v1)')
    parser.add_argument('--endpoints', type=str, nargs='+',
                        default=['/products', '/products/1', '/orders', '/rentals'],
                        help='Endpoints to test (default: /products /products/1 /orders /rentals)')
    parser.add_argument('--requests', type=int, default=100,
                        help='Number of requests per endpoint (default: 100)')
    parser.add_argument('--concurrency', type=int, default=10,
                        help='Number of concurrent requests (default: 10)')
    parser.add_argument('--output', type=str, default='console',
                        choices=['console', 'json', 'html', 'plot'],
                        help='Output format (default: console)')
    parser.add_argument('--output-file', type=str,
                        help='Output file path (required for json, html, and plot output)')
    parser.add_argument('--auth-token', type=str,
                        help='Authentication token for protected endpoints')
    parser.add_argument('--interval', type=int, default=0,
                        help='Interval between requests in milliseconds (default: 0)')
    parser.add_argument('--timeout', type=int, default=10,
                        help='Request timeout in seconds (default: 10)')
    return parser.parse_args()

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

def test_endpoint(base_url, endpoint, num_requests, auth_token=None, interval=0, timeout=10):
    """Test an endpoint with multiple requests"""
    url = f"{base_url}{endpoint}"
    results = []
    
    for i in range(num_requests):
        result = make_request(url, auth_token, timeout)
        results.append(result)
        
        if interval > 0:
            time.sleep(interval / 1000)  # Convert to seconds
    
    return results

def test_endpoints_concurrent(base_url, endpoints, num_requests, concurrency, auth_token=None, interval=0, timeout=10):
    """Test multiple endpoints concurrently"""
    all_results = []
    
    with ThreadPoolExecutor(max_workers=concurrency) as executor:
        futures = []
        for endpoint in endpoints:
            future = executor.submit(test_endpoint, base_url, endpoint, num_requests, auth_token, interval, timeout)
            futures.append(future)
        
        for future in futures:
            results = future.result()
            all_results.extend(results)
    
    return all_results

def analyze_results(results):
    """Analyze the results of the performance test"""
    # Group results by endpoint
    endpoint_results = {}
    for result in results:
        url = result['url']
        if url not in endpoint_results:
            endpoint_results[url] = []
        
        endpoint_results[url].append(result)
    
    # Calculate statistics for each endpoint
    stats = {}
    for url, results in endpoint_results.items():
        response_times = [r['response_time'] for r in results]
        success_count = sum(1 for r in results if r['success'])
        
        stats[url] = {
            'count': len(results),
            'success_rate': (success_count / len(results)) * 100,
            'min_response_time': min(response_times),
            'max_response_time': max(response_times),
            'avg_response_time': statistics.mean(response_times),
            'median_response_time': statistics.median(response_times),
            'p90_response_time': statistics.quantiles(response_times, n=10)[8],
            'p95_response_time': statistics.quantiles(response_times, n=20)[18],
            'p99_response_time': statistics.quantiles(response_times, n=100)[98] if len(response_times) >= 100 else max(response_times),
            'std_dev': statistics.stdev(response_times) if len(response_times) > 1 else 0
        }
    
    # Calculate overall statistics
    all_response_times = [r['response_time'] for r in results]
    all_success_count = sum(1 for r in results if r['success'])
    
    overall_stats = {
        'count': len(results),
        'success_rate': (all_success_count / len(results)) * 100,
        'min_response_time': min(all_response_times),
        'max_response_time': max(all_response_times),
        'avg_response_time': statistics.mean(all_response_times),
        'median_response_time': statistics.median(all_response_times),
        'p90_response_time': statistics.quantiles(all_response_times, n=10)[8],
        'p95_response_time': statistics.quantiles(all_response_times, n=20)[18],
        'p99_response_time': statistics.quantiles(all_response_times, n=100)[98] if len(all_response_times) >= 100 else max(all_response_times),
        'std_dev': statistics.stdev(all_response_times) if len(all_response_times) > 1 else 0
    }
    
    return {
        'endpoints': stats,
        'overall': overall_stats
    }

def print_console_report(stats, results):
    """Print a report to the console"""
    print("\n" + "=" * 80)
    print("API Performance Report")
    print("=" * 80)
    
    print("\nOverall Statistics:")
    print(f"Total Requests: {stats['overall']['count']}")
    print(f"Success Rate: {stats['overall']['success_rate']:.2f}%")
    print(f"Average Response Time: {stats['overall']['avg_response_time']:.2f} ms")
    print(f"Median Response Time: {stats['overall']['median_response_time']:.2f} ms")
    print(f"90th Percentile: {stats['overall']['p90_response_time']:.2f} ms")
    print(f"95th Percentile: {stats['overall']['p95_response_time']:.2f} ms")
    print(f"99th Percentile: {stats['overall']['p99_response_time']:.2f} ms")
    print(f"Min Response Time: {stats['overall']['min_response_time']:.2f} ms")
    print(f"Max Response Time: {stats['overall']['max_response_time']:.2f} ms")
    print(f"Standard Deviation: {stats['overall']['std_dev']:.2f} ms")
    
    print("\nEndpoint Statistics:")
    for url, endpoint_stats in stats['endpoints'].items():
        print(f"\n{url}:")
        print(f"  Requests: {endpoint_stats['count']}")
        print(f"  Success Rate: {endpoint_stats['success_rate']:.2f}%")
        print(f"  Average Response Time: {endpoint_stats['avg_response_time']:.2f} ms")
        print(f"  Median Response Time: {endpoint_stats['median_response_time']:.2f} ms")
        print(f"  90th Percentile: {endpoint_stats['p90_response_time']:.2f} ms")
        print(f"  95th Percentile: {endpoint_stats['p95_response_time']:.2f} ms")
        print(f"  99th Percentile: {endpoint_stats['p99_response_time']:.2f} ms")
        print(f"  Min Response Time: {endpoint_stats['min_response_time']:.2f} ms")
        print(f"  Max Response Time: {endpoint_stats['max_response_time']:.2f} ms")
        print(f"  Standard Deviation: {endpoint_stats['std_dev']:.2f} ms")
    
    print("\n" + "=" * 80)

def generate_json_report(stats, results):
    """Generate a JSON report"""
    report = {
        'timestamp': time.time(),
        'generated_at': datetime.datetime.now().isoformat(),
        'stats': stats,
        'results': results
    }
    
    return json.dumps(report, indent=2)

def generate_html_report(stats, results):
    """Generate an HTML report"""
    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>API Performance Report</title>
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
        .chart {{
            height: 300px;
            margin-bottom: 20px;
        }}
    </style>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
</head>
<body>
    <h1>API Performance Report</h1>
    <p>Generated at: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}</p>
    
    <div class="container">
        <div class="card">
            <div class="stat">{stats['overall']['count']}</div>
            <div class="label">Total Requests</div>
        </div>
        <div class="card">
            <div class="stat">{stats['overall']['success_rate']:.2f}%</div>
            <div class="label">Success Rate</div>
        </div>
        <div class="card">
            <div class="stat">{stats['overall']['avg_response_time']:.2f} ms</div>
            <div class="label">Average Response Time</div>
        </div>
        <div class="card">
            <div class="stat">{stats['overall']['p95_response_time']:.2f} ms</div>
            <div class="label">95th Percentile</div>
        </div>
    </div>
    
    <div class="container">
        <div class="card" style="flex: 1;">
            <h2>Response Time Distribution</h2>
            <div class="chart">
                <canvas id="responseTimeChart"></canvas>
            </div>
        </div>
        <div class="card" style="flex: 1;">
            <h2>Endpoint Comparison</h2>
            <div class="chart">
                <canvas id="endpointChart"></canvas>
            </div>
        </div>
    </div>
    
    <h2>Endpoint Statistics</h2>
    <table>
        <thead>
            <tr>
                <th>Endpoint</th>
                <th>Requests</th>
                <th>Success Rate</th>
                <th>Avg Response Time</th>
                <th>Median</th>
                <th>95th Percentile</th>
                <th>Min</th>
                <th>Max</th>
                <th>Std Dev</th>
            </tr>
        </thead>
        <tbody>
"""
    
    # Add endpoint rows
    for url, endpoint_stats in stats['endpoints'].items():
        html += f"""
            <tr>
                <td>{url}</td>
                <td>{endpoint_stats['count']}</td>
                <td>{endpoint_stats['success_rate']:.2f}%</td>
                <td>{endpoint_stats['avg_response_time']:.2f} ms</td>
                <td>{endpoint_stats['median_response_time']:.2f} ms</td>
                <td>{endpoint_stats['p95_response_time']:.2f} ms</td>
                <td>{endpoint_stats['min_response_time']:.2f} ms</td>
                <td>{endpoint_stats['max_response_time']:.2f} ms</td>
                <td>{endpoint_stats['std_dev']:.2f} ms</td>
            </tr>
"""
    
    html += """
        </tbody>
    </table>
    
    <h2>Request Details</h2>
    <table>
        <thead>
            <tr>
                <th>URL</th>
                <th>Status Code</th>
                <th>Response Time</th>
                <th>Success</th>
                <th>Timestamp</th>
            </tr>
        </thead>
        <tbody>
"""
    
    # Add request rows (limit to 100 for performance)
    for result in results[:100]:
        timestamp = datetime.datetime.fromtimestamp(result['timestamp']).strftime('%Y-%m-%d %H:%M:%S')
        html += f"""
            <tr>
                <td>{result['url']}</td>
                <td>{result['status_code']}</td>
                <td>{result['response_time']:.2f} ms</td>
                <td>{'Yes' if result['success'] else 'No'}</td>
                <td>{timestamp}</td>
            </tr>
"""
    
    if len(results) > 100:
        html += f"""
            <tr>
                <td colspan="5">... and {len(results) - 100} more requests</td>
            </tr>
"""
    
    html += """
        </tbody>
    </table>
    
    <script>
        // Response time distribution chart
        const responseTimeCtx = document.getElementById('responseTimeChart').getContext('2d');
        
        // Create histogram data
        const responseTimes = [
"""
    
    # Add response times
    for result in results:
        html += f"            {result['response_time']:.2f},\n"
    
    html += """
        ];
        
        // Create histogram bins
        const binSize = 50; // 50ms bins
        const bins = {};
        const maxTime = Math.max(...responseTimes);
        
        for (let i = 0; i <= maxTime; i += binSize) {
            bins[i] = 0;
        }
        
        responseTimes.forEach(time => {
            const bin = Math.floor(time / binSize) * binSize;
            bins[bin] = (bins[bin] || 0) + 1;
        });
        
        const responseTimeChart = new Chart(responseTimeCtx, {
            type: 'bar',
            data: {
                labels: Object.keys(bins).map(bin => `${bin}-${parseInt(bin) + binSize} ms`),
                datasets: [{
                    label: 'Response Time Distribution',
                    data: Object.values(bins),
                    backgroundColor: 'rgba(75, 192, 192, 0.8)'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Number of Requests'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Response Time'
                        }
                    }
                }
            }
        });
        
        // Endpoint comparison chart
        const endpointCtx = document.getElementById('endpointChart').getContext('2d');
        
        const endpointChart = new Chart(endpointCtx, {
            type: 'bar',
            data: {
                labels: [
"""
    
    # Add endpoint labels
    for url in stats['endpoints'].keys():
        html += f"                    '{url}',\n"
    
    html += """
                ],
                datasets: [{
                    label: 'Average Response Time (ms)',
                    data: [
"""
    
    # Add average response times
    for endpoint_stats in stats['endpoints'].values():
        html += f"                        {endpoint_stats['avg_response_time']:.2f},\n"
    
    html += """
                    ],
                    backgroundColor: 'rgba(54, 162, 235, 0.8)'
                },
                {
                    label: '95th Percentile (ms)',
                    data: [
"""
    
    # Add 95th percentile response times
    for endpoint_stats in stats['endpoints'].values():
        html += f"                        {endpoint_stats['p95_response_time']:.2f},\n"
    
    html += """
                    ],
                    backgroundColor: 'rgba(255, 99, 132, 0.8)'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Response Time (ms)'
                        }
                    }
                }
            }
        });
    </script>
</body>
</html>
"""
    
    return html

def generate_plots(stats, results, output_file):
    """Generate plots of the performance test results"""
    # Create figure with subplots
    fig, axs = plt.subplots(2, 2, figsize=(15, 10))
    fig.suptitle('API Performance Test Results', fontsize=16)
    
    # Plot 1: Response time distribution
    response_times = [r['response_time'] for r in results]
    axs[0, 0].hist(response_times, bins=20, alpha=0.7, color='skyblue')
    axs[0, 0].set_title('Response Time Distribution')
    axs[0, 0].set_xlabel('Response Time (ms)')
    axs[0, 0].set_ylabel('Number of Requests')
    
    # Plot 2: Endpoint comparison (average response time)
    urls = list(stats['endpoints'].keys())
    avg_times = [stats['endpoints'][url]['avg_response_time'] for url in urls]
    p95_times = [stats['endpoints'][url]['p95_response_time'] for url in urls]
    
    x = range(len(urls))
    width = 0.35
    
    axs[0, 1].bar(x, avg_times, width, label='Average', color='skyblue')
    axs[0, 1].bar([i + width for i in x], p95_times, width, label='95th Percentile', color='salmon')
    axs[0, 1].set_title('Response Time by Endpoint')
    axs[0, 1].set_ylabel('Response Time (ms)')
    axs[0, 1].set_xticks([i + width/2 for i in x])
    axs[0, 1].set_xticklabels([url.split('/')[-1] or '/' for url in urls], rotation=45, ha='right')
    axs[0, 1].legend()
    
    # Plot 3: Response time over time
    timestamps = [r['timestamp'] - results[0]['timestamp'] for r in results]  # Relative time
    response_times = [r['response_time'] for r in results]
    
    axs[1, 0].scatter(timestamps, response_times, alpha=0.5, color='skyblue')
    axs[1, 0].set_title('Response Time Over Time')
    axs[1, 0].set_xlabel('Time (seconds)')
    axs[1, 0].set_ylabel('Response Time (ms)')
    
    # Plot 4: Success rate by endpoint
    success_rates = [stats['endpoints'][url]['success_rate'] for url in urls]
    
    axs[1, 1].bar(x, success_rates, color='skyblue')
    axs[1, 1].set_title('Success Rate by Endpoint')
    axs[1, 1].set_ylabel('Success Rate (%)')
    axs[1, 1].set_xticks(x)
    axs[1, 1].set_xticklabels([url.split('/')[-1] or '/' for url in urls], rotation=45, ha='right')
    axs[1, 1].set_ylim(0, 100)
    
    # Adjust layout and save
    plt.tight_layout()
    plt.subplots_adjust(top=0.9)
    plt.savefig(output_file)
    plt.close()

def main():
    """Main function"""
    args = parse_args()
    
    print(f"Testing {len(args.endpoints)} endpoints with {args.requests} requests each ({args.concurrency} concurrent requests)")
    print(f"Base URL: {args.base_url}")
    print(f"Endpoints: {', '.join(args.endpoints)}")
    print(f"Interval: {args.interval} ms")
    print(f"Timeout: {args.timeout} seconds")
    print(f"Output format: {args.output}")
    if args.output_file:
        print(f"Output file: {args.output_file}")
    
    # Run the performance test
    start_time = time.time()
    results = test_endpoints_concurrent(
        args.base_url,
        args.endpoints,
        args.requests,
        args.concurrency,
        args.auth_token,
        args.interval,
        args.timeout
    )
    end_time = time.time()
    
    # Calculate test duration
    test_duration = end_time - start_time
    print(f"\nTest completed in {test_duration:.2f} seconds")
    
    # Analyze the results
    stats = analyze_results(results)
    
    # Generate the report
    if args.output == 'console':
        print_console_report(stats, results)
    elif args.output == 'json':
        if not args.output_file:
            print("Error: --output-file is required for JSON output")
            sys.exit(1)
        
        json_report = generate_json_report(stats, results)
        with open(args.output_file, 'w') as f:
            f.write(json_report)
        
        print(f"JSON report saved to {args.output_file}")
    elif args.output == 'html':
        if not args.output_file:
            print("Error: --output-file is required for HTML output")
            sys.exit(1)
        
        html_report = generate_html_report(stats, results)
        with open(args.output_file, 'w') as f:
            f.write(html_report)
        
        print(f"HTML report saved to {args.output_file}")
    elif args.output == 'plot':
        if not args.output_file:
            print("Error: --output-file is required for plot output")
            sys.exit(1)
        
        generate_plots(stats, results, args.output_file)
        print(f"Plots saved to {args.output_file}")
    
    # Save raw results
    if args.output_file:
        raw_results_file = os.path.splitext(args.output_file)[0] + '_raw.json'
        with open(raw_results_file, 'w') as f:
            json.dump(results, f, indent=2)
        
        print(f"Raw results saved to {raw_results_file}")

if __name__ == '__main__':
    main()
