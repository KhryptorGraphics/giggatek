-- Create abandoned_carts table
CREATE TABLE IF NOT EXISTS abandoned_carts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL,
    session_id VARCHAR(255) NOT NULL,
    email VARCHAR(255) NULL,
    cart_data JSON NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_notification_sent TIMESTAMP NULL,
    notification_count INT DEFAULT 0,
    recovered BOOLEAN DEFAULT FALSE,
    recovery_date TIMESTAMP NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_session_id (session_id),
    INDEX idx_email (email),
    INDEX idx_created_at (created_at),
    INDEX idx_recovered (recovered)
);

-- Create abandoned_cart_notifications table to track sent notifications
CREATE TABLE IF NOT EXISTS abandoned_cart_notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    abandoned_cart_id INT NOT NULL,
    notification_type VARCHAR(50) NOT NULL,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) NOT NULL,
    email VARCHAR(255) NULL,
    FOREIGN KEY (abandoned_cart_id) REFERENCES abandoned_carts(id) ON DELETE CASCADE,
    INDEX idx_abandoned_cart_id (abandoned_cart_id),
    INDEX idx_sent_at (sent_at)
);

-- Create recovery_tokens table for secure cart recovery links
CREATE TABLE IF NOT EXISTS recovery_tokens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    abandoned_cart_id INT NOT NULL,
    token VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    used_at TIMESTAMP NULL,
    FOREIGN KEY (abandoned_cart_id) REFERENCES abandoned_carts(id) ON DELETE CASCADE,
    UNIQUE INDEX idx_token (token),
    INDEX idx_abandoned_cart_id (abandoned_cart_id),
    INDEX idx_expires_at (expires_at)
);
