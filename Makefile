# GigGatek Infrastructure Makefile

.PHONY: help install dev start stop restart logs test terraform-init terraform-plan terraform-apply monitoring elk clean

# Default target
help:
	@echo "GigGatek Infrastructure Makefile"
	@echo "================================="
	@echo ""
	@echo "Available commands:"
	@echo "  make install        - Install prerequisites (Docker, Docker Compose)"
	@echo "  make dev            - Start development environment"
	@echo "  make start          - Start all services"
	@echo "  make stop           - Stop all services"
	@echo "  make restart        - Restart all services"
	@echo "  make logs           - Display logs"
	@echo "  make test           - Run tests"
	@echo "  make terraform-init - Initialize Terraform"
	@echo "  make terraform-plan - Run Terraform plan"
	@echo "  make terraform-apply - Apply Terraform configuration"
	@echo "  make monitoring     - Start monitoring stack"
	@echo "  make elk            - Start ELK stack"
	@echo "  make clean          - Remove all containers and volumes"

# Install prerequisites based on OS
install:
	@./scripts/install-prereqs.sh

# Start development environment
dev:
	docker-compose up -d
	@echo "Development environment started. Access the application at http://localhost:80"
	@echo "Adminer (DB management): http://localhost:8080"
	@echo "MailHog (Email testing): http://localhost:8025"

# Start all services
start:
	docker-compose up -d

# Stop all services
stop:
	docker-compose down

# Restart all services
restart:
	docker-compose down
	docker-compose up -d

# Display logs
logs:
	docker-compose logs -f

# Run tests
test:
	@echo "Running backend tests..."
	cd backend && python -m pytest
	@echo "Running frontend tests..."
	cd frontend && composer test

# Terraform initialization
terraform-init:
	cd terraform && terraform init

# Terraform plan
terraform-plan:
	cd terraform && terraform plan -var-file=terraform.tfvars -out=terraform.plan

# Terraform apply
terraform-apply:
	cd terraform && terraform apply terraform.plan

# Start monitoring stack
monitoring:
	cd monitoring && docker-compose -f docker-compose.monitoring.yml up -d
	@echo "Monitoring stack started:"
	@echo "  Prometheus: http://localhost:9090"
	@echo "  Grafana: http://localhost:3000 (admin/admin)"

# Start ELK stack
elk:
	cd monitoring/elk && docker-compose -f docker-compose.elk.yml up -d
	@echo "ELK stack started:"
	@echo "  Kibana: http://localhost:5601"
	@echo "  Elasticsearch: http://localhost:9200"

# Clean everything (remove containers, volumes)
clean:
	docker-compose down -v
	cd monitoring && docker-compose -f docker-compose.monitoring.yml down -v
	cd monitoring/elk && docker-compose -f docker-compose.elk.yml down -v
	@echo "All containers and volumes removed."
