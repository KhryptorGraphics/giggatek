# GigGatek SLA Monitoring Guide

This guide outlines how to implement and monitor Service Level Agreements (SLAs) for the GigGatek platform.

## SLA Definition and Implementation

### Key SLA Metrics for GigGatek

| Service | SLA Metric | Target | Critical Threshold | Measurement Method |
|---------|------------|--------|---------------------|-------------------|
| Website Availability | Uptime | 99.9% | <99.5% | External HTTP checks |
| API Availability | Uptime | 99.95% | <99.8% | External HTTP checks |
| Transaction Processing | Success Rate | 99.8% | <99.5% | Application metrics |
| Order Processing | Completion Time | <30s for 95% | >60s for 95% | Application metrics |
| Customer Support | Ticket Response Time | <4h for 95% | >8h for 95% | Helpdesk metrics |
| Rental Application | Approval Time | <24h for 90% | >48h for 90% | Application metrics |
| Search Functionality | Response Time | <1s for 95% | >3s for 95% | Application metrics |
| Checkout Process | Completion Rate | >85% | <70% | Application metrics |

### Implementing Technical SLA Metrics

#### 1. Service Availability Monitoring

Implement external and internal availability checks:

```yaml
# In monitoring/elk/heartbeat/heartbeat.yml
heartbeat.monitors:
- type: http
  id: frontend-availability
  name: Frontend Website
  schedule: '@every 30s'
  urls: ["https://www.giggatek.com", "https://giggatek.com"]
  check.response:
    status: [200]
    body: "GigGatek"  # String that should appear in response
  timeout: 5s

- type: http
  id: api-availability
  name: GigGatek API
  schedule: '@every 30s'
  urls: ["https://api.giggatek.com/health", "https://api.giggatek.com/v1/ping"]
  check.response:
    status: [200]
  timeout: 3s
  
- type: http
  id: backend-services
  name: Microservices Health
  schedule: '@every 1m'
  urls: 
    - "https://api.giggatek.com/orders/health"
    - "https://api.giggatek.com/rentals/health"
    - "https://api.giggatek.com/auth/health"
  check.response:
    status: [200]
  timeout: 3s
```

#### 2. Prometheus SLA Recording Rules

Add recording rules to continuously calculate SLA metrics:

```yaml
# In monitoring/prometheus/recording_rules.yml
groups:
- name: sla_recording_rules
  rules:
  # Frontend Availability SLA (30-day window)
  - record: sla:website_availability:ratio_30d
    expr: sum_over_time(probe_success{job="frontend-website"}[30d]) / count_over_time(probe_success{job="frontend-website"}[30d])
    
  # API Availability SLA (30-day window)
  - record: sla:api_availability:ratio_30d
    expr: sum_over_time(probe_success{job="api-endpoints"}[30d]) / count_over_time(probe_success{job="api-endpoints"}[30d])
    
  # Order Processing SLA (percentage under 30s)
  - record: sla:order_processing:under_30s_ratio
    expr: (sum(rate(order_processing_duration_seconds_bucket{le="30"}[1d])) by (job) / sum(rate(order_processing_duration_seconds_count[1d])) by (job))
    
  # Transaction Processing Success Rate
  - record: sla:transaction_success:ratio
    expr: sum(rate(payment_transactions_success_total[1d])) / sum(rate(payment_transactions_total[1d]))
    
  # API Response Time SLA (percentage under 1s)
  - record: sla:api_response:under_1s_ratio
    expr: (sum(rate(http_request_duration_seconds_bucket{le="1"}[1d])) by (handler) / sum(rate(http_request_duration_seconds_count[1d])) by (handler))
```

#### 3. Alerting on SLA Violations

Configure alerts for SLA breaches:

