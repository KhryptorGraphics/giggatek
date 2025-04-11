#!/usr/bin/env python
"""
Send Abandoned Cart Recovery Emails

This script sends recovery emails for abandoned shopping carts.
It should be run as a scheduled task (e.g., via cron).

Usage:
    python send_abandoned_cart_emails.py [--hours-threshold HOURS] [--max-notifications MAX]

Options:
    --hours-threshold HOURS    Hours since cart abandonment before sending notification (default: 1)
    --max-notifications MAX    Maximum number of notifications to send per cart (default: 3)
"""

import os
import sys
import json
import argparse
import requests
from datetime import datetime
import logging

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('abandoned_cart_emails.log'),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger('abandoned_cart_emails')

def parse_args():
    """Parse command line arguments"""
    parser = argparse.ArgumentParser(description='Send abandoned cart recovery emails')
    parser.add_argument('--hours-threshold', type=int, default=1,
                        help='Hours since cart abandonment before sending notification')
    parser.add_argument('--max-notifications', type=int, default=3,
                        help='Maximum number of notifications to send per cart')
    return parser.parse_args()

def get_api_url():
    """Get API URL from environment or use default"""
    return os.environ.get('API_URL', 'http://localhost:5000')

def get_api_token():
    """Get API token from environment"""
    return os.environ.get('API_TOKEN')

def send_batch_notifications(hours_threshold, max_notifications):
    """Send batch notifications for abandoned carts"""
    api_url = get_api_url()
    api_token = get_api_token()
    
    if not api_token:
        logger.error('API token not found in environment')
        return False
    
    url = f"{api_url}/api/abandoned-carts/admin/send-batch"
    
    headers = {
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {api_token}'
    }
    
    data = {
        'hours_threshold': hours_threshold,
        'max_notifications': max_notifications
    }
    
    try:
        response = requests.post(url, headers=headers, json=data)
        
        if response.status_code == 200:
            result = response.json()
            logger.info(f"Successfully sent notifications: {result['message']}")
            return True
        else:
            logger.error(f"Failed to send notifications: {response.status_code} - {response.text}")
            return False
    
    except Exception as e:
        logger.error(f"Error sending notifications: {str(e)}")
        return False

def main():
    """Main function"""
    args = parse_args()
    
    logger.info(f"Starting abandoned cart email job with hours_threshold={args.hours_threshold}, max_notifications={args.max_notifications}")
    
    success = send_batch_notifications(args.hours_threshold, args.max_notifications)
    
    if success:
        logger.info("Job completed successfully")
    else:
        logger.error("Job failed")
        sys.exit(1)

if __name__ == '__main__':
    main()
