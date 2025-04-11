-- Create customer_segments table for advanced segmentation
CREATE TABLE IF NOT EXISTS customer_segments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    criteria JSON NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by INT NULL,
    active BOOLEAN DEFAULT TRUE,
    UNIQUE INDEX idx_name (name),
    INDEX idx_active (active)
);

-- Create segment_members table to track which users belong to which segments
CREATE TABLE IF NOT EXISTS segment_members (
    id INT AUTO_INCREMENT PRIMARY KEY,
    segment_id INT NOT NULL,
    user_id INT NOT NULL,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (segment_id) REFERENCES customer_segments(id) ON DELETE CASCADE,
    UNIQUE INDEX idx_segment_user (segment_id, user_id)
);

-- Create segment_campaigns table to track campaigns for segments
CREATE TABLE IF NOT EXISTS segment_campaigns (
    id INT AUTO_INCREMENT PRIMARY KEY,
    segment_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    email_template VARCHAR(100) NOT NULL,
    discount_percentage INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    start_date TIMESTAMP NULL,
    end_date TIMESTAMP NULL,
    active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (segment_id) REFERENCES customer_segments(id) ON DELETE CASCADE,
    INDEX idx_active (active)
);
