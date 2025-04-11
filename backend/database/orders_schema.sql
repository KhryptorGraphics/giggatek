-- Orders Schema for GigGatek
-- This script creates the orders and order_items tables

-- Ensure the orders table exists
CREATE TABLE IF NOT EXISTS `orders` (
  `order_id` int PRIMARY KEY AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `order_date` timestamp DEFAULT CURRENT_TIMESTAMP,
  `total_amount` decimal(10,2) NOT NULL,
  `status` varchar(50) DEFAULT 'pending',
  `shipping_address` text NOT NULL,
  `billing_address` text,
  `payment_method` varchar(50) NOT NULL,
  `shipping_method` varchar(50) DEFAULT 'standard',
  `shipping_cost` decimal(8,2) DEFAULT 0.00,
  `tax_amount` decimal(8,2) DEFAULT 0.00,
  `notes` text,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE RESTRICT
);

-- Ensure the order_items table exists
CREATE TABLE IF NOT EXISTS `order_items` (
  `item_id` int PRIMARY KEY AUTO_INCREMENT,
  `order_id` int NOT NULL,
  `product_id` int NOT NULL,
  `quantity` int NOT NULL,
  `price_per_unit` decimal(10,2) NOT NULL,
  `total_price` decimal(10,2) NOT NULL,
  `is_rental` boolean DEFAULT FALSE,
  `rental_term_months` int DEFAULT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`order_id`) REFERENCES `orders` (`order_id`) ON DELETE CASCADE,
  FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`) ON DELETE RESTRICT
);

-- Add index for order queries
CREATE INDEX idx_orders_user_id ON `orders` (`user_id`);
CREATE INDEX idx_orders_status ON `orders` (`status`);
CREATE INDEX idx_order_items_order_id ON `order_items` (`order_id`);
CREATE INDEX idx_order_items_product_id ON `order_items` (`product_id`);

-- Add order status tracking table
CREATE TABLE IF NOT EXISTS `order_status_history` (
  `history_id` int PRIMARY KEY AUTO_INCREMENT,
  `order_id` int NOT NULL,
  `status` varchar(50) NOT NULL,
  `comment` text,
  `created_by` int, -- user_id who made the change, NULL for system changes
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`order_id`) REFERENCES `orders` (`order_id`) ON DELETE CASCADE,
  FOREIGN KEY (`created_by`) REFERENCES `users` (`user_id`) ON DELETE SET NULL
);

-- Add index for status history queries
CREATE INDEX IF NOT EXISTS idx_order_status_history_order_id ON `order_status_history` (`order_id`);

-- Create shipping addresses table
CREATE TABLE IF NOT EXISTS `shipping_addresses` (
  `address_id` int PRIMARY KEY AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `is_default` boolean DEFAULT FALSE,
  `address_name` varchar(100), -- "Home", "Work", etc.
  `recipient_name` varchar(255) NOT NULL,
  `street_address1` varchar(255) NOT NULL,
  `street_address2` varchar(255),
  `city` varchar(100) NOT NULL,
  `state_province` varchar(100) NOT NULL,
  `postal_code` varchar(20) NOT NULL,
  `country` varchar(100) NOT NULL DEFAULT 'United States',
  `phone` varchar(20),
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
);

-- Add index for shipping address lookup
CREATE INDEX IF NOT EXISTS idx_shipping_addresses_user_id ON `shipping_addresses` (`user_id`);
