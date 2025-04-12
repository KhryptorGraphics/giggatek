# GigGatek Deployment Guide

This document provides instructions for deploying the GigGatek application in various environments.

## Prerequisites

- Linux server (Ubuntu 20.04 LTS or later recommended)
- Docker and Docker Compose installed
- Git
- Ansible (for automated deployment)

## Development Environment Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/khryptorgraphics/giggatek.git
   cd giggatek
   ```

2. Start the application using Docker Compose:
   ```bash
   docker-compose up -d
   ```

3. Access the application:
   - Frontend: http://localhost:8000
   - Backend API: http://localhost:5000
   - Adminer (Database Management): http://localhost:8080
   - Mailhog (Email Testing): http://localhost:8025

## Manual Deployment

1. Clone the repository on your server:
   ```bash
   git clone https://github.com/khryptorgraphics/giggatek.git
   cd giggatek
   ```

2. Create a `.env` file with your environment-specific configuration:
   ```bash
   cp .env.example .env
   nano .env
   ```

3. Update the Docker Compose file if needed:
   ```bash
   nano docker-compose.yml
   ```

4. Start the application:
   ```bash
   docker-compose up -d
   ```

5. Set up a reverse proxy (Nginx or Apache) to handle HTTPS and domain routing.

## Automated Deployment with Ansible

1. Update the inventory file with your server information:
   ```bash
   nano ansible/inventory.ini
   ```

2. Update the variables in the playbook if needed:
   ```bash
   nano ansible/playbook.yml
   ```

3. Run the Ansible playbook:
   ```bash
   cd ansible
   ansible-playbook -i inventory.ini playbook.yml
   ```

## Database Management

The application uses SQLite for simplicity in development. For production, consider migrating to a more robust database like MySQL or PostgreSQL.

## Redis Caching

The application now uses Redis for caching to improve API performance, particularly for rental operations.

1. Make sure Redis is installed and running:
   ```bash
   # Check if Redis is running
   systemctl status redis-server
   
   # Install Redis if needed
   apt-get install redis-server
   systemctl enable redis-server
   systemctl start redis-server
   ```

2. Configure Redis environment variables in your `.env` file:
   ```
   REDIS_HOST=localhost
   REDIS_PORT=6379
   REDIS_DB=0
   REDIS_PASSWORD=your_redis_password  # Optional
   REDIS_ENABLED=true
   ```

3. To disable caching during development or troubleshooting, set:
   ```
   REDIS_ENABLED=false
   ```

## Monitoring

The application includes monitoring setup with Prometheus and Grafana. Access the monitoring dashboards:
- Prometheus: http://your-server:9090
- Grafana: http://your-server:3000

## Backup and Restore

Automated backups are configured in the Ansible playbook. To manually backup the database:

```bash
docker-compose exec backend python -c "from utils.db import backup_database; backup_database()"
```

## Troubleshooting

1. Check container logs:
   ```bash
   docker-compose logs -f
   ```

2. Check specific container logs:
   ```bash
   docker-compose logs -f backend
   docker-compose logs -f frontend
   ```

3. Restart services:
   ```bash
   docker-compose restart backend
   docker-compose restart frontend
   ```

4. Rebuild containers after code changes:
   ```bash
   docker-compose up -d --build
   ```

## Security Considerations

1. Change default passwords in production
2. Enable HTTPS with proper SSL certificates
3. Set up firewall rules to restrict access
4. Regularly update dependencies and Docker images
