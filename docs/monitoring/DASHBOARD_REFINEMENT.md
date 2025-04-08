# GigGatek Dashboard Refinement Guide

This guide provides a methodology for refining monitoring dashboards to meet the specific needs of different stakeholders within GigGatek.

## Dashboard Refinement Principles

When refining dashboards for business stakeholders, focus on:

1. **Relevance**: Show only the metrics that matter to specific roles
2. **Clarity**: Use visualization types that clearly communicate the intended information
3. **Context**: Provide historical context and thresholds for proper interpretation
4. **Actionability**: Make it clear what actions should be taken based on the data
5. **Audience-Specific**: Tailor technical depth to the intended audience

## Stakeholder-Specific Dashboard Requirements

### Executive Leadership

**Dashboard Name**: `Executive Overview`

**Purpose**: High-level business health metrics with minimal technical details

**Key Visualizations**:
- Revenue vs. Target (Gauge or Progress Bar)
- Daily/Weekly/Monthly Order Volume Trends (Time Series)
- Payment Success Rate (Gauge)
- Active Rental Contracts (Number with Trend)
- Customer Acquisition Cost vs. Lifetime Value (Bar Chart)
- System Availability SLA Compliance (Gauge)

**Refinement Considerations**:
- Focus on business outcomes, not technical metrics
- Use quarter-to-date and year-to-date comparisons
- Include forecasting where possible
- Limit technical jargon
- Include annotations for significant business events (marketing campaigns, etc.)

**Example Panel Configuration**:
```json
{
  "title": "Revenue vs. Target",
  "type": "gauge",
  "datasource": "Prometheus",
  "targets": [
    {
      "expr": "sum(revenue_total) / on() group_left sum(revenue_target) * 100",
      "legendFormat": "% of Target"
    }
  ],
  "options": {
    "orientation": "auto",
    "textMode": "auto",
    "colorMode": "thresholds",
    "graphMode": "area",
    "justifyMode": "auto",
    "displayMode": "gradient",
    "content": "",
    "mode": "basic",
    "valueField": "",
    "alignment": "center"
  },
  "fieldConfig": {
    "defaults": {
      "color": {
        "mode": "thresholds"
      },
      "mappings": [],
      "thresholds": {
        "mode": "absolute",
        "steps": [
          {
            "color": "red",
            "value": 0
          },
          {
            "color": "orange",
            "value": 70
          },
          {
            "color": "#EAB839",
            "value": 90
          },
          {
            "color": "green",
            "value": 100
          }
        ]
      },
      "unit": "percent"
    }
  }
}
```

### Sales & Marketing Team

**Dashboard Name**: `Sales Performance`

**Purpose**: Track sales effectiveness and marketing campaign impact

**Key Visualizations**:
- Revenue by Product Category (Pie Chart)
- Conversion Funnel: Visitors → Carts → Checkouts → Orders (Funnel Chart)
- Customer Acquisition by Channel (Bar Chart)
- Cart Abandonment Rate (Time Series)
- Top Selling Products (Table)
- Order Value Distribution (Histogram)
- Geographic Sales Distribution (Map)

**Refinement Considerations**:
- Add filters for campaign IDs, date ranges, and product categories
- Include comparison to previous periods
- Highlight correlations between marketing activities and sales
- Show real-time data for current campaigns
- Add annotations for price changes and promotions

**Example Panel Configuration**:
```json
{
  "title": "Conversion Funnel",
  "type": "barchart",
  "datasource": "Elasticsearch",
  "targets": [
    {
      "query": "metrics.visitors.value",
      "refId": "Visitors"
    },
    {
      "query": "metrics.cart_additions.value",
      "refId": "Added to Cart"
    },
    {
      "query": "metrics.checkout_starts.value",
      "refId": "Started Checkout"
    },
    {
      "query": "metrics.orders.value",
      "refId": "Completed Orders"
    }
  ],
  "options": {
    "orientation": "auto",
    "stacking": "none",
    "showValue": "auto",
    "axisPlacement": "auto",
    "barWidth": 0.97,
    "groupWidth": 0.7,
    "lineWidth": 1
  },
  "fieldConfig": {
    "defaults": {
      "unit": "short",
      "displayName": "${__field.name}",
      "color": {
        "mode": "scheme",
        "seriesBy": "last",
        "fixedColors": [
          "green",
          "yellow",
          "orange",
          "red"
        ],
        "schemeId": "bluePurple"
      }
    }
  }
}
```

