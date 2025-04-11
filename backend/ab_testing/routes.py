"""
Routes for A/B testing functionality.
"""

import json
from datetime import datetime
from flask import request, jsonify, current_app

from . import ab_testing_bp
from ..utils.db import get_db_connection
from ..utils.auth import token_required, admin_required, get_user_id_from_token

# API Routes

@ab_testing_bp.route('/campaigns', methods=['GET'])
@token_required
@admin_required
def list_campaigns():
    """List all A/B test campaigns"""
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    try:
        # Get query parameters
        status = request.args.get('status')

        # Build query
        query = """
            SELECT c.*, s.name as segment_name,
                   (SELECT COUNT(*) FROM ab_test_variants WHERE campaign_id = c.id) as variant_count
            FROM ab_test_campaigns c
            LEFT JOIN customer_segments s ON c.segment_id = s.id
        """

        params = []

        # Add filters
        if status:
            query += " WHERE c.status = %s"
            params.append(status)

        query += " ORDER BY c.created_at DESC"

        # Execute query
        cursor.execute(query, params)
        campaigns = cursor.fetchall()

        # Format results
        formatted_campaigns = []
        for campaign in campaigns:
            formatted_campaigns.append({
                'id': campaign['id'],
                'name': campaign['name'],
                'description': campaign['description'],
                'created_at': campaign['created_at'].isoformat() if campaign['created_at'] else None,
                'updated_at': campaign['updated_at'].isoformat() if campaign['updated_at'] else None,
                'start_date': campaign['start_date'].isoformat() if campaign['start_date'] else None,
                'end_date': campaign['end_date'].isoformat() if campaign['end_date'] else None,
                'segment_id': campaign['segment_id'],
                'segment_name': campaign['segment_name'],
                'status': campaign['status'],
                'winner_variant_id': campaign['winner_variant_id'],
                'variant_count': campaign['variant_count']
            })

        return jsonify({
            'success': True,
            'campaigns': formatted_campaigns
        }), 200

    except Exception as e:
        current_app.logger.error(f"Error listing A/B test campaigns: {str(e)}")
        return jsonify({'error': 'Failed to list campaigns'}), 500

    finally:
        cursor.close()
        conn.close()

@ab_testing_bp.route('/campaigns', methods=['POST'])
@token_required
@admin_required
def create_campaign():
    """Create a new A/B test campaign"""
    data = request.get_json()

    if not data or 'name' not in data:
        return jsonify({'error': 'Missing required fields'}), 400

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
            INSERT INTO ab_test_campaigns (
                name, description, start_date, end_date, segment_id, status
            )
            VALUES (%s, %s, %s, %s, %s, %s)
            """,
            (
                data['name'],
                data.get('description', ''),
                start_date,
                end_date,
                data.get('segment_id'),
                data.get('status', 'draft')
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
        current_app.logger.error(f"Error creating A/B test campaign: {str(e)}")
        return jsonify({'error': 'Failed to create campaign'}), 500

    finally:
        cursor.close()
        conn.close()

@ab_testing_bp.route('/campaigns/<int:campaign_id>', methods=['GET'])
@token_required
@admin_required
def get_campaign(campaign_id):
    """Get an A/B test campaign by ID"""
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    try:
        # Get campaign
        cursor.execute(
            """
            SELECT c.*, s.name as segment_name
            FROM ab_test_campaigns c
            LEFT JOIN customer_segments s ON c.segment_id = s.id
            WHERE c.id = %s
            """,
            (campaign_id,)
        )

        campaign = cursor.fetchone()

        if not campaign:
            return jsonify({'error': 'Campaign not found'}), 404

        # Get variants
        cursor.execute(
            """
            SELECT v.*
            FROM ab_test_variants v
            WHERE v.campaign_id = %s
            """,
            (campaign_id,)
        )

        variants = cursor.fetchall()

        # Format campaign
        formatted_campaign = {
            'id': campaign['id'],
            'name': campaign['name'],
            'description': campaign['description'],
            'created_at': campaign['created_at'].isoformat() if campaign['created_at'] else None,
            'updated_at': campaign['updated_at'].isoformat() if campaign['updated_at'] else None,
            'start_date': campaign['start_date'].isoformat() if campaign['start_date'] else None,
            'end_date': campaign['end_date'].isoformat() if campaign['end_date'] else None,
            'segment_id': campaign['segment_id'],
            'segment_name': campaign['segment_name'],
            'status': campaign['status'],
            'winner_variant_id': campaign['winner_variant_id']
        }

        # Format variants
        formatted_variants = []
        for variant in variants:
            formatted_variants.append({
                'id': variant['id'],
                'name': variant['name'],
                'email_template': variant['email_template'],
                'subject_line': variant['subject_line'],
                'discount_percentage': variant['discount_percentage'],
                'discount_type': variant['discount_type'],
                'created_at': variant['created_at'].isoformat() if variant['created_at'] else None,
                'traffic_allocation': variant['traffic_allocation']
            })

        return jsonify({
            'success': True,
            'campaign': formatted_campaign,
            'variants': formatted_variants
        }), 200

    except Exception as e:
        current_app.logger.error(f"Error getting A/B test campaign: {str(e)}")
        return jsonify({'error': 'Failed to get campaign'}), 500

    finally:
        cursor.close()
        conn.close()

@ab_testing_bp.route('/campaigns/<int:campaign_id>', methods=['PUT'])
@token_required
@admin_required
def update_campaign(campaign_id):
    """Update an A/B test campaign"""
    data = request.get_json()

    if not data:
        return jsonify({'error': 'Missing request data'}), 400

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    try:
        # Check if campaign exists
        cursor.execute(
            """
            SELECT * FROM ab_test_campaigns
            WHERE id = %s
            """,
            (campaign_id,)
        )

        campaign = cursor.fetchone()

        if not campaign:
            return jsonify({'error': 'Campaign not found'}), 404

        # Update campaign
        update_fields = []
        params = []

        if 'name' in data:
            update_fields.append("name = %s")
            params.append(data['name'])

        if 'description' in data:
            update_fields.append("description = %s")
            params.append(data['description'])

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

        if 'segment_id' in data:
            update_fields.append("segment_id = %s")
            params.append(data['segment_id'])

        if 'status' in data:
            update_fields.append("status = %s")
            params.append(data['status'])

        if 'winner_variant_id' in data:
            update_fields.append("winner_variant_id = %s")
            params.append(data['winner_variant_id'])

        if not update_fields:
            return jsonify({'error': 'No fields to update'}), 400

        # Add campaign ID to params
        params.append(campaign_id)

        # Execute update
        cursor.execute(
            f"""
            UPDATE ab_test_campaigns
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
        current_app.logger.error(f"Error updating A/B test campaign: {str(e)}")
        return jsonify({'error': 'Failed to update campaign'}), 500

    finally:
        cursor.close()
        conn.close()

