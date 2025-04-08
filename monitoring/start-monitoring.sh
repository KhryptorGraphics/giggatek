#!/bin/bash
# GigGatek Monitoring Stack Startup Script
# This script initializes and starts the monitoring infrastructure

set -e

# Define colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print banner
echo -e "${BLUE}"
echo "  ____  _         ____       _        _    "
echo " / ___|(_) __ _  / ___| __ _| |_ ___ | | __"
echo "| |  _ | |/ _\` || |  _ / _\` | __/ _ \| |/ /"
echo "| |_| || | (_| || |_| | (_| | ||  __/|   < "
echo " \____|_|\__, | \____|\__,_|\__\___||_|\_\\"
echo "         |___/                            "
echo -e "       Monitoring Stack Startup${NC}"
echo ""

# Check if running as root or with sudo
if [ "$EUID" -ne 0 ]; then
  echo -e "${YELLOW}Warning: This script might need elevated privileges to set up docker volumes.${NC}"
  echo -e "Consider running with sudo if you encounter permission issues."
  echo ""
fi

# Function to check if a command exists
command_exists() {
  command -v "$1" >/dev/null 2>&1
}

# Check dependencies
echo -e "${BLUE}[1/7]${NC} Checking dependencies..."

deps_ok=true
for cmd in docker docker-compose curl jq wget; do
  if ! command_exists "$cmd"; then
    echo -e "  ${RED}✗ $cmd is not installed${NC}"
    deps_ok=false
  else
    echo -e "  ${GREEN}✓ $cmd is installed${NC}"
  fi
done

if [ "$deps_ok" = false ]; then
  echo -e "${RED}Error: Required dependencies are missing.${NC}"
  echo "Please install the missing dependencies and try again."
  exit 1
fi

# Check Docker is running
echo -e "${BLUE}[2/7]${NC} Checking if Docker is running..."
if ! docker info >/dev/null 2>&1; then
  echo -e "${RED}Error: Docker is not running.${NC}"
  echo "Please start Docker and try again."
  exit 1
else
  echo -e "${GREEN}✓ Docker is running${NC}"
fi

# Create necessary directories
echo -e "${BLUE}[3/7]${NC} Creating necessary directories..."

directories=(
  "./prometheus"
  "./alertmanager"
  "./alertmanager/templates"
  "./alertmanager/secrets"
  "./grafana/provisioning/datasources"
  "./grafana/provisioning/dashboards"
  "./grafana/provisioning/dashboards/json"
  "./grafana/provisioning/notifiers"
  "./blackbox"
  "./promtail"
  "./loki"
)

for dir in "${directories[@]}"; do
  if [ ! -d "$dir" ]; then
    mkdir -p "$dir"
    echo -e "  ${GREEN}✓ Created $dir${NC}"
  else
    echo -e "  ${GREEN}✓ $dir already exists${NC}"
  fi
done

# Check for configuration files and create them if they don't exist
echo -e "${BLUE}[4/7]${NC} Checking configuration files..."

# Check for prometheus configuration
if [ ! -f "./prometheus/prometheus.yml" ]; then
  echo -e "  ${YELLOW}! prometheus.yml not found, please ensure it exists${NC}"
else
  echo -e "  ${GREEN}✓ prometheus.yml exists${NC}"
fi

# Check for alertmanager configuration
if [ ! -f "./alertmanager/alertmanager.yml" ]; then
  echo -e "  ${YELLOW}! alertmanager.yml not found, please ensure it exists${NC}"
else
  echo -e "  ${GREEN}✓ alertmanager.yml exists${NC}"
fi

# Check for recording rules
if [ ! -f "./prometheus/recording_rules.yml" ]; then
  echo -e "  ${YELLOW}! Creating default recording_rules.yml${NC}"
  cat > "./prometheus/recording_rules.yml" << EOF
