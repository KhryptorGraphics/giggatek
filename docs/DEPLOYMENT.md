# GigGatek Deployment Guide

This document outlines the deployment process for the GigGatek ecommerce platform on an Ubuntu 22.04 server with Apache2 and MySQL.

## System Requirements

- **Server OS**: Ubuntu 22.04 LTS
- **Web Server**: Apache 2.4+
- **Database**: MySQL 8.0+
- **PHP**: PHP 8.1+ with required extensions
- **Memory**: Minimum 4GB RAM (8GB+ recommended)
- **Storage**: Minimum 20GB (SSD recommended)
- **SSL Certificate**: Required for HTTPS

## Prerequisites

1. A registered domain (e.g., giggatek.com)
2. DNS configured to point to your server IP
3. SSH access to your Ubuntu server
4. Root or sudo privileges

## Server Setup

### 1. Update System Packages

```bash
sudo apt update
sudo apt upgrade -y
```

### 2. Install Core Dependencies

```bash
sudo apt install -y apache2 mysql-server php libapache2-mod-php php-mysql \
php-curl php-json php-gd php-mbstring php-xml php-zip php-bcmath php-intl \
unzip git composer
```

### 3. Configure MySQL

```bash
sudo mysql_secure_installation
```

Follow the prompts to set a root password and secure the MySQL installation.

### 4. Create Database and User

```bash
sudo mysql -u root -p
```

In the MySQL prompt:

```sql
CREATE DATABASE giggatek CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'giggatek_user'@'localhost' IDENTIFIED BY 'strong_password_here';
GRANT ALL PRIVILEGES ON giggatek.* TO 'giggatek_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

Replace `'strong_password_here'` with an actual strong password.

## Apache Configuration

### 1. Create a Virtual Host

```bash
sudo nano /etc/apache2/sites-available/giggatek.conf
```

Add the following configuration:

```apache
<VirtualHost *:80>
    ServerName giggatek.com
    ServerAlias www.giggatek.com
    DocumentRoot /var/www/giggatek/public
    
    <Directory /var/www/giggatek/public>
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>
    
    ErrorLog ${APACHE_LOG_DIR}/giggatek-error.log
    CustomLog ${APACHE_LOG_DIR}/giggatek-access.log combined
</VirtualHost>
```

### 2. Enable Required Apache Modules

```bash
sudo a2enmod rewrite
sudo a2enmod ssl
sudo a2enmod headers
sudo a2enmod expires
sudo a2enmod http2
```

### 3. Enable the Virtual Host

```bash
sudo a2ensite giggatek.conf
sudo systemctl reload apache2
```

## SSL Configuration with Let's Encrypt

### 1. Install Certbot

```bash
sudo apt install -y certbot python3-certbot-apache
```

### 2. Obtain and Install SSL Certificate

```bash
sudo certbot --apache -d giggatek.com -d www.giggatek.com
```

Follow the prompts to complete the certificate installation.

## Application Deployment

### 1. Clone the Repository

```bash
sudo mkdir -p /var/www
cd /var/www
sudo git clone https://github.com/your-organization/giggatek.git
cd giggatek
```

Replace the repository URL with your actual Git repository.

### 2. Set Directory Permissions

```bash
sudo chown -R www-data:www-data /var/www/giggatek
sudo find /var/www/giggatek -type d -exec chmod 755 {} \;
sudo find /var/www/giggatek -type f -exec chmod 644 {} \;
```

### 3. Configure Environment

Create an environment configuration file:

```bash
sudo cp .env.example .env
sudo nano .env
```

Update the database and application settings in the `.env` file:

```
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=giggatek
DB_USERNAME=giggatek_user
DB_PASSWORD=strong_password_here

