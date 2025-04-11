-- Products Schema for GigGatek
-- This script creates the products table

-- Ensure the products table exists
CREATE TABLE IF NOT EXISTS `products` (
  `product_id` int PRIMARY KEY AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` text,
  `category` varchar(100) NOT NULL,
  `specifications` json,
  `condition_rating` varchar(50) NOT NULL,
  `purchase_price` decimal(10,2) NOT NULL,
  `rental_price_3m` decimal(10,2),
  `rental_price_6m` decimal(10,2),
  `rental_price_12m` decimal(10,2),
  `stock_quantity` int NOT NULL DEFAULT 0,
  `is_featured` boolean DEFAULT FALSE,
  `image_urls` json,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Add indexes for product queries
CREATE INDEX idx_products_category ON `products` (`category`);
CREATE INDEX idx_products_condition ON `products` (`condition_rating`);
CREATE INDEX idx_products_featured ON `products` (`is_featured`);

-- Add some sample products for development
INSERT INTO `products` (name, description, category, specifications, condition_rating, purchase_price, rental_price_3m, rental_price_6m, rental_price_12m, stock_quantity, is_featured, image_urls)
VALUES
('Refurbished GPU Model X', 'A powerful refurbished GPU perfect for gaming and professional work.', 'GPUs',
'{"Memory": "8GB GDDR6", "Core Clock": "1.8 GHz", "CUDA Cores": "3584", "Power Consumption": "215W", "Outputs": "3x DisplayPort, 1x HDMI", "Warranty": "1 Year Limited"}',
'Excellent', 399.99, 49.99, 44.99, 39.99, 5, TRUE, '["img/products/gpu_x_1.jpg", "img/products/gpu_x_2.jpg"]'),

('Refurbished CPU Model Y', 'High-performance CPU for demanding applications.', 'CPUs',
'{"Cores": "8", "Threads": "16", "Base Clock": "3.6 GHz", "Boost Clock": "4.8 GHz", "TDP": "105W", "Socket": "AM4", "Warranty": "1 Year Limited"}',
'Good', 249.99, 34.99, 29.99, 24.99, 8, TRUE, '["img/products/cpu_y_1.jpg"]'),

('Refurbished System Z', 'Complete refurbished system ready for gaming and productivity.', 'Systems',
'{"CPU": "6-core 3.2 GHz", "RAM": "16GB DDR4", "Storage": "512GB SSD", "GPU": "6GB GDDR6", "OS": "Windows 10 Pro", "Warranty": "1 Year Limited"}',
'Excellent', 899.99, 99.99, 89.99, 79.99, 3, TRUE, '["img/products/system_z_1.jpg", "img/products/system_z_2.jpg", "img/products/system_z_3.jpg"]');
