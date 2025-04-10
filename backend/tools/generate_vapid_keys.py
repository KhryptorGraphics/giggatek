#!/usr/bin/env python
"""
Generate VAPID keys for Web Push notifications.

This script generates a pair of VAPID keys (public and private) that are used
for authenticating push notification requests. The keys are saved to a .env file
that can be loaded by the application.

Usage:
    python generate_vapid_keys.py

Requirements:
    pip install py-vapid
"""

import os
import base64
from py_vapid import Vapid

def generate_vapid_keys():
    """Generate VAPID keys and save them to .env file."""
    # Create Vapid instance
    vapid = Vapid()
    
    # Generate keys
    vapid.generate_keys()
    
    # Get keys in the correct format
    private_key = vapid.private_key.private_numbers().private_value
    private_key_base64 = base64.urlsafe_b64encode(private_key.to_bytes(32, byteorder='big')).decode('utf-8')
    
    public_key = vapid.get_public_key()
    public_key_base64 = base64.urlsafe_b64encode(public_key).decode('utf-8')
    
    # Print keys
    print("VAPID keys generated successfully!")
    print(f"VAPID_PRIVATE_KEY={private_key_base64}")
    print(f"VAPID_PUBLIC_KEY={public_key_base64}")
    
    # Save to .env file
    env_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), '.env')
    
    # Check if .env file exists
    if os.path.exists(env_path):
        # Read existing .env file
        with open(env_path, 'r') as f:
            env_content = f.read()
        
        # Check if VAPID keys already exist
        if 'VAPID_PRIVATE_KEY' in env_content:
            # Replace existing keys
            lines = env_content.split('\n')
            new_lines = []
            
            for line in lines:
                if line.startswith('VAPID_PRIVATE_KEY=') or line.startswith('VAPID_PUBLIC_KEY='):
                    continue
                new_lines.append(line)
            
            env_content = '\n'.join(new_lines)
        
        # Add new keys
        if env_content and not env_content.endswith('\n'):
            env_content += '\n'
        
        env_content += f"VAPID_PRIVATE_KEY={private_key_base64}\n"
        env_content += f"VAPID_PUBLIC_KEY={public_key_base64}\n"
        
        # Write updated content
        with open(env_path, 'w') as f:
            f.write(env_content)
    else:
        # Create new .env file
        with open(env_path, 'w') as f:
            f.write(f"VAPID_PRIVATE_KEY={private_key_base64}\n")
            f.write(f"VAPID_PUBLIC_KEY={public_key_base64}\n")
    
    print(f"VAPID keys saved to {env_path}")

if __name__ == '__main__':
    generate_vapid_keys()
