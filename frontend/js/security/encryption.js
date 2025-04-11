/**
 * Encryption Module
 * 
 * This module provides encryption and decryption functionality for API requests and responses.
 * It uses the Web Crypto API for secure encryption.
 */

class EncryptionService {
  constructor() {
    this.enabled = false;
    this.publicKey = null;
    this.privateKey = null;
    this.serverPublicKey = null;
    this.keyPair = null;
    
    // Initialize encryption service
    this.initialize();
  }
  
  /**
   * Initialize encryption service
   */
  async initialize() {
    try {
      // Check if Web Crypto API is available
      if (!window.crypto || !window.crypto.subtle) {
        console.warn('Web Crypto API is not available. Encryption will be disabled.');
        return;
      }
      
      // Generate key pair
      await this.generateKeyPair();
      
      // Enable encryption
      this.enabled = true;
      
      // Add event listener for server public key
      window.addEventListener('encryption:serverKey', event => {
        if (event.detail && event.detail.key) {
          this.setServerPublicKey(event.detail.key);
        }
      });
    } catch (error) {
      console.error('Error initializing encryption service:', error);
      this.enabled = false;
    }
  }
  
  /**
   * Generate key pair for encryption
   */
  async generateKeyPair() {
    try {
      // Generate RSA key pair
      this.keyPair = await window.crypto.subtle.generateKey(
        {
          name: 'RSA-OAEP',
          modulusLength: 2048,
          publicExponent: new Uint8Array([0x01, 0x00, 0x01]), // 65537
          hash: { name: 'SHA-256' }
        },
        true, // extractable
        ['encrypt', 'decrypt'] // key usages
      );
      
      // Export public key
      const publicKeyBuffer = await window.crypto.subtle.exportKey(
        'spki',
        this.keyPair.publicKey
      );
      
      // Convert public key to base64
      this.publicKey = this.arrayBufferToBase64(publicKeyBuffer);
      
      // Store private key
      this.privateKey = this.keyPair.privateKey;
      
      return this.publicKey;
    } catch (error) {
      console.error('Error generating key pair:', error);
      throw error;
    }
  }
  
  /**
   * Set server public key
   * 
   * @param {string} key - Server public key in base64 format
   */
  async setServerPublicKey(key) {
    try {
      // Convert base64 to array buffer
      const keyBuffer = this.base64ToArrayBuffer(key);
      
      // Import server public key
      this.serverPublicKey = await window.crypto.subtle.importKey(
        'spki',
        keyBuffer,
        {
          name: 'RSA-OAEP',
          hash: { name: 'SHA-256' }
        },
        true, // extractable
        ['encrypt'] // key usages
      );
      
      return true;
    } catch (error) {
      console.error('Error setting server public key:', error);
      return false;
    }
  }
  
  /**
   * Encrypt data
   * 
   * @param {Object|string} data - Data to encrypt
   * @returns {Object} Encrypted data with public key
   */
  async encrypt(data) {
    if (!this.enabled || !this.serverPublicKey) {
      return { encrypted: false, data };
    }
    
    try {
      // Convert data to string
      const dataString = typeof data === 'string' ? data : JSON.stringify(data);
      
      // Generate random AES key
      const aesKey = await window.crypto.subtle.generateKey(
        {
          name: 'AES-GCM',
          length: 256
        },
        true, // extractable
        ['encrypt', 'decrypt'] // key usages
      );
      
      // Generate random IV
      const iv = window.crypto.getRandomValues(new Uint8Array(12));
      
      // Encrypt data with AES key
      const encryptedData = await window.crypto.subtle.encrypt(
        {
          name: 'AES-GCM',
          iv
        },
        aesKey,
        new TextEncoder().encode(dataString)
      );
      
      // Export AES key
      const exportedKey = await window.crypto.subtle.exportKey('raw', aesKey);
      
      // Encrypt AES key with server public key
      const encryptedKey = await window.crypto.subtle.encrypt(
        {
          name: 'RSA-OAEP'
        },
        this.serverPublicKey,
        exportedKey
      );
      
      // Return encrypted data
      return {
        encrypted: true,
        key: this.arrayBufferToBase64(encryptedKey),
        iv: this.arrayBufferToBase64(iv),
        data: this.arrayBufferToBase64(encryptedData),
        publicKey: this.publicKey
      };
    } catch (error) {
      console.error('Error encrypting data:', error);
      return { encrypted: false, data };
    }
  }
  
  /**
   * Decrypt data
   * 
   * @param {Object} encryptedData - Encrypted data
   * @returns {Object|string} Decrypted data
   */
  async decrypt(encryptedData) {
    if (!this.enabled || !this.privateKey || !encryptedData.encrypted) {
      return encryptedData.data;
    }
    
    try {
      // Convert base64 to array buffer
      const encryptedKey = this.base64ToArrayBuffer(encryptedData.key);
      const iv = this.base64ToArrayBuffer(encryptedData.iv);
      const data = this.base64ToArrayBuffer(encryptedData.data);
      
      // Decrypt AES key with private key
      const decryptedKey = await window.crypto.subtle.decrypt(
        {
          name: 'RSA-OAEP'
        },
        this.privateKey,
        encryptedKey
      );
      
      // Import AES key
      const aesKey = await window.crypto.subtle.importKey(
        'raw',
        decryptedKey,
        {
          name: 'AES-GCM',
          length: 256
        },
        false, // extractable
        ['decrypt'] // key usages
      );
      
      // Decrypt data with AES key
      const decryptedData = await window.crypto.subtle.decrypt(
        {
          name: 'AES-GCM',
          iv
        },
        aesKey,
        data
      );
      
      // Convert array buffer to string
      const dataString = new TextDecoder().decode(decryptedData);
      
      // Parse JSON if possible
      try {
        return JSON.parse(dataString);
      } catch (e) {
        return dataString;
      }
    } catch (error) {
      console.error('Error decrypting data:', error);
      return encryptedData.data;
    }
  }
  
  /**
   * Convert array buffer to base64
   * 
   * @param {ArrayBuffer} buffer - Array buffer
   * @returns {string} Base64 string
   */
  arrayBufferToBase64(buffer) {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }
  
  /**
   * Convert base64 to array buffer
   * 
   * @param {string} base64 - Base64 string
   * @returns {ArrayBuffer} Array buffer
   */
  base64ToArrayBuffer(base64) {
    const binaryString = window.atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  }
  
  /**
   * Check if encryption is enabled
   * 
   * @returns {boolean} True if encryption is enabled
   */
  isEnabled() {
    return this.enabled && this.serverPublicKey !== null;
  }
  
  /**
   * Get public key
   * 
   * @returns {string} Public key in base64 format
   */
  getPublicKey() {
    return this.publicKey;
  }
}

// Create global encryption service instance
const encryptionService = new EncryptionService();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = encryptionService;
}
