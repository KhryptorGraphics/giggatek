-- Create push_subscriptions table for storing user push notification subscriptions

CREATE TABLE IF NOT EXISTS push_subscriptions (
    subscription_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    endpoint VARCHAR(512) NOT NULL,
    subscription_data TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    UNIQUE KEY (user_id, endpoint)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
