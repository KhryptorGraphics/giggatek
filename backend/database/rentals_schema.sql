-- Rentals Schema for GigGatek
-- This script creates the rentals and rental_payments tables

-- Ensure the rentals table exists
CREATE TABLE IF NOT EXISTS `rentals` (
  `rental_id` int PRIMARY KEY AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `product_id` int NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `monthly_rate` decimal(10,2) NOT NULL,
  `total_amount` decimal(10,2) NOT NULL,
  `status` varchar(50) DEFAULT 'active',
  `original_order_id` int,  -- Reference to the order that created this rental
  `buyout_price` decimal(10,2),  -- Remaining amount to buy out the rental
  `contract_terms` text,  -- JSON string with full contract details
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE RESTRICT,
  FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`) ON DELETE RESTRICT,
  FOREIGN KEY (`original_order_id`) REFERENCES `orders` (`order_id`) ON DELETE SET NULL
);

-- Ensure the rental_payments table exists
CREATE TABLE IF NOT EXISTS `rental_payments` (
  `payment_id` int PRIMARY KEY AUTO_INCREMENT,
  `rental_id` int NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `due_date` date NOT NULL,
  `payment_date` date,  -- NULL if not yet paid
  `status` varchar(50) DEFAULT 'pending',  -- pending, paid, late, failed
  `payment_method` varchar(50),
  `transaction_id` varchar(255),  -- External payment processor transaction ID
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`rental_id`) REFERENCES `rentals` (`rental_id`) ON DELETE CASCADE
);

-- Add rental status tracking table
CREATE TABLE IF NOT EXISTS `rental_status_history` (
  `history_id` int PRIMARY KEY AUTO_INCREMENT,
  `rental_id` int NOT NULL,
  `status` varchar(50) NOT NULL,
  `comment` text,
  `created_by` int,  -- user_id who made the change, NULL for system changes
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`rental_id`) REFERENCES `rentals` (`rental_id`) ON DELETE CASCADE,
  FOREIGN KEY (`created_by`) REFERENCES `users` (`user_id`) ON DELETE SET NULL
);

-- Create rental extensions table
CREATE TABLE IF NOT EXISTS `rental_extensions` (
  `extension_id` int PRIMARY KEY AUTO_INCREMENT,
  `rental_id` int NOT NULL,
  `previous_end_date` date NOT NULL,
  `new_end_date` date NOT NULL,
  `extension_fee` decimal(10,2) DEFAULT 0.00,
  `reason` text,
  `approved_by` int,  -- user_id who approved the extension, NULL for automatic/system approvals
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`rental_id`) REFERENCES `rentals` (`rental_id`) ON DELETE CASCADE,
  FOREIGN KEY (`approved_by`) REFERENCES `users` (`user_id`) ON DELETE SET NULL
);

-- Create rental notification table
CREATE TABLE IF NOT EXISTS `rental_notifications` (
  `notification_id` int PRIMARY KEY AUTO_INCREMENT,
  `rental_id` int NOT NULL,
  `user_id` int NOT NULL,
  `type` varchar(50) NOT NULL,  -- payment_due, payment_late, contract_ending, etc.
  `message` text NOT NULL,
  `is_read` boolean DEFAULT FALSE,
  `delivery_method` varchar(50) DEFAULT 'email',  -- email, sms, in_app, etc.
  `sent_at` timestamp,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`rental_id`) REFERENCES `rentals` (`rental_id`) ON DELETE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
);

-- Create indices for performance
CREATE INDEX idx_rentals_user_id ON `rentals` (`user_id`);
CREATE INDEX idx_rentals_product_id ON `rentals` (`product_id`);
CREATE INDEX idx_rentals_status ON `rentals` (`status`);
CREATE INDEX idx_rental_payments_rental_id ON `rental_payments` (`rental_id`);
CREATE INDEX idx_rental_payments_due_date ON `rental_payments` (`due_date`);
CREATE INDEX idx_rental_payments_status ON `rental_payments` (`status`);
CREATE INDEX idx_rental_status_history_rental_id ON `rental_status_history` (`rental_id`);
CREATE INDEX idx_rental_notifications_user_id ON `rental_notifications` (`user_id`);
CREATE INDEX idx_rental_notifications_type ON `rental_notifications` (`type`);
