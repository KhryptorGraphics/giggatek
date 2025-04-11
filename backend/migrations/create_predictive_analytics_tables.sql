-- Create predictive_models table
CREATE TABLE IF NOT EXISTS predictive_models (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    model_type ENUM('recovery_likelihood', 'discount_sensitivity', 'time_sensitivity', 'custom') NOT NULL,
    features JSON NOT NULL,
    parameters JSON NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_trained_at TIMESTAMP NULL,
    active BOOLEAN DEFAULT TRUE,
    accuracy FLOAT NULL,
    UNIQUE INDEX idx_name (name),
    INDEX idx_model_type (model_type),
    INDEX idx_active (active)
);

-- Create predictive_features table
CREATE TABLE IF NOT EXISTS predictive_features (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cart_id INT NOT NULL,
    user_id INT NULL,
    email VARCHAR(255) NULL,
    cart_value DECIMAL(10, 2) NOT NULL,
    item_count INT NOT NULL,
    has_previous_purchase BOOLEAN DEFAULT FALSE,
    previous_purchase_count INT DEFAULT 0,
    previous_purchase_value DECIMAL(10, 2) DEFAULT 0,
    days_since_last_purchase INT NULL,
    visit_count INT DEFAULT 0,
    time_spent_seconds INT DEFAULT 0,
    device_type VARCHAR(50) NULL,
    browser VARCHAR(50) NULL,
    referrer VARCHAR(255) NULL,
    utm_source VARCHAR(100) NULL,
    utm_medium VARCHAR(100) NULL,
    utm_campaign VARCHAR(100) NULL,
    country VARCHAR(50) NULL,
    region VARCHAR(100) NULL,
    city VARCHAR(100) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cart_id) REFERENCES abandoned_carts(id) ON DELETE CASCADE,
    INDEX idx_cart_id (cart_id),
    INDEX idx_user_id (user_id),
    INDEX idx_email (email),
    INDEX idx_created_at (created_at)
);

-- Create predictive_scores table
CREATE TABLE IF NOT EXISTS predictive_scores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cart_id INT NOT NULL,
    model_id INT NOT NULL,
    score FLOAT NOT NULL,
    confidence FLOAT NULL,
    explanation JSON NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cart_id) REFERENCES abandoned_carts(id) ON DELETE CASCADE,
    FOREIGN KEY (model_id) REFERENCES predictive_models(id) ON DELETE CASCADE,
    UNIQUE INDEX idx_cart_model (cart_id, model_id),
    INDEX idx_score (score),
    INDEX idx_created_at (created_at)
);

-- Create predictive_recommendations table
CREATE TABLE IF NOT EXISTS predictive_recommendations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cart_id INT NOT NULL,
    recommended_action ENUM('email', 'discount', 'personalized', 'wait', 'none') NOT NULL,
    discount_percentage INT NULL,
    priority INT DEFAULT 5,
    explanation TEXT NULL,
    applied BOOLEAN DEFAULT FALSE,
    result ENUM('success', 'failure', 'pending') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    applied_at TIMESTAMP NULL,
    FOREIGN KEY (cart_id) REFERENCES abandoned_carts(id) ON DELETE CASCADE,
    INDEX idx_cart_id (cart_id),
    INDEX idx_recommended_action (recommended_action),
    INDEX idx_priority (priority),
    INDEX idx_applied (applied),
    INDEX idx_created_at (created_at)
);

-- Create predictive_training_logs table
CREATE TABLE IF NOT EXISTS predictive_training_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    model_id INT NOT NULL,
    training_data_count INT NOT NULL,
    validation_data_count INT NOT NULL,
    accuracy FLOAT NULL,
    precision_score FLOAT NULL,
    recall_score FLOAT NULL,
    f1_score FLOAT NULL,
    training_duration_seconds INT NULL,
    parameters JSON NULL,
    error_message TEXT NULL,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    FOREIGN KEY (model_id) REFERENCES predictive_models(id) ON DELETE CASCADE,
    INDEX idx_model_id (model_id),
    INDEX idx_started_at (started_at)
);
