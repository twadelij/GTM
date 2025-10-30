#!/usr/bin/env python3
"""
Import movie data from JSON files to database
Migrates existing movie data to new database structure
"""
import asyncio
import json
import logging
import os
import sys
from pathlib import Path
from typing import Dict, List, Any

# Add src directory to Python path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'src'))

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from src.core.database import async_engine
from src.models.movie import Movie, MovieStats
from src.models.movie import Genre
from src.config.config import config

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

async def load_genres(session: AsyncSession) -> Dict[str, int]:
    """Load existing genres from database"""
    result = await session.execute(text("SELECT id, slug FROM genres WHERE is_active = true"))
    genres = {}
    for row in result:
        genres[row[1]] = row[0]
    return genres

async def import_movies_from_json():
    """Import movies from existing JSON files"""
    try:
        movies_json_path = Path(config.DATA_DIR) / "movies.json"
        
        if not movies_json_path.exists():
            logger.error(f"Movies JSON file not found: {movies_json_path}")
            return
        
        logger.info(f"Loading movies from: {movies_json_path}")
        
        with open(movies_json_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        movies = data.get('results', [])  # Changed from 'movies' to 'results'
        logger.info(f"Found {len(movies)} movies to import")
        
        async with AsyncSession(async_engine) as session:
            # Load genres
            genres = await load_genres(session)
            
            imported_count = 0
            skipped_count = 0
            
            for movie_data in movies:
                try:
                    # Check if movie already exists
                    existing_result = await session.execute(
                        text("SELECT id FROM movies WHERE title = :title"),
                        {"title": movie_data.get('title', '')}
                    )
                    
                    if existing_result.fetchone():
                        skipped_count += 1
                        continue
                    
                    # Create movie record
                    movie = Movie(
                        title=movie_data.get('title', ''),
                        original_title=movie_data.get('title', ''),
                        year=int(movie_data.get('year', 0)) if movie_data.get('year') else None,
                        rating=movie_data.get('rating'),
                        genres=movie_data.get('genres', [movie_data.get('category', '')]),
                        overview=movie_data.get('overview'),
                        tagline=movie_data.get('tagline'),
                        image_path=movie_data.get('backdrop_path', ''),
                        poster_path=movie_data.get('poster_path'),
                        backdrop_path=movie_data.get('backdrop_path'),
                        difficulty_score=5.0,
                        is_active=True,
                        is_family_friendly=movie_data.get('rating') in ['G', 'PG'],
                        content_warnings=[]
                    )
                    
                    session.add(movie)
                    await session.flush()  # Get the ID
                    
                    # Create movie stats record
                    movie_stats = MovieStats(
                        movie_id=movie.id,
                        total_appearances=0,
                        correct_guesses=0,
                        incorrect_guesses=0,
                        success_rate=0.0,
                        difficulty_rating=movie_data.get('difficulty_score', 5.0)
                    )
                    
                    session.add(movie_stats)
                    imported_count += 1
                    
                    if imported_count % 100 == 0:
                        logger.info(f"Imported {imported_count} movies...")
                
                except Exception as e:
                    logger.error(f"Error importing movie {movie_data.get('title')}: {str(e)}")
                    continue
            
            await session.commit()
            logger.info(f"✅ Import completed: {imported_count} imported, {skipped_count} skipped")
            
    except Exception as e:
        logger.error(f"Error importing movies: {str(e)}")
        raise

async def verify_import():
    """Verify movie import by checking database counts"""
    try:
        async with AsyncSession(async_engine) as session:
            # Count movies
            movie_result = await session.execute(text("SELECT COUNT(*) FROM movies"))
            movie_count = movie_result.scalar()
            
            # Count movie stats
            stats_result = await session.execute(text("SELECT COUNT(*) FROM movie_stats"))
            stats_count = stats_result.scalar()
            
            logger.info(f"Database verification:")
            logger.info(f"  Movies: {movie_count}")
            logger.info(f"  Movie stats: {stats_count}")
            
            if movie_count > 0:
                logger.info("✅ Movie import verification passed")
            else:
                logger.error("❌ No movies found in database")
                
    except Exception as e:
        logger.error(f"Error verifying import: {str(e)}")
        raise

async def main():
    """Main import function"""
    try:
        logger.info("Starting movie data import...")
        
        # Import movies from JSON
        await import_movies_from_json()
        
        # Verify import
        await verify_import()
        
        logger.info("✅ Movie data import completed successfully!")
        
    except Exception as e:
        logger.error(f"❌ Movie import failed: {str(e)}")
        sys.exit(1)
    finally:
        await async_engine.dispose()

if __name__ == "__main__":
    asyncio.run(main())
