"""
Mailchimp integration provider.
"""

import json
import requests
from flask import current_app
from base64 import b64encode

def get_api_client(integration):
    """Get Mailchimp API client"""
    api_key = integration.get('api_key')
    
    if not api_key:
        raise ValueError("Mailchimp API key is required")
    
    # Extract datacenter from API key
    if '-' in api_key:
        datacenter = api_key.split('-')[1]
    else:
        datacenter = 'us1'  # Default datacenter
    
    api_endpoint = f"https://{datacenter}.api.mailchimp.com/3.0"
    
    # Create session with authentication
    session = requests.Session()
    session.auth = ('apikey', api_key)
    session.headers.update({
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    })
    
    return {
        'session': session,
        'api_endpoint': api_endpoint
    }

def test_connection(integration):
    """Test connection to Mailchimp API"""
    try:
        client = get_api_client(integration)
        session = client['session']
        api_endpoint = client['api_endpoint']
        
        # Make a simple request to the API
        response = session.get(f"{api_endpoint}/ping")
        
        if response.status_code == 200:
            # Get account info
            account_response = session.get(f"{api_endpoint}/")
            account_data = account_response.json()
            
            return {
                'success': True,
                'details': {
                    'account_name': account_data.get('account_name'),
                    'email': account_data.get('email'),
                    'username': account_data.get('username'),
                    'industry': account_data.get('industry'),
                    'total_subscribers': account_data.get('total_subscribers')
                }
            }
        else:
            return {
                'success': False,
                'error': f"API request failed with status code {response.status_code}: {response.text}"
            }
    
    except Exception as e:
        current_app.logger.error(f"Error testing Mailchimp connection: {str(e)}")
        return {
            'success': False,
            'error': str(e)
        }

