-- Create ab_test_campaigns table
CREATE TABLE IF NOT EXISTS ab_test_campaigns (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    start_date TIMESTAMP NULL,
    end_date TIMESTAMP NULL,
    segment_id INT NULL,
    status ENUM('draft', 'active', 'paused', 'completed') DEFAULT 'draft',
    winner_variant_id INT NULL,
    FOREIGN KEY (segment_id) REFERENCES customer_segments(id) ON DELETE SET NULL,
    INDEX idx_status (status)
);

-- Create ab_test_variants table
CREATE TABLE IF NOT EXISTS ab_test_variants (
    id INT AUTO_INCREMENT PRIMARY KEY,
    campaign_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    email_template VARCHAR(100) NOT NULL,
    subject_line VARCHAR(255) NOT NULL,
    discount_percentage INT DEFAULT 0,
    discount_type ENUM('percentage', 'fixed', 'none') DEFAULT 'percentage',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    traffic_allocation INT DEFAULT 50, -- Percentage of traffic allocated to this variant
    FOREIGN KEY (campaign_id) REFERENCES ab_test_campaigns(id) ON DELETE CASCADE,
    INDEX idx_campaign_id (campaign_id)
);

-- Create ab_test_results table
CREATE TABLE IF NOT EXISTS ab_test_results (
    id INT AUTO_INCREMENT PRIMARY KEY,
    variant_id INT NOT NULL,
    emails_sent INT DEFAULT 0,
    emails_opened INT DEFAULT 0,
    clicks INT DEFAULT 0,
    conversions INT DEFAULT 0,
    revenue DECIMAL(10, 2) DEFAULT 0.00,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (variant_id) REFERENCES ab_test_variants(id) ON DELETE CASCADE,
    INDEX idx_variant_id (variant_id)
);

-- Create ab_test_events table to track individual user interactions
CREATE TABLE IF NOT EXISTS ab_test_events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    variant_id INT NOT NULL,
    user_id INT NULL,
    email VARCHAR(255) NULL,
    event_type ENUM('sent', 'opened', 'clicked', 'converted') NOT NULL,
    event_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    cart_id INT NULL,
    order_id INT NULL,
    revenue DECIMAL(10, 2) DEFAULT 0.00,
    FOREIGN KEY (variant_id) REFERENCES ab_test_variants(id) ON DELETE CASCADE,
    INDEX idx_variant_id (variant_id),
    INDEX idx_user_id (user_id),
    INDEX idx_email (email),
    INDEX idx_event_type (event_type),
    INDEX idx_event_time (event_time)
);