# GigGatek Recording Rules
groups:
- name: recording_rules
  rules:
  - record: job:http_requests_total:rate1m
    expr: sum(rate(http_requests_total[1m])) by (job)
  
  - record: job:http_request_duration_seconds:p95
    expr: histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket[5m])) by (job, le))
  
  - record: node:memory_utilization:percent
    expr: 100 - ((node_memory_MemAvailable_bytes * 100) / node_memory_MemTotal_bytes)
  
  - record: node:cpu_utilization:percent
    expr: 100 - (avg by (instance) (irate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)
EOF
  echo -e "  ${GREEN}✓ Created default recording_rules.yml${NC}"
else
  echo -e "  ${GREEN}✓ recording_rules.yml exists${NC}"
fi

# Check for meta alerts
if [ ! -f "./prometheus/meta_alerts.yml" ]; then
  echo -e "  ${YELLOW}! Creating default meta_alerts.yml${NC}"
  cat > "./prometheus/meta_alerts.yml" << EOF
# GigGatek Meta-Monitoring Alerts
groups:
- name: meta_monitoring
  rules:
  - alert: PrometheusDown
    expr: absent(up{job="prometheus"})
    for: 1m
    labels:
      severity: critical
      meta: true
    annotations:
      summary: "Prometheus is down"
      description: "Prometheus server is not responding"
      runbook: "docs/monitoring/RUNBOOKS.md#prometheus-down"
  
  - alert: AlertmanagerDown
    expr: absent(up{job="alertmanager"})
    for: 1m
    labels:
      severity: critical
      meta: true
    annotations:
      summary: "Alertmanager is down"
      description: "Alertmanager is not responding"
      runbook: "docs/monitoring/RUNBOOKS.md#alertmanager-down"
      
  - alert: GrafanaDown
    expr: absent(up{job="grafana"})
    for: 1m
    labels:
      severity: critical
      meta: true
    annotations:
      summary: "Grafana is down"
      description: "Grafana is not responding"
      runbook: "docs/monitoring/RUNBOOKS.md#grafana-down"
EOF
  echo -e "  ${GREEN}✓ Created default meta_alerts.yml${NC}"
else
  echo -e "  ${GREEN}✓ meta_alerts.yml exists${NC}"
fi

# Check for blackbox configuration
if [ ! -f "./blackbox/blackbox.yml" ]; then
  echo -e "  ${YELLOW}! Creating default blackbox.yml${NC}"
  cat > "./blackbox/blackbox.yml" << EOF
modules:
  http_2xx:
    prober: http
    timeout: 5s
    http:
      valid_http_versions: ["HTTP/1.1", "HTTP/2.0"]
      valid_status_codes: [200]
      method: GET
      no_follow_redirects: false
      fail_if_ssl: false
      fail_if_not_ssl: false
      preferred_ip_protocol: "ip4"
      
  http_post_2xx:
    prober: http
    timeout: 5s
    http:
      method: POST
      valid_status_codes: [200]
      
  tcp_connect:
    prober: tcp
    timeout: 5s
    
  icmp:
    prober: icmp
    timeout: 5s
    icmp:
      preferred_ip_protocol: "ip4"
EOF
  echo -e "  ${GREEN}✓ Created default blackbox.yml${NC}"
else
  echo -e "  ${GREEN}✓ blackbox.yml exists${NC}"
fi

# Check for Loki configuration
if [ ! -f "./loki/loki-config.yml" ]; then
  echo -e "  ${YELLOW}! Creating default loki-config.yml${NC}"
  cat > "./loki/loki-config.yml" << EOF
auth_enabled: false

server:
  http_listen_port: 3100

ingester:
  lifecycler:
    address: 127.0.0.1
    ring:
      kvstore:
        store: inmemory
      replication_factor: 1
    final_sleep: 0s
  chunk_idle_period: 5m
  chunk_retain_period: 30s

schema_config:
  configs:
    - from: 2020-10-24
      store: boltdb-shipper
      object_store: filesystem
      schema: v11
      index:
        prefix: index_
        period: 24h

storage_config:
  boltdb_shipper:
    active_index_directory: /data/loki/index
    cache_location: /data/loki/index_cache
    cache_ttl: 24h
    shared_store: filesystem
  filesystem:
    directory: /data/loki/chunks

limits_config:
  enforce_metric_name: false
  reject_old_samples: true
  reject_old_samples_max_age: 168h

chunk_store_config:
  max_look_back_period: 168h

compactor:
  working_directory: /data/loki/compactor
  shared_store: filesystem
EOF
  echo -e "  ${GREEN}✓ Created default loki-config.yml${NC}"
else
  echo -e "  ${GREEN}✓ loki-config.yml exists${NC}"
fi

# Check for Promtail configuration
if [ ! -f "./promtail/promtail-config.yml" ]; then
  echo -e "  ${YELLOW}! Creating default promtail-config.yml${NC}"
  cat > "./promtail/promtail-config.yml" << EOF
server:
  http_listen_port: 9080
  grpc_listen_port: 0

positions:
  filename: /tmp/positions.yaml

clients:
  - url: http://loki:3100/loki/api/v1/push

scrape_configs:
  - job_name: system
    static_configs:
    - targets:
        - localhost
      labels:
        job: varlogs
        __path__: /var/log/*log

  - job_name: giggatek_logs
    static_configs:
    - targets:
        - localhost
      labels:
        job: giggatek
        __path__: /var/log/giggatek/*.log
EOF
  echo -e "  ${GREEN}✓ Created default promtail-config.yml${NC}"
else
  echo -e "  ${GREEN}✓ promtail-config.yml exists${NC}"
fi

# Setup Grafana datasources
if [ ! -f "./grafana/provisioning/datasources/datasources.yml" ]; then
  echo -e "  ${YELLOW}! Creating default Grafana datasources${NC}"
  cat > "./grafana/provisioning/datasources/datasources.yml" << EOF
apiVersion: 1

datasources:
  - name: Prometheus
    type: prometheus
    access: proxy
    url: http://prometheus:9090
    isDefault: true
    editable: false
    
  - name: Loki
    type: loki
    access: proxy
    url: http://loki:3100
    editable: false
    
  - name: Elasticsearch
    type: elasticsearch
    access: proxy
    url: http://elasticsearch:9200
    database: "[giggatek-logs-]YYYY.MM.DD"
    basicAuth: true
    basicAuthUser: elastic
    secureJsonData:
      basicAuthPassword: elastic
    jsonData:
      esVersion: 7.10.0
      timeField: "@timestamp"
      logMessageField: message
      logLevelField: level
    editable: false
EOF
  echo -e "  ${GREEN}✓ Created default Grafana datasources${NC}"
else
  echo -e "  ${GREEN}✓ Grafana datasources exist${NC}"
fi

# Setup Grafana dashboard provisioning
if [ ! -f "./grafana/provisioning/dashboards/dashboards.yml" ]; then
  echo -e "  ${YELLOW}! Creating default Grafana dashboard provisioning${NC}"
  cat > "./grafana/provisioning/dashboards/dashboards.yml" << EOF
apiVersion: 1

providers:
  - name: 'GigGatek Dashboards'
    orgId: 1
    folder: 'GigGatek'
    type: file
    disableDeletion: false
    editable: true
    updateIntervalSeconds: 10
    allowUiUpdates: true
    options:
      path: /etc/grafana/provisioning/dashboards/json
EOF
  echo -e "  ${GREEN}✓ Created default Grafana dashboard provisioning${NC}"
else
  echo -e "  ${GREEN}✓ Grafana dashboard provisioning exists${NC}"
fi

# Setting required permissions
echo -e "${BLUE}[5/7]${NC} Setting required permissions..."
find . -type d -exec chmod 755 {} \;
find . -type f -name "*.sh" -exec chmod +x {} \;
echo -e "${GREEN}✓ Permissions set${NC}"

# Starting the monitoring stack
echo -e "${BLUE}[6/7]${NC} Starting the monitoring stack..."
docker-compose -f docker-compose.monitoring.yml up -d
status=$?

if [ $status -ne 0 ]; then
  echo -e "${RED}Error: Failed to start monitoring stack.${NC}"
  echo "Please check the error message above and fix any issues."
  exit 1
else
  echo -e "${GREEN}✓ Monitoring stack started successfully${NC}"
fi

# Verify services are running
echo -e "${BLUE}[7/7]${NC} Verifying services..."
sleep 10  # Give services time to start

services=(
  "prometheus:9090/-/healthy"
  "alertmanager:9093/-/healthy"
  "grafana:3000/api/health"
  "node-exporter:9100/metrics"
)

for service in "${services[@]}"; do
  IFS=':' read -r -a service_parts <<< "$service"
  name="${service_parts[0]}"
  port="${service_parts[1]%/*}"
  path="/${service_parts[1]#*/}"
  
  echo -ne "  Checking $name... "
  if docker-compose -f docker-compose.monitoring.yml exec -T "$name" wget -q --spider "http://localhost:$port$path" >/dev/null 2>&1; then
    echo -e "${GREEN}✓ OK${NC}"
  else
    echo -e "${YELLOW}! May not be ready yet${NC}"
  fi
done

echo ""
echo -e "${GREEN}GigGatek Monitoring Stack Initialization Complete!${NC}"
echo ""
echo -e "Access Grafana at: ${BLUE}http://localhost:3000${NC}"
echo -e "Default login: ${BLUE}admin / admin${NC}"
echo ""
echo -e "Access Prometheus at: ${BLUE}http://localhost:9090${NC}"
echo -e "Access AlertManager at: ${BLUE}http://localhost:9093${NC}"
echo ""
echo -e "${YELLOW}Note:${NC} For production use, please update default passwords and secure your configuration."
echo ""
