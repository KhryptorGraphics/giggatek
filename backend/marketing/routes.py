"""
Routes for marketing integrations functionality.
"""

import json
from datetime import datetime
from flask import request, jsonify, current_app

from . import marketing_bp
from ..utils.db import get_db_connection
from ..utils.auth import token_required, admin_required, get_user_id_from_token

# API Routes

@marketing_bp.route('/integrations', methods=['GET'])
@token_required
@admin_required
def list_integrations():
    """List all marketing integrations"""
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        # Get query parameters
        active_only = request.args.get('active', 'true').lower() == 'true'
        
        # Build query
        query = """
            SELECT id, name, provider, api_endpoint, created_at, updated_at, active
            FROM marketing_integrations
        """
        
        params = []
        
        if active_only:
            query += " WHERE active = TRUE"
        
        query += " ORDER BY name ASC"
        
        # Execute query
        cursor.execute(query, params)
        integrations = cursor.fetchall()
        
        # Format results
        formatted_integrations = []
        for integration in integrations:
            formatted_integrations.append({
                'id': integration['id'],
                'name': integration['name'],
                'provider': integration['provider'],
                'api_endpoint': integration['api_endpoint'],
                'created_at': integration['created_at'].isoformat() if integration['created_at'] else None,
                'updated_at': integration['updated_at'].isoformat() if integration['updated_at'] else None,
                'active': integration['active']
            })
        
        return jsonify({
            'success': True,
            'integrations': formatted_integrations
        }), 200
    
    except Exception as e:
        current_app.logger.error(f"Error listing integrations: {str(e)}")
        return jsonify({'error': 'Failed to list integrations'}), 500
    
    finally:
        cursor.close()
        conn.close()

@marketing_bp.route('/integrations', methods=['POST'])
@token_required
@admin_required
def create_integration():
    """Create a new marketing integration"""
    data = request.get_json()
    
    if not data or 'name' not in data or 'provider' not in data:
        return jsonify({'error': 'Missing required fields'}), 400
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # Check if integration with same name already exists
        cursor.execute(
            """
            SELECT id FROM marketing_integrations
            WHERE name = %s
            """,
            (data['name'],)
        )
        
        if cursor.fetchone():
            return jsonify({'error': 'Integration with this name already exists'}), 400
        
        # Insert integration
        cursor.execute(
            """
            INSERT INTO marketing_integrations (
                name, provider, api_key, api_secret, api_endpoint, config, active
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            """,
            (
                data['name'],
                data['provider'],
                data.get('api_key'),
                data.get('api_secret'),
                data.get('api_endpoint'),
                json.dumps(data.get('config', {})),
                data.get('active', True)
            )
        )
        
        integration_id = cursor.lastrowid
        conn.commit()
        
        return jsonify({
            'success': True,
            'integration_id': integration_id
        }), 201
    
    except Exception as e:
        conn.rollback()
        current_app.logger.error(f"Error creating integration: {str(e)}")
        return jsonify({'error': 'Failed to create integration'}), 500
    
    finally:
        cursor.close()
        conn.close()

@marketing_bp.route('/integrations/<int:integration_id>', methods=['GET'])
@token_required
@admin_required
def get_integration(integration_id):
    """Get a marketing integration by ID"""
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        # Get integration
        cursor.execute(
            """
            SELECT id, name, provider, api_endpoint, config, created_at, updated_at, active
            FROM marketing_integrations
            WHERE id = %s
            """,
            (integration_id,)
        )
        
        integration = cursor.fetchone()
        
        if not integration:
            return jsonify({'error': 'Integration not found'}), 404
        
        # Format integration
        formatted_integration = {
            'id': integration['id'],
            'name': integration['name'],
            'provider': integration['provider'],
            'api_endpoint': integration['api_endpoint'],
            'config': json.loads(integration['config']) if integration['config'] else {},
            'created_at': integration['created_at'].isoformat() if integration['created_at'] else None,
            'updated_at': integration['updated_at'].isoformat() if integration['updated_at'] else None,
            'active': integration['active']
        }
        
        return jsonify({
            'success': True,
            'integration': formatted_integration
        }), 200
    
    except Exception as e:
        current_app.logger.error(f"Error getting integration: {str(e)}")
        return jsonify({'error': 'Failed to get integration'}), 500
    
    finally:
        cursor.close()
        conn.close()

