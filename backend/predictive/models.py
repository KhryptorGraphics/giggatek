"""
Predictive models implementation.
"""

import json
import math
import random
from datetime import datetime, timedelta
from flask import current_app

from ..utils.db import get_db_connection

def extract_features(cart):
    """
    Extract features from a cart for prediction.
    
    In a real implementation, this would extract meaningful features from the cart,
    user behavior, and other data sources. For this example, we'll use a simplified
    approach with some basic features.
    
    Args:
        cart (dict): The abandoned cart data.
        
    Returns:
        dict: A dictionary of features.
    """
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        # Parse cart data
        cart_data = json.loads(cart.get('cart_data', '{}'))
        user_id = cart.get('user_id')
        email = cart.get('email')
        
        # Basic cart features
        features = {
            'user_id': user_id,
            'email': email,
            'cart_value': float(cart_data.get('total', 0)),
            'item_count': len(cart_data.get('items', [])),
            'has_previous_purchase': False,
            'previous_purchase_count': 0,
            'previous_purchase_value': 0,
            'days_since_last_purchase': None,
            'visit_count': 0,
            'time_spent_seconds': 0
        }
        
        # Get user purchase history if user_id is available
        if user_id:
            cursor.execute(
                """
                SELECT COUNT(*) as purchase_count, MAX(created_at) as last_purchase_date,
                       SUM(total) as total_spent
                FROM orders
                WHERE user_id = %s AND status = 'completed'
                """,
                (user_id,)
            )
            
            purchase_history = cursor.fetchone()
            
            if purchase_history and purchase_history['purchase_count'] > 0:
                features['has_previous_purchase'] = True
                features['previous_purchase_count'] = purchase_history['purchase_count']
                features['previous_purchase_value'] = float(purchase_history['total_spent'] or 0)
                
                if purchase_history['last_purchase_date']:
                    days_since = (datetime.now() - purchase_history['last_purchase_date']).days
                    features['days_since_last_purchase'] = days_since
        
        # Get user visit data
        if user_id or email:
            query = """
                SELECT COUNT(*) as visit_count, SUM(duration_seconds) as time_spent
                FROM user_visits
                WHERE 
            """
            
            params = []
            
            if user_id:
                query += "user_id = %s"
                params.append(user_id)
            else:
                query += "email = %s"
                params.append(email)
            
            cursor.execute(query, params)
            visit_data = cursor.fetchone()
            
            if visit_data:
                features['visit_count'] = visit_data['visit_count'] or 0
                features['time_spent_seconds'] = visit_data['time_spent'] or 0
        
        # Get device and referrer info
        if 'metadata' in cart_data:
            metadata = cart_data['metadata']
            features['device_type'] = metadata.get('device_type')
            features['browser'] = metadata.get('browser')
            features['referrer'] = metadata.get('referrer')
            features['utm_source'] = metadata.get('utm_source')
            features['utm_medium'] = metadata.get('utm_medium')
            features['utm_campaign'] = metadata.get('utm_campaign')
            features['country'] = metadata.get('country')
            features['region'] = metadata.get('region')
            features['city'] = metadata.get('city')
        
        return features
    
    except Exception as e:
        current_app.logger.error(f"Error extracting features: {str(e)}")
        return {
            'cart_value': float(cart_data.get('total', 0)),
            'item_count': len(cart_data.get('items', []))
        }
    
    finally:
        cursor.close()
        conn.close()

