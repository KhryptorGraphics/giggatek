-- Authentication Schema for GigGatek
-- This script creates the users table for authentication

-- Ensure the users table exists
CREATE TABLE IF NOT EXISTS `users` (
  `user_id` int PRIMARY KEY AUTO_INCREMENT,
  `email` varchar(255) UNIQUE NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `phone` varchar(20),
  `role` varchar(20) DEFAULT 'customer',
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP
);

-- Add index for email lookups (they'll be frequent for logins)
CREATE INDEX IF NOT EXISTS idx_users_email ON `users` (`email`);

-- Initial admin account for testing
-- Password: Admin123!
-- This is for development only - remove in production
INSERT INTO `users` (email, password_hash, first_name, last_name, phone, role)
SELECT 'admin@giggatek.com', '$2b$12$FHtrrGgb.cqCINu2u6bYcexeF2YI3a7.C5XvfajzT/LhJi2QpyNUu', 'Admin', 'User', '555-123-4567', 'admin'
WHERE NOT EXISTS (SELECT 1 FROM `users` WHERE email = 'admin@giggatek.com');

-- Initial manager account for testing
-- Password: Manager123!
INSERT INTO `users` (email, password_hash, first_name, last_name, phone, role)
SELECT 'manager@giggatek.com', '$2b$12$Wo9HS.CbTCuUw3A1zOTWUuQEHELyRZrFz9.F7LhwFLMNcUy8mQAjK', 'Manager', 'User', '555-987-6543', 'manager'
WHERE NOT EXISTS (SELECT 1 FROM `users` WHERE email = 'manager@giggatek.com');

-- Initial customer account for testing
-- Password: Customer123!
INSERT INTO `users` (email, password_hash, first_name, last_name, phone, role)
SELECT 'customer@example.com', '$2b$12$6uSGiHw7vq8s3.bzSPmcIeJzVBy7AU0cnYvgvZ7Y3FX1XqffHvYoy', 'John', 'Smith', '555-555-5555', 'customer'
WHERE NOT EXISTS (SELECT 1 FROM `users` WHERE email = 'customer@example.com');