def get_lists(integration):
    """Get lists from Mailchimp"""
    try:
        client = get_api_client(integration)
        session = client['session']
        api_endpoint = client['api_endpoint']
        
        response = session.get(f"{api_endpoint}/lists?count=100")
        
        if response.status_code == 200:
            data = response.json()
            lists = []
            
            for list_item in data.get('lists', []):
                lists.append({
                    'external_id': list_item['id'],
                    'name': list_item['name'],
                    'member_count': list_item['stats']['member_count'],
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
        current_app.logger.error(f"Error getting Mailchimp lists: {str(e)}")
        return {
            'success': False,
            'error': str(e)
        }

def get_templates(integration):
    """Get templates from Mailchimp"""
    try:
        client = get_api_client(integration)
        session = client['session']
        api_endpoint = client['api_endpoint']
        
        response = session.get(f"{api_endpoint}/templates?count=100")
        
        if response.status_code == 200:
            data = response.json()
            templates = []
            
            for template in data.get('templates', []):
                templates.append({
                    'external_id': template['id'],
                    'name': template['name'],
                    'type': template['type'],
                    'created_at': template.get('date_created')
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
        current_app.logger.error(f"Error getting Mailchimp templates: {str(e)}")
        return {
            'success': False,
            'error': str(e)
        }

def sync_abandoned_cart(integration, cart_data, user_data):
    """Sync abandoned cart data to Mailchimp"""
    try:
        client = get_api_client(integration)
        session = client['session']
        api_endpoint = client['api_endpoint']
        
        # Get store ID from integration config
        config = json.loads(integration.get('config', '{}'))
        store_id = config.get('store_id')
        
        if not store_id:
            return {
                'success': False,
                'error': "Store ID is required in integration config"
            }
        
        # Create or update customer
        customer_data = {
            'id': str(user_data.get('id')),
            'email_address': user_data.get('email'),
            'first_name': user_data.get('first_name', ''),
            'last_name': user_data.get('last_name', ''),
            'opt_in_status': True
        }
        
        customer_response = session.put(
            f"{api_endpoint}/ecommerce/stores/{store_id}/customers/{customer_data['id']}",
            json=customer_data
        )
        
        if customer_response.status_code not in [200, 201]:
            return {
                'success': False,
                'error': f"Failed to create/update customer: {customer_response.text}"
            }
        
        # Create cart
        cart_items = []
        for item in cart_data.get('items', []):
            cart_items.append({
                'id': str(item.get('id')),
                'product_id': str(item.get('product_id')),
                'product_variant_id': str(item.get('variant_id', item.get('product_id'))),
                'quantity': item.get('quantity', 1),
                'price': item.get('price', 0)
            })
        
        cart_payload = {
            'id': str(cart_data.get('id')),
            'customer': {
                'id': str(user_data.get('id'))
            },
            'currency_code': 'USD',
            'order_total': cart_data.get('total', 0),
            'checkout_url': cart_data.get('checkout_url', ''),
            'lines': cart_items
        }
        
        cart_response = session.post(
            f"{api_endpoint}/ecommerce/stores/{store_id}/carts",
            json=cart_payload
        )
        
        if cart_response.status_code == 201:
            return {
                'success': True,
                'cart_id': cart_data.get('id')
            }
        else:
            return {
                'success': False,
                'error': f"Failed to create cart: {cart_response.text}"
            }
    
    except Exception as e:
        current_app.logger.error(f"Error syncing abandoned cart to Mailchimp: {str(e)}")
        return {
            'success': False,
            'error': str(e)
        }

def send_abandoned_cart_email(integration, email_data):
    """Send abandoned cart email via Mailchimp"""
    try:
        client = get_api_client(integration)
        session = client['session']
        api_endpoint = client['api_endpoint']
        
        # Get list ID and template ID from integration config
        config = json.loads(integration.get('config', '{}'))
        list_id = config.get('list_id')
        
        if not list_id:
            return {
                'success': False,
                'error': "List ID is required in integration config"
            }
        
        # Create campaign
        campaign_data = {
            'type': 'regular',
            'recipients': {
                'list_id': list_id,
                'segment_opts': {
                    'match': 'all',
                    'conditions': [{
                        'condition_type': 'EmailAddress',
                        'op': 'is',
                        'field': 'EMAIL',
                        'value': email_data.get('email')
                    }]
                }
            },
            'settings': {
                'subject_line': email_data.get('subject', 'Complete your purchase'),
                'title': f"Abandoned Cart - {email_data.get('email')}",
                'from_name': config.get('from_name', 'GigGatek'),
                'reply_to': config.get('reply_to', 'noreply@giggatek.com'),
                'auto_footer': True
            }
        }
        
        # If template ID is provided, use it
        if 'template_id' in email_data:
            campaign_data['settings']['template_id'] = email_data['template_id']
        
        campaign_response = session.post(
            f"{api_endpoint}/campaigns",
            json=campaign_data
        )
        
        if campaign_response.status_code != 200:
            return {
                'success': False,
                'error': f"Failed to create campaign: {campaign_response.text}"
            }
        
        campaign_id = campaign_response.json()['id']
        
        # If no template ID, set content directly
        if 'template_id' not in email_data and 'html' in email_data:
            content_response = session.put(
                f"{api_endpoint}/campaigns/{campaign_id}/content",
                json={'html': email_data['html']}
            )
            
            if content_response.status_code != 200:
                return {
                    'success': False,
                    'error': f"Failed to set campaign content: {content_response.text}"
                }
        
        # Send campaign
        send_response = session.post(f"{api_endpoint}/campaigns/{campaign_id}/actions/send")
        
        if send_response.status_code == 204:
            return {
                'success': True,
                'campaign_id': campaign_id
            }
        else:
            return {
                'success': False,
                'error': f"Failed to send campaign: {send_response.text}"
            }
    
    except Exception as e:
        current_app.logger.error(f"Error sending abandoned cart email via Mailchimp: {str(e)}")
        return {
            'success': False,
            'error': str(e)
        }
