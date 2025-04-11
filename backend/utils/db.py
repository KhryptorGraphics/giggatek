"""
Database utility functions for GigGatek backend.
"""

import mysql.connector
from mysql.connector import Error
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def get_db_connection():
    """
    Establishes a connection to the MySQL database using environment variables.

    Returns:
        A MySQL connection object if successful, None otherwise.
    """
    # Database Configuration from environment variables
    DB_CONFIG = {
        'host': os.getenv('DB_HOST', 'localhost'),
        'port': int(os.getenv('DB_PORT', 3306)),
        'user': os.getenv('DB_USER', 'giggatek_user'),
        'password': os.getenv('DB_PASSWORD', 'giggatek_password'),
        'database': os.getenv('DB_NAME', 'giggatek')
    }

    conn = None
    try:
        conn = mysql.connector.connect(**DB_CONFIG)
        if conn.is_connected():
            print(f"Connected to MySQL database: {DB_CONFIG['database']} on {DB_CONFIG['host']}")
    except Error as e:
        print(f"Error connecting to MySQL Database: {e}")
    return conn
