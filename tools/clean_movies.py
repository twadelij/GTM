#!/usr/bin/env python3
import json
import os
import shutil

def clean_database():
    # Laad de huidige database
    with open('data/movies.json', 'r', encoding='utf-8') as f:
        db = json.load(f)

    # Filter films met correcte afbeeldingsnamen (gm*.jpg)
    valid_movies = []
    for movie in db['results']:
        img_path = movie['backdrop_path']
        img_name = os.path.basename(img_path)
        
        if img_name.startswith('gm') and img_name.endswith('.jpg'):
            # Controleer of het bestand bestaat
            if os.path.exists(img_path):
                valid_movies.append(movie)
            else:
                print(f"Verwijderd (ontbrekende afbeelding): {movie['title']}")
        else:
            print(f"Verwijderd (verkeerde naamgeving): {movie['title']}")

    # Update de database
    db['results'] = valid_movies
    
    # Backup de originele database
    shutil.copy2('data/movies.json', 'data/movies.json.bak')
    
    # Sla de nieuwe database op
    with open('data/movies.json', 'w', encoding='utf-8') as f:
        json.dump(db, f, indent=2, ensure_ascii=False)
    
    print(f"\nDatabase opgeschoond:")
    print(f"Aantal films in database: {len(valid_movies)}")

if __name__ == '__main__':
    clean_database() 