#!/usr/bin/env python3
import http.server
import socketserver
import json
import os
import logging
from urllib.parse import urlparse, parse_qs
from pathlib import Path

# Configureer logging
logging.basicConfig(
    level=logging.DEBUG,  # Verander naar DEBUG voor meer informatie
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('server.log', mode='w'),  # Overschrijf oude logs
        logging.StreamHandler()
    ]
)

logger = logging.getLogger(__name__)

def verify_server_setup():
    """Controleer of alle benodigde bestanden en mappen aanwezig zijn."""
    logger.info("Verifiëren van server setup...")
    
    # Log huidige directory
    current_dir = os.getcwd()
    logger.info(f"Huidige directory: {current_dir}")
    
    # Controleer data directory
    data_dir = os.path.join(current_dir, "data", "movies")
    logger.info(f"Zoeken naar data directory: {data_dir}")
    if not os.path.exists(data_dir):
        logger.error(f"Data directory niet gevonden: {data_dir}")
        return False
    
    # Controleer movies.json
    movies_json = os.path.join(current_dir, "data", "movies.json")
    logger.info(f"Zoeken naar movies.json: {movies_json}")
    if not os.path.exists(movies_json):
        logger.error(f"movies.json niet gevonden: {movies_json}")
        return False
    
    # Valideer movies.json structuur
    try:
        logger.info("Valideren van movies.json...")
        with open(movies_json, 'r', encoding='utf-8') as f:
            data = json.load(f)
            if not isinstance(data, dict) or 'results' not in data:
                logger.error("Ongeldige movies.json structuur")
                return False
            if not data['results']:
                logger.error("Geen films gevonden in movies.json")
                return False
            logger.info(f"Aantal films gevonden: {len(data['results'])}")
    except json.JSONDecodeError as e:
        logger.error(f"Fout bij lezen movies.json: {e}")
        return False
    except Exception as e:
        logger.error(f"Onverwachte fout bij valideren movies.json: {e}")
        return False
    
    # Controleer client bestanden
    src_dir = os.path.join(current_dir, "src", "client")
    logger.info(f"Zoeken naar client bestanden in: {src_dir}")
    
    required_files = [
        os.path.join(src_dir, "index.html"),
        os.path.join(src_dir, "js", "config.js"),
        os.path.join(src_dir, "js", "movieDb.js"),
        os.path.join(src_dir, "js", "script.js"),
        os.path.join(src_dir, "js", "imageManager.js"),
        os.path.join(src_dir, "css", "styles.css")
    ]
    
    for file_path in required_files:
        logger.info(f"Controleren bestand: {file_path}")
        if not os.path.exists(file_path):
            logger.error(f"Benodigd bestand niet gevonden: {file_path}")
            return False
    
    logger.info("Server setup verificatie succesvol!")
    return True

class MovieGameHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        # Gebruik de src/client directory als root
        current_dir = os.getcwd()
        client_dir = os.path.join(current_dir, "src", "client")
        super().__init__(*args, directory=client_dir, **kwargs)
    
    def log_message(self, format, *args):
        logger.info(format%args)
    
    def do_GET(self):
        logger.info(f"GET request ontvangen voor: {self.path}")
        try:
            # Speciale afhandeling voor /data/ requests
            if self.path.startswith('/data/'):
                self.serve_data_file()
                return
            super().do_GET()
        except Exception as e:
            logger.error(f"Fout bij afhandelen GET request: {e}")
            self.send_error(500, f"Internal Server Error: {str(e)}")
    
    def serve_data_file(self):
        try:
            # Verwijder /data/ prefix en normaliseer pad
            path = self.path.replace('/data/', '')
            current_dir = os.getcwd()
            file_path = os.path.join(current_dir, "data", path)
            
            # Veiligheidscheck
            if not os.path.abspath(file_path).startswith(os.path.abspath(os.path.join(current_dir, "data"))):
                self.send_error(403, "Forbidden")
                return
            
            if not os.path.exists(file_path):
                self.send_error(404, "File not found")
                return
            
            # Bepaal content type
            if file_path.endswith('.json'):
                content_type = 'application/json'
            elif file_path.endswith(('.jpg', '.jpeg')):
                content_type = 'image/jpeg'
            else:
                self.send_error(415, "Unsupported Media Type")
                return
            
            # Stuur het bestand
            self.send_response(200)
            self.send_header('Content-Type', content_type)
            self.end_headers()
            with open(file_path, 'rb') as f:
                self.wfile.write(f.read())
                
        except Exception as e:
            logger.error(f"Fout bij serveren data bestand: {e}")
            self.send_error(500, f"Internal Server Error: {str(e)}")

def run_server(port=8888):
    """Start de server met health checks."""
    try:
        # Voer setup verificatie uit
        if not verify_server_setup():
            logger.error("Server setup verificatie mislukt. Server wordt niet gestart.")
            return False
        
        # Start de server
        logger.info("Setup verificatie succesvol, server wordt gestart...")
        with socketserver.TCPServer(("", port), MovieGameHandler) as httpd:
            logger.info(f"Server draait op http://localhost:{port}")
            logger.info("Gebruik Ctrl+C om te stoppen")
            httpd.serve_forever()
            
    except OSError as e:
        if e.errno == 98:  # Address already in use
            logger.error(f"Poort {port} is al in gebruik. Probeer eerst: pkill -f 'python.*server.py'")
        else:
            logger.error(f"OS Error bij starten server: {e}")
        return False
    except KeyboardInterrupt:
        logger.info("Server gestopt door gebruiker")
        return True
    except Exception as e:
        logger.error(f"Onverwachte fout bij starten server: {e}")
        return False
    return True

if __name__ == "__main__":
    logger.info("Movie Game Server wordt gestart...")
    success = run_server()
    if not success:
        logger.error("Server kon niet worden gestart.")
        exit(1)
