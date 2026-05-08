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
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS approved_films (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            movie_id INTEGER NOT NULL UNIQUE,
            movie_title TEXT NOT NULL,
            image_url TEXT NOT NULL,
            tmdb_rating REAL DEFAULT 0,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS rejected_stills (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            movie_id INTEGER NOT NULL,
            image_url TEXT NOT NULL UNIQUE,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS scores (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            player_name TEXT NOT NULL,
            week_start TEXT NOT NULL,
            score INTEGER NOT NULL DEFAULT 0,
            correct INTEGER NOT NULL DEFAULT 0,
            total INTEGER NOT NULL DEFAULT 5,
            avg_time REAL NOT NULL DEFAULT 0,
            details TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(player_name, week_start)
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
    """Get current weekly challenge from database.
    Regenerates if it contains blacklisted films or if approved pool is now
    large enough but the cached challenge doesn't use approved films."""
    week_start = get_current_week()
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('''
        SELECT movies FROM weekly_challenges WHERE week_start = ?
    ''', (week_start,))
    result = cursor.fetchone()
    conn.close()
    
    if result:
        movies = json.loads(result[0])
        needs_regen = False
        
        # Check if any film in the challenge is now blacklisted
        blacklist = get_blacklist()
        blacklisted_ids = {b['movie_id'] for b in blacklist}
        if any(m['id'] in blacklisted_ids for m in movies):
            print("Weekly challenge contains blacklisted films, regenerating...")
            needs_regen = True
        
        # Check if approved pool is large enough but challenge isn't using it
        approved_ids = get_approved_ids()
        if len(approved_ids) >= 10:
            challenge_ids = {m['id'] for m in movies}
            if not challenge_ids.issubset(approved_ids):
                print(f"Approved pool has {len(approved_ids)} films but challenge uses non-approved films, regenerating...")
                needs_regen = True
        
        if needs_regen:
            new_challenge = generate_weekly_challenge()
            if new_challenge:
                save_weekly_challenge(new_challenge)
                return new_challenge
        return movies
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

def add_to_approved(movie_id, movie_title, image_url, tmdb_rating=0):
    """Add movie to approved films pool"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('''
        INSERT OR REPLACE INTO approved_films (movie_id, movie_title, image_url, tmdb_rating, created_at)
        VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
    ''', (movie_id, movie_title, image_url, tmdb_rating))
    conn.commit()
    conn.close()
    print(f"Approved: {movie_title} (rating: {tmdb_rating})")

def get_approved_films():
    """Get all approved films"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('SELECT movie_id, movie_title, image_url, tmdb_rating FROM approved_films')
    results = cursor.fetchall()
    conn.close()
    return [{'movie_id': r[0], 'movie_title': r[1], 'image_url': r[2], 'tmdb_rating': r[3]} for r in results]

def get_approved_ids():
    """Get set of approved movie IDs"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('SELECT movie_id FROM approved_films')
    results = cursor.fetchall()
    conn.close()
    return {r[0] for r in results}

def remove_from_approved(movie_id):
    """Remove movie from approved pool"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('DELETE FROM approved_films WHERE movie_id = ?', (movie_id,))
    conn.commit()
    conn.close()

def add_rejected_still(movie_id, image_url):
    """Reject a specific still (movie can appear again with different still)"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('''
        INSERT OR IGNORE INTO rejected_stills (movie_id, image_url, created_at)
        VALUES (?, ?, CURRENT_TIMESTAMP)
    ''', (movie_id, image_url))
    conn.commit()
    conn.close()
    print(f"Rejected still for movie {movie_id}")

def get_rejected_image_urls():
    """Get set of rejected image URLs"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('SELECT image_url FROM rejected_stills')
    results = cursor.fetchall()
    conn.close()
    return {r[0] for r in results}


def save_score(player_name, score, correct, total, avg_time, details=None):
    """Save player score for current week. Updates if already played this week."""
    week_start = get_current_week()
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('''
        INSERT OR REPLACE INTO scores (player_name, week_start, score, correct, total, avg_time, details, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    ''', (player_name, week_start, score, correct, total, avg_time, json.dumps(details) if details else None))
    conn.commit()
    conn.close()
    print(f"Score saved: {player_name} = {score} pts ({correct}/{total})")

def get_leaderboard(week_start=None):
    """Get leaderboard for a specific week (default: current week)"""
    if not week_start:
        week_start = get_current_week()
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('''
        SELECT player_name, score, correct, total, avg_time, created_at
        FROM scores WHERE week_start = ?
        ORDER BY score DESC, avg_time ASC
    ''', (week_start,))
    results = cursor.fetchall()
    conn.close()
    return [{
        'player_name': r[0], 'score': r[1], 'correct': r[2],
        'total': r[3], 'avg_time': r[4], 'played_at': r[5]
    } for r in results]

def get_player_history(player_name):
    """Get all scores for a player across weeks"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('''
        SELECT week_start, score, correct, total, avg_time
        FROM scores WHERE player_name = ?
        ORDER BY week_start DESC
    ''', (player_name,))
    results = cursor.fetchall()
    conn.close()
    return results

def get_streak(player_name):
    """Calculate consecutive weeks played streak"""
    history = get_player_history(player_name)
    if not history:
        return 0
    
    streak = 0
    current_week = datetime.now()
    current_monday = current_week - timedelta(days=current_week.weekday())
    
    for row in history:
        week_date = datetime.strptime(row[0], '%Y-%m-%d')
        expected_monday = current_monday - timedelta(weeks=streak)
        if week_date.date() == expected_monday.date():
            streak += 1
        else:
            break
    return streak


def fetch_random_stills(count=25):
    """Fetch random movie stills from TMDB for admin review.
    Excludes: blacklisted movies, already-approved movies, rejected stills."""
    import requests
    
    print(f"Fetching {count} random stills from TMDB for review...")
    
    try:
        # Collect exclusion sets
        blacklisted_ids = {b['movie_id'] for b in get_blacklist()}
        approved_ids = get_approved_ids()
        rejected_urls = get_rejected_image_urls()
        exclude_ids = blacklisted_ids | approved_ids
        
        # Fetch from multiple random pages for variety
        all_movies = []
        pages_needed = max(4, (count // 20) + 2)
        random_pages = random.sample(range(1, 50), min(pages_needed, 10))
        
        for page in random_pages:
            response = requests.get(
                f'{TMDB_BASE_URL}/movie/popular',
                params={
                    'api_key': TMDB_API_KEY,
                    'language': 'en-US',
                    'page': page
                }
            )
            page_data = response.json()
            if 'results' in page_data:
                all_movies.extend(page_data['results'])
        
        if not all_movies:
            print("No movies fetched from TMDB")
            return []
        
        # Deduplicate by movie ID and filter excluded
        seen_ids = set()
        filtered = []
        for m in all_movies:
            if m['id'] not in exclude_ids and m['id'] not in seen_ids:
                seen_ids.add(m['id'])
                filtered.append(m)
        
        if not filtered:
            print("All fetched movies are excluded")
            return []
        
        # Shuffle and pick requested count
        random.shuffle(filtered)
        selected = filtered[:count]
        
        # Fetch stills/backdrops for each movie, skipping rejected URLs
        stills_result = []
        for movie in selected:
            images_response = requests.get(
                f'{TMDB_BASE_URL}/movie/{movie["id"]}/images',
                params={'api_key': TMDB_API_KEY}
            )
            images_data = images_response.json()
            
            backdrops = images_data.get('backdrops', [])
            stills = images_data.get('stills', [])
            all_images = stills + backdrops
            
            # Filter out rejected stills
            available = [img for img in all_images
                        if f'{TMDB_IMAGE_BASE_URL}{img["file_path"]}' not in rejected_urls]
            
            if available:
                image_path = random.choice(available)['file_path']
            elif movie.get('poster_path'):
                image_path = movie['poster_path']
            else:
                continue
            
            stills_result.append({
                'id': movie['id'],
                'title': movie['title'],
                'image': f'{TMDB_IMAGE_BASE_URL}{image_path}',
                'rating': round(movie.get('vote_average', 0), 1),
                'vote_count': movie.get('vote_count', 0)
            })
        
        print(f"Returning {len(stills_result)} stills for review "
              f"(excluded {len(approved_ids)} approved, {len(blacklisted_ids)} blacklisted)")
        return stills_result
        
    except Exception as e:
        print(f"Error fetching random stills: {e}")
        import traceback
        traceback.print_exc()
        return []


def generate_weekly_challenge():
    """Generate new weekly challenge.
    Uses approved films if pool >= 10, otherwise falls back to TMDB random."""
    import requests
    
    approved = get_approved_films()
    use_approved = len(approved) >= 10
    
    if use_approved:
        print(f"Generating challenge from {len(approved)} approved films")
    else:
        print(f"Only {len(approved)} approved films, using TMDB random (need 10+)")
    
    try:
        # Always fetch TMDB popular for wrong options pool
        all_tmdb = []
        for page in range(1, 4):
            response = requests.get(
                f'{TMDB_BASE_URL}/movie/popular',
                params={
                    'api_key': TMDB_API_KEY,
                    'language': 'en-US',
                    'page': page
                }
            )
            page_data = response.json()
            if 'results' in page_data:
                all_tmdb.extend(page_data['results'])
        
        all_titles = [m['title'] for m in all_tmdb]
        
        if use_approved:
            # Pick 5 random approved films (no duplicates)
            selected_approved = random.sample(approved, 5)
            movies_with_images = []
            for af in selected_approved:
                # Generate wrong options from TMDB pool
                wrong_pool = [t for t in all_titles if t != af['movie_title']]
                wrong_options = random.sample(wrong_pool, min(8, len(wrong_pool)))
                options = [af['movie_title']] + wrong_options[:8]
                random.shuffle(options)
                
                movies_with_images.append({
                    'id': af['movie_id'],
                    'title': af['movie_title'],
                    'image': af['image_url'],
                    'isMystery': False,
                    'options': options
                })
            return movies_with_images
        
        else:
            # Fallback: random TMDB (old behavior)
            blacklisted_ids = {b['movie_id'] for b in get_blacklist()}
            filtered = [m for m in all_tmdb if m['id'] not in blacklisted_ids]
            
            if len(filtered) < 5:
                filtered = all_tmdb
            
            random.shuffle(filtered)
            selected = filtered[:5]
            
            movies_with_images = []
            for movie in selected:
                images_response = requests.get(
                    f'{TMDB_BASE_URL}/movie/{movie["id"]}/images',
                    params={'api_key': TMDB_API_KEY}
                )
                images_data = images_response.json()
                stills = images_data.get('stills', [])
                backdrops = images_data.get('backdrops', [])
                
                if stills:
                    image_path = random.choice(stills)['file_path']
                elif backdrops:
                    image_path = random.choice(backdrops)['file_path']
                else:
                    image_path = movie.get('poster_path', '')
                
                wrong_pool = [t for t in all_titles if t != movie['title']]
                wrong_options = random.sample(wrong_pool, min(8, len(wrong_pool)))
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
        
        elif path == '/api/random-stills':
            # Fetch random stills for admin review (not cached)
            params = parse_qs(parsed.query)
            count = int(params.get('count', ['25'])[0])
            count = min(count, 50)  # Cap at 50
            stills = fetch_random_stills(count)
            if stills:
                self.send_json_response(200, stills)
            else:
                self.send_json_response(200, [])
        
        elif path == '/api/approve':
            if self.command == 'POST':
                content_length = int(self.headers.get('Content-Length', 0))
                post_data = self.rfile.read(content_length)
                data = json.loads(post_data)
                add_to_approved(data['movie_id'], data['movie_title'],
                               data['image_url'], data.get('tmdb_rating', 0))
                self.send_json_response(200, {'status': 'success'})
            elif self.command == 'GET':
                approved = get_approved_films()
                self.send_json_response(200, approved)
        
        elif path == '/api/reject-still':
            if self.command == 'POST':
                content_length = int(self.headers.get('Content-Length', 0))
                post_data = self.rfile.read(content_length)
                data = json.loads(post_data)
                add_rejected_still(data['movie_id'], data['image_url'])
                self.send_json_response(200, {'status': 'success'})
        
        elif path == '/api/score':
            if self.command == 'POST':
                content_length = int(self.headers.get('Content-Length', 0))
                post_data = self.rfile.read(content_length)
                data = json.loads(post_data)
                save_score(
                    data['player_name'], data['score'], data['correct'],
                    data.get('total', 5), data.get('avg_time', 0),
                    data.get('details')
                )
                streak = get_streak(data['player_name'])
                self.send_json_response(200, {'status': 'success', 'streak': streak})
        
        elif path == '/api/leaderboard':
            params = parse_qs(parsed.query)
            week = params.get('week', [None])[0]
            leaderboard = get_leaderboard(week)
            self.send_json_response(200, leaderboard)
        
        elif path == '/api/blacklist':
            # Legacy full-ban blacklist
            if self.command == 'GET':
                blacklist = get_blacklist()
                self.send_json_response(200, blacklist)
            elif self.command == 'POST':
                content_length = int(self.headers.get('Content-Length', 0))
                post_data = self.rfile.read(content_length)
                data = json.loads(post_data)
                add_to_blacklist(data['movie_id'], data['movie_title'], data['image_url'])
                self.send_json_response(200, {'status': 'success'})
            elif self.command == 'DELETE':
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
        elif path == '/leaderboard.html':
            self.serve_file('static/leaderboard.html', 'text/html')
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
            self.send_header('Content-Length', str(len(content)))
            self.end_headers()
            self.wfile.write(content)
        except FileNotFoundError:
            self.send_response(404)
            self.send_header('Content-Length', '0')
            self.end_headers()
        except Exception as e:
            self.send_response(500)
            self.send_header('Content-Length', '0')
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
