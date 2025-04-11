"""
Marketing integration utilities for abandoned carts.
"""

import json
from flask import current_app

from ..utils.db import get_db_connection
from ..marketing.providers.mailchimp import sync_abandoned_cart as mailchimp_sync
from ..marketing.providers.klaviyo import sync_abandoned_cart as klaviyo_sync

def sync_abandoned_cart_to_marketing_tools(cart_id):
    """
    Sync an abandoned cart to all active marketing integrations.
    
    Args:
        cart_id (int): The ID of the abandoned cart to sync.
        
    Returns:
        dict: A dictionary with the sync results for each integration.
    """
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        # Get cart data
        cursor.execute(
            """
            SELECT * FROM abandoned_carts
            WHERE id = %s
            """,
            (cart_id,)
        )
        
        cart = cursor.fetchone()
        
        if not cart:
            return {
                'success': False,
                'error': 'Cart not found'
            }
        
        # Get user data
        user_id = cart.get('user_id')
        email = cart.get('email')
        
        if user_id:
            cursor.execute(
                """
                SELECT * FROM users
                WHERE id = %s
                """,
                (user_id,)
            )
            
            user = cursor.fetchone()
        else:
            # Create minimal user data from email
            user = {
                'id': None,
                'email': email,
                'first_name': '',
                'last_name': ''
            }
        
        # Parse cart data
        cart_data = json.loads(cart.get('cart_data', '{}'))
        
        # Get active marketing integrations
        cursor.execute(
            """
            SELECT * FROM marketing_integrations
            WHERE active = TRUE
            """
        )
        
        integrations = cursor.fetchall()
        
        if not integrations:
            return {
                'success': True,
                'message': 'No active marketing integrations found',
                'results': {}
            }
        
        # Sync cart to each integration
        results = {}
        
        for integration in integrations:
            provider = integration.get('provider')
            
            try:
                if provider == 'mailchimp':
                    result = mailchimp_sync(integration, cart_data, user)
                elif provider == 'klaviyo':
                    result = klaviyo_sync(integration, cart_data, user)
                else:
                    result = {
                        'success': False,
                        'error': f'Unsupported provider: {provider}'
                    }
                
                results[provider] = result
                
                # Log event
                if result.get('success'):
                    cursor.execute(
                        """
                        INSERT INTO marketing_events (
                            integration_id, event_type, user_id, email, data, status
                        )
                        VALUES (%s, %s, %s, %s, %s, %s)
                        """,
                        (
                            integration.get('id'),
                            'cart_abandoned',
                            user_id,
                            email,
                            json.dumps({
                                'cart_id': cart_id,
                                'cart_total': cart_data.get('total', 0),
                                'item_count': len(cart_data.get('items', [])),
                                'result': result
                            }),
                            'processed'
                        )
                    )
                    
                    conn.commit()
            
            except Exception as e:
                current_app.logger.error(f"Error syncing cart to {provider}: {str(e)}")
                results[provider] = {
                    'success': False,
                    'error': str(e)
                }
        
        return {
            'success': True,
            'results': results
        }
    
    except Exception as e:
        current_app.logger.error(f"Error syncing abandoned cart to marketing tools: {str(e)}")
        return {
            'success': False,
            'error': str(e)
        }
    
    finally:
        cursor.close()
        conn.close()

def send_abandoned_cart_email_via_marketing_tools(cart_id, email_data):
    """
    Send an abandoned cart email via marketing tools.
    
    Args:
        cart_id (int): The ID of the abandoned cart.
        email_data (dict): Email data including subject, template, etc.
        
    Returns:
        dict: A dictionary with the send results for each integration.
    """
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        # Get cart data
        cursor.execute(
            """
            SELECT * FROM abandoned_carts
            WHERE id = %s
            """,
            (cart_id,)
        )
        
        cart = cursor.fetchone()
        
        if not cart:
            return {
                'success': False,
                'error': 'Cart not found'
            }
        
        # Get active marketing integrations
        cursor.execute(
            """
            SELECT * FROM marketing_integrations
            WHERE active = TRUE
            """
        )
        
        integrations = cursor.fetchall()
        
        if not integrations:
            return {
                'success': True,
                'message': 'No active marketing integrations found',
                'results': {}
            }
        
        # Send email via each integration
        results = {}
        
        for integration in integrations:
            provider = integration.get('provider')
            
            try:
                if provider == 'mailchimp':
                    from ..marketing.providers.mailchimp import send_abandoned_cart_email
                    result = send_abandoned_cart_email(integration, email_data)
                elif provider == 'klaviyo':
                    from ..marketing.providers.klaviyo import send_abandoned_cart_email
                    result = send_abandoned_cart_email(integration, email_data)
                else:
                    result = {
                        'success': False,
                        'error': f'Unsupported provider: {provider}'
                    }
                
                results[provider] = result
                
                # Log event
                if result.get('success'):
                    cursor.execute(
                        """
                        INSERT INTO marketing_events (
                            integration_id, event_type, user_id, email, data, status
                        )
                        VALUES (%s, %s, %s, %s, %s, %s)
                        """,
                        (
                            integration.get('id'),
                            'email_sent',
                            cart.get('user_id'),
                            cart.get('email'),
                            json.dumps({
                                'cart_id': cart_id,
                                'subject': email_data.get('subject'),
                                'template': email_data.get('template_id'),
                                'result': result
                            }),
                            'processed'
                        )
                    )
                    
                    conn.commit()
            
            except Exception as e:
                current_app.logger.error(f"Error sending email via {provider}: {str(e)}")
                results[provider] = {
                    'success': False,
                    'error': str(e)
                }
        
        return {
            'success': True,
            'results': results
        }
    
    except Exception as e:
        current_app.logger.error(f"Error sending abandoned cart email via marketing tools: {str(e)}")
        return {
            'success': False,
            'error': str(e)
        }
    
    finally:
        cursor.close()
        conn.close()
