"""
Klaviyo integration provider.
"""

import json
import requests
from flask import current_app
from datetime import datetime

def get_api_client(integration):
    """Get Klaviyo API client"""
    api_key = integration.get('api_key')
    
    if not api_key:
        raise ValueError("Klaviyo API key is required")
    
    # Create session with authentication
    session = requests.Session()
    session.headers.update({
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': f"Klaviyo-API-Key {api_key}"
    })
    
    return {
        'session': session,
        'api_endpoint': 'https://a.klaviyo.com/api'
    }

def test_connection(integration):
    """Test connection to Klaviyo API"""
    try:
        client = get_api_client(integration)
        session = client['session']
        api_endpoint = client['api_endpoint']
        
        # Make a simple request to the API to get account info
        response = session.get(f"{api_endpoint}/v2/account")
        
        if response.status_code == 200:
            account_data = response.json()
            
            return {
                'success': True,
                'details': {
                    'account_name': account_data.get('name'),
                    'email': account_data.get('email'),
                    'timezone': account_data.get('timezone'),
                    'public_api_key': account_data.get('public_api_key')
                }
            }
        else:
            return {
                'success': False,
                'error': f"API request failed with status code {response.status_code}: {response.text}"
            }
    
    except Exception as e:
        current_app.logger.error(f"Error testing Klaviyo connection: {str(e)}")
        return {
            'success': False,
            'error': str(e)
        }

def get_lists(integration):
    """Get lists from Klaviyo"""
    try:
        client = get_api_client(integration)
        session = client['session']
        api_endpoint = client['api_endpoint']
        
        response = session.get(f"{api_endpoint}/v2/lists")
        
        if response.status_code == 200:
            lists_data = response.json()
            lists = []
            
            for list_item in lists_data:
                lists.append({
                    'external_id': list_item['id'],
                    'name': list_item['name'],
                    'member_count': list_item.get('person_count', 0),
                    'description': list_item.get('description', '')
                })
            
            return {
                'success': True,
                'lists': lists
            }
        else:
            return {
                'success': False,
                'error': f"API request failed with status code {response.status_code}: {response.text}"
            }
    
    except Exception as e:
        current_app.logger.error(f"Error getting Klaviyo lists: {str(e)}")
        return {
            'success': False,
            'error': str(e)
        }

def get_templates(integration):
    """Get templates from Klaviyo"""
    try:
        client = get_api_client(integration)
        session = client['session']
        api_endpoint = client['api_endpoint']
        
        response = session.get(f"{api_endpoint}/v1/email-templates")
        
        if response.status_code == 200:
            templates_data = response.json()
            templates = []
            
            for template in templates_data:
                templates.append({
                    'external_id': template['id'],
                    'name': template['name'],
                    'created_at': template.get('created'),
                    'updated_at': template.get('updated')
                })
            
            return {
                'success': True,
                'templates': templates
            }
        else:
            return {
                'success': False,
                'error': f"API request failed with status code {response.status_code}: {response.text}"
            }
    
    except Exception as e:
        current_app.logger.error(f"Error getting Klaviyo templates: {str(e)}")
        return {
            'success': False,
            'error': str(e)
        }

def track_event(integration, event_data):
    """Track an event in Klaviyo"""
    try:
        client = get_api_client(integration)
        session = client['session']
        api_endpoint = client['api_endpoint']
        
        # Get public API key from integration config
        config = json.loads(integration.get('config', '{}'))
        public_key = config.get('public_api_key')
        
        if not public_key:
            # Try to get it from account info
            account_response = session.get(f"{api_endpoint}/v2/account")
            if account_response.status_code == 200:
                public_key = account_response.json().get('public_api_key')
            
            if not public_key:
                return {
                    'success': False,
                    'error': "Public API key is required for tracking events"
                }
        
        # Prepare event data
        event_payload = {
            'token': public_key,
            'event': event_data.get('event_name', 'Abandoned Cart'),
            'customer_properties': {
                '$email': event_data.get('email'),
                '$first_name': event_data.get('first_name', ''),
                '$last_name': event_data.get('last_name', '')
            },
            'properties': event_data.get('properties', {}),
            'time': int(datetime.now().timestamp())
        }
        
        # Track event
        response = session.post(
            f"{api_endpoint}/v2/track",
            json=event_payload
        )
        
        if response.status_code == 200:
            return {
                'success': True,
                'event_id': response.json().get('id')
            }
        else:
            return {
                'success': False,
                'error': f"Failed to track event: {response.text}"
            }
    
    except Exception as e:
        current_app.logger.error(f"Error tracking event in Klaviyo: {str(e)}")
        return {
            'success': False,
            'error': str(e)
        }

def sync_abandoned_cart(integration, cart_data, user_data):
    """Sync abandoned cart data to Klaviyo"""
    try:
        # Format cart data for Klaviyo
        items = []
        for item in cart_data.get('items', []):
            items.append({
                'ProductID': item.get('product_id'),
                'SKU': item.get('sku', ''),
                'ProductName': item.get('name', ''),
                'Quantity': item.get('quantity', 1),
                'ItemPrice': item.get('price', 0),
                'RowTotal': item.get('price', 0) * item.get('quantity', 1),
                'ProductURL': item.get('url', ''),
                'ImageURL': item.get('image_url', '')
            })
        
        event_properties = {
            '$value': cart_data.get('total', 0),
            'CartID': cart_data.get('id'),
            'ItemCount': len(items),
            'Items': items,
            'CheckoutURL': cart_data.get('checkout_url', '')
        }
        
        # Track event
        event_data = {
            'event_name': 'Started Checkout',
            'email': user_data.get('email'),
            'first_name': user_data.get('first_name', ''),
            'last_name': user_data.get('last_name', ''),
            'properties': event_properties
        }
        
        return track_event(integration, event_data)
    
    except Exception as e:
        current_app.logger.error(f"Error syncing abandoned cart to Klaviyo: {str(e)}")
        return {
            'success': False,
            'error': str(e)
        }

def send_abandoned_cart_email(integration, email_data):
    """Send abandoned cart email via Klaviyo"""
    try:
        client = get_api_client(integration)
        session = client['session']
        api_endpoint = client['api_endpoint']
        
        # Get template ID from email data or config
        config = json.loads(integration.get('config', '{}'))
        template_id = email_data.get('template_id') or config.get('abandoned_cart_template_id')
        
        if not template_id:
            return {
                'success': False,
                'error': "Template ID is required for sending emails"
            }
        
        # Prepare email data
        email_payload = {
            'from_email': config.get('from_email', 'noreply@giggatek.com'),
            'from_name': config.get('from_name', 'GigGatek'),
            'subject': email_data.get('subject', 'Complete your purchase'),
            'to': [{'email': email_data.get('email')}],
            'context': email_data.get('context', {})
        }
        
        # Send email
        response = session.post(
            f"{api_endpoint}/v1/email-template/{template_id}/send",
            json=email_payload
        )
        
        if response.status_code == 200:
            return {
                'success': True,
                'message_id': response.json().get('id')
            }
        else:
            return {
                'success': False,
                'error': f"Failed to send email: {response.text}"
            }
    
    except Exception as e:
        current_app.logger.error(f"Error sending abandoned cart email via Klaviyo: {str(e)}")
        return {
            'success': False,
            'error': str(e)
        }