```yaml
# In monitoring/prometheus/alert_rules.yml
groups:
- name: sla_alerts
  rules:
  - alert: WebsiteAvailabilitySLABreach
    expr: sla:website_availability:ratio_30d < 0.999
    for: 5m
    labels:
      severity: warning
      sla: availability
      service: website
    annotations:
      summary: "Website availability SLA breach"
      description: "Website availability at {{ $value | humanizePercentage }} over 30 days, below 99.9% SLA target"
      
  - alert: WebsiteAvailabilitySLACritical
    expr: sla:website_availability:ratio_30d < 0.995
    for: 5m
    labels:
      severity: critical
      sla: availability
      service: website
    annotations:
      summary: "Critical website availability SLA breach"
      description: "Website availability at {{ $value | humanizePercentage }} over 30 days, below 99.5% critical threshold"
      
  - alert: TransactionProcessingSLABreach
    expr: sla:transaction_success:ratio < 0.998
    for: 10m
    labels:
      severity: warning
      sla: success_rate
      service: payments
    annotations:
      summary: "Transaction processing SLA breach"
      description: "Transaction success rate at {{ $value | humanizePercentage }}, below 99.8% SLA target"
      
  - alert: OrderProcessingSLABreach
    expr: sla:order_processing:under_30s_ratio < 0.95
    for: 15m
    labels:
      severity: warning
      sla: performance
      service: orders
    annotations:
      summary: "Order processing SLA breach"
      description: "Only {{ $value | humanizePercentage }} of orders processed within 30s, below 95% SLA target"
```

### Implementing Business SLA Metrics

#### 1. Application Instrumentation

Implement code to track business SLA metrics:

```python
# In backend/utils/sla.py

import time
from prometheus_client import Histogram, Counter, Gauge
from functools import wraps

# Define SLA metrics
order_processing_time = Histogram(
    'order_processing_duration_seconds',
    'Time to process orders',
    ['order_type', 'payment_method'],
    buckets=[5, 10, 15, 30, 60, 120, 300]
)

rental_approval_time = Histogram(
    'rental_approval_duration_seconds',
    'Time to approve rental applications',
    ['application_type', 'credit_tier'],
    buckets=[60, 300, 600, 1800, 3600, 7200, 86400]  # Up to 24 hours
)

checkout_completion = Counter(
    'checkout_completion_total',
    'Checkout process completion',
    ['status', 'payment_method']
)

support_ticket_response = Histogram(
    'support_ticket_response_seconds',
    'Time to first response for support tickets',
    ['priority', 'department'],
    buckets=[300, 600, 1800, 3600, 7200, 14400, 28800]  # Up to 8 hours
)

# Current SLA compliance gauges
sla_compliance = Gauge(
    'sla_compliance_ratio',
    'Current SLA compliance ratio',
    ['service', 'metric']
)

# Decorator to track order processing time
def track_order_processing(order_type):
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            start_time = time.time()
            result = func(*args, **kwargs)
            duration = time.time() - start_time
            
            # Extract payment method from result
            payment_method = result.get('payment_method', 'unknown')
            
            # Record the duration
            order_processing_time.labels(
                order_type=order_type,
                payment_method=payment_method
            ).observe(duration)
            
            # Update SLA compliance gauge
            if duration <= 30:
                sla_compliance.labels(
                    service='orders',
                    metric='processing_time'
                ).set(1)
            else:
                sla_compliance.labels(
                    service='orders',
                    metric='processing_time'
                ).set(0)
                
            return result
        return wrapper
    return decorator

# Decorator to track rental approval time
def track_rental_approval(application_type):
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            start_time = time.time()
            result = func(*args, **kwargs)
            duration = time.time() - start_time
            
            # Extract credit tier from result
            credit_tier = result.get('credit_tier', 'unknown')
            
            # Record the duration
            rental_approval_time.labels(
                application_type=application_type,
                credit_tier=credit_tier
            ).observe(duration)
            
            # Update SLA compliance gauge
            if duration <= 86400:  # 24 hours
                sla_compliance.labels(
                    service='rentals',
                    metric='approval_time'
                ).set(1)
            else:
                sla_compliance.labels(
                    service='rentals',
                    metric='approval_time'
                ).set(0)
                
            return result
        return wrapper
    return decorator

# Function to track checkout completion
def record_checkout_completion(status, payment_method='unknown'):
    checkout_completion.labels(
        status=status,
        payment_method=payment_method
    ).inc()
    
    # Update SLA compliance for checkout completion rate
    successful = checkout_completion.labels(status='success', payment_method='').value
    abandoned = checkout_completion.labels(status='abandoned', payment_method='').value
    failed = checkout_completion.labels(status='failed', payment_method='').value
    
    total = successful + abandoned + failed
    if total > 0:
        completion_rate = successful / total
        sla_compliance.labels(
            service='checkout',
            metric='completion_rate'
        ).set(1 if completion_rate >= 0.85 else 0)
```

