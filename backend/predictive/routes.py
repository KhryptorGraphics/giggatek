"""
Routes for predictive analytics functionality.
"""

import json
from datetime import datetime
from flask import request, jsonify, current_app

from . import predictive_bp
from ..utils.db import get_db_connection
from ..utils.auth import token_required, admin_required, get_user_id_from_token
from .models import predict_recovery_likelihood, train_model, extract_features

# API Routes

@predictive_bp.route('/models', methods=['GET'])
@token_required
@admin_required
def list_models():
    """List all predictive models"""
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        # Get query parameters
        active_only = request.args.get('active', 'true').lower() == 'true'
        model_type = request.args.get('model_type')
        
        # Build query
        query = """
            SELECT *
            FROM predictive_models
        """
        
        params = []
        where_clauses = []
        
        if active_only:
            where_clauses.append("active = TRUE")
        
        if model_type:
            where_clauses.append("model_type = %s")
            params.append(model_type)
        
        if where_clauses:
            query += " WHERE " + " AND ".join(where_clauses)
        
        query += " ORDER BY name ASC"
        
        # Execute query
        cursor.execute(query, params)
        models = cursor.fetchall()
        
        # Format results
        formatted_models = []
        for model in models:
            formatted_models.append({
                'id': model['id'],
                'name': model['name'],
                'description': model['description'],
                'model_type': model['model_type'],
                'features': json.loads(model['features']),
                'parameters': json.loads(model['parameters']),
                'created_at': model['created_at'].isoformat() if model['created_at'] else None,
                'updated_at': model['updated_at'].isoformat() if model['updated_at'] else None,
                'last_trained_at': model['last_trained_at'].isoformat() if model['last_trained_at'] else None,
                'active': model['active'],
                'accuracy': model['accuracy']
            })
        
        return jsonify({
            'success': True,
            'models': formatted_models
        }), 200
    
    except Exception as e:
        current_app.logger.error(f"Error listing models: {str(e)}")
        return jsonify({'error': 'Failed to list models'}), 500
    
    finally:
        cursor.close()
        conn.close()

@predictive_bp.route('/models', methods=['POST'])
@token_required
@admin_required
def create_model():
    """Create a new predictive model"""
    data = request.get_json()
    
    if not data or 'name' not in data or 'model_type' not in data:
        return jsonify({'error': 'Missing required fields'}), 400
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # Check if model with same name already exists
        cursor.execute(
            """
            SELECT id FROM predictive_models
            WHERE name = %s
            """,
            (data['name'],)
        )
        
        if cursor.fetchone():
            return jsonify({'error': 'Model with this name already exists'}), 400
        
        # Insert model
        cursor.execute(
            """
            INSERT INTO predictive_models (
                name, description, model_type, features, parameters, active
            )
            VALUES (%s, %s, %s, %s, %s, %s)
            """,
            (
                data['name'],
                data.get('description', ''),
                data['model_type'],
                json.dumps(data.get('features', [])),
                json.dumps(data.get('parameters', {})),
                data.get('active', True)
            )
        )
        
        model_id = cursor.lastrowid
        conn.commit()
        
        return jsonify({
            'success': True,
            'model_id': model_id
        }), 201
    
    except Exception as e:
        conn.rollback()
        current_app.logger.error(f"Error creating model: {str(e)}")
        return jsonify({'error': 'Failed to create model'}), 500
    
    finally:
        cursor.close()
        conn.close()

