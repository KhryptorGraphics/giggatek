# GigGatek Manual Deployment Guide

This document provides step-by-step instructions for manually deploying the GigGatek e-commerce platform without using the automated deployment tools. This guide is useful for environments where the automated tools can't be used or when you need to understand the deployment process in detail.

## Prerequisites

Before beginning the deployment process, ensure you have the following:

1. Ubuntu 22.04 LTS server with:
   - Minimum 4GB RAM
   - At least 20GB free disk space
   - Root or sudo access

2. Software requirements:
   - MySQL 8.0
   - PHP 8.1 with extensions: gd, mysqli, pdo_mysql, zip
   - Python 3.10
   - Apache 2.4 with mod_rewrite enabled
   - Git
   - Composer (for PHP dependencies)
   - pip (for Python dependencies)

## 1. Server Preparation

### 1.1 Update System Packages

```bash
sudo apt update
sudo apt upgrade -y
```

### 1.2 Install Required Packages

```bash
# Install Apache, PHP, and related extensions
sudo apt install -y apache2 php8.1 php8.1-cli php8.1-common php8.1-gd php8.1-mysql php8.1-mbstring php8.1-curl php8.1-zip php8.1-xml libapache2-mod-php8.1

# Install Python and pip
sudo apt install -y python3.10 python3-pip python3-dev python3-venv

# Install MySQL
sudo apt install -y mysql-server mysql-client

# Install Git and other utilities
sudo apt install -y git curl unzip vim
```

### 1.3 Configure Firewall

```bash
sudo ufw allow ssh
sudo ufw allow http
sudo ufw allow https
sudo ufw enable
```

## 2. Database Setup

### 2.1 Secure MySQL Installation

```bash
sudo mysql_secure_installation
```

Follow the prompts to:
- Set a root password
- Remove anonymous users
- Disallow root login remotely
- Remove test database
- Reload privilege tables

### 2.2 Create Database and User

```bash
sudo mysql -u root -p
```

Once in the MySQL prompt:

```sql
CREATE DATABASE giggatek;
CREATE USER 'giggatek_user'@'localhost' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON giggatek.* TO 'giggatek_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 2.3 Import Database Schema

```bash
cd /path/to/giggatek
sudo mysql -u giggatek_user -p giggatek < backend/database/auth_schema.sql
sudo mysql -u giggatek_user -p giggatek < backend/database/orders_schema.sql
sudo mysql -u giggatek_user -p giggatek < backend/database/rentals_schema.sql
```

## 3. Backend Deployment

### 3.1 Clone Repository (if not already done)

```bash
mkdir -p /opt/giggatek
cd /opt/giggatek
git clone https://your-repository-url.git .
```

### 3.2 Set Up Python Virtual Environment

```bash
cd /opt/giggatek/backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 3.3 Configure Backend Environment

Create a `.env` file in the backend directory:

```bash
cd /opt/giggatek/backend
cat > .env << EOL
DB_HOST=localhost
DB_PORT=3306
DB_USER=giggatek_user
DB_PASSWORD=your_secure_password
DB_NAME=giggatek
FLASK_ENV=production
SECRET_KEY=generate_a_secure_random_key_here
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_HOST_USER=notifications@giggatek.com
EMAIL_HOST_PASSWORD=your_email_password
EMAIL_USE_TLS=True
EOL
```

### 3.4 Configure Gunicorn Service

Create a systemd service file for the backend:

```bash
sudo nano /etc/systemd/system/giggatek-backend.service
```

Add the following content:

```ini
[Unit]
Description=GigGatek Backend Service
After=network.target

[Service]
User=www-data
Group=www-data
WorkingDirectory=/opt/giggatek/backend
ExecStart=/opt/giggatek/backend/venv/bin/gunicorn --workers 3 --bind 127.0.0.1:5000 app:app
Restart=always
Environment="PATH=/opt/giggatek/backend/venv/bin"
EnvironmentFile=/opt/giggatek/backend/.env

[Install]
WantedBy=multi-user.target
```

Enable and start the service:

```bash
sudo systemctl daemon-reload
sudo systemctl enable giggatek-backend
sudo systemctl start giggatek-backend
```

## 4. Frontend Deployment

### 4.1 Configure Apache Virtual Host

Create a new virtual host configuration:

```bash
sudo nano /etc/apache2/sites-available/giggatek.conf
```

Add the following content:

```apache
<VirtualHost *:80>
    ServerName yourdomain.com
    ServerAdmin webmaster@yourdomain.com
    DocumentRoot /opt/giggatek/frontend
    
    <Directory /opt/giggatek/frontend>
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>
    
    ErrorLog ${APACHE_LOG_DIR}/giggatek-error.log
    CustomLog ${APACHE_LOG_DIR}/giggatek-access.log combined
    
    # Proxy backend API requests to the Python backend
    ProxyPass /api http://127.0.0.1:5000/api
    ProxyPassReverse /api http://127.0.0.1:5000/api
</VirtualHost>
```

### 4.2 Enable Required Apache Modules

