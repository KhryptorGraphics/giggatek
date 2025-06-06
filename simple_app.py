"""
Simple Flask application to test the setup.
"""

from flask import Flask, jsonify

app = Flask(__name__)

@app.route('/')
def home():
    return "GigGatek Backend is running!"

@app.route('/api/test')
def test():
    return jsonify({"status": "success", "message": "API is working!"})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
