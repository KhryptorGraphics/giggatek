#!/bin/bash
# GigGatek Infrastructure Quick Start Script

# Make script exit if any command fails
set -e

# Display info message
echo "======================================================="
echo "  GigGatek Infrastructure Modernization Quick Start"
echo "======================================================="
echo ""
echo "This script will quickly set up the GigGatek infrastructure:"
echo "1. Install prerequisites if needed"
echo "2. Start the development environment"
echo "3. Start the monitoring stack"
echo ""
echo "Press ENTER to continue or CTRL+C to exit"
read -r

# Make scripts executable
chmod +x scripts/install-prereqs.sh

# Install prerequisites
echo ""
echo "Step 1: Installing prerequisites..."
./scripts/install-prereqs.sh

# Start the development environment
echo ""
echo "Step 2: Starting development environment..."
docker-compose up -d
echo "Development environment started."
echo "  - Frontend: http://localhost:80"
echo "  - Backend API: http://localhost:5000"
echo "  - Adminer (DB): http://localhost:8080"
echo "  - MailHog (Email): http://localhost:8025"

# Start the monitoring stack
echo ""
echo "Step 3: Starting monitoring stack..."
cd monitoring && docker-compose -f docker-compose.monitoring.yml up -d
echo "Monitoring stack started."
echo "  - Prometheus: http://localhost:9090"
echo "  - Grafana: http://localhost:3000 (admin/admin)"

# Final instructions
echo ""
echo "======================================================="
echo "  GigGatek Infrastructure Successfully Started!"
echo "======================================================="
echo ""
echo "Next steps:"
echo "1. Explore the monitoring dashboard at http://localhost:3000"
echo "   (login with admin/admin)"
echo ""
echo "2. To start the ELK stack for logging:"
echo "   cd monitoring/elk && docker-compose -f docker-compose.elk.yml up -d"
echo ""
echo "3. For advanced infrastructure management:"
echo "   Run 'make help' to see available commands"
echo ""
echo "For more information, see the documentation files:"
echo "- GETTING_STARTED.md - Implementation guide"
echo "- PREREQUISITES_INSTALLATION.md - Tool installation guide"
echo "- INFRASTRUCTURE_SUMMARY.md - Overview of all components"
echo "======================================================="
