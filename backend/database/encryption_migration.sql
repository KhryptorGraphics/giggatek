-- Migration script to update users table for PII encryption

-- Add encrypted columns for PII data
ALTER TABLE `users` ADD COLUMN IF NOT EXISTS `first_name_encrypted` VARCHAR(500);
ALTER TABLE `users` ADD COLUMN IF NOT EXISTS `last_name_encrypted` VARCHAR(500);
ALTER TABLE `users` ADD COLUMN IF NOT EXISTS `phone_encrypted` VARCHAR(500);

-- Create stored procedure to migrate existing data (for development, in production this should be done with a secure script)
DELIMITER //
CREATE PROCEDURE migrate_to_encrypted_pii()
BEGIN
    -- This is a placeholder for the actual encryption process
    -- In real implementation, this would be done in application code using the encryption utilities
    -- We're only creating this structure to document the migration process
    
    -- Example:
    -- UPDATE `users` SET 
    --   `first_name_encrypted` = ENCRYPT_FUNCTION(`first_name`),
    --   `last_name_encrypted` = ENCRYPT_FUNCTION(`last_name`),
    --   `phone_encrypted` = ENCRYPT_FUNCTION(`phone`);
    
    SELECT 'Migration process defined. Actual encryption should be performed by application code.' AS message;
END //
DELIMITER ;

-- Create audit table for tracking encryption operations
CREATE TABLE IF NOT EXISTS `encryption_audit` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `operation` VARCHAR(50) NOT NULL,
  `table_name` VARCHAR(100) NOT NULL,
  `record_id` INT NOT NULL,
  `encrypted_fields` JSON,
  `performed_by` VARCHAR(255),
  `timestamp` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for efficient audit queries
CREATE INDEX IF NOT EXISTS idx_encryption_audit_table_record ON `encryption_audit` (`table_name`, `record_id`);