### Operations Team

**Dashboard Name**: `Operational Health`

**Purpose**: Monitor day-to-day business operations and system health

**Key Visualizations**:
- Order Processing Time (Time Series with SLA threshold)
- Order Queue Depth (Time Series)
- Inventory Status for Top Products (Table with thresholds)
- Shipping Partner Status (Status Panels)
- Customer Support Ticket Volume (Time Series)
- Failed Payments by Reason (Pie Chart)

**Refinement Considerations**:
- Include alerting thresholds directly on visualizations
- Add links to runbooks for common issues
- Show current values and 24-hour trends
- Group related metrics in logical sections
- Support drill-down into specific components

**Example Panel Configuration**:
```json
{
  "title": "Order Processing Time (90th Percentile)",
  "type": "timeseries",
  "datasource": "Prometheus",
  "targets": [
    {
      "expr": "histogram_quantile(0.9, sum(rate(order_processing_duration_seconds_bucket[5m])) by (le))",
      "legendFormat": "Processing Time"
    }
  ],
  "options": {
    "tooltip": {
      "mode": "multi",
      "sort": "none"
    },
    "legend": {
      "displayMode": "list",
      "placement": "bottom",
      "showLegend": true
    }
  },
  "fieldConfig": {
    "defaults": {
      "color": {
        "mode": "palette-classic"
      },
      "custom": {
        "axisCenteredZero": false,
        "axisColorMode": "text",
        "axisLabel": "Seconds",
        "axisPlacement": "auto",
        "barAlignment": 0,
        "drawStyle": "line",
        "fillOpacity": 10,
        "gradientMode": "none",
        "hideFrom": {
          "legend": false,
          "tooltip": false,
          "viz": false
        },
        "insertNulls": false,
        "lineInterpolation": "smooth",
        "lineWidth": 2,
        "pointSize": 5,
        "scaleDistribution": {
          "type": "linear"
        },
        "showPoints": "never",
        "spanNulls": true,
        "stacking": {
          "group": "A",
          "mode": "none"
        },
        "thresholdsStyle": {
          "mode": "line+area"
        }
      },
      "thresholds": {
        "mode": "absolute",
        "steps": [
          {
            "color": "green",
            "value": null
          },
          {
            "color": "red",
            "value": 30
          }
        ]
      },
      "unit": "s"
    }
  }
}
```

### Finance Team

**Dashboard Name**: `Financial Metrics`

**Purpose**: Track revenue, payment processing, and financial health

**Key Visualizations**:
- Revenue by Payment Method (Bar Chart)
- Transaction Success Rate (Time Series)
- Average Order Value Trend (Time Series)
- Chargebacks and Disputes (Time Series)
- Rent-to-Own Contract Value (Time Series)
- Rental Late Payment Rate (Gauge)

**Refinement Considerations**:
- Include fiscal period markers (Q1, Q2, etc.)
- Use accounting-relevant units and formats
- Show variance from forecasts
- Include tax calculation metrics
- Add revenue recognition timing visualizations

**Example Panel Configuration**:
```json
{
  "title": "Revenue by Payment Method",
  "type": "piechart",
  "datasource": "Prometheus",
  "targets": [
    {
      "expr": "sum(payment_volume_total) by (payment_method)",
      "legendFormat": "{{payment_method}}"
    }
  ],
  "options": {
    "pieType": "pie",
    "displayLabels": ["name", "value"],
    "legend": {
      "displayMode": "table",
      "placement": "right",
      "values": ["value", "percent"]
    },
    "reduceOptions": {
      "values": true,
      "calcs": ["sum"],
      "fields": ""
    }
  },
  "fieldConfig": {
    "defaults": {
      "unit": "currencyUSD",
      "decimals": 2
    }
  }
}
```

### Product Management

**Dashboard Name**: `Product Insights`

**Purpose**: Understand product usage and performance

**Key Visualizations**:
- Product Page Views vs. Conversions (Bar Chart)
- Top Performing Products (Table)
- Product Category Performance (Heat Map)
- Search Term Analysis (Word Cloud)
- Feature Usage Statistics (Bar Chart)
- Rental vs. Purchase Preference (Time Series)

