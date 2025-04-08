# GigGatek Alert Tuning Guide

This document provides a methodology for tuning alert thresholds in the GigGatek monitoring system based on observed production patterns.

## Alert Tuning Process

Alert tuning is an iterative process that should be performed regularly as part of the monitoring system's lifecycle. The goal is to minimize false positives while ensuring that genuine issues are caught promptly.

### 1. Initial Data Collection Phase (2-4 weeks)

During the first few weeks after deploying the monitoring system:

1. **Set alerts to "notification-only mode"**
   - Configure alerts to log and notify but not trigger actual paging/incidents
   - This allows collection of baseline data without alert fatigue
   
2. **Gather baseline metrics**
   - Record normal operating patterns for each metric
   - Document peak hours, expected fluctuations, and cyclical patterns
   - Identify the normal range for each monitored metric

3. **Document false positives**
   - Track all instances where alerts would have fired unnecessarily
   - Categorize by alert type, service, and time of day

### 2. Threshold Adjustment

After gathering baseline data:

1. **Calculate statistical thresholds**
   - For each metric, calculate:
     - Mean and standard deviation
     - 95th and 99th percentiles
     - Maximum observed values during normal operation
   
2. **Set primary thresholds**
   - For resource-based alerts (CPU, memory, disk):
     - Warning: Set at 80% of capacity or mean + 2 standard deviations
     - Critical: Set at 90% of capacity or mean + 3 standard deviations
   
   - For response time alerts:
     - Warning: 95th percentile + 20%
     - Critical: 95th percentile + 50%
   
   - For error rate alerts:
     - Warning: 3x normal error rate
     - Critical: 5x normal error rate or above SLA breach threshold

3. **Configure time windows**
   - Adjust "for" duration to reduce transient alerts:
     - Resource alerts: 5-10 minutes
     - Error rate alerts: 2-5 minutes
     - SLA-critical alerts: 1-2 minutes

4. **Apply business context**
   - For business hours (9am-6pm):
     - Use stricter thresholds
     - Set shorter evaluation windows
   
   - For non-business hours:
     - Use more relaxed thresholds
     - Set longer evaluation windows

### 3. Validation Phase (1-2 weeks)

1. **Shadow-mode testing**
   - Apply new thresholds in parallel with old ones
   - Compare alert patterns and identify improvements/regressions
   
2. **Alert correlation analysis**
   - Analyze which alerts tend to fire together
   - Group related alerts for better incident management
   - Configure inhibition rules to reduce noise

3. **Fine-tuning**
   - For noisy alerts:
     - Increase thresholds gradually (5-10% at a time)
     - Extend evaluation windows
   
   - For missed incidents:
     - Decrease thresholds
     - Add additional alert conditions

### 4. Alert Tuning Automation

For ongoing maintenance, consider implementing:

1. **Automatic threshold calculation**
   - Script that periodically recalculates thresholds based on recent data
   - Example implementation:

```python
def calculate_thresholds(metric_name, history_days=30):
    """Calculate appropriate thresholds for a given metric based on historical data"""
    # Query Prometheus for historical data
    query = f'avg_over_time({metric_name}[{history_days}d])'
    result = prometheus_client.query(query)
    
    # Calculate statistics
    mean = numpy.mean(result)
    std_dev = numpy.std(result)
    percentile_95 = numpy.percentile(result, 95)
    
    # Set thresholds
    warning_threshold = mean + 2 * std_dev
    critical_threshold = mean + 3 * std_dev
    
    # Don't let thresholds get too low
    min_warning = historical_min_thresholds[metric_name]['warning']
    min_critical = historical_min_thresholds[metric_name]['critical']
    
    return {
        'warning': max(warning_threshold, min_warning),
        'critical': max(critical_threshold, min_critical)
    }
```

2. **Alert effectiveness reporting**
   - Weekly report that tracks:
     - Most frequent alerts
     - Alerts that led to incidents
     - Potential false positives
     - Alert timing vs. actual incident impact

## Business-Specific Alert Tuning

### Payment Processing Alerts

| Alert | Initial Threshold | Tuning Considerations |
|-------|-------------------|------------------------|
| Payment Errors | >5 in 15min | Scale with transaction volume. During high-volume periods (holidays, promotions), use a percentage-based threshold instead (e.g., >2% error rate) |
| Payment Gateway Latency | >500ms avg | Tune based on provider SLAs. Different payment processors may have different performance characteristics |
| Transaction Value | Varies | Set different thresholds for different transaction amount ranges. High-value transactions may warrant stricter monitoring |

