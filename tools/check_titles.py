#!/usr/bin/env python3
import os
import json
import pytesseract
from PIL import Image

def check_image_for_title(image_path, movie_title):
    """
    Controleer of de filmtitel (of delen ervan) zichtbaar zijn in de afbeelding.
    """
    try:
        # Laad de afbeelding
        img = Image.open(image_path)
        
        # Voer OCR uit
        text = pytesseract.image_to_string(img)
        
        # Maak alles lowercase voor betere matching
        text = text.lower()
        title_parts = movie_title.lower().split()
        
        # Zoek naar delen van de titel in de tekst
        matches = []
        for part in title_parts:
            if len(part) > 2 and part in text:  # Negeer korte woorden (a, an, the, etc.)
                matches.append(part)
        
        return matches
    except Exception as e:
        print(f"Fout bij verwerken van {image_path}: {e}")
        return []

def main():
    # Laad movies.json
    with open('data/movies.json', 'r') as f:
        movies = json.load(f)['results']
    
    print("Start controle van afbeeldingen op zichtbare titels...")
    print("Voor elke gevonden match zal om bevestiging worden gevraagd.\n")
    
    suspicious_images = []
    
    for movie in movies:
        image_path = movie['backdrop_path']
        if os.path.exists(image_path):
            matches = check_image_for_title(image_path, movie['title'])
            if matches:
                print(f"\nMogelijke titel gevonden in {image_path}")
                print(f"Film: {movie['title']} ({movie['year']})")
                print(f"Gevonden woorden: {', '.join(matches)}")
                
                response = input("\nWil je deze afbeelding markeren voor review? (j/n): ")
                if response.lower() == 'j':
                    suspicious_images.append({
                        'id': movie['id'],
                        'title': movie['title'],
                        'year': movie['year'],
                        'image': image_path,
                        'matches': matches
                    })
                print("-" * 80)
    
    if suspicious_images:
        print("\nSamenvatting van gemarkeerde afbeeldingen:")
        for img in suspicious_images:
            print(f"\n- {img['title']} ({img['year']})")
            print(f"  ID: {img['id']}")
            print(f"  Bestand: {img['image']}")
            print(f"  Gevonden woorden: {', '.join(img['matches'])}")
    else:
        print("\nGeen verdachte afbeeldingen gevonden.")

if __name__ == "__main__":
    main() 