**Refinement Considerations**:
- Include cohort analysis for retention metrics
- Add filters for specific product features
- Show user journey and navigation patterns
- Incorporate customer feedback metrics
- Compare performance against product release timeline

**Example Panel Configuration**:
```json
{
  "title": "Product Category Performance",
  "type": "heatmap",
  "datasource": "Elasticsearch",
  "targets": [
    {
      "query": "product_performance",
      "metrics": [
        { "type": "count", "id": "1" }
      ],
      "bucketAggs": [
        {
          "type": "terms",
          "id": "2",
          "field": "category.keyword",
          "settings": { "size": "10", "order": "desc", "orderBy": "_count" }
        },
        {
          "type": "date_histogram",
          "id": "3",
          "field": "@timestamp",
          "settings": { "interval": "1d", "min_doc_count": "1" }
        }
      ]
    }
  ],
  "options": {
    "calculate": true,
    "cellGap": 1,
    "color": {
      "mode": "scheme",
      "schemeId": "turbo"
    },
    "yAxis": {
      "axisPlacement": "left"
    }
  }
}
```

## Creating Role-Based Views

Beyond individual dashboards, consider creating role-based views that combine relevant panels from multiple dashboards:

1. **Create Base Dashboards**: Design comprehensive dashboards for each functional area
2. **Define Roles**: Map organizational roles to dashboard needs
3. **Create Role Views**: Build filtered views of the base dashboards
4. **Use Dashboard Links**: Create navigation between related dashboards
5. **Set Default Dashboards**: Configure default views based on user groups

### Example Role-Dashboard Mapping

```json
{
  "roles": [
    {
      "name": "CEO",
      "dashboards": [
        {"name": "Executive Overview", "default": true},
        {"name": "Financial Metrics", "filtered": true},
        {"name": "Operational Health", "filtered": true}
      ]
    },
    {
      "name": "Sales Director",
      "dashboards": [
        {"name": "Sales Performance", "default": true},
        {"name": "Product Insights", "filtered": false},
        {"name": "Executive Overview", "filtered": true}
      ]
    },
    {
      "name": "Operations Manager",
      "dashboards": [
        {"name": "Operational Health", "default": true},
        {"name": "Technical Operations", "filtered": false},
        {"name": "Sales Performance", "filtered": true}
      ]
    }
  ]
}
```

## Dashboard Design Best Practices

### Layout and Organization

1. **Top-to-Bottom Flow**: Organize from high-level metrics to detailed breakdowns
2. **Logical Grouping**: Cluster related metrics together
3. **Consistent Color Scheme**: Use consistent colors for the same metrics across dashboards
4. **White Space**: Don't overcrowd - leave breathing room between panels
5. **Responsive Layout**: Ensure layouts work on different screen sizes

### Visualization Selection

| Data Type | Best Visualizations | Avoid |
|-----------|---------------------|-------|
| Time Series | Line charts, Area charts | Pie charts, Tables |
| Distribution | Histograms, Heat maps | Line charts |
| Composition | Stacked bar charts, Pie charts | Tables, Time series |
| Comparison | Bar charts, Bullet graphs | Pie charts, Area charts |
| Correlation | Scatter plots, Bubble charts | Pie charts, Gauges |
| Status | Gauges, Status panels | Line charts |

### Annotation and Documentation

1. **Add Dashboard Documentation**: Include a dashboard description and usage notes
2. **Use Annotations**: Mark deployments, incidents, and business events
3. **Add Tooltips**: Explain complex metrics with hover descriptions
4. **Include Links**: Add links to related dashboards and external documentation
5. **Provide Context**: Include targets and thresholds wherever possible

## Implementing New Dashboard Panels

### Custom Business Metric Collection

Implement these application changes to collect business-specific metrics:

1. **Backend implementation**:
   ```python
   # In backend/utils/monitoring.py
   
   # Define business metrics
   revenue_daily = Gauge(
       'revenue_daily_total',
       'Total daily revenue in cents',
       ['payment_method', 'product_category']
   )
   
   customer_acquisition_count = Counter(
       'customer_acquisition_total',
       'New customer count',
       ['acquisition_channel', 'campaign_id']
   )
   
   # Example usage in order processing code
   @track_order_processing('purchase')
   def process_order(order_data):
       # Process order...
       
       # Record revenue metrics
       revenue_daily.labels(
           payment_method=order_data['payment_method'],
           product_category=order_data['product_category']
       ).inc(order_data['total_amount_cents'])
       
       # Record customer acquisition if new customer
       if order_data['is_new_customer']:
           customer_acquisition_count.labels(
               acquisition_channel=order_data['referral_source'],
               campaign_id=order_data.get('campaign_id', 'none')
           ).inc()
   ```