@predictive_bp.route('/models/<int:model_id>', methods=['GET'])
@token_required
@admin_required
def get_model(model_id):
    """Get a predictive model by ID"""
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        # Get model
        cursor.execute(
            """
            SELECT *
            FROM predictive_models
            WHERE id = %s
            """,
            (model_id,)
        )
        
        model = cursor.fetchone()
        
        if not model:
            return jsonify({'error': 'Model not found'}), 404
        
        # Format model
        formatted_model = {
            'id': model['id'],
            'name': model['name'],
            'description': model['description'],
            'model_type': model['model_type'],
            'features': json.loads(model['features']),
            'parameters': json.loads(model['parameters']),
            'created_at': model['created_at'].isoformat() if model['created_at'] else None,
            'updated_at': model['updated_at'].isoformat() if model['updated_at'] else None,
            'last_trained_at': model['last_trained_at'].isoformat() if model['last_trained_at'] else None,
            'active': model['active'],
            'accuracy': model['accuracy']
        }
        
        # Get training logs
        cursor.execute(
            """
            SELECT *
            FROM predictive_training_logs
            WHERE model_id = %s
            ORDER BY started_at DESC
            LIMIT 10
            """,
            (model_id,)
        )
        
        logs = cursor.fetchall()
        
        # Format logs
        formatted_logs = []
        for log in logs:
            formatted_logs.append({
                'id': log['id'],
                'training_data_count': log['training_data_count'],
                'validation_data_count': log['validation_data_count'],
                'accuracy': log['accuracy'],
                'precision_score': log['precision_score'],
                'recall_score': log['recall_score'],
                'f1_score': log['f1_score'],
                'training_duration_seconds': log['training_duration_seconds'],
                'parameters': json.loads(log['parameters']) if log['parameters'] else None,
                'error_message': log['error_message'],
                'started_at': log['started_at'].isoformat() if log['started_at'] else None,
                'completed_at': log['completed_at'].isoformat() if log['completed_at'] else None
            })
        
        return jsonify({
            'success': True,
            'model': formatted_model,
            'training_logs': formatted_logs
        }), 200
    
    except Exception as e:
        current_app.logger.error(f"Error getting model: {str(e)}")
        return jsonify({'error': 'Failed to get model'}), 500
    
    finally:
        cursor.close()
        conn.close()

@predictive_bp.route('/models/<int:model_id>', methods=['PUT'])
@token_required
@admin_required
def update_model(model_id):
    """Update a predictive model"""
    data = request.get_json()
    
    if not data:
        return jsonify({'error': 'Missing request data'}), 400
    
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        # Check if model exists
        cursor.execute(
            """
            SELECT * FROM predictive_models
            WHERE id = %s
            """,
            (model_id,)
        )
        
        model = cursor.fetchone()
        
        if not model:
            return jsonify({'error': 'Model not found'}), 404
        
        # Update model
        update_fields = []
        params = []
        
        if 'name' in data:
            # Check if name is already taken by another model
            cursor.execute(
                """
                SELECT id FROM predictive_models
                WHERE name = %s AND id != %s
                """,
                (data['name'], model_id)
            )
            
            if cursor.fetchone():
                return jsonify({'error': 'Model with this name already exists'}), 400
            
            update_fields.append("name = %s")
            params.append(data['name'])
        
        if 'description' in data:
            update_fields.append("description = %s")
            params.append(data['description'])
        
        if 'model_type' in data:
            update_fields.append("model_type = %s")
            params.append(data['model_type'])
        
        if 'features' in data:
            update_fields.append("features = %s")
            params.append(json.dumps(data['features']))
        
        if 'parameters' in data:
            update_fields.append("parameters = %s")
            params.append(json.dumps(data['parameters']))
        
        if 'active' in data:
            update_fields.append("active = %s")
            params.append(data['active'])
        
        if not update_fields:
            return jsonify({'error': 'No fields to update'}), 400
        
        # Add model ID to params
        params.append(model_id)
        
        # Execute update
        cursor.execute(
            f"""
            UPDATE predictive_models
            SET {', '.join(update_fields)}
            WHERE id = %s
            """,
            params
        )
        
        conn.commit()
        
        return jsonify({
            'success': True,
            'message': 'Model updated successfully'
        }), 200
    
    except Exception as e:
        conn.rollback()
        current_app.logger.error(f"Error updating model: {str(e)}")
        return jsonify({'error': 'Failed to update model'}), 500
    
    finally:
        cursor.close()
        conn.close()

