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
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS blacklist (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            movie_id INTEGER NOT NULL,
            movie_title TEXT NOT NULL,
            image_url TEXT NOT NULL,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(movie_id)
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

def add_to_blacklist(movie_id, movie_title, image_url):
    """Add movie to blacklist"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('''
        INSERT OR REPLACE INTO blacklist (movie_id, movie_title, image_url, created_at)
        VALUES (?, ?, ?, CURRENT_TIMESTAMP)
    ''', (movie_id, movie_title, image_url))
    conn.commit()
    conn.close()
    print(f"Added {movie_title} to blacklist")

def remove_from_blacklist(movie_id):
    """Remove movie from blacklist"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('DELETE FROM blacklist WHERE movie_id = ?', (movie_id,))
    conn.commit()
    conn.close()
    print(f"Removed movie {movie_id} from blacklist")

def get_blacklist():
    """Get all blacklisted movies"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('SELECT movie_id, movie_title, image_url FROM blacklist')
    results = cursor.fetchall()
    conn.close()
    
    return [{'movie_id': r[0], 'movie_title': r[1], 'image_url': r[2]} for r in results]

def is_blacklisted(movie_id):
    """Check if movie is blacklisted"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('SELECT COUNT(*) FROM blacklist WHERE movie_id = ?', (movie_id,))
    result = cursor.fetchone()
    conn.close()
    
    return result[0] > 0

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
        
        # Filter out blacklisted movies
        blacklist = get_blacklist()
        blacklisted_ids = {b['movie_id'] for b in blacklist}
        filtered_movies = [m for m in data['results'] if m['id'] not in blacklisted_ids]
        
        if len(filtered_movies) < 5:
            print(f"Warning: Only {len(filtered_movies)} movies available after blacklist filter")
            if len(filtered_movies) == 0:
                print("No movies available after blacklist filter, using original list")
                filtered_movies = data['results']
        
        # Shuffle and pick 5 movies for the challenge
        shuffled = sorted(filtered_movies, key=lambda x: random.random())
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
    protocol_version = 'HTTP/1.1'
    
    def do_GET(self):
        self.handle_request()
    
    def do_POST(self):
        self.handle_request()
    
    def do_DELETE(self):
        self.handle_request()
    
    def handle_request(self):
        parsed = urlparse(self.path)
        path = parsed.path
        
        print(f"Request: {self.command} {path}")
        
        # API endpoints
        if path == '/api/weekly-challenge':
            # Get current weekly challenge
            challenge = get_weekly_challenge()
            if challenge:
                self.send_json_response(200, challenge)
            else:
                # Generate new challenge
                challenge = generate_weekly_challenge()
                if challenge:
                    save_weekly_challenge(challenge)
                    self.send_json_response(200, challenge)
                else:
                    self.send_response(500)
                    self.end_headers()
        
        elif path == '/api/generate-challenge':
            # Force generate new challenge
            challenge = generate_weekly_challenge()
            if challenge:
                save_weekly_challenge(challenge)
                self.send_json_response(200, {'status': 'success', 'movies': challenge})
            else:
                self.send_response(500)
                self.end_headers()
        
        elif path == '/api/blacklist':
            # Get blacklist
            if self.command == 'GET':
                blacklist = get_blacklist()
                self.send_json_response(200, blacklist)
            elif self.command == 'POST':
                # Add to blacklist
                content_length = int(self.headers.get('Content-Length', 0))
                post_data = self.rfile.read(content_length)
                data = json.loads(post_data)
                add_to_blacklist(data['movie_id'], data['movie_title'], data['image_url'])
                self.send_json_response(200, {'status': 'success'})
            elif self.command == 'DELETE':
                # Remove from blacklist
                content_length = int(self.headers.get('Content-Length', 0))
                post_data = self.rfile.read(content_length)
                data = json.loads(post_data)
                remove_from_blacklist(data['movie_id'])
                self.send_json_response(200, {'status': 'success'})
        
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
    
    def send_json_response(self, status_code, data):
        """Send JSON response with proper headers"""
        response = json.dumps(data)
        self.send_response(status_code)
        self.send_header('Content-type', 'application/json')
        self.send_header('Content-Length', str(len(response)))
        self.end_headers()
        self.wfile.write(response.encode())
        self.wfile.flush()

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
