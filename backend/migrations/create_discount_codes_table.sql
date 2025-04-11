-- Create discount_codes table for abandoned cart recovery
CREATE TABLE IF NOT EXISTS discount_codes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) NOT NULL,
    abandoned_cart_id INT NULL,
    user_id INT NULL,
    discount_percentage INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    used_at TIMESTAMP NULL,
    order_id INT NULL,
    UNIQUE INDEX idx_code (code),
    INDEX idx_abandoned_cart_id (abandoned_cart_id),
    INDEX idx_user_id (user_id),
    INDEX idx_expires_at (expires_at),
    INDEX idx_used (used)
);