def predict_recovery_likelihood(features, model_features, model_parameters):
    """
    Predict the likelihood of cart recovery.
    
    In a real implementation, this would use a trained machine learning model.
    For this example, we'll use a simplified rule-based approach.
    
    Args:
        features (dict): The cart features.
        model_features (list): The features used by the model.
        model_parameters (dict): The model parameters.
        
    Returns:
        dict: A dictionary with the prediction score and explanation.
    """
    # In a real implementation, this would load a trained model and make predictions
    # For this example, we'll use a simplified rule-based approach
    
    score = 0.5  # Base score (50% chance of recovery)
    explanation = {}
    
    # Adjust score based on cart value
    if 'cart_value' in features:
        cart_value = features['cart_value']
        
        # Higher value carts are less likely to be recovered without intervention
        if cart_value > 200:
            score -= 0.1
            explanation['cart_value'] = "High-value cart (${:.2f}) reduces natural recovery likelihood".format(cart_value)
        elif cart_value > 100:
            score -= 0.05
            explanation['cart_value'] = "Medium-value cart (${:.2f}) slightly reduces natural recovery likelihood".format(cart_value)
        else:
            score += 0.05
            explanation['cart_value'] = "Low-value cart (${:.2f}) increases natural recovery likelihood".format(cart_value)
    
    # Adjust score based on previous purchases
    if features.get('has_previous_purchase', False):
        purchase_count = features.get('previous_purchase_count', 0)
        
        if purchase_count > 5:
            score += 0.15
            explanation['purchase_history'] = "Loyal customer ({} previous purchases) increases recovery likelihood".format(purchase_count)
        elif purchase_count > 1:
            score += 0.1
            explanation['purchase_history'] = "Returning customer ({} previous purchases) increases recovery likelihood".format(purchase_count)
        else:
            score += 0.05
            explanation['purchase_history'] = "Previous customer (1 purchase) slightly increases recovery likelihood"
    else:
        score -= 0.1
        explanation['purchase_history'] = "New customer (no previous purchases) reduces recovery likelihood"
    
    # Adjust score based on time since last purchase
    if features.get('days_since_last_purchase') is not None:
        days = features['days_since_last_purchase']
        
        if days < 7:
            score += 0.1
            explanation['recency'] = "Recent purchase ({} days ago) increases recovery likelihood".format(days)
        elif days < 30:
            score += 0.05
            explanation['recency'] = "Somewhat recent purchase ({} days ago) slightly increases recovery likelihood".format(days)
        elif days > 180:
            score -= 0.1
            explanation['recency'] = "Old purchase ({} days ago) reduces recovery likelihood".format(days)
    
    # Adjust score based on visit behavior
    if features.get('visit_count', 0) > 10:
        score += 0.05
        explanation['engagement'] = "Highly engaged user ({} visits) increases recovery likelihood".format(features['visit_count'])
    
    if features.get('time_spent_seconds', 0) > 1800:  # 30 minutes
        score += 0.05
        explanation['engagement'] = "Highly engaged user ({:.1f} minutes spent) increases recovery likelihood".format(features['time_spent_seconds'] / 60)
    
    # Apply any model-specific adjustments
    if 'score_adjustments' in model_parameters:
        for key, adjustment in model_parameters['score_adjustments'].items():
            if key in features:
                score += adjustment
                explanation[key] = "Model-specific adjustment: {:.2f}".format(adjustment)
    
    # Ensure score is between 0 and 1
    score = max(0, min(1, score))
    
    # Add some randomness for demonstration purposes
    # In a real model, this would be based on actual predictions
    confidence = random.uniform(0.6, 0.9)
    
    # Generate recommendation
    recommendation = generate_recommendation(score, features)
    
    return {
        'score': score,
        'confidence': confidence,
        'explanation': explanation,
        'recommendation': recommendation
    }

def generate_recommendation(score, features):
    """
    Generate a recommendation based on the prediction score and features.
    
    Args:
        score (float): The prediction score.
        features (dict): The cart features.
        
    Returns:
        dict: A recommendation dictionary.
    """
    cart_value = features.get('cart_value', 0)
    has_previous_purchase = features.get('has_previous_purchase', False)
    
    if score < 0.3:
        # Low likelihood of recovery - aggressive approach
        if cart_value > 100:
            # High-value cart - offer discount
            return {
                'action': 'discount',
                'discount_percentage': 15 if cart_value > 200 else 10,
                'priority': 8,
                'explanation': "Low recovery likelihood ({:.0f}%) with high cart value (${:.2f})".format(score * 100, cart_value)
            }
        else:
            # Low-value cart - send email
            return {
                'action': 'email',
                'priority': 5,
                'explanation': "Low recovery likelihood ({:.0f}%) with standard cart value (${:.2f})".format(score * 100, cart_value)
            }
    
    elif score < 0.6:
        # Medium likelihood of recovery
        if not has_previous_purchase:
            # New customer - offer small discount
            return {
                'action': 'discount',
                'discount_percentage': 5,
                'priority': 6,
                'explanation': "Medium recovery likelihood ({:.0f}%) for new customer".format(score * 100)
            }
        else:
            # Existing customer - send email
            return {
                'action': 'email',
                'priority': 4,
                'explanation': "Medium recovery likelihood ({:.0f}%) for existing customer".format(score * 100)
            }
    
    else:
        # High likelihood of recovery
        if cart_value > 200:
            # High-value cart - send email
            return {
                'action': 'email',
                'priority': 3,
                'explanation': "High recovery likelihood ({:.0f}%) with high cart value (${:.2f})".format(score * 100, cart_value)
            }
        else:
            # Low-value cart - wait
            return {
                'action': 'wait',
                'priority': 1,
                'explanation': "High recovery likelihood ({:.0f}%) with standard cart value (${:.2f})".format(score * 100, cart_value)
            }

