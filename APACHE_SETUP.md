# Setting Up Apache for GigGatek Frontend

This guide explains how to configure Apache to serve the GigGatek frontend while proxying API requests to the backend.

## Prerequisites

- Apache2 installed on your system
- Required Apache modules: mod_proxy, mod_proxy_http, mod_rewrite

## Installation Steps

1. Install Apache2 if not already installed:
   ```bash
   sudo apt update
   sudo apt install apache2
   ```

2. Enable required Apache modules:
   ```bash
   sudo a2enmod proxy proxy_http rewrite
   ```

3. Copy the Apache configuration file:
   ```bash
   sudo cp apache-config.conf /etc/apache2/sites-available/giggatek.conf
   ```

4. Edit the configuration file to match your environment:
   ```bash
   sudo nano /etc/apache2/sites-available/giggatek.conf
   ```
   
   Update the following:
   - ServerName: Set to your domain or localhost
   - DocumentRoot: Set to the full path of your frontend directory
   - Directory path: Match the DocumentRoot path
   - ProxyPass URL: Set to the URL of your backend API

5. Enable the site:
   ```bash
   sudo a2ensite giggatek.conf
   ```

6. Add an entry to your hosts file (for local development):
   ```bash
   sudo nano /etc/hosts
   ```
   
   Add the following line:
   ```
   127.0.0.1 giggatek.local
   ```

7. Restart Apache:
   ```bash
   sudo systemctl restart apache2
   ```

8. Access the application at http://giggatek.local

## Troubleshooting

1. Check Apache error logs:
   ```bash
   sudo tail -f /var/log/apache2/giggatek-error.log
   ```

2. Check Apache access logs:
   ```bash
   sudo tail -f /var/log/apache2/giggatek-access.log
   ```

3. Verify Apache configuration:
   ```bash
   sudo apache2ctl configtest
   ```

4. Check Apache status:
   ```bash
   sudo systemctl status apache2
   ```

5. If you encounter permission issues, ensure the Apache user (www-data) has access to your frontend directory:
   ```bash
   sudo chown -R www-data:www-data /path/to/giggatek/frontend
   ```