### Order Processing Alerts

| Alert | Initial Threshold | Tuning Considerations |
|-------|-------------------|------------------------|
| Order Processing Time | >30s for 90th percentile | Consider order complexity. Set separate thresholds for different order types (standard, custom, international) |
| Order Failure Rate | >3 failures in 30min | Scale with order volume. During sales events, use percentage-based threshold |
| Abandoned Orders | >20% above baseline | Tune based on day of week and time of day patterns |

### Rental Contract Alerts

| Alert | Initial Threshold | Tuning Considerations |
|-------|-------------------|------------------------|
| Contract Creation Failures | >3 in 30min | Adjust based on rental volume. Higher threshold during peak rental season |
| Contract Approval Time | >4 hours | Different thresholds for business vs. non-business hours |
| Contract Amendments | >10% of contracts | Seasonal adjustment may be needed |

## Example Alert Rules Tuning

Example of tuning a Prometheus alert rule for payment errors:

```yaml
# Original alert rule
- alert: PaymentProcessingErrors
  expr: sum(increase(payment_errors_total[15m])) > 5
  for: 5m
  labels:
    severity: critical
    category: payment
  annotations:
    summary: "Payment processing errors"
    description: "There have been more than 5 payment errors in the last 15 minutes."

# Tuned alert rule with business context
- alert: PaymentProcessingErrors
  expr: |
    (
      # During business hours, weekdays
      (sum(increase(payment_errors_total[15m])) > 5 and on() day_of_week() >= 1 and on() day_of_week() <= 5 and on() hour() >= 9 and on() hour() < 18)
      or
      # Outside business hours, higher threshold
      (sum(increase(payment_errors_total[15m])) > 10 and (on() day_of_week() < 1 or on() day_of_week() > 5 or on() hour() < 9 or on() hour() >= 18))
    )
    # During high volume periods (detected by transaction count), use percentage-based approach
    or
    (sum(increase(payment_errors_total[15m])) / sum(increase(payment_transactions_total[15m])) > 0.02 and sum(increase(payment_transactions_total[15m])) > 1000)
  for: 5m
  labels:
    severity: critical
    category: payment
  annotations:
    summary: "Payment processing errors"
    description: "Abnormal payment error rate detected: {{ $value }} errors in the last 15 minutes or error rate exceeding 2%."
```

## Implementing Alert Tuning Changes

1. **Document baseline data** in a standardized format:
   ```json
   {
     "metric": "payment_errors_total",
     "baseline_data": {
       "mean_per_15m": 0.8,
       "std_dev_per_15m": 1.2,
       "p95_per_15m": 3,
       "p99_per_15m": 4.5,
       "business_hours_mean": 1.2,
       "non_business_hours_mean": 0.4
     },
     "current_thresholds": {
       "warning": 5,
       "critical": 10
     },
     "recommended_thresholds": {
       "business_hours": {
         "warning": 4,
         "critical": 6
       },
       "non_business_hours": {
         "warning": 6,
         "critical": 12
       },
       "high_volume_periods": {
         "warning_percentage": 0.01,
         "critical_percentage": 0.02
       }
     }
   }
   ```

2. **Use version control** for alert rule changes:
   - Keep a git repository with alert rule versions
   - Document the reasoning for threshold changes
   - Track alert performance before and after changes

3. **A/B test alert thresholds** when possible:
   - Run two versions of critical alerts in parallel
   - Compare effectiveness before fully committing
   - Use testing to validate time windows and inhibition rules

## Regular Review Cycle

Establish a regular cadence for alert tuning:

1. **Weekly:** Review alert frequency and false positive rates
2. **Monthly:** Adjust thresholds based on data from the previous month
3. **Quarterly:** Comprehensive review of all alert rules
4. **Yearly:** Major revisions and alignment with updated SLAs and business objectives

## Alert Tuning Tools

Leverage these GigGatek monitoring system tools for alert tuning:

1. **Alert Dashboard:** `/grafana/dashboards/alert-analysis`
2. **Threshold Calculator:** `monitoring/scripts/calculate_thresholds.py`
3. **Alert History Query:** `monitoring/scripts/alert_history.py`
