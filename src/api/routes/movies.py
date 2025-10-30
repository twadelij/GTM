#!/usr/bin/env python3
"""
Movie API routes for GTM Game
Handles movie data and image serving
"""
import logging
import json
import os
from pathlib import Path
from typing import List, Dict, Any
from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.database import get_db
from src.core.exceptions import NotFoundError, DatabaseError
from src.config.config import config
from src.core.database import async_engine

logger = logging.getLogger(__name__)
router = APIRouter()

# Load movie data from JSON file (legacy support)
MOVIES_JSON_PATH = Path(config.DATA_DIR) / "movies.json"
MOVIES_DIR = Path(config.DATA_DIR) / "movies"

@router.get("/list", response_model=List[Dict[str, Any]])
async def get_movies():
    """Get list of all available movies"""
    try:
        # Try to get from database first
        from src.core.database import AsyncSession
        from sqlalchemy import select, text
        
        async with AsyncSession(async_engine) as session:
            result = await session.execute(text("SELECT title, year, rating, image_path FROM movies WHERE is_active = true ORDER BY title LIMIT 50"))
            movies = []
            for row in result:
                movies.append({
                    "title": row[0],
                    "year": row[1],
                    "rating": row[2],
                    "image": row[3].replace('data/movies/', '') if row[3] else ''
                })
            
            if movies:
                return movies
        
        # Fallback to JSON file
        if MOVIES_JSON_PATH.exists():
            with open(MOVIES_JSON_PATH, 'r', encoding='utf-8') as f:
                movies_data = json.load(f)
            return movies_data.get('results', [])
        else:
            raise NotFoundError("Movies data not found")
        
    except Exception as e:
        logger.error(f"Error loading movies: {str(e)}")
        raise DatabaseError("Failed to load movies data")

@router.get("/random/{count}", response_model=List[Dict[str, Any]])
async def get_random_movies(count: int):
    """Get random selection of movies for game"""
    try:
        movies = await get_movies()
        
        if count > len(movies):
            raise HTTPException(
                status_code=400, 
                detail=f"Requested {count} movies but only {len(movies)} available"
            )
        
        import random
        random_movies = random.sample(movies, count)
        
        return random_movies
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting random movies: {str(e)}")
        raise DatabaseError("Failed to get random movies")

@router.get("/image/{filename}")
async def get_movie_image(filename: str):
    """Serve movie image files"""
    try:
        image_path = MOVIES_DIR / filename
        
        if not image_path.exists():
            raise NotFoundError("Movie image not found")
            
        # Validate file type for security
        allowed_extensions = ['.jpg', '.jpeg', '.png', '.gif']
        if not any(filename.lower().endswith(ext) for ext in allowed_extensions):
            raise HTTPException(status_code=400, detail="Invalid file type")
        
        return FileResponse(
            path=str(image_path),
            media_type='image/jpeg',  # Most movie images will be JPEG
            filename=filename
        )
        
    except NotFoundError:
        raise
    except Exception as e:
        logger.error(f"Error serving movie image {filename}: {str(e)}")
        raise DatabaseError("Failed to serve movie image")

@router.get("/search")
async def search_movies(query: str, limit: int = 10):
    """Search movies by title"""
    try:
        movies = await get_movies()
        
        # Simple case-insensitive search
        query_lower = query.lower()
        results = [
            movie for movie in movies 
            if query_lower in movie.get('title', '').lower()
        ]
        
        return results[:limit]
        
    except Exception as e:
        logger.error(f"Error searching movies: {str(e)}")
        raise DatabaseError("Failed to search movies")

@router.get("/{movie_id}", response_model=Dict[str, Any])
async def get_movie_by_id(movie_id: str):
    """Get specific movie by ID"""
    try:
        movies = await get_movies()
        
        for movie in movies:
            if movie.get('id') == movie_id:
                return movie
                
        raise NotFoundError("Movie")
        
    except NotFoundError:
        raise
    except Exception as e:
        logger.error(f"Error getting movie {movie_id}: {str(e)}")
        raise DatabaseError("Failed to get movie")
