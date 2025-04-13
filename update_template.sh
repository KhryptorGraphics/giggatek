#!/bin/bash

# Script to update all PHP files with the new modern template
# This script will add the modern-update.css stylesheet and update font imports

# Exit on error
set -e

# Directory containing PHP files
FRONTEND_DIR="frontend"

# List of PHP files to update
PHP_FILES=$(find "$FRONTEND_DIR" -name "*.php" -not -path "*/components/*" -not -path "*/api/*" -not -path "*/includes/*")

# Function to update template in a file
update_template() {
    local file=$1
    echo "Updating template in $file..."
    
    # Add modern-update.css stylesheet after framework.css
    sed -i 's|<link rel="stylesheet" href="css/framework.css">|<link rel="stylesheet" href="css/framework.css">\n    <link rel="stylesheet" href="css/modern-update.css">|g' "$file"
    
    # Update font imports to include Inter and Montserrat
    sed -i 's|<link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap" rel="stylesheet">|<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Montserrat:wght@400;500;600;700;800&family=Roboto:wght@400;500;700&display=swap" rel="stylesheet">|g' "$file"
    
    # Add animation script at the end of the body
    if ! grep -q "animateOnScroll" "$file"; then
        sed -i '/<\/body>/i \
    <script>\n        // Animation on scroll\n        function animateOnScroll() {\n            const elements = document.querySelectorAll(".animate-on-scroll");\n            elements.forEach(element => {\n                const elementTop = element.getBoundingClientRect().top;\n                const elementVisible = 150;\n                if (elementTop < window.innerHeight - elementVisible) {\n                    element.classList.add("animated");\n                }\n            });\n        }\n\n        // Run on page load\n        document.addEventListener("DOMContentLoaded", animateOnScroll);\n\n        // Run on scroll\n        window.addEventListener("scroll", animateOnScroll);\n\n        // Header scroll effect\n        window.addEventListener("scroll", function() {\n            const header = document.querySelector("header");\n            if (window.scrollY > 50) {\n                header.classList.add("scrolled");\n            } else {\n                header.classList.remove("scrolled");\n            }\n        });\n    </script>' "$file"
    fi
}

# Process each file
for file in $PHP_FILES; do
    update_template "$file"
done

echo "All templates updated successfully!"