```bash
sudo a2enmod rewrite
sudo a2enmod proxy
sudo a2enmod proxy_http
sudo a2ensite giggatek
sudo systemctl restart apache2
```

### 4.3 Configure Frontend Environment

Create a configuration file for the frontend:

```bash
cd /opt/giggatek/frontend
cat > config.php << EOL
<?php
// Database Configuration
define('DB_HOST', 'localhost');
define('DB_USER', 'giggatek_user');
define('DB_PASSWORD', 'your_secure_password');
define('DB_NAME', 'giggatek');

// API Configuration
define('API_URL', 'http://localhost:5000/api');

// Site Configuration
define('SITE_URL', 'https://yourdomain.com');
define('SITE_NAME', 'GigGatek');

// Email Configuration
define('EMAIL_FROM', 'notifications@yourdomain.com');
define('EMAIL_REPLY_TO', 'support@yourdomain.com');

// Debug Mode (set to false in production)
define('DEBUG', false);
?>
EOL
```

### 4.4 Set Proper Permissions

```bash
sudo chown -R www-data:www-data /opt/giggatek/frontend
sudo chmod -R 755 /opt/giggatek/frontend
```

## 5. SSL Configuration (Optional but Recommended)

### 5.1 Install Certbot for Let's Encrypt SSL

```bash
sudo apt install -y certbot python3-certbot-apache
```

### 5.2 Obtain SSL Certificate

```bash
sudo certbot --apache -d yourdomain.com
```

Follow the prompts to complete the SSL certificate installation.

## 6. Post-Deployment Verification

### 6.1 Check Backend Service Status

```bash
sudo systemctl status giggatek-backend
```

### 6.2 Check Apache Status

```bash
sudo systemctl status apache2
```

### 6.3 Test the Application

Open a web browser and navigate to your domain. Verify:
- The website loads correctly
- User authentication works
- Product listings are displayed
- Orders can be placed
- Admin dashboard is accessible

### 6.4 View Logs for Troubleshooting

```bash
# Apache logs
sudo tail -f /var/log/apache2/giggatek-error.log
sudo tail -f /var/log/apache2/giggatek-access.log

# Backend service logs
sudo journalctl -u giggatek-backend
```

## 7. Setting Up Cron Jobs

### 7.1 Email Notifications

```bash
sudo crontab -e
```

Add the following line to send daily summary emails:

```
0 8 * * * /opt/giggatek/backend/venv/bin/python /opt/giggatek/backend/scripts/send_daily_summary.py
```

### 7.2 Automated Backups

Create a backup script:

```bash
sudo nano /opt/giggatek/scripts/backup.sh
```

Add the following content:

```bash
#!/bin/bash
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="/opt/backups"

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

# Database backup
mysqldump -u giggatek_user -p'your_secure_password' giggatek > "$BACKUP_DIR/giggatek_db_$TIMESTAMP.sql"

# Files backup
tar -czf "$BACKUP_DIR/giggatek_files_$TIMESTAMP.tar.gz" /opt/giggatek

# Keep only the last 7 days of backups
find $BACKUP_DIR -name "giggatek_db_*.sql" -type f -mtime +7 -delete
find $BACKUP_DIR -name "giggatek_files_*.tar.gz" -type f -mtime +7 -delete
```

Make it executable and set up a cron job:

```bash
sudo chmod +x /opt/giggatek/scripts/backup.sh
sudo crontab -e
```

Add the following line for nightly backups:

```
0 2 * * * /opt/giggatek/scripts/backup.sh > /var/log/giggatek-backup.log 2>&1
```

## 8. Monitoring Setup (Basic)

### 8.1 Install Monitoring Tools

```bash
sudo apt install -y prometheus-node-exporter
```

### 8.2 Configure Email Alerts

Create a simple alert script:

```bash
sudo nano /opt/giggatek/scripts/check_service.sh
```

Add the following content:

```bash
#!/bin/bash
if ! systemctl is-active --quiet giggatek-backend; then
  echo "GigGatek backend service is down!" | mail -s "ALERT: GigGatek Service Down" admin@yourdomain.com
fi
```

Make it executable and add to cron:

```bash
sudo chmod +x /opt/giggatek/scripts/check_service.sh
sudo crontab -e
```

Add:

```
*/5 * * * * /opt/giggatek/scripts/check_service.sh
```

## Conclusion

This completes the manual deployment process for the GigGatek e-commerce platform. For a more automated approach, refer to the Docker, Terraform, and Ansible configuration files provided in the repository.

## Troubleshooting

### Common Issues

1. **Backend service won't start**
   - Check the logs: `sudo journalctl -u giggatek-backend`
   - Verify the .env file exists and has correct permissions
   - Ensure the virtual environment is properly set up

2. **Database connection errors**
   - Verify MySQL is running: `sudo systemctl status mysql`
   - Check database user and permissions
   - Confirm the connection details in configuration files

3. **Apache showing 500 errors**
   - Check the Apache error logs
   - Verify PHP extensions are installed
   - Check file permissions on the frontend directory

4. **API calls failing**
   - Ensure the backend service is running
   - Check the proxy configuration in Apache
   - Verify network connectivity between Apache and the backend