#### 2. Business SLA Dashboard

Create a dedicated business SLA dashboard:

**In Grafana**: `monitoring/grafana/provisioning/dashboards/json/business-slas.json`

Key panels should include:

1. **Order Processing Time SLA**
   - Current SLA compliance status
   - Historical trend (7-day, 30-day)
   - Breakdown by order type

2. **Checkout Completion Rate SLA**
   - Current completion rate vs. target
   - Historical trend
   - Breakdown by payment method

3. **Rental Approval Time SLA**
   - Current approval time vs. target
   - Historical trend
   - Breakdown by application type and credit tier

4. **Support Response Time SLA**
   - Current response time vs. target
   - Historical trend
   - Breakdown by priority and department

## SLA Monitoring Dashboards

### Creating an SLA Overview Dashboard

The SLA Overview dashboard should:

1. Provide a single-pane view of all SLA metrics
2. Clearly indicate current compliance status
3. Show historical trends
4. Support drill-down into detailed metrics

#### Sample SLA Dashboard Layout

1. **Header Row**: Overall SLA compliance summary
   - SLA Compliance Scorecard: Number of compliant vs. non-compliant SLAs
   - Business Impact Rating: Estimated impact of current SLA breaches

2. **Technical SLAs Section**
   - Availability metrics (website, API, services)
   - Performance metrics (response times, error rates)
   - Capacity metrics (resource utilization vs. thresholds)

3. **Business SLAs Section**
   - Order processing metrics
   - Customer service metrics
   - Rental application metrics
   - Payment processing metrics

4. **Footer Row**: SLA breach history
   - Recent SLA violations
   - Time to resolution metrics
   - Most frequent SLA breaches

### Example Visualizations

1. **SLA Status Gauges**

```json
{
  "title": "Website Availability SLA",
  "type": "gauge",
  "datasource": "Prometheus",
  "targets": [
    {
      "expr": "sla:website_availability:ratio_30d * 100",
      "legendFormat": "30-day Availability"
    }
  ],
  "options": {
    "reduceOptions": {
      "values": false,
      "calcs": ["mean"],
      "fields": ""
    }
  },
  "fieldConfig": {
    "defaults": {
      "min": 99,
      "max": 100,
      "thresholds": {
        "mode": "absolute",
        "steps": [
          { "color": "red", "value": null },
          { "color": "orange", "value": 99.5 },
          { "color": "green", "value": 99.9 }
        ]
      },
      "unit": "percent",
      "decimals": 3
    }
  }
}
```

2. **SLA Compliance Timeline**

```json
{
  "title": "SLA Compliance History",
  "type": "timeseries",
  "datasource": "Prometheus",
  "targets": [
    {
      "expr": "sla:order_processing:under_30s_ratio * 100",
      "legendFormat": "Order Processing"
    },
    {
      "expr": "sla:transaction_success:ratio * 100",
      "legendFormat": "Transaction Success"
    },
    {
      "expr": "sla:api_response:under_1s_ratio * 100",
      "legendFormat": "API Response Time"
    }
  ],
  "options": {
    "legend": { "showLegend": true }
  },
  "fieldConfig": {
    "defaults": {
      "custom": {
        "lineInterpolation": "smooth",
        "fillOpacity": 10
      },
      "thresholds": {
        "mode": "line",
        "steps": [
          { "color": "red", "value": null },
          { "color": "orange", "value": 95 },
          { "color": "green", "value": 99 }
        ]
      },
      "unit": "percent",
      "min": 90
    }
  }
}
```

3. **SLA Breach Duration**

```json
{
  "title": "SLA Breach Duration",
  "type": "timeseries",
  "datasource": "Prometheus",
  "targets": [
    {
      "expr": "sum(sla_breach_duration_seconds) by (sla_name)",
      "legendFormat": "{{sla_name}}"
    }
  ],
  "options": {
    "legend": { "showLegend": true }
  },
  "fieldConfig": {
    "defaults": {
      "custom": {
        "drawStyle": "bars",
        "barAlignment": 0
      },
      "unit": "s",
      "color": {
        "mode": "palette-classic"
      }
    }
  }
}
```

