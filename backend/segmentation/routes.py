"""
Routes for customer segmentation functionality.
"""

import json
from datetime import datetime
from flask import request, jsonify, current_app

from . import segmentation_bp
from ..utils.db import get_db_connection
from ..utils.auth import token_required, admin_required, get_user_id_from_token

# Helper functions
def get_segment_by_id(segment_id):
    """Get a segment by ID"""
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        cursor.execute(
            """
            SELECT * FROM customer_segments
            WHERE id = %s
            """,
            (segment_id,)
        )
        
        segment = cursor.fetchone()
        return segment
    
    except Exception as e:
        current_app.logger.error(f"Error getting segment: {str(e)}")
        return None
    
    finally:
        cursor.close()
        conn.close()

def get_segment_members(segment_id):
    """Get members of a segment"""
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        cursor.execute(
            """
            SELECT sm.*, u.email, u.first_name, u.last_name
            FROM segment_members sm
            JOIN users u ON sm.user_id = u.id
            WHERE sm.segment_id = %s
            """,
            (segment_id,)
        )
        
        members = cursor.fetchall()
        return members
    
    except Exception as e:
        current_app.logger.error(f"Error getting segment members: {str(e)}")
        return []
    
    finally:
        cursor.close()
        conn.close()

def apply_segment_criteria(criteria):
    """Apply segment criteria to find matching users"""
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        # Start with a base query
        query = """
            SELECT DISTINCT u.id, u.email, u.first_name, u.last_name
            FROM users u
        """
        
        joins = []
        where_clauses = []
        params = []
        
        # Process criteria
        if 'purchase_count' in criteria:
            joins.append("LEFT JOIN orders o ON u.id = o.user_id")
            purchase_count = criteria['purchase_count']
            
            if 'min' in purchase_count:
                where_clauses.append("(SELECT COUNT(*) FROM orders WHERE user_id = u.id) >= %s")
                params.append(purchase_count['min'])
            
            if 'max' in purchase_count:
                where_clauses.append("(SELECT COUNT(*) FROM orders WHERE user_id = u.id) <= %s")
                params.append(purchase_count['max'])
        
        if 'cart_value' in criteria:
            joins.append("LEFT JOIN abandoned_carts ac ON u.id = ac.user_id")
            cart_value = criteria['cart_value']
            
            if 'min' in cart_value:
                where_clauses.append("JSON_EXTRACT(ac.cart_data, '$.total') >= %s")
                params.append(cart_value['min'])
            
            if 'max' in cart_value:
                where_clauses.append("JSON_EXTRACT(ac.cart_data, '$.total') <= %s")
                params.append(cart_value['max'])
        
        if 'abandoned_count' in criteria:
            joins.append("LEFT JOIN abandoned_carts ac ON u.id = ac.user_id")
            abandoned_count = criteria['abandoned_count']
            
            if 'min' in abandoned_count:
                where_clauses.append("(SELECT COUNT(*) FROM abandoned_carts WHERE user_id = u.id AND recovered = FALSE) >= %s")
                params.append(abandoned_count['min'])
            
            if 'max' in abandoned_count:
                where_clauses.append("(SELECT COUNT(*) FROM abandoned_carts WHERE user_id = u.id AND recovered = FALSE) <= %s")
                params.append(abandoned_count['max'])
        
        if 'last_abandoned' in criteria:
            joins.append("LEFT JOIN abandoned_carts ac ON u.id = ac.user_id")
            last_abandoned = criteria['last_abandoned']
            
            if 'days' in last_abandoned:
                where_clauses.append("ac.created_at >= DATE_SUB(NOW(), INTERVAL %s DAY)")
                params.append(last_abandoned['days'])
        
        if 'product_category' in criteria:
            joins.append("LEFT JOIN orders o ON u.id = o.user_id")
            joins.append("LEFT JOIN order_items oi ON o.id = oi.order_id")
            joins.append("LEFT JOIN products p ON oi.product_id = p.id")
            
            where_clauses.append("p.category = %s")
            params.append(criteria['product_category'])
        
        # Add joins to query
        for join in joins:
            if join not in query:
                query += " " + join
        
        # Add where clauses
        if where_clauses:
            query += " WHERE " + " AND ".join(where_clauses)
        
        # Execute query
        cursor.execute(query, params)
        users = cursor.fetchall()
        
        return users
    
    except Exception as e:
        current_app.logger.error(f"Error applying segment criteria: {str(e)}")
        return []
    
    finally:
        cursor.close()
        conn.close()

