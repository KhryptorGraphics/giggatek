"""
Test if Flask is installed and can be imported.
"""

try:
    import flask
    print("Flask is installed and can be imported.")
    print(f"Flask version: {flask.__version__}")
except ImportError:
    print("Flask is not installed or cannot be imported.")
