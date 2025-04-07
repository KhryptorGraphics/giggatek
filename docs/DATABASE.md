# GigGatek Database Schema

This document outlines the database schema for the GigGatek ecommerce platform. The database is designed to support both traditional purchase transactions and rent-to-own arrangements for refurbished computer hardware.

## Overview

The GigGatek database uses MySQL and consists of the following core tables:

1. **Users** - Customer and administrator accounts
2. **Products** - Hardware items available for sale or rent
3. **Categories** - Product classification 
4. **Inventory** - Stock management for physical items
5. **Orders** - Purchase transactions
6. **OrderItems** - Line items within orders
7. **RentalContracts** - Rent-to-own agreements
8. **RentalPayments** - Individual payments for rental contracts
9. **Addresses** - Customer shipping and billing addresses
10. **PaymentMethods** - Stored payment information
11. **Reviews** - Product reviews and ratings

## Table Definitions

### Users

Stores user account information for both customers and administrators.

```sql
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    is_admin BOOLEAN DEFAULT FALSE,
    admin_role VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
    email_verified BOOLEAN DEFAULT FALSE,
    verification_token VARCHAR(255),
    reset_token VARCHAR(255),
    reset_token_expiry DATETIME
);
```

### Categories

Hierarchical product categories.

```sql
CREATE TABLE categories (
    category_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    parent_id INT NULL,
    description TEXT,
    image_url VARCHAR(255),
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (parent_id) REFERENCES categories(category_id) ON DELETE SET NULL
);
```

### Products

Core product information.

```sql
CREATE TABLE products (
    product_id INT AUTO_INCREMENT PRIMARY KEY,
    sku VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    specifications TEXT,
    category_id INT NOT NULL,
    condition ENUM('Excellent', 'Good', 'Fair') NOT NULL,
    purchase_price DECIMAL(10, 2) NOT NULL,
    rental_price_3m DECIMAL(10, 2),
    rental_price_6m DECIMAL(10, 2),
    rental_price_12m DECIMAL(10, 2),
    cost_price DECIMAL(10, 2),
    weight DECIMAL(8, 2),
    dimensions VARCHAR(50),
    is_featured BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(category_id)
);
```

### ProductImages

Multiple images for each product.

```sql
CREATE TABLE product_images (
    image_id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    image_url VARCHAR(255) NOT NULL,
    alt_text VARCHAR(255),
    sort_order INT DEFAULT 0,
    is_primary BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE
);
```

### Inventory

Tracks individual inventory items and their status.

```sql
CREATE TABLE inventory (
    inventory_id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    serial_number VARCHAR(100) UNIQUE,
    status ENUM('in_stock', 'sold', 'rented', 'reserved', 'repair', 'returned') NOT NULL DEFAULT 'in_stock',
    condition_notes TEXT,
    purchase_date DATE,
    purchase_price DECIMAL(10, 2),
    supplier VARCHAR(100),
    location VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(product_id)
);
```

### Addresses

Customer shipping and billing addresses.

```sql
CREATE TABLE addresses (
    address_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    address_type ENUM('billing', 'shipping') NOT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    company VARCHAR(100),
    address_line1 VARCHAR(255) NOT NULL,
    address_line2 VARCHAR(255),
    city VARCHAR(100) NOT NULL,
    state_province VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20) NOT NULL,
    country VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);
```

### PaymentMethods

Stored payment methods for recurring payments.

```sql
CREATE TABLE payment_methods (
    payment_method_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    payment_type ENUM('credit_card', 'bank_account', 'paypal') NOT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    last_four VARCHAR(4),
    expiry_date VARCHAR(7),
    card_type VARCHAR(50),
    token VARCHAR(255) NOT NULL,
    billing_address_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (billing_address_id) REFERENCES addresses(address_id) ON DELETE SET NULL
);
```

### Orders

Purchase transaction records.

