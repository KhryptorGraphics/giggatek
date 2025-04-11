-- Insert default recovery likelihood model
INSERT INTO predictive_models (
    name, 
    description, 
    model_type, 
    features, 
    parameters, 
    active
)
VALUES (
    'Default Recovery Likelihood Model',
    'Default model for predicting the likelihood of abandoned cart recovery',
    'recovery_likelihood',
    '["cart_value", "item_count", "has_previous_purchase", "previous_purchase_count", "previous_purchase_value", "days_since_last_purchase", "visit_count", "time_spent_seconds"]',
    '{
        "score_adjustments": {
            "cart_value_high": -0.1,
            "cart_value_medium": -0.05,
            "cart_value_low": 0.05,
            "loyal_customer": 0.15,
            "returning_customer": 0.1,
            "new_customer": -0.1,
            "recent_purchase": 0.1,
            "old_purchase": -0.1,
            "high_engagement": 0.05
        },
        "thresholds": {
            "cart_value_high": 200,
            "cart_value_medium": 100,
            "loyal_customer_purchases": 5,
            "returning_customer_purchases": 1,
            "recent_purchase_days": 7,
            "old_purchase_days": 180,
            "high_engagement_visits": 10,
            "high_engagement_time": 1800
        }
    }',
    TRUE
);
