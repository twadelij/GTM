#!/usr/bin/env python3
import http.server
import socketserver
import json
import os
import logging
import sys
from urllib.parse import urlparse, parse_qs
from pathlib import Path

# Load environment variables from .env file
try:
    from dotenv import load_dotenv
    # Load environment variables from .env file
    env_path = Path(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))).joinpath('.env')
    load_dotenv(dotenv_path=env_path)
except ImportError:
    print("python-dotenv not installed, using default environment variables")

# Logging configuratie
log_level = logging.DEBUG if os.getenv('DEBUG', 'False').lower() == 'true' else logging.INFO
logging.basicConfig(
    level=log_level,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('server.log'),
        logging.StreamHandler()
    ]
)

# Basis directory configuratie
BASE_DIR = os.getenv('BASE_DIR', os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
CLIENT_DIR = os.getenv('CLIENT_DIR', os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'client'))
DATA_DIR = os.getenv('DATA_DIR', os.path.join(BASE_DIR, 'data'))

class MovieGameHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=CLIENT_DIR, **kwargs)
    
    def do_GET(self):
        try:
            # Parse URL
            parsed_url = urlparse(self.path)
            path = parsed_url.path
            
            # Log request
            logging.info(f"GET request: {path}")
            
            # API endpoints
            if path.startswith('/data/'):
                self.serve_data_file(path)
            else:
                super().do_GET()
                
        except Exception as e:
            logging.error(f"Error handling GET request: {str(e)}")
            self.send_error(500, f"Internal Server Error: {str(e)}")
    
    def serve_data_file(self, path):
        try:
            # Verwijder /data/ prefix en normaliseer pad
            relative_path = os.path.normpath(path.replace('/data/', ''))
            file_path = os.path.join(DATA_DIR, relative_path)
            
            # Veiligheidscheck - voorkom directory traversal
            if not file_path.startswith(DATA_DIR):
                self.send_error(403, "Forbidden")
                return
            
            # Check bestandstype en zet juiste content-type
            if file_path.endswith('.json'):
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                with open(file_path, 'rb') as f:
                    self.wfile.write(f.read())
            elif file_path.endswith(('.jpg', '.jpeg')):
                self.send_response(200)
                self.send_header('Content-Type', 'image/jpeg')
                self.end_headers()
                with open(file_path, 'rb') as f:
                    self.wfile.write(f.read())
            else:
                self.send_error(404, "File not found")
        
        except Exception as e:
            logging.error(f"Error serving data file: {str(e)}")
            self.send_error(500, f"Internal Server Error: {str(e)}")

def run_server(host=None, port=None):
    try:
        # Get host and port from environment variables if not provided
        if host is None:
            host = os.getenv('HOST', '0.0.0.0')
        if port is None:
            port = int(os.getenv('PORT', '8888'))
            
        logging.debug(f"Starting server on {host}:{port}")
        logging.debug(f"Current working directory: {os.getcwd()}")
        logging.debug(f"Client directory: {CLIENT_DIR}")
        logging.debug(f"Data directory: {DATA_DIR}")
        logging.debug(f"Debug mode: {os.getenv('DEBUG', 'False')}")
        
        # Maak socket met SO_REUSEADDR optie
        socketserver.TCPServer.allow_reuse_address = True
        
        with socketserver.TCPServer((host, port), MovieGameHandler) as httpd:
            domain = os.getenv('DOMAIN', 'localhost')
            logging.info(f"Server running on {host}:{port}")
            logging.info(f"Try accessing via:")
            logging.info(f"- http://{domain}:{port if port != 80 else ''}")
            logging.info(f"- http://localhost:{port}")
            logging.info(f"- http://127.0.0.1:{port}")
            httpd.serve_forever()
    except OSError as e:
        if e.errno == 98:  # Address already in use
            logging.error("Port is already in use. Please stop any running server first.")
            logging.error("You can use: pkill -f 'python3.*server.py'")
        else:
            logging.error(f"Server error: {str(e)}")
        raise
    except Exception as e:
        logging.error(f"Server error: {str(e)}")
        raise

if __name__ == "__main__":
    run_server()
