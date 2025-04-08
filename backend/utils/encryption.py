"""
Encryption utilities for GigGatek backend.
Provides functionality for encrypting and decrypting sensitive data in the database.
"""

import os
import base64
import hashlib
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC

class DatabaseEncryption:
    """
    Handles encryption and decryption of sensitive data for database storage.
    Uses Fernet symmetric encryption with a key derived from a master key.
    """
    
    def __init__(self, master_key=None):
        """
        Initialize the encryption utility.
        
        Args:
            master_key: Optional master key. If not provided, will try to get from environment
                        or generate a new one (for development only).
        """
        # Try to get the master key from the environment
        if master_key is None:
            master_key = os.environ.get('DB_ENCRYPTION_KEY')
        
        # If no key is provided or found in environment, generate one (for development only)
        if master_key is None:
            print("WARNING: No encryption key provided. Generating a temporary key for development.")
            print("WARNING: This should NOT be used in production.")
            master_key = self._generate_key()
        
        # Convert string key to bytes if needed
        if isinstance(master_key, str):
            master_key = master_key.encode('utf-8')
        
        # Derive encryption key from master key
        self.encryption_key = self._derive_key(master_key)
        self.cipher_suite = Fernet(self.encryption_key)
    
    def _generate_key(self):
        """Generate a random key (for development use only)."""
        key = Fernet.generate_key()
        # Convert to hex string for easier storage
        return base64.b64encode(key).decode('utf-8')
    
    def _derive_key(self, master_key):
        """
        Derive an encryption key from the master key using PBKDF2.
        
        Args:
            master_key: The master encryption key
            
        Returns:
            A Fernet-compatible encryption key
        """
        # Fixed salt - not ideal for production, but simplifies key derivation
        # In production, salt should be stored securely and consistently
        salt = b'giggatek_salt_should_be_changed_in_production'
        
        kdf = PBKDF2HMAC(
            algorithm=hashes.SHA256(),
            length=32,
            salt=salt,
            iterations=100000,
        )
        key = base64.urlsafe_b64encode(kdf.derive(master_key))
        return key
    
    def encrypt(self, data):
        """
        Encrypt data for storage in the database.
        
        Args:
            data: Data to encrypt (string or bytes)
            
        Returns:
            Base64-encoded encrypted data suitable for database storage
        """
        if data is None:
            return None
        
        # Convert data to bytes if needed
        if isinstance(data, str):
            data = data.encode('utf-8')
        
        # Encrypt using Fernet
        encrypted_data = self.cipher_suite.encrypt(data)
        
        # Convert to base64 string for database storage
        return base64.b64encode(encrypted_data).decode('utf-8')
    
    def decrypt(self, encrypted_data):
        """
        Decrypt data retrieved from the database.
        
        Args:
            encrypted_data: Base64-encoded encrypted data from database
            
        Returns:
            Original decrypted data as a string
        """
        if encrypted_data is None:
            return None
        
        # Convert from base64 string to bytes
        if isinstance(encrypted_data, str):
            encrypted_data = base64.b64decode(encrypted_data)
        
        # Decrypt using Fernet
        decrypted_data = self.cipher_suite.decrypt(encrypted_data)
        
        # Return as string
        return decrypted_data.decode('utf-8')

# Create a singleton instance
db_encryption = DatabaseEncryption()

# Helper functions for easier use
def encrypt_data(data):
    """Encrypt data for database storage."""
    return db_encryption.encrypt(data)

def decrypt_data(encrypted_data):
    """Decrypt data retrieved from database."""
    return db_encryption.decrypt(encrypted_data)

def hash_sensitive_data(data, salt=None):
    """
    Create a one-way hash of sensitive data (like SSN, for matching without storing).
    
    Args:
        data: The data to hash
        salt: Optional salt to use (will generate one if not provided)
        
    Returns:
        dict with 'hash' and 'salt' keys
    """
    if data is None:
        return None
    
    # Convert data to bytes if needed
    if isinstance(data, str):
        data = data.encode('utf-8')
    
    # Generate a random salt if none is provided
    if salt is None:
        salt = os.urandom(16)
    elif isinstance(salt, str):
        salt = salt.encode('utf-8')
    
    # Create hash
    hash_obj = hashlib.pbkdf2_hmac('sha256', data, salt, 100000)
    
    return {
        'hash': base64.b64encode(hash_obj).decode('utf-8'),
        'salt': base64.b64encode(salt).decode('utf-8')
    }

def verify_hashed_data(data, stored_hash, stored_salt):
    """
    Verify if provided data matches the stored hash.
    
    Args:
        data: The data to verify
        stored_hash: The previously stored hash (base64 string)
        stored_salt: The salt used for hashing (base64 string)
        
    Returns:
        True if the data matches the hash, False otherwise
    """
    if data is None or stored_hash is None or stored_salt is None:
        return False
    
    # Convert data to bytes if needed
    if isinstance(data, str):
        data = data.encode('utf-8')
    
    # Decode salt
    salt = base64.b64decode(stored_salt)
    
    # Create hash with same salt
    hash_obj = hashlib.pbkdf2_hmac('sha256', data, salt, 100000)
    new_hash = base64.b64encode(hash_obj).decode('utf-8')
    
    # Compare hashes
    return new_hash == stored_hash

# PII field encryption/decryption
def encrypt_pii_fields(data, pii_fields):
    """
    Encrypt multiple PII fields in a data dictionary.
    
    Args:
        data: Dictionary containing data to encrypt
        pii_fields: List of field names that should be encrypted
        
    Returns:
        Dictionary with encrypted fields
    """
    if not data or not pii_fields:
        return data
    
    encrypted_data = data.copy()
    for field in pii_fields:
        if field in encrypted_data and encrypted_data[field] is not None:
            encrypted_data[field] = encrypt_data(str(encrypted_data[field]))
    
    return encrypted_data

def decrypt_pii_fields(data, pii_fields):
    """
    Decrypt multiple PII fields in a data dictionary.
    
    Args:
        data: Dictionary containing encrypted data
        pii_fields: List of field names that should be decrypted
        
    Returns:
        Dictionary with decrypted fields
    """
    if not data or not pii_fields:
        return data
    
    decrypted_data = data.copy()
    for field in pii_fields:
        if field in decrypted_data and decrypted_data[field] is not None:
            decrypted_data[field] = decrypt_data(decrypted_data[field])
    
    return decrypted_data
