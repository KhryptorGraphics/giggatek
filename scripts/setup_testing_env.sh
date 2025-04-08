#!/bin/bash
# GigGatek Integration Testing Environment Setup
# This script automates the setup of the integration testing environment

set -e  # Exit on error

CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${CYAN}=========================================================${NC}"
echo -e "${CYAN}   GigGatek Integration Testing Environment Setup${NC}"
echo -e "${CYAN}=========================================================${NC}"

# Check for required tools
echo -e "\n${YELLOW}Checking required tools...${NC}"

command -v python3 >/dev/null 2>&1 || { echo -e "${RED}Python 3 is required but not installed. Aborting.${NC}"; exit 1; }
command -v pip3 >/dev/null 2>&1 || { echo -e "${RED}pip3 is required but not installed. Aborting.${NC}"; exit 1; }
command -v mysql >/dev/null 2>&1 || { echo -e "${RED}MySQL client is required but not installed. Aborting.${NC}"; exit 1; }
command -v docker >/dev/null 2>&1 || { echo -e "${YELLOW}Docker is not installed. MailHog will need to be installed manually.${NC}"; }

echo -e "${GREEN}All required tools are available.${NC}"

# Setup test environment configuration
echo -e "\n${YELLOW}Setting up test environment configuration...${NC}"

# Check if .env.example exists
if [ ! -f .env.example ]; then
    echo -e "${RED}.env.example file not found. Please run this script from the project root directory.${NC}"
    exit 1
fi

# Create .env.test if it doesn't exist
if [ ! -f .env.test ]; then
    cp .env.example .env.test
    echo -e "${GREEN}Created .env.test from .env.example${NC}"
else
    echo -e "${YELLOW}.env.test already exists. Skipping creation.${NC}"
fi

# Update test environment variables
echo -e "\n${YELLOW}Configuring test environment variables...${NC}"

# Database configuration
read -p "Enter test database host [localhost]: " DB_HOST
DB_HOST=${DB_HOST:-localhost}

read -p "Enter test database user [root]: " DB_USER
DB_USER=${DB_USER:-root}

read -s -p "Enter test database password [root]: " DB_PASS
echo ""
DB_PASS=${DB_PASS:-root}

read -p "Enter test database name [giggatek_test]: " DB_NAME
DB_NAME=${DB_NAME:-giggatek_test}

# Update .env.test with database configuration
sed -i "s/DB_HOST=.*/DB_HOST=$DB_HOST/g" .env.test
sed -i "s/DB_USER=.*/DB_USER=$DB_USER/g" .env.test
sed -i "s/DB_PASS=.*/DB_PASS=$DB_PASS/g" .env.test
sed -i "s/DB_NAME=.*/DB_NAME=$DB_NAME/g" .env.test

# Stripe configuration
echo -e "\n${YELLOW}Configuring Stripe test credentials...${NC}"
echo -e "${YELLOW}Visit https://dashboard.stripe.com/test/apikeys to get your test API keys${NC}"

read -p "Enter Stripe test public key [pk_test_example]: " STRIPE_PUBLIC_KEY
STRIPE_PUBLIC_KEY=${STRIPE_PUBLIC_KEY:-pk_test_example}

read -p "Enter Stripe test secret key [sk_test_example]: " STRIPE_SECRET_KEY
STRIPE_SECRET_KEY=${STRIPE_SECRET_KEY:-sk_test_example}

read -p "Enter Stripe test webhook secret [whsec_test_example]: " STRIPE_WEBHOOK_SECRET
STRIPE_WEBHOOK_SECRET=${STRIPE_WEBHOOK_SECRET:-whsec_test_example}

# Update .env.test with Stripe configuration
sed -i "s/STRIPE_PUBLIC_KEY=.*/STRIPE_PUBLIC_KEY=$STRIPE_PUBLIC_KEY/g" .env.test
sed -i "s/STRIPE_SECRET_KEY=.*/STRIPE_SECRET_KEY=$STRIPE_SECRET_KEY/g" .env.test
sed -i "s/STRIPE_WEBHOOK_SECRET=.*/STRIPE_WEBHOOK_SECRET=$STRIPE_WEBHOOK_SECRET/g" .env.test