@marketing_bp.route('/integrations/<int:integration_id>', methods=['PUT'])
@token_required
@admin_required
def update_integration(integration_id):
    """Update a marketing integration"""
    data = request.get_json()
    
    if not data:
        return jsonify({'error': 'Missing request data'}), 400
    
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        # Check if integration exists
        cursor.execute(
            """
            SELECT * FROM marketing_integrations
            WHERE id = %s
            """,
            (integration_id,)
        )
        
        integration = cursor.fetchone()
        
        if not integration:
            return jsonify({'error': 'Integration not found'}), 404
        
        # Update integration
        update_fields = []
        params = []
        
        if 'name' in data:
            # Check if name is already taken by another integration
            cursor.execute(
                """
                SELECT id FROM marketing_integrations
                WHERE name = %s AND id != %s
                """,
                (data['name'], integration_id)
            )
            
            if cursor.fetchone():
                return jsonify({'error': 'Integration with this name already exists'}), 400
            
            update_fields.append("name = %s")
            params.append(data['name'])
        
        if 'provider' in data:
            update_fields.append("provider = %s")
            params.append(data['provider'])
        
        if 'api_key' in data:
            update_fields.append("api_key = %s")
            params.append(data['api_key'])
        
        if 'api_secret' in data:
            update_fields.append("api_secret = %s")
            params.append(data['api_secret'])
        
        if 'api_endpoint' in data:
            update_fields.append("api_endpoint = %s")
            params.append(data['api_endpoint'])
        
        if 'config' in data:
            update_fields.append("config = %s")
            params.append(json.dumps(data['config']))
        
        if 'active' in data:
            update_fields.append("active = %s")
            params.append(data['active'])
        
        if not update_fields:
            return jsonify({'error': 'No fields to update'}), 400
        
        # Add integration ID to params
        params.append(integration_id)
        
        # Execute update
        cursor.execute(
            f"""
            UPDATE marketing_integrations
            SET {', '.join(update_fields)}
            WHERE id = %s
            """,
            params
        )
        
        conn.commit()
        
        return jsonify({
            'success': True,
            'message': 'Integration updated successfully'
        }), 200
    
    except Exception as e:
        conn.rollback()
        current_app.logger.error(f"Error updating integration: {str(e)}")
        return jsonify({'error': 'Failed to update integration'}), 500
    
    finally:
        cursor.close()
        conn.close()

