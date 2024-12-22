#!/usr/bin/env python3
import http.server
import socketserver
import json
import os
import logging
from urllib.parse import urlparse, parse_qs

# Logging configuratie
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('server.log'),
        logging.StreamHandler()
    ]
)

# Basis directory configuratie
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
CLIENT_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'client')
DATA_DIR = os.path.join(BASE_DIR, 'data')

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

def run_server(port=8888):
    try:
        logging.debug(f"Starting server on port {port}")
        logging.debug(f"Current working directory: {os.getcwd()}")
        logging.debug(f"Client directory: {CLIENT_DIR}")
        logging.debug(f"Data directory: {DATA_DIR}")
        
        # Maak socket met SO_REUSEADDR optie
        socketserver.TCPServer.allow_reuse_address = True
        
        with socketserver.TCPServer(("0.0.0.0", port), MovieGameHandler) as httpd:
            logging.info(f"Server running on 0.0.0.0:{port}")
            logging.info(f"Try accessing via:")
            logging.info(f"- http://localhost:{port}")
            logging.info(f"- http://127.0.0.1:{port}")
            logging.info(f"- http://[your-ip]:{port}")
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