## SLA Reporting

### Automated SLA Reports

Set up automated SLA reports to be generated and sent to stakeholders:

1. **Daily Operational Reports**
   - Current SLA compliance status
   - Any ongoing SLA breaches
   - Expected resolution times

2. **Weekly Management Reports**
   - SLA compliance trends
   - Notable incidents
   - Areas for improvement

3. **Monthly Executive Reports**
   - Overall SLA performance
   - Business impact analysis
   - Recommended improvements

### Implementing Automated Reports

Create a reporting script to generate and distribute reports:

```python
#!/usr/bin/env python3
# monitoring/scripts/generate_sla_report.py

import argparse
import datetime
import requests
import json
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.application import MIMEApplication

def query_prometheus(prometheus_url, query):
    """Execute a PromQL query and return results"""
    params = {'query': query}
    response = requests.get(f"{prometheus_url}/api/v1/query", params=params)
    return response.json()

def generate_sla_report(prometheus_url, report_type='daily'):
    """Generate SLA compliance report"""
    report_data = {
        'timestamp': datetime.datetime.now().isoformat(),
        'report_type': report_type,
        'sla_metrics': {}
    }
    
    # Query SLA metrics
    sla_metrics = [
        {'name': 'Website Availability', 'query': 'sla:website_availability:ratio_30d * 100', 'target': 99.9},
        {'name': 'API Availability', 'query': 'sla:api_availability:ratio_30d * 100', 'target': 99.95},
        {'name': 'Transaction Success', 'query': 'sla:transaction_success:ratio * 100', 'target': 99.8},
        {'name': 'Order Processing', 'query': 'sla:order_processing:under_30s_ratio * 100', 'target': 95.0},
    ]
    
    for metric in sla_metrics:
        result = query_prometheus(prometheus_url, metric['query'])
        if result['status'] == 'success' and len(result['data']['result']) > 0:
            value = float(result['data']['result'][0]['value'][1])
            report_data['sla_metrics'][metric['name']] = {
                'value': value,
                'target': metric['target'],
                'compliant': value >= metric['target']
            }
    
    # Calculate overall compliance
    compliant_count = sum(1 for m in report_data['sla_metrics'].values() if m['compliant'])
    total_count = len(report_data['sla_metrics'])
    report_data['overall_compliance'] = {
        'compliant_count': compliant_count,
        'total_count': total_count,
        'percentage': (compliant_count / total_count * 100) if total_count > 0 else 0
    }
    
    # Generate HTML report
    html_report = generate_html_report(report_data, report_type)
    
    return report_data, html_report

def generate_html_report(report_data, report_type):
    """Generate HTML report from report data"""
    # HTML report template
    html = f"""
    <html>
    <head>
        <style>
            body {{ font-family: Arial, sans-serif; margin: 0; padding: 0; }}
            .container {{ max-width: 800px; margin: 0 auto; padding: 20px; }}
            table {{ width: 100%; border-collapse: collapse; margin: 20px 0; }}
            th, td {{ padding: 12px 15px; text-align: left; border-bottom: 1px solid #ddd; }}
            th {{ background-color: #f2f2f2; }}
            .compliant {{ color: green; }}
            .non-compliant {{ color: red; }}
            .summary {{ padding: 15px; background-color: #f9f9f9; margin-bottom: 20px; border-radius: 5px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <h1>GigGatek SLA {report_type.capitalize()} Report</h1>
            <p>Generated on: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}</p>
            
            <div class="summary">
                <h2>Summary</h2>
                <p>Overall Compliance: <b>{report_data['overall_compliance']['percentage']:.2f}%</b> 
                ({report_data['overall_compliance']['compliant_count']} of {report_data['overall_compliance']['total_count']} SLAs met)</p>
            </div>
            
            <h2>SLA Metrics</h2>
            <table>
                <tr>
                    <th>Metric</th>
                    <th>Current Value</th>
                    <th>Target</th>
                    <th>Status</th>
                </tr>
    """
    
    # Add each SLA metric to the table
    for name, metric in report_data['sla_metrics'].items():
        status_class = "compliant" if metric['compliant'] else "non-compliant"
        status_text = "Compliant" if metric['compliant'] else "Non-Compliant"
        html += f"""
                <tr>
                    <td>{name}</td>
                    <td>{metric['value']:.2f}%</td>
                    <td>{metric['target']}%</td>
                    <td class="{status_class}">{status_text}</td>
                </tr>
        """
    
    html += """
            </table>
        </div>
    </body>
    </html>
    """
    
    return html

def send_email_report(recipients, subject, html_content, smtp_server, smtp_port, sender_email, sender_password):
    """Send email report to recipients"""
    message = MIMEMultipart()
    message['Subject'] = subject
    message['From'] = sender_email
    message['To'] = ', '.join(recipients)
    
    # Attach HTML content
    message.attach(MIMEText(html_content, 'html'))
    
    # Connect to SMTP server and send email
    with smtplib.SMTP(smtp_server, smtp_port) as server:
        server.starttls()
        server.login(sender_email, sender_password)
        server.send_message(message)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Generate SLA Compliance Report')
    parser.add_argument('--prometheus', default='http://localhost:9090', help='Prometheus URL')
    parser.add_argument('--type', choices=['daily', 'weekly', 'monthly'], default='daily', help='Report type')
    parser.add_argument('--output', help='Output JSON file path')
    parser.add_argument('--email', action='store_true', help='Send report via email')
    parser.add_argument('--recipients', help='Email recipients (comma-separated)')
    parser.add_argument('--smtp-server', default='smtp.example.com', help='SMTP server')
    parser.add_argument('--smtp-port', type=int, default=587, help='SMTP port')
    parser.add_argument('--sender-email', help='Sender email address')
    parser.add_argument('--sender-password', help='Sender email password')
    
    args = parser.parse_args()
    
    # Generate report
    report_data, html_report = generate_sla_report(args.prometheus, args.type)
    
    # Save to file if specified
    if args.output:
        with open(args.output, 'w') as f:
            json.dump(report_data, f, indent=2)
        print(f"Report saved to {args.output}")
    
    # Send email if specified
    if args.email and args.recipients:
        recipients = [r.strip() for r in args.recipients.split(',')]
        subject = f"GigGatek {args.type.capitalize()} SLA Report - {datetime.datetime.now().strftime('%Y-%m-%d')}"
        send_email_report(
            recipients, 
            subject, 
            html_report, 
            args.smtp_server, 
            args.smtp_port, 
            args.sender_email, 
            args.sender_password
        )
        print(f"Report sent to {args.recipients}")
    
    # Print summary to console
    print(f"Overall SLA Compliance: {report_data['overall_compliance']['percentage']:.2f}%")
    for name, metric in report_data['sla_metrics'].items():
        status = "✅" if metric['compliant'] else "❌"
        print(f"{status} {name}: {metric['value']:.2f}% (Target: {metric['target']}%)")
```

