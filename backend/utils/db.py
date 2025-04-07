"""
Database utility functions for GigGatek backend.
"""

import mysql.connector
from mysql.connector import Error

# Database Configuration
DB_CONFIG = {
    'host': 'localhost',  # Assuming MySQL is running on the same server for now
    'user': 'root',
    'password': 'teamrsi12teamrsi12',
    'database': 'giggatek'
}

def get_db_connection():
    """
    Establishes a connection to the MySQL database.
    
    Returns:
        A MySQL connection object if successful, None otherwise.
    """
    conn = None
    try:
        conn = mysql.connector.connect(**DB_CONFIG)
    except Error as e:
        print(f"Error connecting to MySQL Database: {e}")
    return conn