def update_segment_members(segment_id, criteria):
    """Update segment members based on criteria"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # Get users matching criteria
        users = apply_segment_criteria(criteria)
        
        # Clear existing members
        cursor.execute(
            """
            DELETE FROM segment_members
            WHERE segment_id = %s
            """,
            (segment_id,)
        )
        
        # Add new members
        for user in users:
            cursor.execute(
                """
                INSERT INTO segment_members (segment_id, user_id)
                VALUES (%s, %s)
                """,
                (segment_id, user['id'])
            )
        
        conn.commit()
        return len(users)
    
    except Exception as e:
        conn.rollback()
        current_app.logger.error(f"Error updating segment members: {str(e)}")
        return 0
    
    finally:
        cursor.close()
        conn.close()

# API Routes

@segmentation_bp.route('/segments', methods=['GET'])
@token_required
@admin_required
def list_segments():
    """List all customer segments"""
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        # Get query parameters
        active_only = request.args.get('active', 'true').lower() == 'true'
        
        # Build query
        query = """
            SELECT s.*, 
                   (SELECT COUNT(*) FROM segment_members WHERE segment_id = s.id) as member_count
            FROM customer_segments s
        """
        
        params = []
        
        if active_only:
            query += " WHERE s.active = TRUE"
        
        query += " ORDER BY s.name ASC"
        
        # Execute query
        cursor.execute(query, params)
        segments = cursor.fetchall()
        
        # Format results
        formatted_segments = []
        for segment in segments:
            formatted_segments.append({
                'id': segment['id'],
                'name': segment['name'],
                'description': segment['description'],
                'criteria': json.loads(segment['criteria']),
                'created_at': segment['created_at'].isoformat() if segment['created_at'] else None,
                'updated_at': segment['updated_at'].isoformat() if segment['updated_at'] else None,
                'active': segment['active'],
                'member_count': segment['member_count']
            })
        
        return jsonify({
            'success': True,
            'segments': formatted_segments
        }), 200
    
    except Exception as e:
        current_app.logger.error(f"Error listing segments: {str(e)}")
        return jsonify({'error': 'Failed to list segments'}), 500
    
    finally:
        cursor.close()
        conn.close()

@segmentation_bp.route('/segments', methods=['POST'])
@token_required
@admin_required
def create_segment():
    """Create a new customer segment"""
    data = request.get_json()
    
    if not data or 'name' not in data or 'criteria' not in data:
        return jsonify({'error': 'Missing required fields'}), 400
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # Get user ID
        user_id = get_user_id_from_token(request.headers.get('Authorization').split(' ')[1])
        
        # Insert segment
        cursor.execute(
            """
            INSERT INTO customer_segments (name, description, criteria, created_by, active)
            VALUES (%s, %s, %s, %s, %s)
            """,
            (
                data['name'],
                data.get('description', ''),
                json.dumps(data['criteria']),
                user_id,
                data.get('active', True)
            )
        )
        
        segment_id = cursor.lastrowid
        conn.commit()
        
        # Update segment members
        member_count = update_segment_members(segment_id, data['criteria'])
        
        return jsonify({
            'success': True,
            'segment_id': segment_id,
            'member_count': member_count
        }), 201
    
    except Exception as e:
        conn.rollback()
        current_app.logger.error(f"Error creating segment: {str(e)}")
        return jsonify({'error': 'Failed to create segment'}), 500
    
    finally:
        cursor.close()
        conn.close()

@segmentation_bp.route('/segments/<int:segment_id>', methods=['GET'])
@token_required
@admin_required
def get_segment(segment_id):
    """Get a customer segment by ID"""
    segment = get_segment_by_id(segment_id)
    
    if not segment:
        return jsonify({'error': 'Segment not found'}), 404
    
    # Get segment members
    members = get_segment_members(segment_id)
    
    # Format segment
    formatted_segment = {
        'id': segment['id'],
        'name': segment['name'],
        'description': segment['description'],
        'criteria': json.loads(segment['criteria']),
        'created_at': segment['created_at'].isoformat() if segment['created_at'] else None,
        'updated_at': segment['updated_at'].isoformat() if segment['updated_at'] else None,
        'active': segment['active'],
        'member_count': len(members)
    }
    
    # Format members
    formatted_members = []
    for member in members:
        formatted_members.append({
            'id': member['id'],
            'user_id': member['user_id'],
            'email': member['email'],
            'name': f"{member['first_name']} {member['last_name']}".strip(),
            'added_at': member['added_at'].isoformat() if member['added_at'] else None
        })
    
    return jsonify({
        'success': True,
        'segment': formatted_segment,
        'members': formatted_members
    }), 200

@segmentation_bp.route('/segments/<int:segment_id>', methods=['PUT'])
@token_required
@admin_required
def update_segment(segment_id):
    """Update a customer segment"""
    data = request.get_json()
    
    if not data:
        return jsonify({'error': 'Missing request data'}), 400
    
    segment = get_segment_by_id(segment_id)
    
    if not segment:
        return jsonify({'error': 'Segment not found'}), 404
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # Update segment
        update_fields = []
        params = []
        
        if 'name' in data:
            update_fields.append("name = %s")
            params.append(data['name'])
        
        if 'description' in data:
            update_fields.append("description = %s")
            params.append(data['description'])
        
        if 'criteria' in data:
            update_fields.append("criteria = %s")
            params.append(json.dumps(data['criteria']))
        
        if 'active' in data:
            update_fields.append("active = %s")
            params.append(data['active'])
        
        if not update_fields:
            return jsonify({'error': 'No fields to update'}), 400
        
        # Add segment ID to params
        params.append(segment_id)
        
        # Execute update
        cursor.execute(
            f"""
            UPDATE customer_segments
            SET {', '.join(update_fields)}
            WHERE id = %s
            """,
            params
        )
        
        conn.commit()
        
        # Update segment members if criteria changed
        member_count = 0
        if 'criteria' in data:
            member_count = update_segment_members(segment_id, data['criteria'])
        
        return jsonify({
            'success': True,
            'message': 'Segment updated successfully',
            'member_count': member_count
        }), 200
    
    except Exception as e:
        conn.rollback()
        current_app.logger.error(f"Error updating segment: {str(e)}")
        return jsonify({'error': 'Failed to update segment'}), 500
    
    finally:
        cursor.close()
        conn.close()

@segmentation_bp.route('/segments/<int:segment_id>', methods=['DELETE'])
@token_required
@admin_required
def delete_segment(segment_id):
    """Delete a customer segment"""
    segment = get_segment_by_id(segment_id)
    
    if not segment:
        return jsonify({'error': 'Segment not found'}), 404
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # Delete segment (cascade will delete members)
        cursor.execute(
            """
            DELETE FROM customer_segments
            WHERE id = %s
            """,
            (segment_id,)
        )
        
        conn.commit()
        
        return jsonify({
            'success': True,
            'message': 'Segment deleted successfully'
        }), 200
    
    except Exception as e:
        conn.rollback()
        current_app.logger.error(f"Error deleting segment: {str(e)}")
        return jsonify({'error': 'Failed to delete segment'}), 500
    
    finally:
        cursor.close()
        conn.close()

@segmentation_bp.route('/segments/<int:segment_id>/refresh', methods=['POST'])
@token_required
@admin_required
def refresh_segment(segment_id):
    """Refresh segment members based on criteria"""
    segment = get_segment_by_id(segment_id)
    
    if not segment:
        return jsonify({'error': 'Segment not found'}), 404
    
    try:
        # Parse criteria
        criteria = json.loads(segment['criteria'])
        
        # Update segment members
        member_count = update_segment_members(segment_id, criteria)
        
        return jsonify({
            'success': True,
            'message': 'Segment refreshed successfully',
            'member_count': member_count
        }), 200
    
    except Exception as e:
        current_app.logger.error(f"Error refreshing segment: {str(e)}")
        return jsonify({'error': 'Failed to refresh segment'}), 500

# Campaign routes

@segmentation_bp.route('/campaigns', methods=['GET'])
@token_required
@admin_required
def list_campaigns():
    """List all segment campaigns"""
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        # Get query parameters
        active_only = request.args.get('active', 'true').lower() == 'true'
        segment_id = request.args.get('segment_id')
        
        # Build query
        query = """
            SELECT c.*, s.name as segment_name
            FROM segment_campaigns c
            JOIN customer_segments s ON c.segment_id = s.id
        """
        
        params = []
        where_clauses = []
        
        if active_only:
            where_clauses.append("c.active = TRUE")
        
        if segment_id:
            where_clauses.append("c.segment_id = %s")
            params.append(int(segment_id))
        
        if where_clauses:
            query += " WHERE " + " AND ".join(where_clauses)
        
        query += " ORDER BY c.created_at DESC"
        
        # Execute query
        cursor.execute(query, params)
        campaigns = cursor.fetchall()
        
        # Format results
        formatted_campaigns = []
        for campaign in campaigns:
            formatted_campaigns.append({
                'id': campaign['id'],
                'segment_id': campaign['segment_id'],
                'segment_name': campaign['segment_name'],
                'name': campaign['name'],
                'description': campaign['description'],
                'email_template': campaign['email_template'],
                'discount_percentage': campaign['discount_percentage'],
                'created_at': campaign['created_at'].isoformat() if campaign['created_at'] else None,
                'updated_at': campaign['updated_at'].isoformat() if campaign['updated_at'] else None,
                'start_date': campaign['start_date'].isoformat() if campaign['start_date'] else None,
                'end_date': campaign['end_date'].isoformat() if campaign['end_date'] else None,
                'active': campaign['active']
            })
        
        return jsonify({
            'success': True,
            'campaigns': formatted_campaigns
        }), 200
    
    except Exception as e:
        current_app.logger.error(f"Error listing campaigns: {str(e)}")
        return jsonify({'error': 'Failed to list campaigns'}), 500
    
    finally:
        cursor.close()
        conn.close()

@segmentation_bp.route('/campaigns', methods=['POST'])
@token_required
@admin_required
def create_campaign():
    """Create a new segment campaign"""
    data = request.get_json()
    
    if not data or 'segment_id' not in data or 'name' not in data or 'email_template' not in data:
        return jsonify({'error': 'Missing required fields'}), 400
    
    # Verify segment exists
    segment = get_segment_by_id(data['segment_id'])
    
    if not segment:
        return jsonify({'error': 'Segment not found'}), 404
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # Parse dates
        start_date = None
        if 'start_date' in data and data['start_date']:
            start_date = datetime.fromisoformat(data['start_date'].replace('Z', '+00:00'))
        
        end_date = None
        if 'end_date' in data and data['end_date']:
            end_date = datetime.fromisoformat(data['end_date'].replace('Z', '+00:00'))
        
        # Insert campaign
        cursor.execute(
            """
            INSERT INTO segment_campaigns (
                segment_id, name, description, email_template, 
                discount_percentage, start_date, end_date, active
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            """,
            (
                data['segment_id'],
                data['name'],
                data.get('description', ''),
                data['email_template'],
                data.get('discount_percentage', 0),
                start_date,
                end_date,
                data.get('active', True)
            )
        )
        
        campaign_id = cursor.lastrowid
        conn.commit()
        
        return jsonify({
            'success': True,
            'campaign_id': campaign_id
        }), 201
    
    except Exception as e:
        conn.rollback()
        current_app.logger.error(f"Error creating campaign: {str(e)}")
        return jsonify({'error': 'Failed to create campaign'}), 500
    
    finally:
        cursor.close()
        conn.close()

@segmentation_bp.route('/campaigns/<int:campaign_id>', methods=['GET'])
@token_required
@admin_required
def get_campaign(campaign_id):
    """Get a campaign by ID"""
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        cursor.execute(
            """
            SELECT c.*, s.name as segment_name
            FROM segment_campaigns c
            JOIN customer_segments s ON c.segment_id = s.id
            WHERE c.id = %s
            """,
            (campaign_id,)
        )
        
        campaign = cursor.fetchone()
        
        if not campaign:
            return jsonify({'error': 'Campaign not found'}), 404
        
        # Get segment members
        members = get_segment_members(campaign['segment_id'])
        
        # Format campaign
        formatted_campaign = {
            'id': campaign['id'],
            'segment_id': campaign['segment_id'],
            'segment_name': campaign['segment_name'],
            'name': campaign['name'],
            'description': campaign['description'],
            'email_template': campaign['email_template'],
            'discount_percentage': campaign['discount_percentage'],
            'created_at': campaign['created_at'].isoformat() if campaign['created_at'] else None,
            'updated_at': campaign['updated_at'].isoformat() if campaign['updated_at'] else None,
            'start_date': campaign['start_date'].isoformat() if campaign['start_date'] else None,
            'end_date': campaign['end_date'].isoformat() if campaign['end_date'] else None,
            'active': campaign['active'],
            'member_count': len(members)
        }
        
        return jsonify({
            'success': True,
            'campaign': formatted_campaign
        }), 200
    
    except Exception as e:
        current_app.logger.error(f"Error getting campaign: {str(e)}")
        return jsonify({'error': 'Failed to get campaign'}), 500
    
    finally:
        cursor.close()
        conn.close()

@segmentation_bp.route('/campaigns/<int:campaign_id>', methods=['PUT'])
@token_required
@admin_required
def update_campaign(campaign_id):
    """Update a campaign"""
    data = request.get_json()
    
    if not data:
        return jsonify({'error': 'Missing request data'}), 400
    
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        # Check if campaign exists
        cursor.execute(
            """
            SELECT * FROM segment_campaigns
            WHERE id = %s
            """,
            (campaign_id,)
        )
        
        campaign = cursor.fetchone()
        
        if not campaign:
            return jsonify({'error': 'Campaign not found'}), 404
        
        # Verify segment exists if changing
        if 'segment_id' in data:
            segment = get_segment_by_id(data['segment_id'])
            
            if not segment:
                return jsonify({'error': 'Segment not found'}), 404
        
        # Update campaign
        update_fields = []
        params = []
        
        if 'segment_id' in data:
            update_fields.append("segment_id = %s")
            params.append(data['segment_id'])
        
        if 'name' in data:
            update_fields.append("name = %s")
            params.append(data['name'])
        
        if 'description' in data:
            update_fields.append("description = %s")
            params.append(data['description'])
        
        if 'email_template' in data:
            update_fields.append("email_template = %s")
            params.append(data['email_template'])
        
        if 'discount_percentage' in data:
            update_fields.append("discount_percentage = %s")
            params.append(data['discount_percentage'])
        
        if 'start_date' in data:
            if data['start_date']:
                start_date = datetime.fromisoformat(data['start_date'].replace('Z', '+00:00'))
                update_fields.append("start_date = %s")
                params.append(start_date)
            else:
                update_fields.append("start_date = NULL")
        
        if 'end_date' in data:
            if data['end_date']:
                end_date = datetime.fromisoformat(data['end_date'].replace('Z', '+00:00'))
                update_fields.append("end_date = %s")
                params.append(end_date)
            else:
                update_fields.append("end_date = NULL")
        
        if 'active' in data:
            update_fields.append("active = %s")
            params.append(data['active'])
        
        if not update_fields:
            return jsonify({'error': 'No fields to update'}), 400
        
        # Add campaign ID to params
        params.append(campaign_id)
        
        # Execute update
        cursor.execute(
            f"""
            UPDATE segment_campaigns
            SET {', '.join(update_fields)}
            WHERE id = %s
            """,
            params
        )
        
        conn.commit()
        
        return jsonify({
            'success': True,
            'message': 'Campaign updated successfully'
        }), 200
    
    except Exception as e:
        conn.rollback()
        current_app.logger.error(f"Error updating campaign: {str(e)}")
        return jsonify({'error': 'Failed to update campaign'}), 500
    
    finally:
        cursor.close()
        conn.close()

@segmentation_bp.route('/campaigns/<int:campaign_id>', methods=['DELETE'])
@token_required
@admin_required
def delete_campaign(campaign_id):
    """Delete a campaign"""
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        # Check if campaign exists
        cursor.execute(
            """
            SELECT * FROM segment_campaigns
            WHERE id = %s
            """,
            (campaign_id,)
        )
        
        campaign = cursor.fetchone()
        
        if not campaign:
            return jsonify({'error': 'Campaign not found'}), 404
        
        # Delete campaign
        cursor.execute(
            """
            DELETE FROM segment_campaigns
            WHERE id = %s
            """,
            (campaign_id,)
        )
        
        conn.commit()
        
        return jsonify({
            'success': True,
            'message': 'Campaign deleted successfully'
        }), 200
    
    except Exception as e:
        conn.rollback()
        current_app.logger.error(f"Error deleting campaign: {str(e)}")
        return jsonify({'error': 'Failed to delete campaign'}), 500
    
    finally:
        cursor.close()
        conn.close()

@segmentation_bp.route('/campaigns/<int:campaign_id>/execute', methods=['POST'])
@token_required
@admin_required
def execute_campaign(campaign_id):
    """Execute a campaign by sending emails to segment members"""
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        # Get campaign
        cursor.execute(
            """
            SELECT c.*, s.name as segment_name
            FROM segment_campaigns c
            JOIN customer_segments s ON c.segment_id = s.id
            WHERE c.id = %s
            """,
            (campaign_id,)
        )
        
        campaign = cursor.fetchone()
        
        if not campaign:
            return jsonify({'error': 'Campaign not found'}), 404
        
        # Check if campaign is active
        if not campaign['active']:
            return jsonify({'error': 'Campaign is not active'}), 400
        
        # Check campaign dates
        now = datetime.now()
        
        if campaign['start_date'] and campaign['start_date'] > now:
            return jsonify({'error': 'Campaign has not started yet'}), 400
        
        if campaign['end_date'] and campaign['end_date'] < now:
            return jsonify({'error': 'Campaign has already ended'}), 400
        
        # Get segment members
        members = get_segment_members(campaign['segment_id'])
        
        if not members:
            return jsonify({'error': 'No members in segment'}), 400
        
        # Send emails to members
        success_count = 0
        failed_count = 0
        
        for member in members:
            # Check if member has abandoned cart
            cursor.execute(
                """
                SELECT * FROM abandoned_carts
                WHERE user_id = %s AND recovered = FALSE
                ORDER BY created_at DESC
                LIMIT 1
                """,
                (member['user_id'],)
            )
            
            cart = cursor.fetchone()
            
            if not cart:
                continue
            
            # Import send_abandoned_cart_email function
            from ..abandoned_carts.routes import send_abandoned_cart_email
            
            # Send email
            success = send_abandoned_cart_email(
                cart['id'],
                member['email'],
                member['first_name'],
                include_discount=campaign['discount_percentage'] > 0
            )
            
            if success:
                success_count += 1
            else:
                failed_count += 1
        
        return jsonify({
            'success': True,
            'message': f'Campaign executed successfully. Sent {success_count} emails ({failed_count} failed)',
            'details': {
                'success_count': success_count,
                'failed_count': failed_count,
                'total_members': len(members)
            }
        }), 200
    
    except Exception as e:
        current_app.logger.error(f"Error executing campaign: {str(e)}")
        return jsonify({'error': f'Failed to execute campaign: {str(e)}'}), 500
    
    finally:
        cursor.close()
        conn.close()
