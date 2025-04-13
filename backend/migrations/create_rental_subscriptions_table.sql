-- Create rental_subscriptions table
CREATE TABLE IF NOT EXISTS rental_subscriptions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    rental_id INT NOT NULL,
    user_id INT NOT NULL,
    stripe_subscription_id VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    created_at DATETIME NOT NULL,
    updated_at DATETIME DEFAULT NULL,
    FOREIGN KEY (rental_id) REFERENCES rentals(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY (rental_id, user_id, status)
);

-- Add payment_source column to rental_payments table
ALTER TABLE rental_payments ADD COLUMN IF NOT EXISTS payment_source VARCHAR(50) DEFAULT 'manual';

-- Add stripe_customer_id column to users table if it doesn't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_customer_id VARCHAR(255) DEFAULT NULL;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_rental_subscriptions_user_id ON rental_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_rental_subscriptions_rental_id ON rental_subscriptions(rental_id);
CREATE INDEX IF NOT EXISTS idx_rental_subscriptions_status ON rental_subscriptions(status);
