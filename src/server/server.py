#!/usr/bin/env python3
import http.server
import socketserver
import json
import os
import logging
from urllib.parse import urlparse, parse_qs
from pathlib import Path

# Configure logging
logging.basicConfig(
    level=logging.DEBUG,  # Change to DEBUG for more information
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('logs/server.log', mode='w'),  # Overwrite old logs
        logging.StreamHandler()
    ]
)

logger = logging.getLogger(__name__)

def verify_server_setup():
    """Check if all required files and directories are present."""
    logger.info("Verifying server setup...")
    
    # Log current directory
    current_dir = os.getcwd()
    logger.info(f"Current directory: {current_dir}")
    
    # Check data directory
    data_dir = os.path.join(current_dir, "data", "movies")
    logger.info(f"Looking for data directory: {data_dir}")
    if not os.path.exists(data_dir):
        logger.error(f"Data directory not found: {data_dir}")
        return False
    
    # Check movies.json
    movies_json = os.path.join(current_dir, "data", "movies.json")
    logger.info(f"Looking for movies.json: {movies_json}")
    if not os.path.exists(movies_json):
        logger.error(f"movies.json not found: {movies_json}")
        return False
    
    # Validate movies.json structure
    try:
        logger.info("Validating movies.json...")
        with open(movies_json, 'r', encoding='utf-8') as f:
            data = json.load(f)
            if not isinstance(data, dict) or 'results' not in data:
                logger.error("Invalid movies.json structure")
                return False
            if not data['results']:
                logger.error("No movies found in movies.json")
                return False
            logger.info(f"Number of movies found: {len(data['results'])}")
    except json.JSONDecodeError as e:
        logger.error(f"Error reading movies.json: {e}")
        return False
    except Exception as e:
        logger.error(f"Unexpected error validating movies.json: {e}")
        return False
    
    # Check client files
    src_dir = os.path.join(current_dir, "src", "client")
    logger.info(f"Looking for client files in: {src_dir}")
    
    required_files = [
        os.path.join(src_dir, "index.html"),
        os.path.join(src_dir, "js", "config.js"),
        os.path.join(src_dir, "js", "movieDb.js"),
        os.path.join(src_dir, "js", "script.js"),
        os.path.join(src_dir, "js", "imageManager.js"),
        os.path.join(src_dir, "css", "styles.css")
    ]
    
    for file_path in required_files:
        logger.info(f"Checking file: {file_path}")
        if not os.path.exists(file_path):
            logger.error(f"Required file not found: {file_path}")
            return False
    
    logger.info("Server setup verification successful!")
    return True

class MovieGameHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        # Use the src/client directory as root
        current_dir = os.getcwd()
        client_dir = os.path.join(current_dir, "src", "client")
        super().__init__(*args, directory=client_dir, **kwargs)
    
    def log_message(self, format, *args):
        logger.info(format%args)
    
    def do_GET(self):
        logger.info(f"GET request received for: {self.path}")
        try:
            # Special handling for /data/ requests
            if self.path.startswith('/data/'):
                self.serve_data_file()
                return
            super().do_GET()
        except Exception as e:
            logger.error(f"Error handling GET request: {e}")
            self.send_error(500, f"Internal Server Error: {str(e)}")
    
    def serve_data_file(self):
        try:
            # Remove /data/ prefix and normalize path
            path = self.path.replace('/data/', '')
            current_dir = os.getcwd()
            file_path = os.path.join(current_dir, "data", path)
            
            # Security check
            if not os.path.abspath(file_path).startswith(os.path.abspath(os.path.join(current_dir, "data"))):
                self.send_error(403, "Forbidden")
                return
            
            if not os.path.exists(file_path):
                self.send_error(404, "File not found")
                return
            
            # Determine content type
            if file_path.endswith('.json'):
                content_type = 'application/json'
            elif file_path.endswith(('.jpg', '.jpeg')):
                content_type = 'image/jpeg'
            else:
                self.send_error(415, "Unsupported Media Type")
                return
            
            # Send the file
            self.send_response(200)
            self.send_header('Content-Type', content_type)
            self.end_headers()
            with open(file_path, 'rb') as f:
                self.wfile.write(f.read())
                
        except Exception as e:
            logger.error(f"Error serving data file: {e}")
            self.send_error(500, f"Internal Server Error: {str(e)}")

def run_server(port=8888):
    """Start the server with health checks."""
    try:
        # Run setup verification
        if not verify_server_setup():
            logger.error("Server setup verification failed. Server will not start.")
            return False
        
        # Start the server
        logger.info("Setup verification successful, starting server...")
        with socketserver.TCPServer(("", port), MovieGameHandler) as httpd:
            logger.info(f"Server running at http://localhost:{port}")
            logger.info("Use Ctrl+C to stop")
            httpd.serve_forever()
            
    except OSError as e:
        if e.errno == 98:  # Address already in use
            logger.error(f"Port {port} is already in use. Try first: pkill -f 'python.*server.py'")
        else:
            logger.error(f"OS Error starting server: {e}")
        return False
    except KeyboardInterrupt:
        logger.info("Server stopped by user")
        return True
    except Exception as e:
        logger.error(f"Unexpected error starting server: {e}")
        return False
    return True

if __name__ == "__main__":
    logger.info("Movie Game Server starting...")
    success = run_server()
    if not success:
        logger.error("Server could not be started.")
        exit(1)