APP_ENV=production
APP_DEBUG=false
APP_URL=https://giggatek.com
```

### 4. Install Dependencies and Build Application

For PHP backend:

```bash
cd /var/www/giggatek
sudo -u www-data composer install --no-dev --optimize-autoloader
```

For JavaScript frontend (if applicable):

```bash
sudo apt install -y nodejs npm
sudo npm install
sudo npm run build
```

### 5. Initialize Database

```bash
sudo -u www-data php artisan migrate --seed
```

### 6. Set Up Cron Jobs

```bash
sudo crontab -e
```

Add the following line:

```
* * * * * cd /var/www/giggatek && php artisan schedule:run >> /dev/null 2>&1
```

### 7. Set Up Job Queue (if applicable)

For production, consider using a process manager like Supervisor:

```bash
sudo apt install -y supervisor
```

Create a configuration file:

```bash
sudo nano /etc/supervisor/conf.d/giggatek-worker.conf
```

Add the following:

```
[program:giggatek-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /var/www/giggatek/artisan queue:work --sleep=3 --tries=3 --max-time=3600
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
user=www-data
numprocs=2
redirect_stderr=true
stdout_logfile=/var/log/giggatek-worker.log
stopwaitsecs=3600
```

Apply the configuration:

```bash
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start all
```

## Server Hardening

### 1. Configure Firewall (UFW)

```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Apache Full'
sudo ufw enable
```

### 2. PHP Security Settings

Edit PHP configuration:

```bash
sudo nano /etc/php/8.1/apache2/php.ini
```

Update the following settings:

```ini
display_errors = Off
display_startup_errors = Off
log_errors = On
error_log = /var/log/php/error.log
error_reporting = E_ALL & ~E_DEPRECATED & ~E_STRICT
expose_php = Off
max_execution_time = 30
max_input_time = 60
memory_limit = 256M
post_max_size = 64M
upload_max_filesize = 32M
allow_url_fopen = Off
session.cookie_httponly = 1
session.cookie_secure = 1
```

Create the PHP error log directory:

```bash
sudo mkdir -p /var/log/php
sudo chown www-data:www-data /var/log/php
```

### 3. Apache Security Headers

Add security headers to your virtual host configuration:

```bash
sudo nano /etc/apache2/sites-available/giggatek-le-ssl.conf
```

Add the following within the `<VirtualHost>` block:

```apache
Header always set X-Content-Type-Options "nosniff"
Header always set X-XSS-Protection "1; mode=block"
Header always set X-Frame-Options "SAMEORIGIN"
Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains"
Header always set Content-Security-Policy "default-src 'self'; script-src 'self' https://js.stripe.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:; frame-src https://js.stripe.com; connect-src 'self' https://api.stripe.com;"
```

Adjust the CSP as needed based on your application's requirements.

### 4. Configure ModSecurity (Web Application Firewall)

```bash
sudo apt install -y libapache2-mod-security2
sudo cp /etc/modsecurity/modsecurity.conf-recommended /etc/modsecurity/modsecurity.conf
sudo nano /etc/modsecurity/modsecurity.conf
```

Change `SecRuleEngine DetectionOnly` to `SecRuleEngine On`.

Install OWASP Core Rule Set:

```bash
cd /etc/modsecurity
sudo wget https://github.com/coreruleset/coreruleset/archive/v3.3.2.tar.gz
sudo tar -xzf v3.3.2.tar.gz
sudo mv coreruleset-3.3.2 owasp-crs
sudo cp owasp-crs/crs-setup.conf.example owasp-crs/crs-setup.conf
```

Create a configuration file:

```bash
sudo nano /etc/apache2/conf-available/security.conf
```

Add the following:

```apache
<IfModule security2_module>
    # Turn on ModSecurity
    SecRuleEngine On
    
    # Include base configuration
    Include /etc/modsecurity/modsecurity.conf
    
    # Include OWASP CRS
    Include /etc/modsecurity/owasp-crs/crs-setup.conf
    Include /etc/modsecurity/owasp-crs/rules/*.conf
</IfModule>
```

Enable the configuration:

```bash
sudo a2enconf security
sudo systemctl reload apache2
```

## Monitoring & Logging

### 1. Setup Log Rotation

```bash
sudo nano /etc/logrotate.d/giggatek
```

Add the following:

```
/var/log/apache2/giggatek-*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 640 www-data adm
    sharedscripts
    postrotate
        /etc/init.d/apache2 reload > /dev/null
    endscript
}

/var/log/php/error.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 640 www-data adm
}
```

### 2. Install and Configure Fail2Ban

```bash
sudo apt install -y fail2ban
sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local
sudo nano /etc/fail2ban/jail.local
```

Configure as needed and restart the service:

```bash
sudo systemctl restart fail2ban
```

## Payment Gateway Integration

### 1. Stripe Setup (Example)

Install Stripe PHP SDK:

```bash
cd /var/www/giggatek
sudo -u www-data composer require stripe/stripe-php
```

Update your `.env` file with Stripe API keys:

```
STRIPE_KEY=pk_live_your_publishable_key
STRIPE_SECRET=sk_live_your_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

### 2. PayPal Setup (Example)

Install PayPal SDK:

```bash
cd /var/www/giggatek
sudo -u www-data composer require paypal/rest-api-sdk-php
```

Update your `.env` file with PayPal API credentials:

```
PAYPAL_CLIENT_ID=your_client_id
PAYPAL_SECRET=your_secret
PAYPAL_MODE=live
```

## Backup Strategy

### 1. Database Backups

Create a backup script:

```bash
sudo nano /usr/local/bin/backup-giggatek-db.sh
```

Add the following:

```bash
#!/bin/bash
TIMESTAMP=$(date +"%Y%m%d-%H%M%S")
BACKUP_DIR="/var/backups/giggatek/database"
mkdir -p "$BACKUP_DIR"

# Dump the database
mysqldump -u giggatek_user -p'your_password' giggatek | gzip > "$BACKUP_DIR/giggatek-db-$TIMESTAMP.sql.gz"

# Remove backups older than 30 days
find "$BACKUP_DIR" -type f -name "*.sql.gz" -mtime +30 -delete
```

Make it executable:

```bash
sudo chmod +x /usr/local/bin/backup-giggatek-db.sh
```

Set up a cron job:

```bash
sudo crontab -e
```

Add:

```
0 2 * * * /usr/local/bin/backup-giggatek-db.sh
```

### 2. File Backups

Create a backup script:

```bash
sudo nano /usr/local/bin/backup-giggatek-files.sh
```

Add the following:

```bash
#!/bin/bash
TIMESTAMP=$(date +"%Y%m%d-%H%M%S")
BACKUP_DIR="/var/backups/giggatek/files"
mkdir -p "$BACKUP_DIR"

# Backup code and uploaded files
tar -czf "$BACKUP_DIR/giggatek-files-$TIMESTAMP.tar.gz" -C /var/www giggatek

# Remove backups older than 7 days
find "$BACKUP_DIR" -type f -name "*.tar.gz" -mtime +7 -delete
```

Make it executable:

```bash
sudo chmod +x /usr/local/bin/backup-giggatek-files.sh
```

Set up a cron job:

```bash
sudo crontab -e
```

Add:

```
0 3 * * * /usr/local/bin/backup-giggatek-files.sh
```

## Maintenance Mode

To put the application into maintenance mode during updates:

```bash
cd /var/www/giggatek
sudo -u www-data php artisan down --message="We are upgrading our store. Please check back in 30 minutes." --retry=60
```

To bring the application back online:

```bash
cd /var/www/giggatek
sudo -u www-data php artisan up
```

## Deployment Checklist

Before going live, verify the following:

- [ ] SSL is properly configured
- [ ] Database backups are working
- [ ] Payment gateway integrations are tested
- [ ] File permissions are set correctly
- [ ] Error logging is configured
- [ ] Firewall rules are established
- [ ] Security headers are in place
- [ ] Monitoring is set up
- [ ] Performance optimization is complete
- [ ] Debug mode is turned off

## Performance Optimization

### 1. Enable PHP OPcache

```bash
sudo nano /etc/php/8.1/apache2/conf.d/10-opcache.ini
```

Add or modify:

```ini
opcache.enable=1
opcache.memory_consumption=256
opcache.interned_strings_buffer=16
opcache.max_accelerated_files=10000
opcache.validate_timestamps=0
opcache.save_comments=1
opcache.fast_shutdown=1
```

### 2. Configure Apache MPM Event

```bash
sudo a2dismod mpm_prefork
sudo a2enmod mpm_event
sudo nano /etc/apache2/mods-available/mpm_event.conf
```

Adjust as needed:

```apache
<IfModule mpm_event_module>
    StartServers             2
    MinSpareThreads         25
    MaxSpareThreads         75
    ThreadLimit             64
    ThreadsPerChild         25
    MaxRequestWorkers      150
    MaxConnectionsPerChild   0
</IfModule>
```

### 3. Enable Browser Caching

```bash
sudo nano /etc/apache2/sites-available/giggatek-le-ssl.conf
```

Add inside the `<VirtualHost>` block:

```apache
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/gif "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/webp "access plus 1 year"
    ExpiresByType text/css "access plus 1 month"
    ExpiresByType application/pdf "access plus 1 month"
    ExpiresByType text/javascript "access plus 1 month"
    ExpiresByType application/javascript "access plus 1 month"
    ExpiresByType application/x-javascript "access plus 1 month"
    ExpiresByType application/x-font-ttf "access plus 1 year"
    ExpiresByType application/x-font-woff "access plus 1 year"
    ExpiresByType application/font-woff "access plus 1 year"
    ExpiresByType application/font-woff2 "access plus 1 year"
    ExpiresByType font/woff "access plus 1 year"
    ExpiresByType font/woff2 "access plus 1 year"
    ExpiresByType image/x-icon "access plus 1 year"
    ExpiresByType image/svg+xml "access plus 1 year"
</IfModule>
```

## Scaling Considerations

As your ecommerce platform grows, consider these scaling strategies:

1. **Database Optimization**:
   - Implement database replication with read replicas
   - Consider sharding for large datasets
   - Set up query caching

2. **Caching Layer**:
   - Implement Redis or Memcached for session and data caching
   - Use a CDN for static assets

3. **Load Balancing**:
   - Set up multiple web servers behind a load balancer
   - Consider using NGINX as a reverse proxy

4. **Containerization**:
   - Consider Docker for easier scaling and deployment
   - Implement Kubernetes for container orchestration

5. **Monitoring and Analytics**:
   - Set up comprehensive monitoring with tools like Prometheus and Grafana
   - Use New Relic or DataDog for application performance monitoring

## Troubleshooting

### Common Issues and Solutions

#### 1. 503 Service Unavailable

Check Apache status:
```bash
sudo systemctl status apache2
```

Check error logs:
```bash
sudo tail -f /var/log/apache2/error.log
```

#### 2. Database Connection Issues

Check MySQL status:
```bash
sudo systemctl status mysql
```

Verify database credentials in `.env` file.

#### 3. Permission Problems

Fix permissions:
```bash
sudo chown -R www-data:www-data /var/www/giggatek
sudo find /var/www/giggatek -type d -exec chmod 755 {} \;
sudo find /var/www/giggatek -type f -exec chmod 644 {} \;
```

#### 4. SSL Certificate Issues

Check certificate status:
```bash
sudo certbot certificates
```

Renew certificates:
```bash
sudo certbot renew --dry-run
```

## Support and Maintenance

For ongoing support:

1. **System Updates**:
   - Regularly update system packages with `sudo apt update && sudo apt upgrade`
   - Review security announcements for Ubuntu and installed packages

2. **Application Updates**:
   - Follow the application's release cycle and update accordingly
   - Test updates in a staging environment before applying to production

3. **SSL Renewals**:
   - Let's Encrypt certificates auto-renew via cron jobs
   - Verify renewal is working with `sudo certbot renew --dry-run`

4. **Monitoring**:
   - Regularly review logs and monitoring alerts
   - Implement automated monitoring alerts
