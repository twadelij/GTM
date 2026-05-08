#!/usr/bin/env python3
"""
Simple backend for GTM weekly challenges
Stores weekly challenges in SQLite database
"""
import sqlite3
import json
import os
from datetime import datetime, timedelta
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
import random

# TMDB API Configuration
TMDB_API_KEY = '706c86407a5fbf917664b5e62a30893e'
TMDB_BASE_URL = 'https://api.themoviedb.org/3'
TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w1280'

# Database setup
DB_PATH = os.path.join(os.path.dirname(__file__), 'weekly_challenges.db')

def init_db():
    """Initialize SQLite database"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS weekly_challenges (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            week_start TEXT NOT NULL UNIQUE,
            movies TEXT NOT NULL,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    conn.commit()
    conn.close()

def get_current_week():
    """Get current week start date (Monday)"""
    today = datetime.now()
    week_start = today - timedelta(days=today.weekday())
    return week_start.strftime('%Y-%m-%d')

def save_weekly_challenge(movies):
    """Save weekly challenge to database"""
    week_start = get_current_week()
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('''
        INSERT OR REPLACE INTO weekly_challenges (week_start, movies, created_at)
        VALUES (?, ?, CURRENT_TIMESTAMP)
    ''', (week_start, json.dumps(movies)))
    conn.commit()
    conn.close()
    print(f"Saved weekly challenge for week {week_start}")

def get_weekly_challenge():
    """Get current weekly challenge from database"""
    week_start = get_current_week()
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('''
        SELECT movies FROM weekly_challenges WHERE week_start = ?
    ''', (week_start,))
    result = cursor.fetchone()
    conn.close()
    
    if result:
        return json.loads(result[0])
    return None

def generate_weekly_challenge():
    """Generate new weekly challenge using TMDB API"""
    import requests
    
    print("Generating weekly challenge from TMDB...")
    
    try:
        # Get popular movies from multiple pages for variety (not just recent)
        all_movies = []
        for page in range(1, 4):  # Fetch 3 pages for variety
            response = requests.get(
                f'{TMDB_BASE_URL}/movie/popular',
                params={
                    'api_key': TMDB_API_KEY,
                    'language': 'en-US',
                    'page': page,
                    'vote_count.gte': 500  # Lower threshold for more variety
                }
            )
            page_data = response.json()
            if 'results' in page_data:
                all_movies.extend(page_data['results'])
        
        data = {'results': all_movies}
        
        # Check if response is valid
        if not data or 'results' not in data or not data['results']:
            print("Invalid TMDB API response")
            return []
        
        print(f"Fetched {len(data['results'])} movies from TMDB")
        
        # Shuffle and pick 5 movies for the challenge
        shuffled = sorted(data['results'], key=lambda x: random.random())
        selected = shuffled[:5]
        
        # Use all fetched movies as pool for wrong options
        all_movies = data['results']
        all_titles = [m['title'] for m in all_movies]
        
        # Fetch stills for each selected movie
        movies_with_images = []
        for movie in selected:
            images_response = requests.get(
                f'{TMDB_BASE_URL}/movie/{movie["id"]}/images',
                params={'api_key': TMDB_API_KEY}
            )
            images_data = images_response.json()
            
            # Use stills if available
            stills = images_data.get('stills', [])
            backdrops = images_data.get('backdrops', [])
            
            if stills:
                image_path = random.choice(stills)['file_path']
            elif backdrops:
                image_path = random.choice(backdrops)['file_path']
            else:
                image_path = movie.get('poster_path', '')
            
            # Generate wrong options (8 wrong + 1 correct = 9 options)
            wrong_options = []
            
            # Try genre matching from the full pool
            if movie.get('genre_ids'):
                primary_genre = movie['genre_ids'][0]
                same_genre = [m['title'] for m in all_movies
                            if m.get('genre_ids') and primary_genre in m['genre_ids']
                            and m['title'] != movie['title']]
                if len(same_genre) >= 8:
                    wrong_options = random.sample(same_genre, 8)
            
            # Fallback to random from full pool
            if len(wrong_options) < 8:
                available = [t for t in all_titles if t != movie['title']]
                wrong_options = random.sample(available, min(8, len(available)))
            
            options = [movie['title']] + wrong_options[:8]
            random.shuffle(options)
            
            movies_with_images.append({
                'id': movie['id'],
                'title': movie['title'],
                'image': f'{TMDB_IMAGE_BASE_URL}{image_path}',
                'isMystery': False,
                'options': options
            })
        
        return movies_with_images
        
    except Exception as e:
        print(f"Error generating weekly challenge: {e}")
        import traceback
        traceback.print_exc()
        return []

class GTMHandler(BaseHTTPRequestHandler):
    """HTTP request handler for GTM backend"""
    
    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path
        
        # API endpoints
        if path == '/api/weekly-challenge':
            # Get current weekly challenge
            challenge = get_weekly_challenge()
            if challenge:
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps(challenge).encode())
            else:
                # Generate new challenge
                challenge = generate_weekly_challenge()
                if challenge:
                    save_weekly_challenge(challenge)
                    self.send_response(200)
                    self.send_header('Content-type', 'application/json')
                    self.end_headers()
                    self.wfile.write(json.dumps(challenge).encode())
                else:
                    self.send_response(500)
                    self.end_headers()
        
        elif path == '/api/generate-challenge':
            # Force generate new challenge
            challenge = generate_weekly_challenge()
            if challenge:
                save_weekly_challenge(challenge)
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'status': 'success', 'movies': challenge}).encode())
            else:
                self.send_response(500)
                self.end_headers()
        
        # Serve static files
        elif path == '/' or path == '/weekly-game.html':
            self.serve_file('static/weekly-game.html', 'text/html')
        elif path == '/admin.html':
            self.serve_file('static/admin.html', 'text/html')
        elif path.startswith('/static/'):
            file_path = path[1:]  # Remove leading /
            self.serve_file(file_path, self.guess_type(file_path))
        else:
            self.send_response(404)
            self.end_headers()
    
    def serve_file(self, file_path, content_type):
        """Serve a static file"""
        try:
            with open(file_path, 'rb') as f:
                content = f.read()
            self.send_response(200)
            self.send_header('Content-type', content_type)
            self.end_headers()
            self.wfile.write(content)
        except FileNotFoundError:
            self.send_response(404)
            self.end_headers()
        except Exception as e:
            self.send_response(500)
            self.end_headers()
    
    def guess_type(self, file_path):
        """Guess content type based on file extension"""
        if file_path.endswith('.html'):
            return 'text/html'
        elif file_path.endswith('.css'):
            return 'text/css'
        elif file_path.endswith('.js'):
            return 'application/javascript'
        elif file_path.endswith('.jpg') or file_path.endswith('.jpeg'):
            return 'image/jpeg'
        elif file_path.endswith('.png'):
            return 'image/png'
        elif file_path.endswith('.gif'):
            return 'image/gif'
        else:
            return 'application/octet-stream'
    
    def log_message(self, format, *args):
        """Suppress default logging"""
        pass

def run_server(port=30067):
    """Run HTTP server on specified port"""
    init_db()
    server_address = ('', port)
    httpd = HTTPServer(server_address, GTMHandler)
    print(f"GTM Backend running on port {port}")
    print(f"API endpoints:")
    print(f"  GET /api/weekly-challenge - Get current weekly challenge")
    print(f"  GET /api/generate-challenge - Generate new weekly challenge")
    httpd.serve_forever()

if __name__ == '__main__':
    run_server(30067)
