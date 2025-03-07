import os
import sys
from flask import Flask, send_from_directory, jsonify, request
from flask_cors import CORS
import logging
from pathlib import Path

# Add the current directory to sys.path for relative imports
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, current_dir)

# Setup logging
logs_dir = os.path.join(current_dir, 'logs')
os.makedirs(logs_dir, exist_ok=True)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(os.path.join(logs_dir, 'admin_server.log')),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Determine the client directory path
CLIENT_DIR = os.path.join(current_dir, 'src', 'client')
if not os.path.exists(CLIENT_DIR):
    logger.error(f"Client directory not found at: {CLIENT_DIR}")
    sys.exit(1)

logger.info(f"Client directory found at: {CLIENT_DIR}")

# Check if index.html exists
if not os.path.exists(os.path.join(CLIENT_DIR, 'index.html')):
    logger.error("index.html not found")
    sys.exit(1)

logger.info("index.html found")

# Create Flask app
app = Flask(__name__, static_folder=CLIENT_DIR, static_url_path='')
CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)

# Bypass authentication for admin
@app.route('/')
@app.route('/admin')
def serve_admin():
    """Serve the admin dashboard directly without authentication."""
    return send_from_directory(app.static_folder, 'index.html')

# Mock admin API endpoints to return empty data
@app.route('/api/admin/movies', methods=['GET'])
def list_movies():
    """List all movies - mock endpoint."""
    return jsonify([
        {
            'id': 1,
            'title': 'Sample Movie 1',
            'release_year': 2023,
            'description': 'This is a sample movie for testing the admin dashboard',
            'images': [],
            'tags': [],
            'category_id': None
        },
        {
            'id': 2,
            'title': 'Sample Movie 2',
            'release_year': 2022,
            'description': 'Another sample movie for testing',
            'images': [],
            'tags': [],
            'category_id': None
        }
    ])

@app.route('/api/admin/tags', methods=['GET'])
def list_tags():
    """List all tags - mock endpoint."""
    return jsonify([
        {'id': 1, 'name': 'Action'},
        {'id': 2, 'name': 'Comedy'},
        {'id': 3, 'name': 'Drama'}
    ])

@app.route('/api/admin/categories', methods=['GET'])
def list_categories():
    """List all categories - mock endpoint."""
    return jsonify([
        {'id': 1, 'name': 'Hollywood'},
        {'id': 2, 'name': 'European'},
        {'id': 3, 'name': 'Asian'}
    ])

@app.route('/api/auth/current-user', methods=['GET'])
def current_user():
    """Return mock admin user data."""
    return jsonify({
        'id': 1,
        'username': 'admin',
        'email': 'admin@example.com',
        'is_admin': True
    })

if __name__ == '__main__':
    # Run the app on port 8889
    PORT = 8889
    logger.info(f"Starting admin bypass server on port {PORT}")
    logger.info(f"Admin URL: http://localhost:{PORT}/admin")
    app.run(host='0.0.0.0', port=PORT, debug=True) 