-- Create marketing_integrations table
CREATE TABLE IF NOT EXISTS marketing_integrations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    provider ENUM('mailchimp', 'klaviyo', 'hubspot', 'sendgrid', 'custom') NOT NULL,
    api_key VARCHAR(255) NULL,
    api_secret VARCHAR(255) NULL,
    api_endpoint VARCHAR(255) NULL,
    config JSON NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    active BOOLEAN DEFAULT TRUE,
    UNIQUE INDEX idx_name (name),
    INDEX idx_provider (provider),
    INDEX idx_active (active)
);

-- Create marketing_lists table
CREATE TABLE IF NOT EXISTS marketing_lists (
    id INT AUTO_INCREMENT PRIMARY KEY,
    integration_id INT NOT NULL,
    external_id VARCHAR(100) NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    member_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_synced_at TIMESTAMP NULL,
    FOREIGN KEY (integration_id) REFERENCES marketing_integrations(id) ON DELETE CASCADE,
    UNIQUE INDEX idx_integration_external (integration_id, external_id),
    INDEX idx_name (name)
);

-- Create marketing_events table
CREATE TABLE IF NOT EXISTS marketing_events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    integration_id INT NOT NULL,
    event_type ENUM('cart_abandoned', 'cart_recovered', 'email_sent', 'email_opened', 'email_clicked', 'purchase', 'custom') NOT NULL,
    user_id INT NULL,
    email VARCHAR(255) NULL,
    data JSON NULL,
    external_id VARCHAR(100) NULL,
    status ENUM('pending', 'sent', 'failed', 'processed') DEFAULT 'pending',
    error_message TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP NULL,
    FOREIGN KEY (integration_id) REFERENCES marketing_integrations(id) ON DELETE CASCADE,
    INDEX idx_integration_id (integration_id),
    INDEX idx_event_type (event_type),
    INDEX idx_user_id (user_id),
    INDEX idx_email (email),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
);

-- Create marketing_templates table
CREATE TABLE IF NOT EXISTS marketing_templates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    integration_id INT NOT NULL,
    external_id VARCHAR(100) NULL,
    name VARCHAR(100) NOT NULL,
    subject VARCHAR(255) NULL,
    content TEXT NULL,
    template_type ENUM('abandoned_cart', 'welcome', 'order_confirmation', 'custom') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (integration_id) REFERENCES marketing_integrations(id) ON DELETE CASCADE,
    INDEX idx_integration_id (integration_id),
    INDEX idx_template_type (template_type)
);

-- Create marketing_sync_logs table
CREATE TABLE IF NOT EXISTS marketing_sync_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    integration_id INT NOT NULL,
    sync_type ENUM('contacts', 'lists', 'templates', 'events', 'full') NOT NULL,
    status ENUM('started', 'completed', 'failed') NOT NULL,
    items_processed INT DEFAULT 0,
    items_succeeded INT DEFAULT 0,
    items_failed INT DEFAULT 0,
    error_message TEXT NULL,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    FOREIGN KEY (integration_id) REFERENCES marketing_integrations(id) ON DELETE CASCADE,
    INDEX idx_integration_id (integration_id),
    INDEX idx_sync_type (sync_type),
    INDEX idx_status (status),
    INDEX idx_started_at (started_at)
);
