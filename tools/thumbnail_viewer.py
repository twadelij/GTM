#!/usr/bin/env python3
import os
import json
from http.server import HTTPServer, SimpleHTTPRequestHandler
import html

class ThumbnailViewerHandler(SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/':
            self.send_response(200)
            self.send_header('Content-type', 'text/html')
            self.end_headers()
            
            # Build HTML
            html_content = '''
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Movie Thumbnails</title>
                <style>
                    body {
                        background: #141414;
                        color: #fff;
                        font-family: Arial, sans-serif;
                        margin: 20px;
                    }
                    .grid {
                        display: grid;
                        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                        gap: 20px;
                        padding: 20px;
                    }
                    .thumbnail {
                        position: relative;
                        aspect-ratio: 16/9;
                        overflow: hidden;
                        border-radius: 8px;
                        box-shadow: 0 4px 8px rgba(0,0,0,0.3);
                        transition: transform 0.2s;
                        cursor: pointer;
                    }
                    .thumbnail.missing {
                        border: 2px solid #E50914;
                        box-shadow: 0 0 15px rgba(229, 9, 20, 0.5);
                    }
                    .thumbnail:hover {
                        transform: scale(1.05);
                    }
                    .thumbnail img {
                        width: 100%;
                        height: 100%;
                        object-fit: cover;
                    }
                    .thumbnail .info {
                        position: absolute;
                        bottom: 0;
                        left: 0;
                        right: 0;
                        background: rgba(0,0,0,0.8);
                        padding: 12px;
                        font-size: 16px;
                        opacity: 1;
                        font-weight: bold;
                        text-align: center;
                    }
                    .thumbnail.missing .info {
                        background: rgba(229, 9, 20, 0.8);
                        font-size: 18px;
                    }
                    .thumbnail:hover .info {
                        background: rgba(0,0,0,0.9);
                    }
                    .selected {
                        position: fixed;
                        top: 50%;
                        left: 50%;
                        transform: translate(-50%, -50%);
                        max-width: 90vw;
                        max-height: 90vh;
                        z-index: 1000;
                    }
                    .selected img {
                        max-width: 100%;
                        max-height: 90vh;
                        object-fit: contain;
                    }
                    .overlay {
                        display: none;
                        position: fixed;
                        top: 0;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        background: rgba(0,0,0,0.9);
                        z-index: 999;
                    }
                </style>
            </head>
            <body>
                <div class="grid">
            '''
            
            # Load movies.json for titles
            try:
                with open(os.path.join('data', 'movies.json'), 'r') as f:
                    movies_data = json.load(f)
                    movies_dict = {os.path.basename(m['backdrop_path']): m['title'] for m in movies_data['results']}
            except Exception as e:
                movies_dict = {}
                print(f"Error loading movies.json: {e}")
            
            # Sort files with "Missing" first
            movies_dir = os.path.join('data', 'movies')
            files = sorted(os.listdir(movies_dir))
            files.sort(key=lambda x: 0 if "Missing" in movies_dict.get(x, "") else 1)
            
            # Add all thumbnails
            for file in files:
                if file.startswith('gm'):
                    title = movies_dict.get(file, file)
                    img_path = f'/data/movies/{file}'
                    is_missing = "Missing" in title
                    html_content += f'''
                    <div class="thumbnail{' missing' if is_missing else ''}" onclick="showFullSize('{img_path}', '{html.escape(title)}')">
                        <img src="{img_path}" alt="{html.escape(title)}" loading="lazy">
                        <div class="info">{html.escape(title)}</div>
                    </div>
                    '''
            
            # Add overlay and JavaScript
            html_content += '''
                </div>
                <div class="overlay" onclick="hideFullSize()">
                    <div class="selected">
                        <img src="" alt="">
                    </div>
                </div>
                <script>
                    function showFullSize(src, title) {
                        const overlay = document.querySelector('.overlay');
                        const img = overlay.querySelector('img');
                        img.src = src;
                        img.alt = title;
                        overlay.style.display = 'block';
                    }
                    
                    function hideFullSize() {
                        document.querySelector('.overlay').style.display = 'none';
                    }
                    
                    // Close with Escape key
                    document.addEventListener('keydown', (e) => {
                        if (e.key === 'Escape') hideFullSize();
                    });
                </script>
            </body>
            </html>
            '''
            
            self.wfile.write(html_content.encode())
            return
            
        # For other paths, use the default handler
        return SimpleHTTPRequestHandler.do_GET(self)

def run_server(port=9999):
    server_address = ('', port)
    httpd = HTTPServer(server_address, ThumbnailViewerHandler)
    print(f"Thumbnail viewer running at http://localhost:{port}")
    httpd.serve_forever()

if __name__ == "__main__":
    run_server() 