### Schedule Report Generation

Add the following to your crontab to schedule report generation:

```bash
# Daily operational report (every day at 7am)
0 7 * * * /usr/bin/python3 /path/to/monitoring/scripts/generate_sla_report.py --type daily --output /path/to/reports/daily_sla_report_$(date +\%Y\%m\%d).json --email --recipients operations@giggatek.com

# Weekly management report (every Monday at 8am)
0 8 * * 1 /usr/bin/python3 /path/to/monitoring/scripts/generate_sla_report.py --type weekly --output /path/to/reports/weekly_sla_report_$(date +\%Y\%m\%d).json --email --recipients management@giggatek.com

# Monthly executive report (1st day of month at 9am)
0 9 1 * * /usr/bin/python3 /path/to/monitoring/scripts/generate_sla_report.py --type monthly --output /path/to/reports/monthly_sla_report_$(date +\%Y\%m).json --email --recipients executives@giggatek.com
```

## SLA Breach Management

### SLA Breach Response Process

1. **Detection**: Alert triggered by monitoring system
2. **Classification**: Determine severity and business impact
3. **Notification**: Notify stakeholders based on severity
4. **Investigation**: Determine root cause
5. **Mitigation**: Implement immediate fix or workaround
6. **Resolution**: Apply permanent fix
7. **Post-Mortem**: Document incident and lessons learned

### SLA Breach Tracking

Create an SLA breach tracking system:

