#!/usr/bin/env python3
import json
import os

def clean_movies():
    """Remove specific movies from movies.json."""
    movies_json = os.path.join('data', 'movies.json')
    
    # Read movies.json
    with open(movies_json, 'r') as f:
        data = json.load(f)
    
    # Filter out the After Death movie
    original_count = len(data['results'])
    data['results'] = [
        movie for movie in data['results']
        if movie['id'] != 'gm7b2c904e'  # After Death movie ID
    ]
    removed_count = original_count - len(data['results'])
    
    # Write back to file
    with open(movies_json, 'w') as f:
        json.dump(data, f, indent=2)
    
    print(f"Removed: {removed_count} movies")
    print(f"Remaining: {len(data['results'])} movies")

if __name__ == "__main__":
    clean_movies() 