#!/usr/bin/env python3
import json
import os
import re

def rebuild_movies():
    """Rebuild movies.json based on available images."""
    movies_dir = os.path.join('data', 'movies')
    movies_json = os.path.join('data', 'movies.json')
    
    # Collect all gm*.jpg files
    movie_files = [f for f in os.listdir(movies_dir) 
                  if f.startswith('gm') and f.endswith('.jpg')]
    
    # Create new database structure
    data = {
        "results": [
            {
                "id": os.path.splitext(img)[0],
                "title": f"Movie {i+1}",  # Temporary title
                "year": "2024",
                "category": "Young_Adults_PG-13",
                "rating": "PG-13",
                "backdrop_path": f"data/movies/{img}"
            }
            for i, img in enumerate(sorted(movie_files))
        ]
    }
    
    # Write to file
    with open(movies_json, 'w') as f:
        json.dump(data, f, indent=2)
    
    print(f"Database rebuilt with {len(movie_files)} movies")
    print("Note: all movies have temporary titles.")
    print("You need to add the correct titles manually.")

if __name__ == "__main__":
    rebuild_movies() 