```sql
CREATE TABLE orders (
    order_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    order_number VARCHAR(50) NOT NULL UNIQUE,
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded') NOT NULL DEFAULT 'pending',
    subtotal DECIMAL(10, 2) NOT NULL,
    tax DECIMAL(10, 2) NOT NULL,
    shipping DECIMAL(10, 2) NOT NULL,
    total DECIMAL(10, 2) NOT NULL,
    discount DECIMAL(10, 2) DEFAULT 0,
    shipping_address_id INT NOT NULL,
    billing_address_id INT NOT NULL,
    payment_method_id INT,
    payment_status ENUM('pending', 'paid', 'failed', 'refunded') NOT NULL DEFAULT 'pending',
    payment_transaction_id VARCHAR(255),
    notes TEXT,
    tracking_number VARCHAR(100),
    carrier VARCHAR(100),
    estimated_delivery DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE NO ACTION,
    FOREIGN KEY (shipping_address_id) REFERENCES addresses(address_id) ON DELETE NO ACTION,
    FOREIGN KEY (billing_address_id) REFERENCES addresses(address_id) ON DELETE NO ACTION,
    FOREIGN KEY (payment_method_id) REFERENCES payment_methods(payment_method_id) ON DELETE SET NULL
);
```

### OrderItems

Line items within orders.

```sql
CREATE TABLE order_items (
    order_item_id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    inventory_id INT,
    quantity INT NOT NULL DEFAULT 1,
    price DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE NO ACTION,
    FOREIGN KEY (inventory_id) REFERENCES inventory(inventory_id) ON DELETE SET NULL
);
```

### RentalContracts

Rent-to-own agreements.

```sql
CREATE TABLE rental_contracts (
    contract_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    contract_number VARCHAR(50) NOT NULL UNIQUE,
    status ENUM('active', 'completed', 'cancelled', 'defaulted') NOT NULL DEFAULT 'active',
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    term_months INT NOT NULL,
    monthly_rate DECIMAL(10, 2) NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    paid_amount DECIMAL(10, 2) DEFAULT 0,
    remaining_amount DECIMAL(10, 2) AS (total_amount - paid_amount),
    payment_day INT NOT NULL,
    next_payment_date DATE,
    shipping_address_id INT NOT NULL,
    billing_address_id INT NOT NULL,
    payment_method_id INT NOT NULL,
    deposit_amount DECIMAL(10, 2) DEFAULT 0,
    early_buyout_discount_percent INT DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE NO ACTION,
    FOREIGN KEY (shipping_address_id) REFERENCES addresses(address_id) ON DELETE NO ACTION,
    FOREIGN KEY (billing_address_id) REFERENCES addresses(address_id) ON DELETE NO ACTION,
    FOREIGN KEY (payment_method_id) REFERENCES payment_methods(payment_method_id) ON DELETE NO ACTION
);
```

### RentalItems

Items included in rental contracts.

```sql
CREATE TABLE rental_items (
    rental_item_id INT AUTO_INCREMENT PRIMARY KEY,
    contract_id INT NOT NULL,
    product_id INT NOT NULL,
    inventory_id INT NOT NULL,
    monthly_rate DECIMAL(10, 2) NOT NULL,
    buyout_price DECIMAL(10, 2) NOT NULL,
    condition_status ENUM('excellent', 'good', 'fair') NOT NULL,
    condition_notes TEXT,
    FOREIGN KEY (contract_id) REFERENCES rental_contracts(contract_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE NO ACTION,
    FOREIGN KEY (inventory_id) REFERENCES inventory(inventory_id) ON DELETE NO ACTION
);
```

### RentalPayments

Individual payments for rental contracts.

```sql
CREATE TABLE rental_payments (
    payment_id INT AUTO_INCREMENT PRIMARY KEY,
    contract_id INT NOT NULL,
    payment_number INT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    due_date DATE NOT NULL,
    payment_date DATE,
    status ENUM('scheduled', 'paid', 'late', 'missed', 'waived') NOT NULL DEFAULT 'scheduled',
    payment_method_id INT,
    transaction_id VARCHAR(255),
    notes TEXT,
    FOREIGN KEY (contract_id) REFERENCES rental_contracts(contract_id) ON DELETE CASCADE,
    FOREIGN KEY (payment_method_id) REFERENCES payment_methods(payment_method_id) ON DELETE SET NULL
);
```