2. **Frontend implementation**:
   ```javascript
   // In frontend/js/monitoring.js
   
   // Track marketing funnel events
   function trackFunnelStep(step, metadata = {}) {
     GigGatekMonitoring.trackAction('funnel_step', {
       step_name: step,
       ...metadata
     });
   }
   
   // Example usage in product pages
   document.querySelector('.add-to-cart-button').addEventListener('click', function() {
     trackFunnelStep('add_to_cart', {
       product_id: productId,
       product_name: productName,
       product_category: productCategory,
       product_price: productPrice
     });
   });
   ```

### Dashboard JSON Import Procedure

Create a script to automatically import new dashboards:

```python
#!/usr/bin/env python3
# monitoring/scripts/import_dashboards.py

import json
import requests
import os
import argparse

def import_dashboard(grafana_url, api_key, dashboard_path, overwrite=False):
    """Import a dashboard JSON file into Grafana"""
    
    headers = {
        'Authorization': f'Bearer {api_key}',
        'Content-Type': 'application/json'
    }
    
    with open(dashboard_path, 'r') as f:
        dashboard_json = json.load(f)
    
    # Prepare the import payload
    payload = {
        "dashboard": dashboard_json,
        "overwrite": overwrite,
        "message": f"Imported via script: {os.path.basename(dashboard_path)}"
    }
    
    # Send the request
    response = requests.post(
        f"{grafana_url}/api/dashboards/db",
        headers=headers,
        json=payload
    )
    
    if response.status_code == 200:
        result = response.json()
        print(f"Successfully imported dashboard: {result['url']}")
        return True
    else:
        print(f"Error importing dashboard: {response.status_code}")
        print(response.text)
        return False

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Import Grafana dashboards')
    parser.add_argument('--url', default='http://localhost:3000', help='Grafana URL')
    parser.add_argument('--key', required=True, help='Grafana API key')
    parser.add_argument('--path', required=True, help='Path to dashboard JSON file or directory')
    parser.add_argument('--overwrite', action='store_true', help='Overwrite existing dashboards')
    
    args = parser.parse_args()
    
    if os.path.isdir(args.path):
        # Import all JSON files in the directory
        success_count = 0
        total_count = 0
        for filename in os.listdir(args.path):
            if filename.endswith('.json'):
                total_count += 1
                file_path = os.path.join(args.path, filename)
                if import_dashboard(args.url, args.key, file_path, args.overwrite):
                    success_count += 1
        
        print(f"Imported {success_count} of {total_count} dashboards")
    else:
        # Import a single file
        import_dashboard(args.url, args.key, args.path, args.overwrite)
```

## Regular Dashboard Review Process

Implement a scheduled review process for dashboards:

1. **Weekly**: Quick review of most-used dashboards for accuracy
2. **Monthly**: Gather feedback from stakeholders on dashboard effectiveness
3. **Quarterly**: Comprehensive review and update of all dashboards
4. **Yearly**: Major redesign based on changing business needs

### Feedback Loop Implementation

Create a structured process for dashboard feedback:

1. **Add Feedback Button**: Add a link on each dashboard to a feedback form
2. **Schedule Interviews**: Regular sessions with key stakeholders
3. **Usage Analytics**: Track which dashboards and panels are most used
4. **Action Items**: Maintain a backlog of dashboard improvements
5. **Dashboard Versioning**: Keep track of dashboard changes over time

## Useful Grafana Features for Business Dashboards

1. **Variables**: Create template variables for filtering by time period, product, etc.
2. **Annotations**: Mark important business events on time-series charts
3. **Transformations**: Use transformations to combine and process data for better visualizations
4. **Value Mappings**: Map numeric values to text for better readability
5. **Thresholds**: Add visual indicators for targets and critical values
6. **Data Links**: Add links to other systems or detailed views
7. **Panel Links**: Link between related dashboards
8. **Repeating Rows/Panels**: Create dynamic dashboards that adapt to your data
9. **Time Shift**: Compare current period with previous periods
10. **Stat Panels**: Highlight important single-value metrics
