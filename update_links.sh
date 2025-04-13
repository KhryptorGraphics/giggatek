#!/bin/bash

# Script to update navigation and footer links in all PHP files
# This script will replace placeholder links with actual links to pages

# Exit on error
set -e

# Directory containing PHP files
FRONTEND_DIR="frontend"

# List of PHP files to update (excluding the ones we've already updated)
PHP_FILES=$(find "$FRONTEND_DIR" -name "*.php" -not -path "*/components/*" -not -path "*/api/*" -not -path "*/includes/*")

# Function to update links in a file
update_links() {
    local file=$1
    echo "Updating links in $file..."
    
    # Update support link in Quick Links section
    sed -i 's|<a href="#\?">Support</a>|<a href="support.php">Support</a>|g' "$file"
    
    # Update Customer Service links
    sed -i 's|<a href="#\?">Contact Us</a>|<a href="contact.php">Contact Us</a>|g' "$file"
    sed -i 's|<a href="#\?">FAQ</a>|<a href="faq.php">FAQ</a>|g' "$file"
    sed -i 's|<a href="#\?">Shipping Policy</a>|<a href="shipping-policy.php">Shipping Policy</a>|g' "$file"
    sed -i 's|<a href="#\?">Return Policy</a>|<a href="return-policy.php">Return Policy</a>|g' "$file"
    sed -i 's|<a href="#\?">Warranty Information</a>|<a href="warranty-information.php">Warranty Information</a>|g' "$file"
    
    # Update footer bottom links
    sed -i 's|<a href="#\?" data-i18n="footer.privacyPolicy">Privacy Policy</a>|<a href="privacy-policy.php" data-i18n="footer.privacyPolicy">Privacy Policy</a>|g' "$file"
    sed -i 's|<a href="#\?" data-i18n="footer.termsOfService">Terms of Service</a>|<a href="terms-of-service.php" data-i18n="footer.termsOfService">Terms of Service</a>|g' "$file"
    sed -i 's|<a href="#\?" data-i18n="footer.sitemap">Sitemap</a>|<a href="sitemap.php" data-i18n="footer.sitemap">Sitemap</a>|g' "$file"
    
    # Update Privacy Policy links in newsletter sections
    sed -i 's|<a href="#\?">Privacy Policy</a>|<a href="privacy-policy.php">Privacy Policy</a>|g' "$file"
    
    # Add notifications icon to header actions if it doesn't exist
    if ! grep -q "notifications.php" "$file"; then
        sed -i '/<a href="#" class="search-icon" id="searchToggle">/a \                <a href="notifications.php" class="notifications-icon"><i class="fas fa-bell"><\/i><\/a>' "$file"
    fi
}

# Process each file
for file in $PHP_FILES; do
    update_links "$file"
done

echo "All links updated successfully!"