### Reviews

Product reviews and ratings.

```sql
CREATE TABLE reviews (
    review_id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    user_id INT NOT NULL,
    rating TINYINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    title VARCHAR(255),
    comment TEXT,
    purchase_verified BOOLEAN DEFAULT FALSE,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);
```

### Carts

Shopping cart sessions.

```sql
CREATE TABLE carts (
    cart_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    session_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);
```

### CartItems

Items in shopping carts.

```sql
CREATE TABLE cart_items (
    cart_item_id INT AUTO_INCREMENT PRIMARY KEY,
    cart_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    price DECIMAL(10, 2) NOT NULL,
    purchase_type ENUM('buy', 'rent') NOT NULL DEFAULT 'buy',
    rental_term INT, -- in months, NULL if purchase_type is 'buy'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (cart_id) REFERENCES carts(cart_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE
);
```

### Coupons

Promotional discount codes.

```sql
CREATE TABLE coupons (
    coupon_id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255),
    discount_type ENUM('percentage', 'fixed_amount') NOT NULL,
    discount_value DECIMAL(10, 2) NOT NULL,
    minimum_order DECIMAL(10, 2) DEFAULT 0,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    usage_limit INT,
    times_used INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    applies_to ENUM('all', 'category', 'product') DEFAULT 'all',
    category_id INT,
    product_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(category_id) ON DELETE SET NULL,
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE SET NULL
);
```

### WishlistItems

User's saved items for future consideration.

```sql
CREATE TABLE wishlist_items (
    wishlist_item_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE,
    UNIQUE KEY user_product (user_id, product_id)
);
```

## Indexes

Additional indexes for performance optimization:

```sql
-- Users table
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_status ON users(status);

-- Products table
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_condition ON products(condition);
CREATE INDEX idx_products_featured ON products(is_featured);
CREATE INDEX idx_products_active ON products(is_active);
CREATE INDEX idx_products_slug ON products(slug);

-- Orders table
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_date ON orders(order_date);
CREATE INDEX idx_orders_number ON orders(order_number);

-- RentalContracts table
CREATE INDEX idx_rental_contracts_user ON rental_contracts(user_id);
CREATE INDEX idx_rental_contracts_status ON rental_contracts(status);
CREATE INDEX idx_rental_contracts_dates ON rental_contracts(start_date, end_date);
CREATE INDEX idx_rental_contracts_next_payment ON rental_contracts(next_payment_date);

-- Inventory table
CREATE INDEX idx_inventory_product ON inventory(product_id);
CREATE INDEX idx_inventory_status ON inventory(status);
CREATE INDEX idx_inventory_serial ON inventory(serial_number);

-- Reviews table
CREATE INDEX idx_reviews_product ON reviews(product_id);
CREATE INDEX idx_reviews_user ON reviews(user_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);
CREATE INDEX idx_reviews_status ON reviews(status);
```

## Sample Data

To initialize the database with test data, consider creating a seeder that populates these tables with realistic values representing common computer hardware items, varying conditions, and appropriate pricing for both purchase and rental options.

## Maintenance

Regular database maintenance should include:

1. **Backups**: Daily automated backups with point-in-time recovery capability
2. **Performance monitoring**: Regular review of slow queries and optimization
3. **Data archiving**: Implement an archiving strategy for old/inactive records
4. **Indexes**: Periodically review and optimize indexes based on query patterns

## Security Considerations

1. **User passwords**: Stored using strong one-way hashing (e.g., bcrypt with appropriate cost factor)
2. **Payment information**: Tokenized through payment processor, with minimal sensitive data stored locally
3. **Personal information**: Encrypted at rest for sensitive fields
4. **Access control**: Implement granular permissions for admin users to limit access to sensitive data
