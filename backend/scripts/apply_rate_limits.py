#!/usr/bin/env python3
"""
Apply Rate Limits

This script applies recommended rate limits to the API configuration.
"""

import os
import sys
import json
import argparse
import datetime

# Add the parent directory to the path so we can import the utils module
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

def parse_args():
    """Parse command line arguments"""
    parser = argparse.ArgumentParser(description='Apply recommended rate limits')
    parser.add_argument('--recommendations-file', type=str, required=True,
                        help='Path to the recommendations JSON file')
    parser.add_argument('--config-file', type=str, default='../config/rate_limits.json',
                        help='Path to the rate limit configuration file (default: ../config/rate_limits.json)')
    parser.add_argument('--dry-run', action='store_true',
                        help='Dry run (do not modify the configuration file)')
    parser.add_argument('--apply-global', action='store_true',
                        help='Apply global rate limits')
    parser.add_argument('--apply-endpoint', action='store_true',
                        help='Apply endpoint rate limits')
    parser.add_argument('--apply-client', action='store_true',
                        help='Apply client rate limits')
    parser.add_argument('--apply-all', action='store_true',
                        help='Apply all rate limits')
    return parser.parse_args()

def load_recommendations(file_path):
    """Load rate limit recommendations from a file"""
    try:
        with open(file_path, 'r') as f:
            data = json.load(f)
        
        return data.get('recommendations', {})
    except (json.JSONDecodeError, IOError) as e:
        print(f"Error loading recommendations file: {e}")
        sys.exit(1)

def load_config(file_path):
    """Load rate limit configuration from a file"""
    try:
        with open(file_path, 'r') as f:
            return json.load(f)
    except (json.JSONDecodeError, IOError):
        # Return default configuration if file doesn't exist or is invalid
        return {
            'global_limits': {
                'per_second': 10,
                'per_minute': 100,
                'per_hour': 1000
            },
            'endpoint_limits': {},
            'client_limits': {}
        }

def save_config(config, file_path):
    """Save rate limit configuration to a file"""
    # Create directory if it doesn't exist
    os.makedirs(os.path.dirname(file_path), exist_ok=True)
    
    try:
        with open(file_path, 'w') as f:
            json.dump(config, f, indent=2)
        return True
    except IOError as e:
        print(f"Error saving configuration file: {e}")
        return False

def apply_global_limits(config, recommendations):
    """Apply global rate limits"""
    global_limits = recommendations.get('global_limits', {})
    if not global_limits:
        print("No global rate limits found in recommendations")
        return config
    
    # Update global limits
    config['global_limits'] = {
        'per_second': global_limits.get('per_second', config['global_limits'].get('per_second', 10)),
        'per_minute': global_limits.get('per_minute', config['global_limits'].get('per_minute', 100)),
        'per_hour': global_limits.get('per_hour', config['global_limits'].get('per_hour', 1000))
    }
    
    print("Applied global rate limits:")
    print(f"  Per Second: {config['global_limits']['per_second']}")
    print(f"  Per Minute: {config['global_limits']['per_minute']}")
    print(f"  Per Hour: {config['global_limits']['per_hour']}")
    
    return config

def apply_endpoint_limits(config, recommendations):
    """Apply endpoint rate limits"""
    endpoint_limits = recommendations.get('endpoint_limits', {})
    if not endpoint_limits:
        print("No endpoint rate limits found in recommendations")
        return config
    
    # Initialize endpoint limits if not present
    if 'endpoint_limits' not in config:
        config['endpoint_limits'] = {}
    
    # Update endpoint limits
    for endpoint, limits in endpoint_limits.items():
        config['endpoint_limits'][endpoint] = {
            'per_second': limits.get('per_second', 5),
            'per_minute': limits.get('per_minute', 60),
            'per_hour': limits.get('per_hour', 600)
        }
    
    print(f"Applied rate limits for {len(endpoint_limits)} endpoints")
    
    return config

def apply_client_limits(config, recommendations):
    """Apply client rate limits"""
    client_limits = recommendations.get('client_limits', {})
    if not client_limits:
        print("No client rate limits found in recommendations")
        return config
    
    # Initialize client limits if not present
    if 'client_limits' not in config:
        config['client_limits'] = {}
    
    # Update client limits (only for top clients)
    # Sort clients by per_minute limit (highest first)
    sorted_clients = sorted(
        client_limits.items(),
        key=lambda x: x[1]['per_minute'],
        reverse=True
    )
    
    # Apply limits for top 10 clients
    for client_id, limits in sorted_clients[:10]:
        config['client_limits'][client_id] = {
            'per_second': limits.get('per_second', 1),
            'per_minute': limits.get('per_minute', 10),
            'per_hour': limits.get('per_hour', 100)
        }
    
    print(f"Applied rate limits for {min(10, len(client_limits))} clients")
    
    return config

def main():
    """Main function"""
    args = parse_args()
    
    # Load recommendations
    recommendations = load_recommendations(args.recommendations_file)
    
    # Load current configuration
    config = load_config(args.config_file)
    
    # Make a copy of the original configuration
    original_config = json.loads(json.dumps(config))
    
    # Apply rate limits
    if args.apply_all or args.apply_global:
        config = apply_global_limits(config, recommendations)
    
    if args.apply_all or args.apply_endpoint:
        config = apply_endpoint_limits(config, recommendations)
    
    if args.apply_all or args.apply_client:
        config = apply_client_limits(config, recommendations)
    
    # Check if configuration has changed
    if config == original_config:
        print("No changes to apply")
        return
    
    # Save configuration
    if args.dry_run:
        print("\nDry run - not saving changes")
        print(f"Configuration would be saved to: {args.config_file}")
    else:
        print(f"\nSaving configuration to: {args.config_file}")
        if save_config(config, args.config_file):
            print("Configuration saved successfully")
            
            # Add timestamp to configuration
            config['last_updated'] = datetime.datetime.now().isoformat()
            
            # Save a backup of the configuration
            backup_file = f"{args.config_file}.{datetime.datetime.now().strftime('%Y%m%d%H%M%S')}.bak"
            save_config(config, backup_file)
            print(f"Backup saved to: {backup_file}")
        else:
            print("Failed to save configuration")

if __name__ == '__main__':
    main()
