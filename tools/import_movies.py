import os
import json
import shutil
import hashlib
import re
from pathlib import Path

def generate_obscure_id(title, year):
    # Genereer een unieke hash gebaseerd op titel en jaar
    hash_input = f"{title}{year}".encode('utf-8')
    return f"gm{hashlib.md5(hash_input).hexdigest()[:8]}"

def extract_movie_info(movie_dir):
    # Regular expression om titel en jaar te extraheren uit mapnaam
    pattern = r"(.*?)\s*\((\d{4})\)\s*\[(.*?)\]"
    match = re.match(pattern, movie_dir.name)
    
    if match:
        title = match.group(1).strip()
        year = match.group(2)
        rating = match.group(3)
        return title, year, rating
    return None

def import_movies():
    base_path = Path('/ds/movies')
    data_path = Path('data/movies')
    data_path.mkdir(parents=True, exist_ok=True)

    movies = []
    used_ids = set()

    # Loop door alle categorieën
    for category in ['Kids_G_and_PG', 'Young_Adults_PG-13', 'Adults_R_and_NC-17']:
        category_path = base_path / category
        if not category_path.exists():
            continue

        # Loop door alle film mappen in deze categorie
        for movie_dir in category_path.iterdir():
            if not movie_dir.is_dir():
                continue

            # Zoek fanart.jpg
            fanart_path = movie_dir / 'fanart.jpg'
            if not fanart_path.exists():
                continue

            # Extraheer film informatie
            movie_info = extract_movie_info(movie_dir)
            if not movie_info:
                continue

            title, year, rating = movie_info

            # Genereer obscure ID
            movie_id = generate_obscure_id(title, year)
            while movie_id in used_ids:
                movie_id = generate_obscure_id(title + str(len(used_ids)), year)
            used_ids.add(movie_id)

            # Kopieer en hernoem afbeelding
            new_filename = f"{movie_id}.jpg"
            new_path = data_path / new_filename
            shutil.copy2(fanart_path, new_path)

            # Voeg film toe aan lijst
            movies.append({
                'id': movie_id,
                'title': title,
                'year': year,
                'category': category,
                'rating': rating,
                'backdrop_path': f"data/movies/{new_filename}"
            })

    # Sorteer films op titel
    movies.sort(key=lambda x: x['title'])

    # Sla metadata op
    with open('data/movies.json', 'w', encoding='utf-8') as f:
        json.dump({'results': movies}, f, indent=2, ensure_ascii=False)

    print(f"Geïmporteerd: {len(movies)} films")

if __name__ == '__main__':
    import_movies()