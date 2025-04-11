"""
Tracking functions for A/B testing.
"""

import json
import random
from datetime import datetime
from flask import current_app

from ..utils.db import get_db_connection

def select_variant_for_user(campaign_id, user_id=None, email=None):
    """
    Select a variant for a user based on traffic allocation.
    If the user has already been assigned a variant, return that variant.
    Otherwise, randomly select a variant based on traffic allocation.
    
    Returns a tuple of (variant_id, variant_data) or (None, None) if no variants are available.
    """
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        # Check if campaign is active
        cursor.execute(
            """
            SELECT * FROM ab_test_campaigns
            WHERE id = %s AND status = 'active'
            """,
            (campaign_id,)
        )
        
        campaign = cursor.fetchone()
        
        if not campaign:
            return None, None
        
        # Check if user has already been assigned a variant
        if user_id or email:
            query = """
                SELECT v.*, e.id as event_id
                FROM ab_test_variants v
                JOIN ab_test_events e ON v.id = e.variant_id
                WHERE v.campaign_id = %s AND e.event_type = 'sent'
            """
            
            params = [campaign_id]
            
            if user_id:
                query += " AND e.user_id = %s"
                params.append(user_id)
            elif email:
                query += " AND e.email = %s"
                params.append(email)
            
            cursor.execute(query, params)
            existing_variant = cursor.fetchone()
            
            if existing_variant:
                return existing_variant['id'], existing_variant
        
        # Get all variants for the campaign
        cursor.execute(
            """
            SELECT * FROM ab_test_variants
            WHERE campaign_id = %s
            """,
            (campaign_id,)
        )
        
        variants = cursor.fetchall()
        
        if not variants:
            return None, None
        
        # Select a variant based on traffic allocation
        total_allocation = sum(v['traffic_allocation'] for v in variants)
        
        if total_allocation <= 0:
            # Equal distribution if no allocation is set
            selected_variant = random.choice(variants)
            return selected_variant['id'], selected_variant
        
        # Weighted random selection
        r = random.uniform(0, total_allocation)
        cumulative = 0
        
        for variant in variants:
            cumulative += variant['traffic_allocation']
            if r <= cumulative:
                return variant['id'], variant
        
        # Fallback to the last variant
        return variants[-1]['id'], variants[-1]
    
    except Exception as e:
        current_app.logger.error(f"Error selecting variant: {str(e)}")
        return None, None
    
    finally:
        cursor.close()
        conn.close()

def track_event(variant_id, event_type, user_id=None, email=None, cart_id=None, order_id=None, revenue=0):
    """
    Track an event for a variant.
    Event types: 'sent', 'opened', 'clicked', 'converted'
    
    Returns True if the event was tracked successfully, False otherwise.
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # Insert event
        cursor.execute(
            """
            INSERT INTO ab_test_events (
                variant_id, user_id, email, event_type, 
                event_time, cart_id, order_id, revenue
            )
            VALUES (%s, %s, %s, %s, NOW(), %s, %s, %s)
            """,
            (
                variant_id,
                user_id,
                email,
                event_type,
                cart_id,
                order_id,
                revenue
            )
        )
        
        # Update results
        update_field = ""
        if event_type == 'sent':
            update_field = "emails_sent = emails_sent + 1"
        elif event_type == 'opened':
            update_field = "emails_opened = emails_opened + 1"
        elif event_type == 'clicked':
            update_field = "clicks = clicks + 1"
        elif event_type == 'converted':
            update_field = "conversions = conversions + 1, revenue = revenue + %s"
        
        if update_field:
            if event_type == 'converted':
                cursor.execute(
                    f"""
                    UPDATE ab_test_results
                    SET {update_field}
                    WHERE variant_id = %s
                    """,
                    (revenue, variant_id)
                )
            else:
                cursor.execute(
                    f"""
                    UPDATE ab_test_results
                    SET {update_field}
                    WHERE variant_id = %s
                    """,
                    (variant_id,)
                )
        
        conn.commit()
        return True
    
    except Exception as e:
        conn.rollback()
        current_app.logger.error(f"Error tracking event: {str(e)}")
        return False
    
    finally:
        cursor.close()
        conn.close()

def get_campaign_results(campaign_id):
    """
    Get results for a campaign.
    
    Returns a dictionary with campaign and variant results.
    """
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
            return None
        
        # Get variants with results
        cursor.execute(
            """
            SELECT v.*, r.emails_sent, r.emails_opened, r.clicks, r.conversions, r.revenue
            FROM ab_test_variants v
            LEFT JOIN ab_test_results r ON v.id = r.variant_id
            WHERE v.campaign_id = %s
            """,
            (campaign_id,)
        )
        
        variants = cursor.fetchall()
        
        # Calculate metrics
        formatted_variants = []
        
        for variant in variants:
            emails_sent = variant['emails_sent'] or 0
            emails_opened = variant['emails_opened'] or 0
            clicks = variant['clicks'] or 0
            conversions = variant['conversions'] or 0
            revenue = float(variant['revenue'] or 0)
            
            # Calculate rates
            open_rate = (emails_opened / emails_sent) * 100 if emails_sent > 0 else 0
            click_rate = (clicks / emails_sent) * 100 if emails_sent > 0 else 0
            conversion_rate = (conversions / emails_sent) * 100 if emails_sent > 0 else 0
            
            # Calculate revenue per email
            revenue_per_email = revenue / emails_sent if emails_sent > 0 else 0
            
            formatted_variants.append({
                'id': variant['id'],
                'name': variant['name'],
                'email_template': variant['email_template'],
                'subject_line': variant['subject_line'],
                'discount_percentage': variant['discount_percentage'],
                'discount_type': variant['discount_type'],
                'traffic_allocation': variant['traffic_allocation'],
                'metrics': {
                    'emails_sent': emails_sent,
                    'emails_opened': emails_opened,
                    'clicks': clicks,
                    'conversions': conversions,
                    'revenue': revenue,
                    'open_rate': round(open_rate, 2),
                    'click_rate': round(click_rate, 2),
                    'conversion_rate': round(conversion_rate, 2),
                    'revenue_per_email': round(revenue_per_email, 2)
                },
                'is_winner': variant['id'] == campaign['winner_variant_id']
            })
        
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
        
        return {
            'campaign': formatted_campaign,
            'variants': formatted_variants
        }
    
    except Exception as e:
        current_app.logger.error(f"Error getting campaign results: {str(e)}")
        return None
    
    finally:
        cursor.close()
        conn.close()

def determine_winner(campaign_id, metric='conversion_rate'):
    """
    Determine the winner of a campaign based on a metric.
    
    Metrics: 'open_rate', 'click_rate', 'conversion_rate', 'revenue_per_email'
    
    Returns the winner variant ID or None if no winner can be determined.
    """
    results = get_campaign_results(campaign_id)
    
    if not results or not results['variants']:
        return None
    
    # Find variant with highest metric
    best_variant = None
    best_value = -1
    
    for variant in results['variants']:
        value = variant['metrics'].get(metric, 0)
        
        if value > best_value:
            best_value = value
            best_variant = variant
    
    return best_variant['id'] if best_variant else None