@marketing_bp.route('/integrations/<int:integration_id>', methods=['DELETE'])
@token_required
@admin_required
def delete_integration(integration_id):
    """Delete a marketing integration"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # Check if integration exists
        cursor.execute(
            """
            SELECT * FROM marketing_integrations
            WHERE id = %s
            """,
            (integration_id,)
        )
        
        if not cursor.fetchone():
            return jsonify({'error': 'Integration not found'}), 404
        
        # Delete integration (cascade will delete related records)
        cursor.execute(
            """
            DELETE FROM marketing_integrations
            WHERE id = %s
            """,
            (integration_id,)
        )
        
        conn.commit()
        
        return jsonify({
            'success': True,
            'message': 'Integration deleted successfully'
        }), 200
    
    except Exception as e:
        conn.rollback()
        current_app.logger.error(f"Error deleting integration: {str(e)}")
        return jsonify({'error': 'Failed to delete integration'}), 500
    
    finally:
        cursor.close()
        conn.close()

@marketing_bp.route('/integrations/<int:integration_id>/test', methods=['POST'])
@token_required
@admin_required
def test_integration(integration_id):
    """Test a marketing integration connection"""
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        # Get integration
        cursor.execute(
            """
            SELECT * FROM marketing_integrations
            WHERE id = %s
            """,
            (integration_id,)
        )
        
        integration = cursor.fetchone()
        
        if not integration:
            return jsonify({'error': 'Integration not found'}), 404
        
        # Test connection based on provider
        provider = integration['provider']
        
        if provider == 'mailchimp':
            from .providers.mailchimp import test_connection
            result = test_connection(integration)
        elif provider == 'klaviyo':
            from .providers.klaviyo import test_connection
            result = test_connection(integration)
        elif provider == 'hubspot':
            from .providers.hubspot import test_connection
            result = test_connection(integration)
        elif provider == 'sendgrid':
            from .providers.sendgrid import test_connection
            result = test_connection(integration)
        else:
            return jsonify({'error': 'Unsupported provider'}), 400
        
        if result['success']:
            return jsonify({
                'success': True,
                'message': 'Connection successful',
                'details': result.get('details', {})
            }), 200
        else:
            return jsonify({
                'success': False,
                'message': 'Connection failed',
                'error': result.get('error', 'Unknown error')
            }), 400
    
    except Exception as e:
        current_app.logger.error(f"Error testing integration: {str(e)}")
        return jsonify({'error': f'Failed to test integration: {str(e)}'}), 500
    
    finally:
        cursor.close()
        conn.close()

@marketing_bp.route('/integrations/<int:integration_id>/sync', methods=['POST'])
@token_required
@admin_required
def sync_integration(integration_id):
    """Sync data with a marketing integration"""
    data = request.get_json() or {}
    sync_type = data.get('sync_type', 'full')
    
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        # Get integration
        cursor.execute(
            """
            SELECT * FROM marketing_integrations
            WHERE id = %s
            """,
            (integration_id,)
        )
        
        integration = cursor.fetchone()
        
        if not integration:
            return jsonify({'error': 'Integration not found'}), 404
        
        # Create sync log
        cursor.execute(
            """
            INSERT INTO marketing_sync_logs (
                integration_id, sync_type, status
            )
            VALUES (%s, %s, %s)
            """,
            (integration_id, sync_type, 'started')
        )
        
        sync_id = cursor.lastrowid
        conn.commit()
        
        # Start sync process (this would typically be done asynchronously)
        # For now, we'll just return a success message
        
        return jsonify({
            'success': True,
            'message': f'Sync {sync_type} started',
            'sync_id': sync_id
        }), 200
    
    except Exception as e:
        conn.rollback()
        current_app.logger.error(f"Error starting sync: {str(e)}")
        return jsonify({'error': 'Failed to start sync'}), 500
    
    finally:
        cursor.close()
        conn.close()

@marketing_bp.route('/lists', methods=['GET'])
@token_required
@admin_required
def list_marketing_lists():
    """List all marketing lists"""
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        # Get query parameters
        integration_id = request.args.get('integration_id')
        
        # Build query
        query = """
            SELECT l.*, i.name as integration_name, i.provider
            FROM marketing_lists l
            JOIN marketing_integrations i ON l.integration_id = i.id
        """
        
        params = []
        
        if integration_id:
            query += " WHERE l.integration_id = %s"
            params.append(int(integration_id))
        
        query += " ORDER BY l.name ASC"
        
        # Execute query
        cursor.execute(query, params)
        lists = cursor.fetchall()
        
        # Format results
        formatted_lists = []
        for list_item in lists:
            formatted_lists.append({
                'id': list_item['id'],
                'integration_id': list_item['integration_id'],
                'integration_name': list_item['integration_name'],
                'provider': list_item['provider'],
                'external_id': list_item['external_id'],
                'name': list_item['name'],
                'description': list_item['description'],
                'member_count': list_item['member_count'],
                'created_at': list_item['created_at'].isoformat() if list_item['created_at'] else None,
                'updated_at': list_item['updated_at'].isoformat() if list_item['updated_at'] else None,
                'last_synced_at': list_item['last_synced_at'].isoformat() if list_item['last_synced_at'] else None
            })
        
        return jsonify({
            'success': True,
            'lists': formatted_lists
        }), 200
    
    except Exception as e:
        current_app.logger.error(f"Error listing marketing lists: {str(e)}")
        return jsonify({'error': 'Failed to list marketing lists'}), 500
    
    finally:
        cursor.close()
        conn.close()

@marketing_bp.route('/templates', methods=['GET'])
@token_required
@admin_required
def list_marketing_templates():
    """List all marketing templates"""
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        # Get query parameters
        integration_id = request.args.get('integration_id')
        template_type = request.args.get('template_type')
        
        # Build query
        query = """
            SELECT t.*, i.name as integration_name, i.provider
            FROM marketing_templates t
            JOIN marketing_integrations i ON t.integration_id = i.id
        """
        
        params = []
        where_clauses = []
        
        if integration_id:
            where_clauses.append("t.integration_id = %s")
            params.append(int(integration_id))
        
        if template_type:
            where_clauses.append("t.template_type = %s")
            params.append(template_type)
        
        if where_clauses:
            query += " WHERE " + " AND ".join(where_clauses)
        
        query += " ORDER BY t.name ASC"
        
        # Execute query
        cursor.execute(query, params)
        templates = cursor.fetchall()
        
        # Format results
        formatted_templates = []
        for template in templates:
            formatted_templates.append({
                'id': template['id'],
                'integration_id': template['integration_id'],
                'integration_name': template['integration_name'],
                'provider': template['provider'],
                'external_id': template['external_id'],
                'name': template['name'],
                'subject': template['subject'],
                'template_type': template['template_type'],
                'created_at': template['created_at'].isoformat() if template['created_at'] else None,
                'updated_at': template['updated_at'].isoformat() if template['updated_at'] else None
            })
        
        return jsonify({
            'success': True,
            'templates': formatted_templates
        }), 200
    
    except Exception as e:
        current_app.logger.error(f"Error listing marketing templates: {str(e)}")
        return jsonify({'error': 'Failed to list marketing templates'}), 500
    
    finally:
        cursor.close()
        conn.close()

@marketing_bp.route('/events', methods=['POST'])
@token_required
def track_marketing_event():
    """Track a marketing event"""
    data = request.get_json()
    
    if not data or 'event_type' not in data or 'integration_id' not in data:
        return jsonify({'error': 'Missing required fields'}), 400
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # Get user ID from token if available
        auth_header = request.headers.get('Authorization')
        user_id = None
        
        if auth_header:
            token = auth_header.split(' ')[1]
            user_id = get_user_id_from_token(token)
        
        # Insert event
        cursor.execute(
            """
            INSERT INTO marketing_events (
                integration_id, event_type, user_id, email, data, external_id, status
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            """,
            (
                data['integration_id'],
                data['event_type'],
                user_id or data.get('user_id'),
                data.get('email'),
                json.dumps(data.get('data', {})),
                data.get('external_id'),
                'pending'
            )
        )
        
        event_id = cursor.lastrowid
        conn.commit()
        
        # Process event (this would typically be done asynchronously)
        # For now, we'll just return a success message
        
        return jsonify({
            'success': True,
            'event_id': event_id
        }), 201
    
    except Exception as e:
        conn.rollback()
        current_app.logger.error(f"Error tracking event: {str(e)}")
        return jsonify({'error': 'Failed to track event'}), 500
    
    finally:
        cursor.close()
        conn.close()