@ab_testing_bp.route('/campaigns/<int:campaign_id>', methods=['DELETE'])
@token_required
@admin_required
def delete_campaign(campaign_id):
    """Delete an A/B test campaign"""
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        # Delete campaign (cascade will delete variants and results)
        cursor.execute(
            """
            DELETE FROM ab_test_campaigns
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
        current_app.logger.error(f"Error deleting A/B test campaign: {str(e)}")
        return jsonify({'error': 'Failed to delete campaign'}), 500

    finally:
        cursor.close()
        conn.close()


@ab_testing_bp.route('/campaigns/<int:campaign_id>/variants', methods=['POST'])
@token_required
@admin_required
def create_variant(campaign_id):
    """Create a new variant for an A/B test campaign"""
    data = request.get_json()

    if not data or 'name' not in data or 'email_template' not in data or 'subject_line' not in data:
        return jsonify({'error': 'Missing required fields'}), 400

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    try:
        # Check if campaign exists
        cursor.execute(
            """
            SELECT * FROM ab_test_campaigns
            WHERE id = %s
            """,
            (campaign_id,)
        )

        campaign = cursor.fetchone()

        if not campaign:
            return jsonify({'error': 'Campaign not found'}), 404

        # Insert variant
        cursor.execute(
            """
            INSERT INTO ab_test_variants (
                campaign_id, name, email_template, subject_line,
                discount_percentage, discount_type, traffic_allocation
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            """,
            (
                campaign_id,
                data['name'],
                data['email_template'],
                data['subject_line'],
                data.get('discount_percentage', 0),
                data.get('discount_type', 'percentage'),
                data.get('traffic_allocation', 50)
            )
        )

        variant_id = cursor.lastrowid

        # Create empty results record
        cursor.execute(
            """
            INSERT INTO ab_test_results (variant_id)
            VALUES (%s)
            """,
            (variant_id,)
        )

        conn.commit()

        return jsonify({
            'success': True,
            'variant_id': variant_id
        }), 201

    except Exception as e:
        conn.rollback()
        current_app.logger.error(f"Error creating variant: {str(e)}")
        return jsonify({'error': 'Failed to create variant'}), 500

    finally:
        cursor.close()
        conn.close()


@ab_testing_bp.route('/campaigns/<int:campaign_id>/variants/<int:variant_id>', methods=['PUT'])
@token_required
@admin_required
def update_variant(campaign_id, variant_id):
    """Update a variant"""
    data = request.get_json()

    if not data:
        return jsonify({'error': 'Missing request data'}), 400

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    try:
        # Check if variant exists and belongs to the campaign
        cursor.execute(
            """
            SELECT * FROM ab_test_variants
            WHERE id = %s AND campaign_id = %s
            """,
            (variant_id, campaign_id)
        )

        variant = cursor.fetchone()

        if not variant:
            return jsonify({'error': 'Variant not found or does not belong to the campaign'}), 404

        # Update variant
        update_fields = []
        params = []

        if 'name' in data:
            update_fields.append("name = %s")
            params.append(data['name'])

        if 'email_template' in data:
            update_fields.append("email_template = %s")
            params.append(data['email_template'])

        if 'subject_line' in data:
            update_fields.append("subject_line = %s")
            params.append(data['subject_line'])

        if 'discount_percentage' in data:
            update_fields.append("discount_percentage = %s")
            params.append(data['discount_percentage'])

        if 'discount_type' in data:
            update_fields.append("discount_type = %s")
            params.append(data['discount_type'])

        if 'traffic_allocation' in data:
            update_fields.append("traffic_allocation = %s")
            params.append(data['traffic_allocation'])

        if not update_fields:
            return jsonify({'error': 'No fields to update'}), 400

        # Add variant ID to params
        params.append(variant_id)

        # Execute update
        cursor.execute(
            f"""
            UPDATE ab_test_variants
            SET {', '.join(update_fields)}
            WHERE id = %s
            """,
            params
        )

        conn.commit()

        return jsonify({
            'success': True,
            'message': 'Variant updated successfully'
        }), 200

    except Exception as e:
        conn.rollback()
        current_app.logger.error(f"Error updating variant: {str(e)}")
        return jsonify({'error': 'Failed to update variant'}), 500

    finally:
        cursor.close()
        conn.close()


@ab_testing_bp.route('/campaigns/<int:campaign_id>/variants/<int:variant_id>', methods=['DELETE'])
@token_required
@admin_required
def delete_variant(campaign_id, variant_id):
    """Delete a variant"""
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    try:
        # Check if variant exists and belongs to the campaign
        cursor.execute(
            """
            SELECT * FROM ab_test_variants
            WHERE id = %s AND campaign_id = %s
            """,
            (variant_id, campaign_id)
        )

        variant = cursor.fetchone()

        if not variant:
            return jsonify({'error': 'Variant not found or does not belong to the campaign'}), 404

        # Delete variant (cascade will delete results and events)
        cursor.execute(
            """
            DELETE FROM ab_test_variants
            WHERE id = %s
            """,
            (variant_id,)
        )

        conn.commit()

        return jsonify({
            'success': True,
            'message': 'Variant deleted successfully'
        }), 200

    except Exception as e:
        conn.rollback()
        current_app.logger.error(f"Error deleting variant: {str(e)}")
        return jsonify({'error': 'Failed to delete variant'}), 500

    finally:
        cursor.close()
        conn.close()


@ab_testing_bp.route('/campaigns/<int:campaign_id>/results', methods=['GET'])
@token_required
@admin_required
def get_campaign_results(campaign_id):
    """Get results for an A/B test campaign"""
    from .tracking import get_campaign_results as fetch_results

    results = fetch_results(campaign_id)

    if not results:
        return jsonify({'error': 'Campaign not found or no results available'}), 404

    return jsonify({
        'success': True,
        'results': results
    }), 200


@ab_testing_bp.route('/campaigns/<int:campaign_id>/determine-winner', methods=['POST'])
@token_required
@admin_required
def determine_campaign_winner(campaign_id):
    """Determine the winner of an A/B test campaign"""
    data = request.get_json() or {}
    metric = data.get('metric', 'conversion_rate')

    from .tracking import determine_winner

    winner_id = determine_winner(campaign_id, metric)

    if not winner_id:
        return jsonify({'error': 'Could not determine a winner'}), 400

    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        # Update campaign with winner
        cursor.execute(
            """
            UPDATE ab_test_campaigns
            SET winner_variant_id = %s, status = 'completed'
            WHERE id = %s
            """,
            (winner_id, campaign_id)
        )

        conn.commit()

        return jsonify({
            'success': True,
            'winner_id': winner_id
        }), 200

    except Exception as e:
        conn.rollback()
        current_app.logger.error(f"Error setting winner: {str(e)}")
        return jsonify({'error': 'Failed to set winner'}), 500

    finally:
        cursor.close()
        conn.close()