```python
# In backend/utils/sla.py

class SLABreachTracker:
    def __init__(self):
        self.active_breaches = {}
        
        # Prometheus metrics for SLA breaches
        self.breach_counter = Counter(
            'sla_breach_total',
            'Count of SLA breaches',
            ['sla_name', 'severity']
        )
        
        self.breach_duration = Gauge(
            'sla_breach_duration_seconds',
            'Duration of active SLA breaches',
            ['sla_name', 'breach_id']
        )
        
        self.breach_resolution_time = Histogram(
            'sla_breach_resolution_seconds',
            'Time to resolve SLA breaches',
            ['sla_name', 'severity'],
            buckets=[60, 300, 900, 1800, 3600, 7200, 14400, 28800, 86400]
        )
    
    def record_breach(self, sla_name, severity='warning', metadata=None):
        """Record a new SLA breach"""
        import uuid
        import time
        
        breach_id = str(uuid.uuid4())
        self.active_breaches[breach_id] = {
            'sla_name': sla_name,
            'severity': severity,
            'start_time': time.time(),
            'metadata': metadata or {}
        }
        
        # Increment breach counter
        self.breach_counter.labels(
            sla_name=sla_name,
            severity=severity
        ).inc()
        
        # Start tracking duration
        self._update_breach_duration(breach_id)
        
        return breach_id
    
    def resolve_breach(self, breach_id):
        """Resolve an SLA breach"""
        import time
        
        if breach_id not in self.active_breaches:
            return False
            
        breach = self.active_breaches[breach_id]
        end_time = time.time()
        duration = end_time - breach['start_time']
        
        # Record resolution time
        self.breach_resolution_time.labels(
            sla_name=breach['sla_name'],
            severity=breach['severity']
        ).observe(duration)
        
        # Stop tracking duration
        self.breach_duration.labels(
            sla_name=breach['sla_name'],
            breach_id=breach_id
        ).set(0)
        
        # Remove from active breaches
        del self.active_breaches[breach_id]
        
        return True
    
    def get_active_breaches(self):
        """Get all active breaches"""
        return self.active_breaches
    
    def _update_breach_duration(self, breach_id):
        """Update the duration metric for an active breach"""
        import time
        import threading
        
        if breach_id not in self.active_breaches:
            return
            
        breach = self.active_breaches[breach_id]
        duration = time.time() - breach['start_time']
        
        # Update the duration metric
        self.breach_duration.labels(
            sla_name=breach['sla_name'],
            breach_id=breach_id
        ).set(duration)
        
        # Schedule the next update
        threading.Timer(10, self._update_breach_duration, args=[breach_id]).start()

# Global SLA breach tracker instance
sla_breach_tracker = SLABreachTracker()
```

### Integration with Incident Management

Create an example incident management integration:

```python
# In backend/utils/incident.py

import requests
import json
import os
from .sla import sla_breach_tracker

# PagerDuty API configuration
PAGERDUTY_API_KEY = os.environ.get('PAGERDUTY_API_KEY')
PAGERDUTY_SERVICE_ID = os.environ.get('PAGERDUTY_SERVICE_ID')
PAGERDUTY_API_URL = 'https://api.pagerduty.com/incidents'

def create_incident_for_sla_breach(breach_id):
    """Create a PagerDuty incident for an SLA breach"""
    breach = sla_breach_tracker.get_active_breaches().get(breach_id)
    
    if not breach:
        return None
        
    # Map severity to PagerDuty urgency
    urgency = 'high' if breach['severity'] == 'critical' else 'low'
    
    # Create the incident payload
    payload = {
        'incident': {
            'type': 'incident',
            'title': f"SLA Breach: {breach['sla_name']}",
            'service': {
                'id': PAGERDUTY_SERVICE_ID,
                'type': 'service_reference'
            },
            'urgency': urgency,
            'body': {
                'type': 'incident_body',
                'details': json.dumps(breach['metadata'], indent=2)
            }
        }
    }
    
    # Send the request to PagerDuty
    headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.pagerduty+json;version=2',
        'Authorization': f'Token token={PAGERDUTY_API_KEY}'
    }
    
    response = requests.post(
        PAGERDUTY_API_URL,
        headers=headers,
        json=payload
    )
    
    if response.