def train_model(model_id, parameters=None):
    """
    Train a predictive model.
    
    In a real implementation, this would train a machine learning model using
    historical data. For this example, we'll use a simplified approach.
    
    Args:
        model_id (int): The model ID.
        parameters (dict, optional): Training parameters.
        
    Returns:
        dict: A dictionary with training results.
    """
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
            return {
                'success': False,
                'error': 'Model not found'
            }
        
        # Get training data
        cursor.execute(
            """
            SELECT pf.*, ac.recovered
            FROM predictive_features pf
            JOIN abandoned_carts ac ON pf.cart_id = ac.id
            WHERE ac.created_at < DATE_SUB(NOW(), INTERVAL 7 DAY)
            """
        )
        
        training_data = cursor.fetchall()
        
        if not training_data:
            return {
                'success': False,
                'error': 'No training data available'
            }
        
        # Split into training and validation sets
        random.shuffle(training_data)
        split_index = int(len(training_data) * 0.8)
        train_set = training_data[:split_index]
        validation_set = training_data[split_index:]
        
        # In a real implementation, this would train a machine learning model
        # For this example, we'll just update the model parameters
        
        # Calculate accuracy on validation set
        correct_predictions = 0
        
        for item in validation_set:
            features = {k: item[k] for k in item.keys() if k != 'recovered'}
            prediction = predict_recovery_likelihood(features, json.loads(model['features']), json.loads(model['parameters']))
            
            # Convert score to binary prediction (>= 0.5 means recovered)
            predicted_recovered = prediction['score'] >= 0.5
            actual_recovered = item['recovered']
            
            if predicted_recovered == actual_recovered:
                correct_predictions += 1
        
        accuracy = correct_predictions / len(validation_set) if validation_set else 0
        
        # Update model
        cursor.execute(
            """
            UPDATE predictive_models
            SET last_trained_at = NOW(), accuracy = %s
            WHERE id = %s
            """,
            (accuracy, model_id)
        )
        
        # Update training log
        cursor.execute(
            """
            UPDATE predictive_training_logs
            SET training_data_count = %s, validation_data_count = %s,
                accuracy = %s, completed_at = NOW()
            WHERE model_id = %s
            ORDER BY started_at DESC
            LIMIT 1
            """,
            (len(train_set), len(validation_set), accuracy, model_id)
        )
        
        conn.commit()
        
        return {
            'success': True,
            'accuracy': accuracy,
            'training_data_count': len(train_set),
            'validation_data_count': len(validation_set)
        }
    
    except Exception as e:
        conn.rollback()
        current_app.logger.error(f"Error training model: {str(e)}")
        return {
            'success': False,
            'error': str(e)
        }
    
    finally:
        cursor.close()
        conn.close()

def create_recommendation(cart_id, prediction_result):
    """
    Create a recommendation based on prediction results.
    
    Args:
        cart_id (int): The cart ID.
        prediction_result (dict): The prediction result.
        
    Returns:
        dict: The created recommendation.
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        recommendation = prediction_result.get('recommendation', {})
        
        # Insert recommendation
        cursor.execute(
            """
            INSERT INTO predictive_recommendations (
                cart_id, recommended_action, discount_percentage, priority, explanation
            )
            VALUES (%s, %s, %s, %s, %s)
            """,
            (
                cart_id,
                recommendation.get('action', 'none'),
                recommendation.get('discount_percentage'),
                recommendation.get('priority', 5),
                recommendation.get('explanation')
            )
        )
        
        recommendation_id = cursor.lastrowid
        conn.commit()
        
        return {
            'success': True,
            'recommendation_id': recommendation_id
        }
    
    except Exception as e:
        conn.rollback()
        current_app.logger.error(f"Error creating recommendation: {str(e)}")
        return {
            'success': False,
            'error': str(e)
        }
    
    finally:
        cursor.close()
        conn.close()
