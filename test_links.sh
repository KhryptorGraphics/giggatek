#!/bin/bash

# Script to test links in all PHP files
# This script will check for broken links in the frontend

# Exit on error
set -e

# Directory containing PHP files
FRONTEND_DIR="frontend"

# Output file for broken links
OUTPUT_FILE="broken_links.txt"

# Clear output file
> "$OUTPUT_FILE"

# Function to extract links from a file
extract_links() {
    local file=$1
    echo "Checking links in $file..."
    
    # Extract href attributes
    grep -o 'href="[^"]*"' "$file" | sed 's/href="//;s/"$//' | while read -r link; do
        # Skip external links, anchors, and javascript
        if [[ $link == http* || $link == "#"* || $link == "javascript:"* ]]; then
            continue
        fi
        
        # Skip empty links
        if [[ -z $link ]]; then
            continue
        fi
        
        # Check if the link is a PHP file
        if [[ $link == *".php"* ]]; then
            # Extract the PHP file name
            php_file=$(echo "$link" | cut -d'?' -f1)
            
            # Check if the PHP file exists
            if [[ ! -f "$FRONTEND_DIR/$php_file" ]]; then
                echo "Broken link in $file: $link (File not found: $FRONTEND_DIR/$php_file)" >> "$OUTPUT_FILE"
            fi
        fi
    done
}

# Process each PHP file
find "$FRONTEND_DIR" -name "*.php" -not -path "*/components/*" -not -path "*/api/*" -not -path "*/includes/*" | while read -r file; do
    extract_links "$file"
done

# Check if there are any broken links
if [[ -s "$OUTPUT_FILE" ]]; then
    echo "Found broken links:"
    cat "$OUTPUT_FILE"
else
    echo "No broken links found!"
fi
