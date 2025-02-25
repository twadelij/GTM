#!/usr/bin/env python3
import os
import glob
import json

def clean_images():
    # Path to the movies directory
    movies_dir = os.path.join('data', 'movies')
    
    # Check if directory exists
    if not os.path.exists(movies_dir):
        print(f"Directory {movies_dir} not found!")
        return
    
    # Load movies.json to check which files we use
    with open(os.path.join('data', 'movies.json'), 'r') as f:
        movies_data = json.load(f)
    
    # Collect all used filenames
    used_files = set()
    for movie in movies_data['results']:
        if 'backdrop_path' in movie:
            filename = os.path.basename(movie['backdrop_path'])
            used_files.add(filename)
    
    # Remove unused files
    for file in os.listdir(movies_dir):
        if not file.startswith('gm'):  # Remove original filenames
            file_path = os.path.join(movies_dir, file)
            try:
                os.remove(file_path)
                print(f"Removed: {file}")
            except Exception as e:
                print(f"Error removing {file}: {e}")

if __name__ == "__main__":
    clean_images() 