@predictive_bp.route('/models/<int:model_id>', methods=['DELETE'])
@token_required
@admin_required
def delete_model(model_id):
    """Delete a predictive model"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # Check if model exists
        cursor.execute(
            """
            SELECT * FROM predictive_models
            WHERE id = %s
            """,
            (model_id,)
        )
        
        if not cursor.fetchone():
            return jsonify({'error': 'Model not found'}), 404
        
        # Delete model (cascade will delete related records)
        cursor.execute(
            """
            DELETE FROM predictive_models
            WHERE id = %s
            """,
            (model_id,)
        )
        
        conn.commit()
        
        return jsonify({
            'success': True,
            'message': 'Model deleted successfully'
        }), 200
    
    except Exception as e:
        conn.rollback()
        current_app.logger.error(f"Error deleting model: {str(e)}")
        return jsonify({'error': 'Failed to delete model'}), 500
    
    finally:
        cursor.close()
        conn.close()

@predictive_bp.route('/models/<int:model_id>/train', methods=['POST'])
@token_required
@admin_required
def train_model_endpoint(model_id):
    """Train a predictive model"""
    data = request.get_json() or {}
    
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        # Get model
        cursor.execute(
            """
            SELECT * FROM predictive_models
            WHERE id = %s
            """,
            (model_id,)
        )
        
        model = cursor.fetchone()
        
        if not model:
            return jsonify({'error': 'Model not found'}), 404
        
        # Create training log
        cursor.execute(
            """
            INSERT INTO predictive_training_logs (
                model_id, training_data_count, validation_data_count, parameters
            )
            VALUES (%s, %s, %s, %s)
            """,
            (
                model_id,
                0,  # Will be updated after training
                0,  # Will be updated after training
                json.dumps(data.get('parameters', {}))
            )
        )
        
        log_id = cursor.lastrowid
        conn.commit()
        
        # Start training (this would typically be done asynchronously)
        # For now, we'll just return a success message
        
        return jsonify({
            'success': True,
            'message': 'Model training started',
            'log_id': log_id
        }), 200
    
    except Exception as e:
        conn.rollback()
        current_app.logger.error(f"Error starting model training: {str(e)}")
        return jsonify({'error': 'Failed to start model training'}), 500
    
    finally:
        cursor.close()
        conn.close()

@predictive_bp.route('/predict/<int:cart_id>', methods=['GET'])
@token_required
@admin_required
def predict_cart_recovery(cart_id):
    """Predict recovery likelihood for a cart"""
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        # Get cart
        cursor.execute(
            """
            SELECT * FROM abandoned_carts
            WHERE id = %s
            """,
            (cart_id,)
        )
        
        cart = cursor.fetchone()
        
        if not cart:
            return jsonify({'error': 'Cart not found'}), 404
        
        # Get active models
        cursor.execute(
            """
            SELECT * FROM predictive_models
            WHERE active = TRUE
            """
        )
        
        models = cursor.fetchall()
        
        if not models:
            return jsonify({'error': 'No active models found'}), 404
        
        # Get or extract features
        cursor.execute(
            """
            SELECT * FROM predictive_features
            WHERE cart_id = %s
            """,
            (cart_id,)
        )
        
        features = cursor.fetchone()
        
        if not features:
            # Extract features
            features = extract_features(cart)
            
            # Save features
            cursor.execute(
                """
                INSERT INTO predictive_features (
                    cart_id, user_id, email, cart_value, item_count,
                    has_previous_purchase, previous_purchase_count, previous_purchase_value,
                    days_since_last_purchase, visit_count, time_spent_seconds,
                    device_type, browser, referrer, utm_source, utm_medium, utm_campaign,
                    country, region, city
                )
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                """,
                (
                    cart_id,
                    features.get('user_id'),
                    features.get('email'),
                    features.get('cart_value', 0),
                    features.get('item_count', 0),
                    features.get('has_previous_purchase', False),
                    features.get('previous_purchase_count', 0),
                    features.get('previous_purchase_value', 0),
                    features.get('days_since_last_purchase'),
                    features.get('visit_count', 0),
                    features.get('time_spent_seconds', 0),
                    features.get('device_type'),
                    features.get('browser'),
                    features.get('referrer'),
                    features.get('utm_source'),
                    features.get('utm_medium'),
                    features.get('utm_campaign'),
                    features.get('country'),
                    features.get('region'),
                    features.get('city')
                )
            )
            
            conn.commit()
        
        # Make predictions
        predictions = []
        
        for model in models:
            # Check if prediction already exists
            cursor.execute(
                """
                SELECT * FROM predictive_scores
                WHERE cart_id = %s AND model_id = %s
                """,
                (cart_id, model['id'])
            )
            
            existing_prediction = cursor.fetchone()
            
            if existing_prediction:
                # Use existing prediction
                prediction = {
                    'model_id': existing_prediction['model_id'],
                    'model_name': model['name'],
                    'model_type': model['model_type'],
                    'score': existing_prediction['score'],
                    'confidence': existing_prediction['confidence'],
                    'explanation': json.loads(existing_prediction['explanation']) if existing_prediction['explanation'] else None,
                    'created_at': existing_prediction['created_at'].isoformat() if existing_prediction['created_at'] else None
                }
            else:
                # Make new prediction
                model_features = json.loads(model['features'])
                model_parameters = json.loads(model['parameters'])
                
                prediction_result = predict_recovery_likelihood(features, model_features, model_parameters)
                
                # Save prediction
                cursor.execute(
                    """
                    INSERT INTO predictive_scores (
                        cart_id, model_id, score, confidence, explanation
                    )
                    VALUES (%s, %s, %s, %s, %s)
                    """,
                    (
                        cart_id,
                        model['id'],
                        prediction_result['score'],
                        prediction_result.get('confidence'),
                        json.dumps(prediction_result.get('explanation'))
                    )
                )
                
                conn.commit()
                
                prediction = {
                    'model_id': model['id'],
                    'model_name': model['name'],
                    'model_type': model['model_type'],
                    'score': prediction_result['score'],
                    'confidence': prediction_result.get('confidence'),
                    'explanation': prediction_result.get('explanation'),
                    'created_at': datetime.now().isoformat()
                }
            
            predictions.append(prediction)
        
        # Get recommendations
        cursor.execute(
            """
            SELECT * FROM predictive_recommendations
            WHERE cart_id = %s
            ORDER BY created_at DESC
            LIMIT 1
            """,
            (cart_id,)
        )
        
        recommendation = cursor.fetchone()
        
        formatted_recommendation = None
        if recommendation:
            formatted_recommendation = {
                'id': recommendation['id'],
                'recommended_action': recommendation['recommended_action'],
                'discount_percentage': recommendation['discount_percentage'],
                'priority': recommendation['priority'],
                'explanation': recommendation['explanation'],
                'applied': recommendation['applied'],
                'result': recommendation['result'],
                'created_at': recommendation['created_at'].isoformat() if recommendation['created_at'] else None,
                'applied_at': recommendation['applied_at'].isoformat() if recommendation['applied_at'] else None
            }
        
        return jsonify({
            'success': True,
            'cart_id': cart_id,
            'predictions': predictions,
            'recommendation': formatted_recommendation
        }), 200
    
    except Exception as e:
        current_app.logger.error(f"Error predicting cart recovery: {str(e)}")
        return jsonify({'error': f'Failed to predict cart recovery: {str(e)}'}), 500
    
    finally:
        cursor.close()
        conn.close()

@predictive_bp.route('/recommendations', methods=['GET'])
@token_required
@admin_required
def list_recommendations():
    """List recommendations"""
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        # Get query parameters
        applied = request.args.get('applied')
        action = request.args.get('action')
        limit = int(request.args.get('limit', 50))
        
        # Build query
        query = """
            SELECT r.*, ac.email, ac.cart_data
            FROM predictive_recommendations r
            JOIN abandoned_carts ac ON r.cart_id = ac.id
        """
        
        params = []
        where_clauses = []
        
        if applied is not None:
            where_clauses.append("r.applied = %s")
            params.append(applied.lower() == 'true')
        
        if action:
            where_clauses.append("r.recommended_action = %s")
            params.append(action)
        
        if where_clauses:
            query += " WHERE " + " AND ".join(where_clauses)
        
        query += " ORDER BY r.priority DESC, r.created_at DESC LIMIT %s"
        params.append(limit)
        
        # Execute query
        cursor.execute(query, params)
        recommendations = cursor.fetchall()
        
        # Format results
        formatted_recommendations = []
        for recommendation in recommendations:
            cart_data = json.loads(recommendation['cart_data'])
            
            formatted_recommendations.append({
                'id': recommendation['id'],
                'cart_id': recommendation['cart_id'],
                'email': recommendation['email'],
                'cart_value': cart_data.get('total', 0),
                'item_count': len(cart_data.get('items', [])),
                'recommended_action': recommendation['recommended_action'],
                'discount_percentage': recommendation['discount_percentage'],
                'priority': recommendation['priority'],
                'explanation': recommendation['explanation'],
                'applied': recommendation['applied'],
                'result': recommendation['result'],
                'created_at': recommendation['created_at'].isoformat() if recommendation['created_at'] else None,
                'applied_at': recommendation['applied_at'].isoformat() if recommendation['applied_at'] else None
            })
        
        return jsonify({
            'success': True,
            'recommendations': formatted_recommendations
        }), 200
    
    except Exception as e:
        current_app.logger.error(f"Error listing recommendations: {str(e)}")
        return jsonify({'error': 'Failed to list recommendations'}), 500
    
    finally:
        cursor.close()
        conn.close()

@predictive_bp.route('/recommendations/<int:recommendation_id>/apply', methods=['POST'])
@token_required
@admin_required
def apply_recommendation(recommendation_id):
    """Apply a recommendation"""
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        # Get recommendation
        cursor.execute(
            """
            SELECT r.*, ac.email, ac.cart_data
            FROM predictive_recommendations r
            JOIN abandoned_carts ac ON r.cart_id = ac.id
            WHERE r.id = %s
            """,
            (recommendation_id,)
        )
        
        recommendation = cursor.fetchone()
        
        if not recommendation:
            return jsonify({'error': 'Recommendation not found'}), 404
        
        if recommendation['applied']:
            return jsonify({'error': 'Recommendation already applied'}), 400
        
        # Apply recommendation
        result = 'pending'
        
        if recommendation['recommended_action'] == 'email':
            # Send email
            from ..abandoned_carts.routes import send_abandoned_cart_email
            
            success = send_abandoned_cart_email(
                recommendation['cart_id'],
                recommendation['email'],
                '',  # First name not available
                include_discount=False
            )
            
            result = 'success' if success else 'failure'
        
        elif recommendation['recommended_action'] == 'discount':
            # Send email with discount
            from ..abandoned_carts.routes import send_abandoned_cart_email
            
            success = send_abandoned_cart_email(
                recommendation['cart_id'],
                recommendation['email'],
                '',  # First name not available
                include_discount=True,
                discount_percentage=recommendation['discount_percentage']
            )
            
            result = 'success' if success else 'failure'
        
        # Update recommendation
        cursor.execute(
            """
            UPDATE predictive_recommendations
            SET applied = TRUE, result = %s, applied_at = NOW()
            WHERE id = %s
            """,
            (result, recommendation_id)
        )
        
        conn.commit()
        
        return jsonify({
            'success': True,
            'message': 'Recommendation applied successfully',
            'result': result
        }), 200
    
    except Exception as e:
        conn.rollback()
        current_app.logger.error(f"Error applying recommendation: {str(e)}")
        return jsonify({'error': 'Failed to apply recommendation'}), 500
    
    finally:
        cursor.close()
        conn.close()

@predictive_bp.route('/stats', methods=['GET'])
@token_required
@admin_required
def get_stats():
    """Get predictive analytics stats"""
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        stats = {}
        
        # Get model stats
        cursor.execute(
            """
            SELECT 
                COUNT(*) as total_models,
                SUM(CASE WHEN active = TRUE THEN 1 ELSE 0 END) as active_models,
                AVG(accuracy) as avg_accuracy
            FROM predictive_models
            """
        )
        
        model_stats = cursor.fetchone()
        stats['models'] = {
            'total': model_stats['total_models'],
            'active': model_stats['active_models'],
            'avg_accuracy': model_stats['avg_accuracy']
        }
        
        # Get prediction stats
        cursor.execute(
            """
            SELECT 
                COUNT(*) as total_predictions,
                AVG(score) as avg_score,
                AVG(confidence) as avg_confidence
            FROM predictive_scores
            """
        )
        
        prediction_stats = cursor.fetchone()
        stats['predictions'] = {
            'total': prediction_stats['total_predictions'],
            'avg_score': prediction_stats['avg_score'],
            'avg_confidence': prediction_stats['avg_confidence']
        }
        
        # Get recommendation stats
        cursor.execute(
            """
            SELECT 
                COUNT(*) as total_recommendations,
                SUM(CASE WHEN applied = TRUE THEN 1 ELSE 0 END) as applied_recommendations,
                SUM(CASE WHEN result = 'success' THEN 1 ELSE 0 END) as successful_recommendations
            FROM predictive_recommendations
            """
        )
        
        recommendation_stats = cursor.fetchone()
        stats['recommendations'] = {
            'total': recommendation_stats['total_recommendations'],
            'applied': recommendation_stats['applied_recommendations'],
            'successful': recommendation_stats['successful_recommendations']
        }
        
        # Get action distribution
        cursor.execute(
            """
            SELECT 
                recommended_action,
                COUNT(*) as count
            FROM predictive_recommendations
            GROUP BY recommended_action
            """
        )
        
        action_distribution = cursor.fetchall()
        stats['action_distribution'] = {item['recommended_action']: item['count'] for item in action_distribution}
        
        return jsonify({
            'success': True,
            'stats': stats
        }), 200
    
    except Exception as e:
        current_app.logger.error(f"Error getting stats: {str(e)}")
        return jsonify({'error': 'Failed to get stats'}), 500
    
    finally:
        cursor.close()
        conn.close()