# Email configuration - using MailHog defaults
sed -i "s/SMTP_HOST=.*/SMTP_HOST=localhost/g" .env.test
sed -i "s/SMTP_PORT=.*/SMTP_PORT=1025/g" .env.test
sed -i "s/EMAIL_FROM=.*/EMAIL_FROM=test@giggatek.com/g" .env.test
sed -i "s/EMAIL_FROM_NAME=.*/EMAIL_FROM_NAME=GigGatek Test/g" .env.test

# Set TEST_MODE to true
sed -i "s/TEST_MODE=.*/TEST_MODE=true/g" .env.test

echo -e "${GREEN}Environment variables configured successfully.${NC}"

# Set up test database
echo -e "\n${YELLOW}Setting up test database...${NC}"

# Check if database exists, create if it doesn't
mysql -h$DB_HOST -u$DB_USER -p$DB_PASS -e "CREATE DATABASE IF NOT EXISTS $DB_NAME;"

# Import database schemas
echo -e "${YELLOW}Importing database schemas...${NC}"
mysql -h$DB_HOST -u$DB_USER -p$DB_PASS $DB_NAME < backend/database/auth_schema.sql
mysql -h$DB_HOST -u$DB_USER -p$DB_PASS $DB_NAME < backend/database/orders_schema.sql
mysql -h$DB_HOST -u$DB_USER -p$DB_PASS $DB_NAME < backend/database/rentals_schema.sql

echo -e "${GREEN}Test database setup completed.${NC}"

# Start MailHog if Docker is available
if command -v docker >/dev/null 2>&1; then
    echo -e "\n${YELLOW}Setting up MailHog for email testing...${NC}"
    
    # Check if MailHog container is already running
    if docker ps | grep -q mailhog; then
        echo -e "${YELLOW}MailHog is already running.${NC}"
    else
        # Check if container exists but is stopped
        if docker ps -a | grep -q mailhog; then
            echo -e "${YELLOW}Starting existing MailHog container...${NC}"
            docker start mailhog
        else
            echo -e "${YELLOW}Creating and starting MailHog container...${NC}"
            docker run -d --name mailhog -p 1025:1025 -p 8025:8025 mailhog/mailhog
        fi
    fi
    
    echo -e "${GREEN}MailHog setup completed. Web interface available at http://localhost:8025${NC}"
else
    echo -e "\n${YELLOW}Docker not available. Please install MailHog manually:${NC}"
    echo -e "${YELLOW}Instructions: https://github.com/mailhog/MailHog#installation${NC}"
fi

# Install Python dependencies
echo -e "\n${YELLOW}Installing Python dependencies...${NC}"
pip3 install pytest requests pytest-html pymysql pytest-dotenv faker bcrypt

echo -e "${GREEN}Python dependencies installed.${NC}"

# Run the environment setup script
echo -e "\n${YELLOW}Running environment setup script...${NC}"
bash tests/setup_test_environment.sh

echo -e "${GREEN}Environment setup completed.${NC}"

# Generate test data
echo -e "\n${YELLOW}Generating test data...${NC}"
python tests/generate_test_data.py

echo -e "${GREEN}Test data generation completed.${NC}"

# Success message
echo -e "\n${CYAN}=========================================================${NC}"
echo -e "${GREEN}GigGatek Integration Testing Environment Setup Complete!${NC}"
echo -e "${CYAN}=========================================================${NC}"
echo -e "\n${YELLOW}Next steps:${NC}"
echo -e "1. Run tests with: ${CYAN}python tests/run_integration_tests.py --report${NC}"
echo -e "2. Access MailHog web interface: ${CYAN}http://localhost:8025${NC}"
echo -e "3. For component-specific tests: ${CYAN}python tests/run_integration_tests.py --component=auth${NC}"
echo -e "\n${YELLOW}For more information, see:${NC} ${CYAN}tests/README.md${NC} and ${CYAN}INTEGRATION_TESTING_NEXT_STEPS.md${NC}"
